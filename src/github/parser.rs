use chrono::{DateTime, Utc};
use tracing::info;
use crate::engine::classes::FuturisticClass;

#[derive(Debug, Clone)]
pub struct UserStats {
    pub username: String,
    pub class: FuturisticClass,
    pub level: u32,
    pub xp: u32,
    pub last_active: Option<DateTime<Utc>>,
}

pub fn parse_score_file(content: &str) -> Vec<UserStats> {
    let mut stats = Vec::new();

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('|') && trimmed.ends_with('|') {
            let parts: Vec<&str> = trimmed.split('|').map(|s| s.trim()).collect();
            if parts.len() < 6 {
                continue;
            }

            let username_raw = parts[1];
            let class_raw = parts[2];
            let level_raw = parts[3];
            let xp_raw = parts[4];
            let last_active_raw = parts.get(5).copied().unwrap_or("N/A");

            if username_raw.eq_ignore_ascii_case("username") 
                || username_raw.starts_with("---") 
                || username_raw.is_empty() 
            {
                continue;
            }

            let username = if username_raw.starts_with('@') {
                username_raw[1..].to_string()
            } else {
                username_raw.to_string()
            };

            let class = FuturisticClass::from_str(class_raw).unwrap_or(FuturisticClass::NexusArchitect);

            let level = level_raw.parse::<u32>().unwrap_or(0);
            let xp = xp_raw.parse::<u32>().unwrap_or(0);

            let last_active = if last_active_raw == "N/A" || last_active_raw.is_empty() {
                None
            } else {
                DateTime::parse_from_rfc3339(last_active_raw)
                    .map(|dt| dt.with_timezone(&Utc))
                    .ok()
            };

            stats.push(UserStats {
                username,
                class,
                level,
                xp,
                last_active,
            });
        }
    }

    info!("Successfully parsed {} user(s) from SCORE.md", stats.len());
    stats
}

pub fn generate_score_file(stats: &[UserStats]) -> String {
    let mut md = String::new();
    
    md.push_str("# 🏆 Repogee Leaderboard\n\n");
    md.push_str("Gamifying repository activity using Rust, serverless architecture, and GitHub webhooks.\n\n");
    
    md.push_str("| Username | Class | Level | XP | Last Active |\n");
    md.push_str("| --- | --- | --- | --- | --- |\n");

    for user in stats {
        let last_active_str = match user.last_active {
            Some(dt) => dt.to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
            None => "N/A".to_string(),
        };

        md.push_str(&format!(
            "| @{} | {} | {} | {} | {} |\n",
            user.username,
            user.class.as_str(),
            user.level,
            user.xp,
            last_active_str
        ));
    }

    md
}

pub fn get_default_score_file() -> String {
    generate_score_file(&[])
}
