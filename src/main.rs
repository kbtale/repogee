mod security;
mod types;
mod engine;
mod github;

use axum::{
    extract::{State, Query},
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
    ReleaseEvent, GollumEvent, PullRequestReviewCommentEvent, CommitCommentEvent,
    DiscussionEvent, DiscussionCommentEvent,
};

#[derive(Clone)]
pub struct AppState {
    pub webhook_secret: String,
    pub app_client: octocrab::Octocrab,
    pub client_id: String,
    pub client_secret: String,
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
                "A" => "added".to_string(),
                "M" => "modified".to_string(),
                "D" => "deleted".to_string(),
                other => other.to_string(),
            };
            changed.push(types::ChangedFile {
                filename: parts[1].to_string(),
                status,
            });
        }
    }
    changed
}

async fn run_local_cli() -> Result<(), anyhow::Error> {
    info!("Running Repogee in local CLI mode");

    let event_name = std::env::var("GITHUB_EVENT_NAME")
        .map_err(|_| anyhow::anyhow!("GITHUB_EVENT_NAME environment variable not set"))?;
    let event_path = std::env::var("GITHUB_EVENT_PATH")
        .map_err(|_| anyhow::anyhow!("GITHUB_EVENT_PATH environment variable not set"))?;
    let score_path = std::env::var("REPOGEE_SCORE_PATH").unwrap_or_else(|_| "SCORE.md".to_string());

    info!("Event Name: {}", event_name);
    info!("Event Path: {}", event_path);
    info!("Score Path: {}", score_path);

    let payload_bytes = std::fs::read(&event_path)
        .map_err(|e| anyhow::anyhow!("Failed to read event payload file: {:?}", e))?;

    let score_content = if std::path::Path::new(&score_path).exists() {
        std::fs::read_to_string(&score_path)
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

            if action != "opened" && action != "assigned" && action != "review_requested" && !(action == "closed" && is_merged) {
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

            if action != "opened" && action != "assigned" && !(action == "closed" && is_completed) {
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

            if event.action != "submitted" {
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
            let xp_to_add = engine::calculator::calculate_push_xp(&event);

            (username, xp_to_add, dominant_class)
        }
        "release" => {
            let event: ReleaseEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse ReleaseEvent: {:?}", e))?;
            let username = event.sender.login.clone();
            let xp_to_add = engine::calculator::calculate_release_xp(&event.action);
            (username, xp_to_add, None)
        }
        "gollum" => {
            let event: GollumEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse GollumEvent: {:?}", e))?;
            let username = event.sender.login.clone();
            let xp_to_add = engine::calculator::calculate_wiki_xp() * event.pages.len() as u32;
            (username, xp_to_add, None)
        }
        "pull_request_review_comment" => {
            let event: PullRequestReviewCommentEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse PullRequestReviewCommentEvent: {:?}", e))?;
            let username = event.sender.login.clone();
            let xp_to_add = engine::calculator::calculate_inline_comment_xp(&event.action);
            (username, xp_to_add, None)
        }
        "commit_comment" => {
            let event: CommitCommentEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse CommitCommentEvent: {:?}", e))?;
            let username = event.sender.login.clone();
            let xp_to_add = engine::calculator::calculate_commit_comment_xp(&event.action);
            (username, xp_to_add, None)
        }
        "discussion" => {
            let event: DiscussionEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse DiscussionEvent: {:?}", e))?;
            let username = event.sender.login.clone();
            let xp_to_add = engine::calculator::calculate_discussion_xp(&event.action);
            (username, xp_to_add, None)
        }
        "discussion_comment" => {
            let event: DiscussionCommentEvent = serde_json::from_slice(&payload_bytes)
                .map_err(|e| anyhow::anyhow!("Failed to parse DiscussionCommentEvent: {:?}", e))?;
            let username = event.sender.login.clone();
            let xp_to_add = engine::calculator::calculate_discussion_comment_xp(&event.action);
            (username, xp_to_add, None)
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
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install default CryptoProvider");

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

    info!("Validating configuration and private key on startup...");
    let webhook_secret = std::env::var("GITHUB_WEBHOOK_SECRET")
        .expect("GITHUB_WEBHOOK_SECRET environment variable must be set");

    let app_client = github::client::init_app_client()
        .expect("Failed to initialize Octocrab App client during startup");

    let client_id = std::env::var("GITHUB_CLIENT_ID").unwrap_or_default();
    let client_secret = std::env::var("GITHUB_CLIENT_SECRET").unwrap_or_default();

    let state = AppState {
        webhook_secret,
        app_client,
        client_id,
        client_secret,
    };

    let frontend_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
    
    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(vec![
            axum::http::HeaderValue::from_static("http://localhost:5173"),
            frontend_url.parse::<axum::http::HeaderValue>().unwrap(),
        ])
        .allow_methods(vec![
            axum::http::Method::GET,
            axum::http::Method::POST,
        ])
        .allow_headers(vec![
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
        ]);

    let app = Router::new()
        .without_v07_checks()
        .route("/health", get(health_check))
        .route("/webhook", post(handle_webhook))
        .route("/login", get(login_handler))
        .route("/callback", get(callback_handler))
        .route("/api/leaderboard", get(leaderboard_handler))
        .route("/api/repos", get(repos_handler))
        .route("/api/onboard", post(onboard_handler))
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr_str = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr_str.parse().expect("Invalid bind address");

    info!("Starting Repogee HTTP server on {}...", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Server failed to run");
}

async fn login_handler(State(state): State<AppState>) -> impl IntoResponse {
    let url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&scope=repo,read%3Auser,write%3Arepo_hook",
        state.client_id
    );
    axum::response::Redirect::temporary(&url)
}

#[derive(serde::Deserialize)]
pub struct CallbackQuery {
    pub code: String,
}

#[derive(serde::Serialize)]
pub struct TokenRequest {
    pub client_id: String,
    pub client_secret: String,
    pub code: String,
}

#[derive(serde::Deserialize)]
pub struct AccessTokenResponse {
    pub access_token: String,
}

async fn callback_handler(
    State(state): State<AppState>,
    Query(query): axum::extract::Query<CallbackQuery>,
) -> impl IntoResponse {
    let client = reqwest::Client::new();
    let res = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .json(&TokenRequest {
            client_id: state.client_id.clone(),
            client_secret: state.client_secret.clone(),
            code: query.code.clone(),
        })
        .send()
        .await;

    let frontend_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

    match res {
        Ok(response) => {
            if let Ok(token_res) = response.json::<AccessTokenResponse>().await {
                axum::response::Redirect::temporary(&format!("{}/?token={}", frontend_url, token_res.access_token))
            } else {
                axum::response::Redirect::temporary(&format!("{}/?error=token_parsing_failed", frontend_url))
            }
        }
        Err(_) => axum::response::Redirect::temporary(&format!("{}/?error=auth_failed", frontend_url)),
    }
}

#[derive(serde::Deserialize)]
pub struct LeaderboardQuery {
    pub repo: Option<String>,
}

async fn leaderboard_handler(
    headers: HeaderMap,
    axum::extract::Query(query): axum::extract::Query<LeaderboardQuery>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let score_content = if let (Some(repo_full_name), Some(auth_header)) = (query.repo, headers.get("Authorization").and_then(|h| h.to_str().ok())) {
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            let octo = octocrab::Octocrab::builder()
                .personal_token(token.to_string())
                .build()
                .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Octocrab build failed: {:?}", e)))?;
            let parts: Vec<&str> = repo_full_name.split('/').collect();
            if parts.len() == 2 {
                let owner = parts[0];
                let repo = parts[1];
                match github::state::fetch_score_file(&octo, owner, repo).await {
                    Ok((content, _)) => content,
                    Err(_) => github::parser::get_default_score_file(),
                }
            } else {
                github::parser::get_default_score_file()
            }
        } else {
            github::parser::get_default_score_file()
        }
    } else {
        let score_path = std::env::var("REPOGEE_SCORE_PATH").unwrap_or_else(|_| "SCORE.md".to_string());
        if std::path::Path::new(&score_path).exists() {
            std::fs::read_to_string(&score_path).unwrap_or_else(|_| github::parser::get_default_score_file())
        } else {
            github::parser::get_default_score_file()
        }
    };

    let stats = github::parser::parse_score_file(&score_content);
    Ok(axum::Json(stats))
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct GithubRepoInfo {
    pub id: u64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub private: bool,
    pub onboarded: bool,
}

async fn repos_handler(
    headers: HeaderMap,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| (axum::http::StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "Invalid Authorization token format".to_string()))?;

    let octo = octocrab::Octocrab::builder()
        .personal_token(token.to_string())
        .build()
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Octocrab build failed: {:?}", e)))?;

    let page = octo
        .current()
        .list_repos_for_authenticated_user()
        .type_("owner")
        .send()
        .await
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to fetch user repos: {:?}", e)))?;

    let mut join_set = tokio::task::JoinSet::new();
    for repo in page {
        let octo = octo.clone();
        join_set.spawn(async move {
            let full_name = repo.full_name.clone().unwrap_or_default();
            let parts: Vec<&str> = full_name.split('/').collect();
            let mut onboarded = false;
            if parts.len() == 2 {
                let owner = parts[0];
                let r_name = parts[1];
                let res = octo
                    .repos(owner, r_name)
                    .get_content()
                    .path("SCORE.md")
                    .send()
                    .await;
                if res.is_ok() {
                    onboarded = true;
                }
            }
            GithubRepoInfo {
                id: repo.id.into_inner(),
                name: repo.name,
                full_name,
                description: repo.description,
                private: repo.r#private.unwrap_or(false),
                onboarded,
            }
        });
    }

    let mut repos = Vec::new();
    while let Some(res) = join_set.join_next().await {
        if let Ok(repo_info) = res {
            repos.push(repo_info);
        }
    }

    Ok((axum::http::StatusCode::OK, axum::Json(repos)))
}

#[derive(serde::Deserialize)]
pub struct OnboardPayload {
    pub repo_full_name: String,
}

async fn onboard_handler(
    headers: HeaderMap,
    axum::Json(payload): axum::Json<OnboardPayload>,
) -> Result<impl IntoResponse, (axum::http::StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| (axum::http::StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "Invalid Authorization token format".to_string()))?;

    let octo = octocrab::Octocrab::builder()
        .personal_token(token.to_string())
        .build()
        .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Octocrab build failed: {:?}", e)))?;

    let parts: Vec<&str> = payload.repo_full_name.split('/').collect();
    if parts.len() != 2 {
        return Err((axum::http::StatusCode::BAD_REQUEST, "Invalid repo_full_name format".to_string()));
    }
    let owner = parts[0];
    let repo = parts[1];

    let content_path = "SCORE.md";
    let exists = octo
        .repos(owner, repo)
        .get_content()
        .path(content_path)
        .send()
        .await
        .is_ok();

    if !exists {
        let default_score = github::parser::get_default_score_file();
        octo
            .repos(owner, repo)
            .create_file(content_path, "chore: initialize repogee SCORE.md", default_score)
            .send()
            .await
            .map_err(|e| {
                (
                    axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to create SCORE.md on GitHub: {:?}", e),
                )
            })?;
    }

    Ok((axum::http::StatusCode::OK, axum::Json(serde_json::json!({ "status": "success" }))))
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
        "release" => {
            let event: ReleaseEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse ReleaseEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;
            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_release_event(state_clone, event, inst_id).await {
                        error!("Error processing ReleaseEvent: {:?}", e);
                    }
                });
            }
        }
        "gollum" => {
            let event: GollumEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse GollumEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;
            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_gollum_event(state_clone, event, inst_id).await {
                        error!("Error processing GollumEvent: {:?}", e);
                    }
                });
            }
        }
        "pull_request_review_comment" => {
            let event: PullRequestReviewCommentEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse PullRequestReviewCommentEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;
            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_pr_review_comment_event(state_clone, event, inst_id).await {
                        error!("Error processing PullRequestReviewCommentEvent: {:?}", e);
                    }
                });
            }
        }
        "commit_comment" => {
            let event: CommitCommentEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse CommitCommentEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;
            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_commit_comment_event(state_clone, event, inst_id).await {
                        error!("Error processing CommitCommentEvent: {:?}", e);
                    }
                });
            }
        }
        "discussion" => {
            let event: DiscussionEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse DiscussionEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;
            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_discussion_event(state_clone, event, inst_id).await {
                        error!("Error processing DiscussionEvent: {:?}", e);
                    }
                });
            }
        }
        "discussion_comment" => {
            let event: DiscussionCommentEvent = serde_json::from_slice(&bytes).map_err(|e| {
                error!("Failed to parse DiscussionCommentEvent: {:?}", e);
                (StatusCode::BAD_REQUEST, format!("Invalid payload: {}", e))
            })?;
            if let Some(ref inst) = event.installation {
                let inst_id = inst.id;
                let state_clone = state.clone();
                tokio::spawn(async move {
                    if let Err(e) = process_discussion_comment_event(state_clone, event, inst_id).await {
                        error!("Error processing DiscussionCommentEvent: {:?}", e);
                    }
                });
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

    if action != "opened" && action != "assigned" && action != "review_requested" && !(action == "closed" && is_merged) {
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
        
        (xp_to_add, dominant_class.clone())
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

    if action != "opened" && action != "assigned" && !(action == "closed" && is_completed) {
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
    if event.action != "submitted" {
        return Ok(());
    }

    let username = &event.review.user.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;

    info!("Processing PR Review submission for user @{}", username);

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
    let xp_to_add = engine::calculator::calculate_push_xp(&event);

    if xp_to_add == 0 && dominant_class.is_none() {
        return Ok(());
    }

    info!("Processing push event for @{}. Dominant class based on pushed files: {:?}", username, dominant_class);

    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;

    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        (xp_to_add, dominant_class.clone())
    }).await?;

    Ok(())
}

async fn process_release_event(
    state: AppState,
    event: ReleaseEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    if action != "published" {
        return Ok(());
    }
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    info!("Processing Release published event for @{}", username);
    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;
    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_release_xp(action);
        (xp_to_add, None)
    }).await?;
    Ok(())
}

async fn process_gollum_event(
    state: AppState,
    event: GollumEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    info!("Processing Gollum wiki event for @{}", username);
    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;
    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_wiki_xp() * event.pages.len() as u32;
        (xp_to_add, None)
    }).await?;
    Ok(())
}

async fn process_pr_review_comment_event(
    state: AppState,
    event: PullRequestReviewCommentEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    if action != "created" {
        return Ok(());
    }
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    info!("Processing PR review comment created event for @{}", username);
    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;
    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_inline_comment_xp(action);
        (xp_to_add, None)
    }).await?;
    Ok(())
}

async fn process_commit_comment_event(
    state: AppState,
    event: CommitCommentEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    if action != "created" {
        return Ok(());
    }
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    info!("Processing Commit comment created event for @{}", username);
    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;
    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_commit_comment_xp(action);
        (xp_to_add, None)
    }).await?;
    Ok(())
}

async fn process_discussion_event(
    state: AppState,
    event: DiscussionEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    if action != "created" && action != "answered" {
        return Ok(());
    }
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    info!("Processing Discussion action '{}' event for @{}", action, username);
    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;
    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_discussion_xp(action);
        (xp_to_add, None)
    }).await?;
    Ok(())
}

async fn process_discussion_comment_event(
    state: AppState,
    event: DiscussionCommentEvent,
    inst_id: u64,
) -> Result<(), anyhow::Error> {
    let action = &event.action;
    if action != "created" {
        return Ok(());
    }
    let username = &event.sender.login;
    let owner = &event.repository.owner.login;
    let repo = &event.repository.name;
    info!("Processing Discussion comment created event for @{}", username);
    let client = github::client::get_installation_client(&state.app_client, inst_id).await?;
    github::state::update_leaderboard_with_retry(&client, owner, repo, username, |_stats| {
        let xp_to_add = engine::calculator::calculate_discussion_comment_xp(action);
        (xp_to_add, None)
    }).await?;
    Ok(())
}
