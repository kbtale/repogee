mod security;
mod types;
mod engine;
mod github;

use axum::{
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    response::IntoResponse,
    Router,
};
use std::net::SocketAddr;
use tracing::{error, info, warn};

use security::VerifiedWebhookPayload;
use types::{
    IssueCommentEvent, IssuesEvent, PullRequestEvent, PullRequestReviewEvent, PushEvent,
};

#[tokio::main]
async fn main() {
    if let Err(e) = dotenvy::dotenv() {
        eprintln!("Warning: Failed to load .env file: {}", e);
    }

    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(health_check))
        .route("/webhook", post(handle_webhook));

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
            info!("PR action '{}'", event.action);
        }
        _ => {
            info!("Received unsupported GitHub event: {}", event_name);
        }
    }

    Ok((StatusCode::OK, "Webhook event processed".to_string()))
}
