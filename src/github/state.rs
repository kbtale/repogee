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
    new_class_profile: Option<(FuturisticClass, String)>,
    last_active_time: DateTime<Utc>,
) {
    let normalized = username.trim().trim_start_matches('@').to_string();

    let mut found = false;
    for user in stats.iter_mut() {
        if user.username.eq_ignore_ascii_case(&normalized) {
            user.xp += xp_to_add;
            user.level = calculate_level(user.xp);
            user.last_active = Some(last_active_time);
            if let Some((class, subclass)) = new_class_profile.clone() {
                user.class = class;
                user.subclass = subclass;
            }
            found = true;
            break;
        }
    }

    if !found {
        let (class, subclass) = match new_class_profile {
            Some((class, subclass)) => (class, subclass),
            None => (FuturisticClass::BackendDeveloper, "General Developer".to_string()),
        };
        let level = calculate_level(xp_to_add);
        stats.push(UserStats {
            username: normalized,
            class,
            subclass,
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

pub async fn commit_score_file(
    client: &Octocrab,
    owner: &str,
    repo: &str,
    content: &str,
    sha: Option<&str>,
) -> Result<(), anyhow::Error> {
    info!("Committing SCORE.md to {}/{}", owner, repo);
    let commit_message = "chore: update repogee leaderboard [skip ci]";

    if let Some(sha_str) = sha {
        client
            .repos(owner, repo)
            .update_file("SCORE.md", commit_message, content, sha_str.to_string())
            .send()
            .await?;
    } else {
        client
            .repos(owner, repo)
            .create_file("SCORE.md", commit_message, content)
            .send()
            .await?;
    }

    info!("Successfully committed SCORE.md to {}/{}", owner, repo);
    Ok(())
}

pub async fn update_leaderboard_with_retry<F>(
    client: &Octocrab,
    owner: &str,
    repo: &str,
    username: &str,
    mut update_fn: F,
) -> Result<(), anyhow::Error>
where
    F: FnMut(&[UserStats]) -> (u32, Option<(FuturisticClass, String)>),
{
    let mut attempts = 0;
    let max_attempts = 5;

    loop {
        attempts += 1;
        info!(
            "Attempt {} of {} to update SCORE.md for user @{}",
            attempts, max_attempts, username
        );

        let (score_content, sha) = fetch_score_file(client, owner, repo).await?;
        let mut stats = crate::github::parser::parse_score_file(&score_content);

        let (xp_to_add, new_class) = update_fn(&stats);

        if xp_to_add == 0 && new_class.is_none() {
            info!("No XP earned and no class updates for @{} from this event", username);
            return Ok(());
        }

        let now = Utc::now();
        update_user_stats(&mut stats, username, xp_to_add, new_class, now);

        let new_score_content = crate::github::parser::generate_score_file(&stats);

        if new_score_content == score_content {
            info!("No changes to SCORE.md, skipping commit");
            return Ok(());
        }

        match commit_score_file(client, owner, repo, &new_score_content, sha.as_deref()).await {
            Ok(_) => {
                info!("Successfully committed SCORE.md after {} attempts", attempts);
                return Ok(());
            }
            Err(e) => {
                if attempts >= max_attempts {
                    tracing::error!(
                        "Failed to commit SCORE.md after {} attempts: {:?}",
                        attempts,
                        e
                    );
                    return Err(e);
                }

                let is_transient = if let Some(octocrab::Error::GitHub { source, .. }) = e.downcast_ref::<octocrab::Error>() {
                    let status = source.status_code.as_u16();
                    status == 409 || status == 422 || (500..600).contains(&status)
                } else {
                    false
                };

                if is_transient {
                    let delay_ms = 100 * (1 << attempts)
                        + (Utc::now().timestamp_nanos_opt().unwrap_or(0) as u64 % 100);
                    tracing::warn!(
                        "Transient error/conflict updating SCORE.md: {:?}. Retrying in {}ms...",
                        e,
                        delay_ms
                    );
                    tokio::time::sleep(std::time::Duration::from_millis(delay_ms)).await;
                } else {
                    return Err(e);
                }
            }
        }
    }
}
