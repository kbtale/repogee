use chrono::{DateTime, Utc};
use octocrab::Octocrab;
use tracing::info;
use crate::engine::calculator::calculate_level;
use crate::engine::classes::FuturisticClass;
use crate::github::parser::{UserStats, get_default_score_file};

pub fn update_user_stats(
    stats: &mut Vec<UserStats>,
    username: &str,
    xp_to_add: u32,
    new_class: Option<FuturisticClass>,
    last_active_time: DateTime<Utc>,
) {
    let normalized = username.trim().trim_start_matches('@').to_string();

    let mut found = false;
    for user in stats.iter_mut() {
        if user.username.eq_ignore_ascii_case(&normalized) {
            user.xp += xp_to_add;
            user.level = calculate_level(user.xp);
            user.last_active = Some(last_active_time);
            if let Some(class) = new_class {
                user.class = class;
            }
            found = true;
            break;
        }
    }

    if !found {
        let class = new_class.unwrap_or(FuturisticClass::NexusArchitect);
        let level = calculate_level(xp_to_add);
        stats.push(UserStats {
            username: normalized,
            class,
            level,
            xp: xp_to_add,
            last_active: Some(last_active_time),
        });
    }

    stats.sort_by(|a, b| b.xp.cmp(&a.xp));
}

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
