# Repogee

Repogee tracks developer contributions, calculates experience points (XP), levels up developers, assigns classes based on commit histories, and maintains a leaderboard in a `SCORE.md` file in the root of the repository.

Repogee is stateless. The repository's `SCORE.md` is the single source of truth for developer statistics, eliminating the need for external databases or state stores.

## Class System

A developer's class is determined and updated by analyzing the file extensions within their commit history and pull requests:

| Class | Specialization | File Types |
| --- | --- | --- |
| Grid Infiltrator | Scripting & Automation | `.py`, `.sh`, `.bash`, `.zsh` |
| Nexus Architect | Backend Systems | `.rs`, `.go`, `.java`, `.php`, `.cpp`, `.cs` |
| Quantum Archivist | Databases & Schemas | `.sql`, `.db`, `.sqlite`, `.prisma` |
| Protocol Sentinel | Serialization & APIs | `.json`, `.yaml`, `.xml`, `.toml`, `.graphql` |
| Holo-Sculptor | Frontend & UI / UX | `.html`, `.css`, `.js`, `.ts`, `.tsx`, `.vue` |
| Void Engineer | DevOps & Infrastructure | `.yml` (workflows), `Dockerfile` |
| Data Scribe | Documentation | `.md`, `.txt`, `.rst` |
| Syntax Purifier | Code Formatting & Linting | `.prettierrc`, `.eslintrc` |

## Feats and XP Modifiers

### Core Feats
* **Merge a Pull Request**: `+50 XP`
* **Open a Pull Request**: `+10 XP`
* **Close an Issue (Completed)**: `+30 XP`
* **Open a Detailed Issue** (body >= 100 chars): `+10 XP`
* **Submit an Approved PR Review**: `+25 XP`
* **Resolve a Merge Conflict**: `+15 XP`
* **Link an Issue to a PR**: `+5 XP`
* **Add a Comment to an Active Issue**: `+2 XP`

### Modifiers and Multipliers
* **The Heavy Lifter**: `+20 XP` bonus to a merged PR if added/deleted lines > 150.
* **The Clean Slate**: `+20 XP` bonus for a merged PR that deletes more lines than it adds.
* **The Architect**: `+15 XP` bonus if a PR creates new files.
* **The Protocol Bonus**: `+10 XP` if a PR updates both source files and documentation/config files.
* **The Squasher**: `+15 XP` if an issue with the `bug` label is closed as completed.
* **The Streak**: `+10%` total XP multiplier if the user merged code in the last 72 hours.

## Leveling Formula

Levels are calculated using:
$$\text{Level} = \lfloor 0.25 \times \sqrt{\text{XP}} \rfloor$$

## GitHub Action Mode

Repogee can run directly inside your repository using GitHub Actions. This runs within GitHub's free-tier runners and requires no server hosting, database setup, or secret configuration.

### Setup

1. Fork the Repogee repository to your GitHub account.
2. In the repository you want to gamify, create a workflow file at `.github/workflows/repogee.yml` containing:

```yaml
name: Repogee Leaderboard

on:
  pull_request:
    types: [opened, closed]
  issues:
    types: [opened, closed]
  issue_comment:
    types: [created]
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  gamify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Repogee Leaderboard
        uses: <your-username>/repogee@main
```

3. Replace `<your-username>` in the workflow with the GitHub username where you forked the repository.
4. Commit and push the workflow file to your default branch.
5. Repogee will now run automatically on pull requests, issues, comments, and pushes, updating `SCORE.md` in the repository root.

## Server Mode (GitHub App)

If you prefer to run Repogee as a hosted service using webhooks, you can configure it as a GitHub App.

### Requirements
Ensure you have the following installed:
* Rust (stable, 2024 edition)
* Cargo

### Configuration
Copy the `.env.example` file to `.env` and define the required variables:
```env
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY_PATH=/path/to/your/private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
PORT=3000
HOST=0.0.0.0
```

### Running Locally
Run the server in development mode:
```bash
cargo run
```

### Deploying the GitHub App
1. Create a GitHub App in your GitHub Developer Settings.
2. Set the Webhook URL to point to your deployed Axum server `/webhook` endpoint.
3. Generate a Private Key, download the `.pem` file, save it locally, and configure `GITHUB_PRIVATE_KEY_PATH`.
4. Under Permissions, grant read and write access to:
   * Issues (track opens, closes, comments)
   * Pull Requests (track opens, merges, reviews)
   * Repository Contents (read and write `SCORE.md`)
   * Single File (read and write `SCORE.md`)
5. Install the GitHub App on your target repositories.

## Verification

To verify the implementation, run:
```bash
cargo test
```

To run clippy and lints:
```bash
cargo clippy --all-targets --all-features -- -D warnings
```
