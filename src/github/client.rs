use std::fs;
use octocrab::Octocrab;
use jsonwebtoken::EncodingKey;
use tracing::info;

pub fn init_app_client() -> Result<Octocrab, anyhow::Error> {
    let app_id_str = std::env::var("GITHUB_APP_ID")
        .map_err(|_| anyhow::anyhow!("GITHUB_APP_ID environment variable is not set"))?;
    let app_id = app_id_str.parse::<u64>()
        .map_err(|e| anyhow::anyhow!("GITHUB_APP_ID is not a valid u64: {}", e))?;

    let key_contents = if let Ok(env_key) = std::env::var("GITHUB_PRIVATE_KEY") {
        env_key.into_bytes()
    } else {
        let key_path = std::env::var("GITHUB_PRIVATE_KEY_PATH")
            .map_err(|_| anyhow::anyhow!("Either GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_PATH must be set"))?;
        fs::read(&key_path)
            .map_err(|e| anyhow::anyhow!("Failed to read private key at {}: {:?}", key_path, e))?
    };
    
    let key = EncodingKey::from_rsa_pem(&key_contents)
        .map_err(|e| anyhow::anyhow!("Failed to parse private key PEM: {:?}", e))?;
    let client = Octocrab::builder()
        .app(app_id.into(), key)
        .build()
        .map_err(|e| anyhow::anyhow!("Failed to build Octocrab app client: {:?}", e))?;
        
    Ok(client)
}

pub async fn get_installation_client(app_client: &Octocrab, installation_id: u64) -> Result<Octocrab, anyhow::Error> {
    info!("Authenticating as installation ID: {}", installation_id);
    
    let (installation_client, _token) = app_client
        .installation_and_token(installation_id.into())
        .await?;
        
    Ok(installation_client)
}

