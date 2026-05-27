use axum::{
    routing::get,
    Router,
};
use std::net::SocketAddr;
use tracing::info;

#[tokio::main]
async fn main() {
    if let Err(e) = dotenvy::dotenv() {
        eprintln!("Warning: Failed to load .env file: {}", e);
    }

    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/", get(health_check));

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
