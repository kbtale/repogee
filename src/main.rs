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
    pub base_url: String,
}

#[tokio::main]
async fn main() {
    if let Err(e) = dotenvy::dotenv() {
        eprintln!("Warning: Failed to load .env file: {}", e);
    }

    tracing_subscriber::fmt::init();

    let webhook_secret = std::env::var("GITHUB_WEBHOOK_SECRET")
        .expect("GITHUB_WEBHOOK_SECRET must be set");
    let base_url = std::env::var("BASE_URL")
        .expect("BASE_URL must be set");

    let state = AppState {
        webhook_secret,
        base_url,
    };

    let app = Router::new()
        .route("/", get(health_check))
        .route("/webhook", post(handle_webhook))
        .route("/api/onboard", post(onboard_handler))
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
        .await
        .expect("Server failed to run");
}

async fn health_check() -> &'static str {
    "OK"
}

async fn handle_webhook(
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
                tokio::spawn(async move {
                    if let Err(e) = process_pull_request_event(event, inst_id).await {
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
                tokio::spawn(async move {
                    if let Err(e) = process_issues_event(event, inst_id).await {
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
                tokio::spawn(async move {
                    if let Err(e) = process_issue_comment_event(event, inst_id).await {
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
                tokio::spawn(async move {
                    if let Err(e) = process_pr_review_event(event, inst_id).await {
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
                tokio::spawn(async move {
                    if let Err(e) = process_push_event(event, inst_id).await {
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

async fn process_pull_request_event(event: PullRequestEvent, inst_id: u64) -> Result<(), anyhow::Error> {
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

    let client = github::client::get_installation_client(inst_id).await?;

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

    let (score_content, sha) = github::state::fetch_score_file(&client, owner, repo).await?;
    let mut stats = github::parser::parse_score_file(&score_content);

    let mut streak_active = false;
    if action == "closed" && is_merged {
        if let Some(user) = stats.iter().find(|u| u.username.eq_ignore_ascii_case(username)) {
            if let Some(last_active) = user.last_active {
                let diff = Utc::now() - last_active;
                if diff.num_hours() < 72 {
                    streak_active = true;
                    info!("Streak bonus active for @{}! (Last merge was {} hours ago)", username, diff.num_hours());
                }
            }
        }
    }

    let pr_body = event.pull_request.body.as_deref().unwrap_or("");
    let pr_title = event.pull_request.title.as_deref().unwrap_or("");
    let xp_to_add = engine::calculator::calculate_pr_xp(
        &event,
        &changed_files,
        pr_body,
        pr_title,
        streak_active,
    );

    if xp_to_add == 0 && dominant_class.is_none() {
        info!("No XP earned and no class updates for @{} from this PR event", username);
        return Ok(());
    }

    let now = Utc::now();
    github::state::update_user_stats(&mut stats, username, xp_to_add, dominant_class, now);

    let new_score_content = github::parser::generate_score_file(&stats);
    github::state::commit_score_file(&client, owner, repo, &new_score_content, sha.as_deref()).await?;

    info!("Successfully updated leaderboard for PR merge/open by @{} (+{} XP)", username, xp_to_add);
    Ok(())
}

async fn process_issues_event(event: IssuesEvent, inst_id: u64) -> Result<(), anyhow::Error> {
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

    let client = github::client::get_installation_client(inst_id).await?;
    let xp_to_add = engine::calculator::calculate_issue_xp(&event);

    if xp_to_add == 0 {
        return Ok(());
    }

    let (score_content, sha) = github::state::fetch_score_file(&client, owner, repo).await?;
    let mut stats = github::parser::parse_score_file(&score_content);

    let now = Utc::now();
    github::state::update_user_stats(&mut stats, username, xp_to_add, None, now);

    let new_score_content = github::parser::generate_score_file(&stats);
    github::state::commit_score_file(&client, owner, repo, &new_score_content, sha.as_deref()).await?;

    info!("Successfully updated leaderboard for Issue event by @{} (+{} XP)", username, xp_to_add);
    Ok(())
}

async fn process_issue_comment_event(event: IssueCommentEvent, inst_id: u64) -> Result<(), anyhow::Error> {
    if event.action != "created" {
        return Ok(());
    }

    let username = &event.comment.user.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    info!("Processing Issue Comment action 'created' for user @{}", username);

    let client = github::client::get_installation_client(inst_id).await?;
    let xp_to_add = engine::calculator::calculate_comment_xp(&event);

    if xp_to_add == 0 {
        return Ok(());
    }

    let (score_content, sha) = github::state::fetch_score_file(&client, owner, repo).await?;
    let mut stats = github::parser::parse_score_file(&score_content);

    let now = Utc::now();
    github::state::update_user_stats(&mut stats, username, xp_to_add, None, now);

    let new_score_content = github::parser::generate_score_file(&stats);
    github::state::commit_score_file(&client, owner, repo, &new_score_content, sha.as_deref()).await?;

    info!("Successfully updated leaderboard for Comment event by @{} (+{} XP)", username, xp_to_add);
    Ok(())
}

async fn process_pr_review_event(event: PullRequestReviewEvent, inst_id: u64) -> Result<(), anyhow::Error> {
    if event.action != "submitted" || event.review.state != "approved" {
        return Ok(());
    }

    let username = &event.review.user.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    info!("Processing PR Review approval for user @{}", username);

    let client = github::client::get_installation_client(inst_id).await?;
    let xp_to_add = engine::calculator::calculate_review_xp(&event);

    if xp_to_add == 0 {
        return Ok(());
    }

    let (score_content, sha) = github::state::fetch_score_file(&client, owner, repo).await?;
    let mut stats = github::parser::parse_score_file(&score_content);

    let now = Utc::now();
    github::state::update_user_stats(&mut stats, username, xp_to_add, None, now);

    let new_score_content = github::parser::generate_score_file(&stats);
    github::state::commit_score_file(&client, owner, repo, &new_score_content, sha.as_deref()).await?;

    info!("Successfully updated leaderboard for PR Review by @{} (+{} XP)", username, xp_to_add);
    Ok(())
}

async fn process_push_event(event: PushEvent, inst_id: u64) -> Result<(), anyhow::Error> {
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

    let client = github::client::get_installation_client(inst_id).await?;
    let (score_content, sha) = github::state::fetch_score_file(&client, owner, repo).await?;
    let mut stats = github::parser::parse_score_file(&score_content);

    let now = Utc::now();
    github::state::update_user_stats(&mut stats, username, 0, Some(class), now);

    let new_score_content = github::parser::generate_score_file(&stats);
    github::state::commit_score_file(&client, owner, repo, &new_score_content, sha.as_deref()).await?;

    info!("Successfully updated class to {:?} for @{} on push event", class, username);
    Ok(())
}

#[derive(serde::Deserialize)]
pub struct OnboardPayload {
    pub repo_full_name: String,
}

async fn onboard_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    axum::Json(payload): axum::Json<OnboardPayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| (StatusCode::BAD_REQUEST, "Invalid Authorization token format".to_string()))?;

    let octo = octocrab::Octocrab::builder()
        .personal_token(token.to_string())
        .build()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to build GitHub client: {:?}", e)))?;

    let parts: Vec<&str> = payload.repo_full_name.split('/').collect();
    if parts.len() != 2 {
        return Err((StatusCode::BAD_REQUEST, "Invalid repo_full_name format".to_string()));
    }
    let owner = parts[0];
    let repo = parts[1];

    let default_score = github::parser::get_default_score_file();
    let score_result = octo
        .repos(owner, repo)
        .create_file("SCORE.md", "chore: initialize repogee SCORE.md", default_score)
        .send()
        .await;

    let score_created = match score_result {
        Ok(_) => {
            info!("Created SCORE.md in {}/{}", owner, repo);
            true
        }
        Err(e) => {
            warn!("Failed to create SCORE.md in {}/{}: {:?}", owner, repo, e);
            false
        }
    };

    let webhook_url = format!("{}/webhook", state.base_url);
    let hook_config = octocrab::models::hooks::Config {
        url: webhook_url.clone(),
        content_type: Some(octocrab::models::hooks::ContentType::Json),
        insecure_ssl: None,
        secret: Some(state.webhook_secret.clone()),
    };

    let hook = octocrab::models::hooks::Hook {
        name: "web".to_string(),
        active: true,
        events: vec![
            octocrab::models::webhook_events::WebhookEventType::PullRequest,
            octocrab::models::webhook_events::WebhookEventType::Issues,
            octocrab::models::webhook_events::WebhookEventType::IssueComment,
            octocrab::models::webhook_events::WebhookEventType::PullRequestReview,
            octocrab::models::webhook_events::WebhookEventType::Push,
        ],
        config: hook_config,
        ..octocrab::models::hooks::Hook::default()
    };

    let webhook_status = match octo.repos(owner, repo).create_hook(hook).await {
        Ok(created_hook) => {
            info!("Created webhook in {}/{} (id: {})", owner, repo, created_hook.id);
            "created"
        }
        Err(e) => {
            if let octocrab::Error::GitHub { source, .. } = &e {
                if source.status_code.as_u16() == 422 {
                    info!("Webhook already exists in {}/{}", owner, repo);
                    "already_exists"
                } else {
                    warn!("Failed to create webhook in {}/{}: {:?}", owner, repo, e);
                    "failed"
                }
            } else {
                warn!("Failed to create webhook in {}/{}: {:?}", owner, repo, e);
                "failed"
            }
        }
    };

    Ok((StatusCode::OK, axum::Json(serde_json::json!({
        "status": "success",
        "score_created": score_created,
        "webhook_status": webhook_status,
    }))))
}
