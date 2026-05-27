use hmac::{Hmac, KeyInit, Mac};
use sha2::Sha256;

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
