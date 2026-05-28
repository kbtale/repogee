#![allow(dead_code)]
use serde::Deserialize;


#[derive(Debug, Clone, Deserialize)]
pub struct User {
    pub login: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Label {
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Installation {
    pub id: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Repository {
    pub name: String,
    pub owner: User,
    pub full_name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PullRequest {
    pub number: u64,
    pub title: Option<String>,
    pub body: Option<String>,
    pub merged: Option<bool>,
    pub additions: Option<u32>,
    pub deletions: Option<u32>,
    pub user: User,
    pub labels: Vec<Label>,
    pub created_at: Option<String>,
    pub merged_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PullRequestEvent {
    pub action: String,
    pub pull_request: PullRequest,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Issue {
    pub number: u64,
    pub user: User,
    pub labels: Vec<Label>,
    pub state_reason: Option<String>,
    pub body: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct IssuesEvent {
    pub action: String,
    pub issue: Issue,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct IssueComment {
    pub user: User,
}

#[derive(Debug, Clone, Deserialize)]
pub struct IssueCommentEvent {
    pub action: String,
    pub issue: Issue,
    pub comment: IssueComment,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PullRequestReview {
    pub state: String,
    pub user: User,
    pub body: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PullRequestReviewEvent {
    pub action: String,
    pub pull_request: PullRequest,
    pub review: PullRequestReview,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CommitAuthor {
    pub name: String,
    pub username: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PushCommit {
    pub id: String,
    pub message: String,
    pub author: CommitAuthor,
    pub added: Vec<String>,
    pub removed: Vec<String>,
    pub modified: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PushEvent {
    #[serde(rename = "ref")]
    pub ref_field: String,
    pub forced: bool,
    pub commits: Vec<PushCommit>,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Release {
    pub tag_name: String,
    pub name: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ReleaseEvent {
    pub action: String,
    pub release: Release,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GollumPage {
    pub page_name: String,
    pub title: String,
    pub action: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GollumEvent {
    pub pages: Vec<GollumPage>,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PullRequestReviewCommentEvent {
    pub action: String,
    pub pull_request: PullRequest,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CommitCommentEvent {
    pub action: String,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Discussion {
    pub id: u64,
    pub title: String,
    pub answer_html_url: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DiscussionEvent {
    pub action: String,
    pub discussion: Discussion,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DiscussionCommentEvent {
    pub action: String,
    pub discussion: Discussion,
    pub repository: Repository,
    pub sender: User,
    pub installation: Option<Installation>,
}

#[derive(Debug, Clone)]
pub enum WebhookEvent {
    PullRequest(PullRequestEvent),
    Issues(IssuesEvent),
    IssueComment(IssueCommentEvent),
    PullRequestReview(PullRequestReviewEvent),
    Push(PushEvent),
    Release(ReleaseEvent),
    Gollum(GollumEvent),
    PullRequestReviewComment(PullRequestReviewCommentEvent),
    CommitComment(CommitCommentEvent),
    Discussion(DiscussionEvent),
    DiscussionComment(DiscussionCommentEvent),
}

#[derive(Debug, Clone, Deserialize)]
pub struct ChangedFile {
    pub filename: String,
    pub status: String,
}
