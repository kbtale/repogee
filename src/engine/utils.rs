/// Formats the XP progress bar as a string representation.
pub fn format_progress_bar(xp: u32, next_level_xp: u32) -> String {
    if next_level_xp == 0 {
        return "██████████ 100%".to_string();
    }
    let percentage = (xp as f64 / next_level_xp as f64) * 100.0;
    let filled_blocks = ((percentage / 10.0).round() as usize).min(10);
    let empty_blocks = 10 - filled_blocks;
    
    let mut bar = String::new();
    for _ in 0..filled_blocks {
        bar.push('█');
    }
    for _ in 0..empty_blocks {
        bar.push('░');
    }
    format!("{} {:.1}%", bar, percentage)
}

/// Trims and standardizes pull request titles for gamification metrics.
pub fn clean_title(title: &str) -> String {
    title.trim().to_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_progress_bar() {
        assert_eq!(format_progress_bar(50, 100), "█████░░░░░ 50.0%");
        assert_eq!(format_progress_bar(0, 100), "░░░░░░░░░░ 0.0%");
        assert_eq!(format_progress_bar(100, 100), "██████████ 100.0%");
        assert_eq!(format_progress_bar(120, 100), "██████████ 120.0%");
    }

    #[test]
    fn test_clean_title() {
        assert_eq!(clean_title("  Feat: Add Auth  "), "feat: add auth");
        assert_eq!(clean_title("FIX: BUG "), "fix: bug");
    }
}

