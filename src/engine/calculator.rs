use crate::engine::constants::*;
use crate::types::{ChangedFile, IssueCommentEvent, IssuesEvent, PullRequestEvent, PullRequestReviewEvent, PushEvent};

pub fn calculate_level(total_xp: u32) -> u32 {
    if total_xp == 0 {
        return 0;
    }
    ((total_xp as f64).sqrt() * 0.25).floor() as u32
}

fn is_source_file(filename: &str) -> bool {
    let lower = filename.to_lowercase();
    let ext = lower.split('.').next_back().unwrap_or("");

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
    let ext = lower.split('.').next_back().unwrap_or("");
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
    } else if event.action == "assigned" {
        base_xp += XP_TASK_ASSIGNED;
    } else if event.action == "review_requested" {
        base_xp += XP_REVIEW_REQUESTED;
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

        let refactor_wizard = changed_files.len() > 5 && !changed_files.iter().any(|f| f.status == "added");
        if refactor_wizard {
            base_xp += BONUS_REFACTORING_WIZARD;
        }

        if additions + deletions <= 3 && additions + deletions > 0 {
            base_xp += BONUS_PRECISION_STRIKE;
        }

        if additions + deletions > 500 {
            base_xp += BONUS_COLOSSAL_CONTRIBUTION;
        }

        let doc_evangelist = changed_files.iter().all(|f| is_doc_config_file(&f.filename)) && !changed_files.is_empty();
        if doc_evangelist {
            base_xp += BONUS_DOC_EVANGELIST;
        }

        let quick_merger = match (&event.pull_request.created_at, &event.pull_request.merged_at) {
            (Some(c), Some(m)) => {
                if let (Ok(c_dt), Ok(m_dt)) = (chrono::DateTime::parse_from_rfc3339(c), chrono::DateTime::parse_from_rfc3339(m)) {
                    (m_dt - c_dt).num_hours() < 2
                } else {
                    false
                }
            }
            _ => false,
        };
        if quick_merger {
            base_xp += BONUS_QUICK_MERGER;
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
        if body_len > 500 {
            base_xp += BONUS_EPIC_ISSUE;
        } else if body_len >= 100 {
            base_xp += XP_OPEN_DETAILED_ISSUE;
        } else {
            base_xp += 10;
        }
    } else if event.action == "assigned" {
        base_xp += XP_TASK_ASSIGNED;
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

    base_xp
}

pub fn calculate_review_xp(event: &PullRequestReviewEvent) -> u32 {
    let mut base_xp = 0;
    if event.action == "submitted" {
        if event.review.state == "approved" {
            base_xp += XP_SUBMIT_APPROVED_REVIEW;
        } else if event.review.state == "changes_requested" {
            let body_len = event.review.body.as_deref().unwrap_or("").len();
            if body_len > 150 {
                base_xp += BONUS_THOROUGH_MENTOR;
            }
        }
    }
    base_xp
}

pub fn calculate_comment_xp(event: &IssueCommentEvent) -> u32 {
    if event.action == "created" {
        XP_COMMENT_ACTIVE_ISSUE
    } else {
        0
    }
}

pub fn calculate_wiki_xp() -> u32 {
    XP_WIKI_UPDATE
}

pub fn calculate_release_xp(action: &str) -> u32 {
    if action == "published" {
        XP_PUBLISH_RELEASE
    } else {
        0
    }
}

pub fn calculate_discussion_xp(action: &str) -> u32 {
    if action == "created" {
        XP_START_DISCUSSION
    } else if action == "answered" {
        XP_ANSWER_DISCUSSION
    } else {
        0
    }
}

pub fn calculate_discussion_comment_xp(action: &str) -> u32 {
    if action == "created" {
        XP_COMMENT_DISCUSSION
    } else {
        0
    }
}

pub fn calculate_inline_comment_xp(action: &str) -> u32 {
    if action == "created" {
        XP_INLINE_REVIEW_COMMENT
    } else {
        0
    }
}

pub fn calculate_commit_comment_xp(action: &str) -> u32 {
    if action == "created" {
        XP_COMMIT_COMMENT
    } else {
        0
    }
}

pub fn calculate_push_xp(event: &PushEvent) -> u32 {
    let mut base_xp = 0;
    if event.ref_field == "refs/heads/main" || event.ref_field == "refs/heads/master" {
        base_xp += BONUS_DIRECT_COMMIT;
    }
    if event.commits.len() >= 5 {
        base_xp += BONUS_BATCH_COMMIT;
    }
    base_xp
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{User, Repository, PullRequest, PullRequestEvent, IssuesEvent, Issue, PushEvent, PushCommit, CommitAuthor};

    mod calculate_level {
        use super::*;

        #[test]
        fn returns_zero_when_xp_is_zero() {
            assert_eq!(calculate_level(0), 0);
        }

        #[test]
        fn returns_five_when_xp_is_four_hundred() {
            assert_eq!(calculate_level(400), 5);
        }

        #[test]
        fn returns_ten_when_xp_is_sixteen_hundred() {
            assert_eq!(calculate_level(1600), 10);
        }
    }

    mod calculate_push_xp {
        use super::*;

        #[test]
        fn returns_zero_for_non_main_branch_single_commit() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let commit = PushCommit {
                id: "123".to_string(),
                message: "feat: something".to_string(),
                author: CommitAuthor {
                    name: "User One".to_string(),
                    username: Some("user1".to_string()),
                },
                added: vec![],
                removed: vec![],
                modified: vec![],
            };
            let event = PushEvent {
                ref_field: "refs/heads/feature".to_string(),
                forced: false,
                commits: vec![commit],
                repository: repo,
                sender: user,
                installation: None,
            };
            assert_eq!(calculate_push_xp(&event), 0);
        }

        #[test]
        fn adds_direct_commit_bonus_when_pushed_to_main() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let commit = PushCommit {
                id: "123".to_string(),
                message: "feat: something".to_string(),
                author: CommitAuthor {
                    name: "User One".to_string(),
                    username: Some("user1".to_string()),
                },
                added: vec![],
                removed: vec![],
                modified: vec![],
            };
            let event = PushEvent {
                ref_field: "refs/heads/main".to_string(),
                forced: false,
                commits: vec![commit],
                repository: repo,
                sender: user,
                installation: None,
            };
            assert_eq!(calculate_push_xp(&event), BONUS_DIRECT_COMMIT);
        }

        #[test]
        fn adds_batch_commit_bonus_when_five_commits_pushed() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let commits = (0..5).map(|i| PushCommit {
                id: i.to_string(),
                message: "feat: something".to_string(),
                author: CommitAuthor {
                    name: "User One".to_string(),
                    username: Some("user1".to_string()),
                },
                added: vec![],
                removed: vec![],
                modified: vec![],
            }).collect();
            let event = PushEvent {
                ref_field: "refs/heads/feature".to_string(),
                forced: false,
                commits,
                repository: repo,
                sender: user,
                installation: None,
            };
            assert_eq!(calculate_push_xp(&event), BONUS_BATCH_COMMIT);
        }
    }

    mod calculate_issue_xp {
        use super::*;

        #[test]
        fn returns_zero_for_unsupported_action() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let issue = Issue {
                number: 1,
                user: user.clone(),
                labels: vec![],
                state_reason: None,
                body: None,
            };
            let event = IssuesEvent {
                action: "labeled".to_string(),
                issue,
                repository: repo,
                sender: user,
                installation: None,
            };
            assert_eq!(calculate_issue_xp(&event), 0);
        }

        #[test]
        fn returns_standard_ten_points_for_short_opened_issue() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let issue = Issue {
                number: 1,
                user: user.clone(),
                labels: vec![],
                state_reason: None,
                body: Some("very short body".to_string()),
            };
            let event = IssuesEvent {
                action: "opened".to_string(),
                issue,
                repository: repo,
                sender: user,
                installation: None,
            };
            assert_eq!(calculate_issue_xp(&event), 10);
        }

        #[test]
        fn returns_additional_points_for_detailed_opened_issue() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let issue = Issue {
                number: 1,
                user: user.clone(),
                labels: vec![],
                state_reason: None,
                body: Some("a".repeat(120)),
            };
            let event = IssuesEvent {
                action: "opened".to_string(),
                issue,
                repository: repo,
                sender: user,
                installation: None,
            };
            assert_eq!(calculate_issue_xp(&event), XP_OPEN_DETAILED_ISSUE);
        }
    }

    mod calculate_pr_xp {
        use super::*;

        #[test]
        fn returns_basic_xp_for_opened_pr() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let pr = PullRequest {
                number: 1,
                title: Some("feat: implementation".to_string()),
                body: Some("detailed description".to_string()),
                merged: Some(false),
                additions: Some(10),
                deletions: Some(5),
                user: user.clone(),
                labels: vec![],
                created_at: None,
                merged_at: None,
            };
            let event = PullRequestEvent {
                action: "opened".to_string(),
                pull_request: pr,
                repository: repo,
                sender: user,
                installation: None,
            };
            let files = vec![];
            assert_eq!(calculate_pr_xp(&event, &files, "", "", false), XP_OPEN_PR);
        }

        #[test]
        fn applies_streak_multiplier_to_positive_pr_xp() {
            let user = User { login: "user1".to_string() };
            let repo = Repository {
                name: "repo1".to_string(),
                owner: user.clone(),
                full_name: "user1/repo1".to_string(),
            };
            let pr = PullRequest {
                number: 1,
                title: Some("feat: implementation".to_string()),
                body: Some("detailed description".to_string()),
                merged: Some(false),
                additions: Some(10),
                deletions: Some(5),
                user: user.clone(),
                labels: vec![],
                created_at: None,
                merged_at: None,
            };
            let event = PullRequestEvent {
                action: "opened".to_string(),
                pull_request: pr,
                repository: repo,
                sender: user,
                installation: None,
            };
            let files = vec![];
            let expected_base = XP_OPEN_PR;
            let expected_total = expected_base + ((expected_base as f64) * MULTIPLIER_STREAK).round() as u32;
            assert_eq!(calculate_pr_xp(&event, &files, "", "", true), expected_total);
        }
    }
}
