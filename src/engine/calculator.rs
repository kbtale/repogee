use crate::engine::constants::*;
use crate::types::{
    ChangedFile, IssueCommentEvent, IssuesEvent, PullRequestEvent, PullRequestReviewEvent,
};

fn is_source_file(filename: &str) -> bool {
    let lower = filename.to_lowercase();
    let ext = lower.split('.').last().unwrap_or("");
    matches!(
        ext,
        "rs" | "go" | "py" | "js" | "ts" | "java" | "c" | "cpp" | "h" | "hpp" | "sh" | "php" | "cs" | "rb" | "kt"
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
    streak_active: bool,
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
            || lower_body.contains("ref #")
            || lower_body.contains("fixes gh-")
        {
            base_xp += XP_LINK_ISSUE_TO_PR;
        }
    }

    if base_xp > 0 && streak_active {
        base_xp += ((base_xp as f64) * MULTIPLIER_STREAK).round() as u32;
    }

    base_xp
}

pub fn calculate_issue_xp(event: &IssuesEvent) -> u32 {
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
            .any(|l| l.name.eq_ignore_ascii_case("bug"));
        if has_bug_label {
            base_xp += BONUS_SQUASHER;
        }
    }

    base_xp
}

pub fn calculate_review_xp(event: &PullRequestReviewEvent) -> u32 {
    if event.action == "submitted" && event.review.state == "approved" {
        XP_SUBMIT_APPROVED_REVIEW
    } else {
        0
    }
}

pub fn calculate_comment_xp(event: &IssueCommentEvent) -> u32 {
    if event.action == "created" {
        XP_COMMENT_ACTIVE_ISSUE
    } else {
        0
    }
}
