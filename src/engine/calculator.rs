use crate::engine::constants::*;
use crate::types::{ChangedFile, IssueCommentEvent, IssuesEvent, PullRequestEvent, PullRequestReviewEvent};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum StreakTier {
    None,
    Tier1,
    Tier2,
}

impl StreakTier {
    pub fn multiplier(&self) -> f64 {
        match self {
            StreakTier::None => 0.0,
            StreakTier::Tier1 => STREAK_TIER_1_MULTIPLIER,
            StreakTier::Tier2 => STREAK_TIER_2_MULTIPLIER,
        }
    }
}

pub fn calculate_streak_tier(last_active: Option<DateTime<Utc>>) -> StreakTier {
    let Some(last_active) = last_active else {
        return StreakTier::None;
    };

    let hours = (Utc::now() - last_active).num_hours();

    if hours < STREAK_TIER_1_HOURS {
        StreakTier::Tier1
    } else if hours < STREAK_TIER_2_HOURS {
        StreakTier::Tier2
    } else {
        StreakTier::None
    }
}

fn apply_streak_multiplier(base_xp: u32, streak: StreakTier) -> u32 {
    if base_xp == 0 || streak == StreakTier::None {
        return base_xp;
    }
    base_xp + ((base_xp as f64) * streak.multiplier()).round() as u32
}

pub fn calculate_level(total_xp: u32) -> u32 {
    if total_xp == 0 {
        return 0;
    }
    ((total_xp as f64).sqrt() * 0.25).floor() as u32
}

fn is_source_file(filename: &str) -> bool {
    let lower = filename.to_lowercase();
    let ext = lower.split('.').last().unwrap_or("");
    matches!(
        ext,
        "rs" | "py"
            | "go"
            | "java"
            | "js"
            | "ts"
            | "html"
            | "css"
            | "sh"
            | "bash"
            | "zsh"
            | "php"
            | "c"
            | "cpp"
            | "h"
            | "hpp"
            | "cs"
            | "swift"
            | "kt"
            | "sql"
            | "db"
            | "sqlite"
            | "prisma"
            | "graphql"
            | "proto"
            | "jsx"
            | "tsx"
            | "vue"
            | "svelte"
            | "rb"
            | "lua"
            | "pl"
            | "r"
            | "dart"
            | "scala"
    )
}

fn is_doc_config_file(filename: &str) -> bool {
    let lower = filename.to_lowercase();
    let ext = lower.split('.').last().unwrap_or("");
    matches!(ext, "json" | "yaml" | "yml" | "toml" | "xml" | "md" | "txt")
}

pub fn calculate_pr_xp(
    event: &PullRequestEvent,
    changed_files: &[ChangedFile],
    pr_body: &str,
    pr_title: &str,
    streak: StreakTier,
) -> u32 {
    let mut base_xp = 0;

    if event.action == "opened" {
        base_xp += XP_OPEN_PR;
    } else if event.action == "closed" && event.pull_request.merged.unwrap_or(false) {
        base_xp += XP_MERGE_PR;

        let additions = event.pull_request.additions.unwrap_or(0);
        let deletions = event.pull_request.deletions.unwrap_or(0);
        if additions + deletions > 150 {
            base_xp += BONUS_HEAVY_LIFTER;
        }

        if deletions > additions {
            base_xp += BONUS_CLEAN_SLATE;
        }

        let has_source = changed_files.iter().any(|f| is_source_file(&f.filename));
        let has_doc = changed_files.iter().any(|f| is_doc_config_file(&f.filename));
        if has_source && has_doc {
            base_xp += BONUS_PROTOCOL;
        }

        let has_new_files = changed_files.iter().any(|f| f.status == "added");
        if has_new_files {
            base_xp += BONUS_ARCHITECT;
        }

        let lower_title = pr_title.to_lowercase();
        let lower_body = pr_body.to_lowercase();
        if lower_title.contains("conflict") || lower_body.contains("conflict") || lower_title.contains("merge branch") {
            base_xp += XP_RESOLVE_MERGE_CONFLICT;
        }

        if lower_body.contains("fixes #")
            || lower_body.contains("closes #")
            || lower_body.contains("resolves #")
            || lower_body.contains("fixes gh-")
        {
            base_xp += XP_LINK_ISSUE_TO_PR;
        }
    }

    apply_streak_multiplier(base_xp, streak)
}

pub fn calculate_issue_xp(event: &IssuesEvent, streak: StreakTier) -> u32 {
    let mut base_xp = 0;

    if event.action == "opened" {
        let body_len = event.issue.body.as_deref().unwrap_or("").len();
        if body_len >= 100 {
            base_xp += XP_OPEN_DETAILED_ISSUE;
        } else {
            base_xp += 10;
        }
    } else if event.action == "closed" && event.issue.state_reason.as_deref() == Some("completed") {
        base_xp += XP_CLOSE_ISSUE;

        let has_bug_label = event
            .issue
            .labels
            .iter()
            .any(|l| l.name.to_lowercase() == "bug");
        if has_bug_label {
            base_xp += BONUS_SQUASHER;
        }
    }

    apply_streak_multiplier(base_xp, streak)
}

pub fn calculate_review_xp(event: &PullRequestReviewEvent, streak: StreakTier) -> u32 {
    let base_xp = if event.action == "submitted" && event.review.state == "approved" {
        XP_SUBMIT_APPROVED_REVIEW
    } else {
        0
    };
    apply_streak_multiplier(base_xp, streak)
}

pub fn calculate_comment_xp(event: &IssueCommentEvent, streak: StreakTier) -> u32 {
    let base_xp = if event.action == "created" {
        XP_COMMENT_ACTIVE_ISSUE
    } else {
        0
    };
    apply_streak_multiplier(base_xp, streak)
}
