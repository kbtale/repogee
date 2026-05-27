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
pub struct ChangedFile {
    pub filename: String,
    pub status: String,
}

#[derive(Debug, Clone)]
pub enum WebhookEvent {
    PullRequest(PullRequestEvent),
    Issues(IssuesEvent),
    IssueComment(IssueCommentEvent),
}
