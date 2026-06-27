#[cfg(test)]
mod tests {
    use crate::engine::calculator::{calculate_level, calculate_streak_tier, StreakTier};
    use chrono::{Duration, Utc};

    #[test]
    fn test_calculate_level() {
        assert_eq!(calculate_level(0), 0);
        assert_eq!(calculate_level(15), 0);
        assert_eq!(calculate_level(16), 1);
        assert_eq!(calculate_level(64), 2);
    }

    #[test]
    fn test_calculate_streak_tier() {
        let now = Utc::now();
        assert_eq!(calculate_streak_tier(None), StreakTier::None);
        
        let active_recently = now - Duration::hours(12);
        assert_eq!(calculate_streak_tier(Some(active_recently)), StreakTier::Tier1);
    }
}
