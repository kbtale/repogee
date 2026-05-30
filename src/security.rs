use axum::{
    body::Bytes,
    extract::FromRequest,
    http::{Request, StatusCode},
};
use hmac::{Hmac, KeyInit, Mac};
use sha2::Sha256;
use tracing::{error, warn};

type HmacSha256 = Hmac<Sha256>;

pub fn verify_signature(secret: &str, signature_header: &str, body: &[u8]) -> Result<(), &'static str> {
    if !signature_header.starts_with("sha256=") {
        return Err("Signature header does not start with 'sha256='");
    }

    let hex_sig = &signature_header[7..];
    let received_bytes = hex::decode(hex_sig).map_err(|_| "Failed to decode signature hex")?;

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|_| "Failed to initialize HMAC key")?;
    mac.update(body);

    mac.verify_slice(&received_bytes)
        .map_err(|_| "HMAC verification failed")
}

pub struct VerifiedWebhookPayload(pub Bytes);

impl FromRequest<crate::AppState> for VerifiedWebhookPayload {
    type Rejection = (StatusCode, String);

    async fn from_request(req: Request<axum::body::Body>, state: &crate::AppState) -> Result<Self, Self::Rejection> {
        let (parts, body) = req.into_parts();

        let signature = parts
            .headers
            .get("x-hub-signature-256")
            .and_then(|v| v.to_str().ok())
            .map(|s| s.to_string())
            .ok_or_else(|| {
                warn!("Missing x-hub-signature-256 header");
                (StatusCode::UNAUTHORIZED, "Missing x-hub-signature-256 header".to_string())
            })?;

        let bytes = Bytes::from_request(Request::from_parts(parts, body), state)
            .await
            .map_err(|e| {
                error!("Failed to buffer request body: {:?}", e);
                (StatusCode::BAD_REQUEST, "Failed to read request body".to_string())
            })?;

        verify_signature(&state.webhook_secret, &signature, &bytes).map_err(|err| {
            warn!("Webhook verification failed: {}", err);
            (StatusCode::UNAUTHORIZED, format!("Invalid signature: {}", err))
        })?;

        Ok(VerifiedWebhookPayload(bytes))
    }
}

