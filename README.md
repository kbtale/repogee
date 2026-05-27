# Repogee

Repogee is an App written in Rust that **gamifies repository activity**. It tracks developer contributions, calculates Experience Points (XP), levels up developers, assigns classes based on coding habits, and compiles a real-time leaderboard in a `SCORE.md` file within the root of the target repository.

Because Repogee is completely **stateless**, the target repository's `SCORE.md` serves as the single source of truth—no databases, no external state stores.

---

## 🛠️ The Futuristic Class System
A developer's class is dynamically determined and updated by analyzing the file extensions within their commit history and pull requests:

| Class | Specialization | File Types |
| --- | --- | --- |
| 🕵️‍♂️ **Grid Infiltrator** | Scripting & Automation | `.py`, `.sh`, `.bash`, `.zsh` |
| 🏛️ **Nexus Architect** | Backend Systems | `.rs`, `.go`, `.java`, `.php`, `.cpp`, `.cs` |
| 🗄️ **Quantum Archivist** | Databases & Schemas | `.sql`, `.db`, `.sqlite`, `.prisma` |
| 🛡️ **Protocol Sentinel** | Serialization & APIs | `.json`, `.yaml`, `.xml`, `.toml`, `.graphql` |
| 🎨 **Holo-Sculptor** | Frontend & UI / UX | `.html`, `.css`, `.js`, `.ts`, `.tsx`, `.vue` |
| ⚙️ **Void Engineer** | DevOps & Infrastructure | `.yml` (workflows), `Dockerfile` |
| ✍️ **Data Scribe** | Documentation | `.md`, `.txt`, `.rst` |
| 🧼 **Syntax Purifier** | Code Formatting & Linting | `.prettierrc`, `.eslintrc` |

---

## 🏆 Feats & XP Modifiers

### Core Feats
*   **Merge a Pull Request**: `+50 XP`
*   **Open a Pull Request**: `+10 XP`
*   **Close an Issue (Completed)**: `+30 XP`
*   **Open a Detailed Issue** (body ≥ 100 chars): `+10 XP`
*   **Submit an Approved PR Review**: `+25 XP`
*   **Resolve a Merge Conflict**: `+15 XP`
*   **Link an Issue to a PR**: `+5 XP`
*   **Add a Comment to an Active Issue**: `+2 XP`

### Modifiers & Multipliers
*   💪 **The Heavy Lifter**: `+20 XP` bonus to a merged PR if added/deleted lines > 150.
*   🧹 **The Clean Slate**: `+20 XP` bonus for a merged PR that deletes more lines than it adds.
*   🏗️ **The Architect**: `+15 XP` bonus if a PR creates entirely new files rather than just modifying existing ones.
*   📦 **The Protocol Bonus**: `+10 XP` if a PR updates both source files and documentation/config files.
*   👾 **The Squasher**: `+15 XP` if an issue containing the `bug` label is closed as completed.
*   🔥 **The Streak**: `+10%` total XP multiplier if the user merged code in the last 72 hours.

---

## 📈 Leveling Progression Formula
Levels are calculated dynamically using the following formula:
$$\text{Level} = \lfloor 0.25 \times \sqrt{\text{XP}} \rfloor$$

---

## 🚀 Environment Setup & Installation

### 1. Requirements
Ensure you have the following installed on your system:
- **Rust** (stable, 2024 edition)
- **Cargo**

### 2. Configuration
Copy the `.env.example` file to `.env` and fill in the required environment variables:
```env
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY_PATH=/path/to/your/private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
PORT=3000
HOST=0.0.0.0
```

### 3. Running Locally
Run the server in development mode:
```bash
cargo run
```

### 4. Deploying the GitHub App
1. Create a new GitHub App in your GitHub Developer Settings.
2. Set the **Webhook URL** to point to your deployed Axum server `/webhook` endpoint.
3. Generate a **Private Key** and download the `.pem` file. Save it locally and configure `GITHUB_PRIVATE_KEY_PATH`.
4. Under **Permissions**, grant read & write access to:
   - **Issues** (for tracking issue opens, closes, and comments)
   - **Pull Requests** (for tracking PR opens, merges, and reviews)
   - **Repository Contents** (for reading & writing `SCORE.md`)
   - **Single File** (read & write to `SCORE.md`)
5. Install the GitHub App on your target repositories!

---

## 🧪 Verification & Testing
To verify the engine and parser implementation, run:
```bash
cargo test
```
To run cargo clippy and lints:
```bash
cargo clippy --all-targets --all-features -- -D warnings
```
