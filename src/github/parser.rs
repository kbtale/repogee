use chrono::{DateTime, Utc};
use tracing::info;
use crate::engine::classes::FuturisticClass;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UserStats {
    pub username: String,
    pub class: FuturisticClass,
    pub subclass: String,
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

            let username = username_raw.strip_prefix('@').unwrap_or(username_raw).to_string();

            let mut class = FuturisticClass::BackendDeveloper;
            let mut subclass = "General Developer".to_string();

            if class_raw.contains(':') {
                let bits: Vec<&str> = class_raw.split(':').map(|s| s.trim()).collect();
                if let Some(c) = FuturisticClass::from_str(bits[0]) {
                    class = c;
                }
                if bits.len() > 1 {
                    subclass = bits[1].to_string();
                }
            } else if let Some(c) = FuturisticClass::from_str(class_raw) {
                class = c;
                subclass = format!("General {}", c.role_suffix());
            }

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
                subclass,
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
            "| @{} | {}: {} | {} | {} | {} |\n",
            user.username,
            user.class.as_str(),
            user.subclass,
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

#[cfg(test)]
mod tests {
    use super::*;

    mod score_file {
        use super::*;

        #[test]
        fn generates_default_empty_leaderboard() {
            let default_md = get_default_score_file();
            assert!(default_md.contains("# 🏆 Repogee Leaderboard"));
            assert!(default_md.contains("| Username | Class | Level | XP | Last Active |"));
        }

        #[test]
        fn parses_valid_score_file_rows() {
            let content = "\
# Repogee Leaderboard

| Username | Class | Level | XP | Last Active |
| --- | --- | --- | --- | --- |
| @alice | Backend Developer: Database | 5 | 500 | 2026-06-03T23:53:22Z |
| @bob | Frontend Engineer: UI | 3 | 300 | N/A |
";
            let stats = parse_score_file(content);
            assert_eq!(stats.len(), 2);
            assert_eq!(stats[0].username, "alice");
            assert_eq!(stats[0].subclass, "Database");
            assert_eq!(stats[0].level, 5);
            assert_eq!(stats[0].xp, 500);
            assert_eq!(stats[1].username, "bob");
            assert_eq!(stats[1].subclass, "UI");
            assert_eq!(stats[1].level, 3);
            assert_eq!(stats[1].xp, 300);
        }

        #[test]
        fn generates_correct_markdown_for_stats() {
            let stats = vec![UserStats {
                username: "charlie".to_string(),
                class: FuturisticClass::FrontendArtisan,
                subclass: "Architecture".to_string(),
                level: 2,
                xp: 200,
                last_active: None,
            }];
            let generated = generate_score_file(&stats);
            assert!(generated.contains("| @charlie | Frontend Artisan: Architecture | 2 | 200 | N/A |"));
        }
    }
}
