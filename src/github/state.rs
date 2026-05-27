use octocrab::Octocrab;
use tracing::info;
use crate::github::parser::get_default_score_file;

pub async fn fetch_score_file(
    client: &Octocrab,
    owner: &str,
    repo: &str,
) -> Result<(String, Option<String>), anyhow::Error> {
    info!("Fetching SCORE.md for {}/{}", owner, repo);

    let content_result = client
        .repos(owner, repo)
        .get_content()
        .path("SCORE.md")
        .send()
        .await;

    match content_result {
        Ok(content_items) => {
            if let Some(file_content) = content_items.items.first() {
                let decoded = file_content.decoded_content().ok_or_else(|| {
                    anyhow::anyhow!("Failed to decode base64 content of SCORE.md")
                })?;
                Ok((decoded, Some(file_content.sha.clone())))
            } else {
                Err(anyhow::anyhow!("SCORE.md returned an empty list of items"))
            }
        }
        Err(octocrab::Error::GitHub { source, .. }) if source.status_code.as_u16() == 404 => {
            info!("SCORE.md not found in {}/{} - initializing new file", owner, repo);
            Ok((get_default_score_file(), None))
        }
        Err(e) => Err(e.into()),
    }
}
