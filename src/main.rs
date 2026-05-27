mod security;
mod types;
mod engine;
mod github;

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    response::IntoResponse,
    Router,
};
use chrono::Utc;
use std::net::SocketAddr;
use tracing::{error, info, warn};

use security::VerifiedWebhookPayload;
use types::{
    IssueCommentEvent, IssuesEvent, PullRequestEvent, PullRequestReviewEvent, PushEvent,
};

#[derive(Clone)]
pub struct AppState {
    pub webhook_secret: String,
    pub app_client: octocrab::Octocrab,
}

fn get_local_changed_files() -> Vec<types::ChangedFile> {
    let output = std::process::Command::new("git")
        .args(["diff", "--name-status", "HEAD~1", "HEAD"])
        .output();
    
    let stdout = match output {
        Ok(out) if out.status.success() => String::from_utf8_lossy(&out.stdout).to_string(),
        _ => {
            let fb = std::process::Command::new("git")
                .args(["show", "--name-status", "--oneline", "HEAD"])
                .output();
            match fb {
                Ok(out) if out.status.success() => String::from_utf8_lossy(&out.stdout).to_string(),
                _ => return Vec::new(),
            }
        }
    };

    let mut changed = Vec::new();
    for line in stdout.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            let status = match parts[0] {
                "A" => "added",
                "D" => "deleted",
                "M" => "modified",
                _ => "modified",
            };
            changed.push(types::ChangedFile {
                filename: parts[1].to_string(),
                status: status.to_string(),
            });
        }
    }
    changed
}

async fn run_local_cli() -> Result<(), anyhow::Error> {
    info!("Running Repogee in local CLI/GitHub Actions mode");

    let event_name = std::env::var("GITHUB_EVENT_NAME")
        .map_err(|_| anyhow::anyhow!("GITHUB_EVENT_NAME environment variable is not set"))?;
    let event_path = std::env::var("GITHUB_EVENT_PATH")
        .map_err(|_| anyhow::anyhow!("GITHUB_EVENT_PATH environment variable is not set"))?;

    info!("Event Name: {}", event_name);
    info!("Event Path: {}", event_path);

    let payload_bytes = std::fs::read(&event_path)
        .map_err(|e| anyhow::anyhow!("Failed to read event payload at {}: {:?}", event_path, e))?;

    let score_path = "SCORE.md";
    let score_content = if std::path::Path::new(score_path).exists() {
        std::fs::read_to_string(score_path)
            .map_err(|e| anyhow::anyhow!("Failed to read SCORE.md: {:?}", e))?
    } else {
        github::parser::get_default_score_file()
    };
    let mut stats = github::parser::parse_score_file(&score_content);

    let (username, xp_to_add, dominant_class) = match event_name.as_str() {
        "pull_request" => {
            let event: PullRequestEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse PullRequestEvent: {:?}", e))?;
            let action = &event.action;
            let is_merged = event.pull_request.merged.unwrap_or(false);
            let username = event.pull_request.user.login.clone();

            if action != "opened" && !(action == "closed" && is_merged) {
                info!("PR action '{}' is not tracked for XP, exiting", action);
                return Ok(());
            }

            let changed_files = get_local_changed_files();
            let file_names: Vec<String> = changed_files.iter().map(|f| f.filename.clone()).collect();
            let dominant_class = engine::classes::classify_dominant_class(&file_names);

            let pr_body = event.pull_request.body.as_deref().unwrap_or("");
            let pr_title = event.pull_request.title.as_deref().unwrap_or("");

            let streak_active = stats.iter()
                .find(|u| u.username.eq_ignore_ascii_case(&username))
                .and_then(|u| u.last_active)
                .map(|last_active| (Utc::now() - last_active).num_hours() < 72)
                .unwrap_or(false);

            let xp_to_add = engine::calculator::calculate_pr_xp(
                &event,
                &changed_files,
                pr_body,
                pr_title,
                streak_active,
            );

            (username, xp_to_add, dominant_class)
        }
        "issues" => {
            let event: IssuesEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse IssuesEvent: {:?}", e))?;
            let action = &event.action;
            let username = event.sender.login.clone();
            let is_completed = event.issue.state_reason.as_deref() == Some("completed");

            if action != "opened" && !(action == "closed" && is_completed) {
                info!("Issue action '{}' not tracked for XP, exiting", action);
                return Ok(());
            }

            let xp_to_add = engine::calculator::calculate_issue_xp(&event);
            (username, xp_to_add, None)
        }
        "issue_comment" => {
            let event: IssueCommentEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse IssueCommentEvent: {:?}", e))?;
            
            if event.action != "created" {
                info!("Issue comment action '{}' is not tracked for XP, exiting", event.action);
                return Ok(());
            }

            let username = event.comment.user.login.clone();
            let xp_to_add = engine::calculator::calculate_comment_xp(&event);
            (username, xp_to_add, None)
        }
        "pull_request_review" => {
            let event: PullRequestReviewEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse PullRequestReviewEvent: {:?}", e))?;

            if event.action != "submitted" || event.review.state != "approved" {
                info!("PR review action '{}' state '{}' is not tracked for XP, exiting", event.action, event.review.state);
                return Ok(());
            }

            let username = event.review.user.login.clone();
            let xp_to_add = engine::calculator::calculate_review_xp(&event);
            (username, xp_to_add, None)
        }
        "push" => {
            let event: PushEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse PushEvent: {:?}", e))?;
            
            let username = event.sender.login.clone();

            let mut touched_files = std::collections::HashSet::new();
            for commit in &event.commits {
                for file in &commit.added {
                    touched_files.insert(file.clone());
                }
                for file in &commit.modified {
                    touched_files.insert(file.clone());
                }
                for file in &commit.removed {
                    touched_files.insert(file.clone());
                }
            }

            if touched_files.is_empty() {
                info!("No files changed in push commit, exiting");
                return Ok(());
            }

            let files_list: Vec<String> = touched_files.into_iter().collect();
            let dominant_class = engine::classes::classify_dominant_class(&files_list);

            (username, 0, dominant_class)
        }
        unsupported => {
            info!("Received unsupported GitHub event: {}", unsupported);
            return Ok(());
        }
    };

    if xp_to_add == 0 && dominant_class.is_none() {
        info!("No XP earned and no class updates for @{} from this event", username);
        return Ok(());
    }

    let now = Utc::now();
    github::state::update_user_stats(&mut stats, &username, xp_to_add, dominant_class, now);

    let new_score_content = github::parser::generate_score_file(&stats);
    std::fs::write(score_path, new_score_content)
        .map_err(|e| anyhow::anyhow!("Failed to write to SCORE.md: {:?}", e))?;

    info!("Successfully updated SCORE.md locally for @{} (+{} XP)", username, xp_to_add);
    Ok(())
}

#[tokio::main]
async fn main() {
    if let (Err(e), Err(_)) = (dotenvy::dotenv(), std::env::var("GITHUB_ACTIONS")) {
        eprintln!("Warning: Failed to load .env file: {}", e);
    }


    tracing_subscriber::fmt::init();

    let args: Vec<String> = std::env::args().collect();
    let is_local = args.contains(&"--local".to_string())
        || args.contains(&"-l".to_string())
        || std::env::var("GITHUB_ACTIONS").map(|val| val == "true").unwrap_or(false);

    if is_local {
        if let Err(e) = run_local_cli().await {
            error!("Error in local CLI execution: {:?}", e);
            std::process::exit(1);
        }
        std::process::exit(0);
    }


    // Startup validations
    info!("Validating configuration and private key on startup...");
    let webhook_secret = std::env::var("GITHUB_WEBHOOK_SECRET")
        .expect("GITHUB_WEBHOOK_SECRET environment variable must be set");

    let app_client = github::client::init_app_client()
        .expect("Failed to initialize Octocrab App client during startup");

    let state = AppState {
        webhook_secret,
        app_client,
    };

    let app = Router::new()
        .route("/", get(health_check))
        .route("/webhook", post(handle_webhook))
        .with_state(state);

    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port_str = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let port: u16 = port_str.parse().expect("PORT must be a valid u16");
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .expect("Failed to parse bind address");

    info!("Starting Repogee server on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind TCP listener");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Server failed to run");
}

async fn health_check() -> &'static str {
    "OK"
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    info!("Signal received, starting graceful shutdown...");
}

async fn handle_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    VerifiedWebhookPayload(bytes): VerifiedWebhookPayload,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let event_name = headers
        .get("x-github-event")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| {
            warn!("Missing X-GitHub-Event header");
            (StatusCode::BAD_REQUEST, "Missing X-GitHub-Event header".to_string())
        })?;

    info!("Received X-GitHub-Event: {}", event_name);

    match event_name {
        "pull_request" => {
            let event: PullRequestEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse PullRequestEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;

            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_pull_request_event(state_clone, event, inst_id).await {
                        error!("Error processing PullRequestEvent: {:?}", e);
                    }
                });
            } else {
                warn!("Missing installation ID in pull_request event, ignoring");
            }
        }
        "issues" => {
            let event: IssuesEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse IssuesEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;

            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_issues_event(state_clone, event, inst_id).await {
                        error!("Error processing IssuesEvent: {:?}", e);
                    }
                });
            } else {
                warn!("Missing installation ID in issues event, ignoring");
            }
        }
        "issue_comment" => {
            let event: IssueCommentEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse IssueCommentEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;

            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_issue_comment_event(state_clone, event, inst_id).await {
                        error!("Error processing IssueCommentEvent: {:?}", e);
                    }
                });
            } else {
                warn!("Missing installation ID in issue_comment event, ignoring");
            }
        }
        "pull_request_review" => {
            let event: PullRequestReviewEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse PullRequestReviewEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;

            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_pr_review_event(state_clone, event, inst_id).await {
                        error!("Error processing PullRequestReviewEvent: {:?}", e);
                    }
                });
            } else {
                warn!("Missing installation ID in pull_request_review event, ignoring");
            }
        }
        "push" => {
            let event: PushEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse PushEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;

            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_push_event(state_clone, event, inst_id).await {
                        error!("Error processing PushEvent: {:?}", e);
                    }
                });
            } else {
                warn!("Missing installation ID in push event, ignoring");
            }
        }
        _ => {
            info!("Received unsupported GitHub event: {}", event_name);
            return Ok((StatusCode::ACCEPTED, "Event received but unsupported".to_string()));
        }
    }

    Ok((StatusCode::ACCEPTED, "Webhook event accepted for background processing".to_string()))
}

async fn process_pull_request_event(
    state: AppState,
    event: PullRequestEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    let is_merged = event.pull_request.merged.unwrap_or(false);
    let username = &event.pull_request.user.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    if action != "opened" && !(action == "closed" && is_merged) {
        info!("PR action '{}' is not tracked for XP, ignoring", action);
        return Ok(());
    }

    info!("Processing PR action '{}' for user @{}", action, username);

    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;

    let mut changed_files = Vec::new();
    let mut dominant_class = None;
    if action == "closed" && is_merged {
        info!("Fetching file diffs for PR #{}", event.pull_request.number);
        match client.pulls(owner, repo).list_files(event.pull_request.number).await {
            Ok(page) => {
                let file_names: Vec<String> = page.items.iter().map(|f| f.filename.clone()).collect();
                dominant_class = engine::classes::classify_dominant_class(&file_names);
                
                changed_files = page.items.into_iter().map(|f| types::ChangedFile {
                    filename: f.filename,
                    status: format!("{:?}", f.status),
                }).collect();
            }
            Err(e) => {
                warn!("Failed to list files for PR #{}: {:?}", event.pull_request.number, e);
            }
        }
    }

    let pr_body = event.pull_request.body.as_deref().unwrap_or("");
    let pr_title = event.pull_request.title.as_deref().unwrap_or("");

    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |stats| {
        let streak_active = if action == "closed" && is_merged {
            stats.iter()
                .find(|u| u.username.eq_ignore_ascii_case(username))
                .and_then(|u| u.last_active)
                .map(|last_active| {
                    let diff = Utc::now() - last_active;
                    let is_active = diff.num_hours() < 72;
                    if is_active {
                        info!("Streak bonus active for @{}! (Last merge was {} hours ago)", username, diff.num_hours());
                    }
                    is_active
                })
                .unwrap_or(false)
        } else {
            false
        };


        let xp_to_add = engine::calculator::calculate_pr_xp(
            &event,
            &changed_files,
            pr_body,
            pr_title,
            streak_active,
        );
        
        (xp_to_add, dominant_class)
    }).await?;

    Ok(())
}

async fn process_issues_event(
    state: AppState,
    event: IssuesEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    let is_completed = event.issue.state_reason.as_deref() == Some("completed");

    if action != "opened" && !(action == "closed" && is_completed) {
        info!("Issue action '{}' (completed={}) not tracked for XP, ignoring", action, is_completed);
        return Ok(());
    }

    info!("Processing Issue action '{}' for user @{}", action, username);

    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;

    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_issue_xp(&event);
        (xp_to_add, None)
    }).await?;

    Ok(())
}

async fn process_issue_comment_event(
    state: AppState,
    event: IssueCommentEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    if event.action != "created" {
        return Ok(());
    }

    let username = &event.comment.user.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    info!("Processing Issue Comment action 'created' for user @{}", username);

    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;

    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_comment_xp(&event);
        (xp_to_add, None)
    }).await?;

    Ok(())
}

async fn process_pr_review_event(
    state: AppState,
    event: PullRequestReviewEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    if event.action != "submitted" || event.review.state != "approved" {
        return Ok(());
    }

    let username = &event.review.user.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    info!("Processing PR Review approval for user @{}", username);

    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;

    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_review_xp(&event);
        (xp_to_add, None)
    }).await?;

    Ok(())
}

async fn process_push_event(
    state: AppState,
    event: PushEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    let mut touched_files = std::collections::HashSet::new();
    for commit in &event.commits {
        for file in &commit.added {
            touched_files.insert(file.clone());
        }
        for file in &commit.modified {
            touched_files.insert(file.clone());
        }
        for file in &commit.removed {
            touched_files.insert(file.clone());
        }
    }

    if touched_files.is_empty() {
        return Ok(());
    }

    let files_list: Vec<String> = touched_files.into_iter().collect();
    let dominant_class = engine::classes::classify_dominant_class(&files_list);

    let Some(class) = dominant_class else {
        return Ok(());
    };

    info!("Processing push event for @{}. Dominant class based on pushed files: {:?}", username, class);

    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;

    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        (0, Some(class))
    }).await?;

    Ok(())
}

