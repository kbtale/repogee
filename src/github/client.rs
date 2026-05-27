use std::fs;
use octocrab::Octocrab;
use jsonwebtoken::EncodingKey;
use tracing::{info, error};

pub fn get_app_client() -> Result<Octocrab, anyhow::Error> {
    let app_id_str = std::env::var("GITHUB_APP_ID")?;
    let app_id = app_id_str.parse::<u64>()?;
    let key_path = std::env::var("GITHUB_PRIVATE_KEY_PATH")?;
    
    let key_contents = fs::read(&key_path)
        .map_err(|e| {
            error!("Failed to read private key at {}: {:?}", key_path, e);
            e
        })?;
    
    let key = EncodingKey::from_rsa_pem(&key_contents)?;
    let client = Octocrab::builder()
        .app(app_id.into(), key)
        .build()?;
        
    Ok(client)
}

pub async fn get_installation_client(installation_id: u64) -> Result<Octocrab, anyhow::Error> {
    let app_client = get_app_client()?;
    info!("Authenticating as installation ID: {}", installation_id);
    
    let (installation_client, _token) = app_client
        .installation_and_token(installation_id.into())
        .await?;
        
    Ok(installation_client)
}
