# Repogee

**Gamify your repository contributions!**

Repogee turns repository contributions into a text-based RPG. It tracks pull requests, issues, and commits to award experience points (XP), level up contributors, and dynamically assign developer classes based on the file types they edit.

The best part? Repogee is completely stateless. It reads and writes user statistics directly to a markdown table in `SCORE.md` at the root of your repository. That means zero database hosting, zero external services to trust, and your git log remains the single source of truth!



## Class System

Repogee assigns each developer a dynamic profile in the format `Class: Subclass` calculated automatically from their repository contributions:

1. **Class**: Determined by the high-level category of files the developer has contributed to the most (e.g., `Systems Engineer`, `Frontend Artisan`, `Bioinformatician`).
2. **Subclass**: Automatically generated based on the specific file extension the developer used the most within that category, combining the extension's name with the class's thematic role suffix (e.g. `Rust Vanguard`, `TypeScript Sculptor`, `FASTA Sequencer`).

### Supported Classes & Role Suffixes

| Class | Thematic Focus | Role Suffix | Examples |
| --- | --- | --- | --- |
| `Systems Engineer` | Silicon Forge | `Vanguard` | `Rust Vanguard`, `C++ Vanguard` |
| `Compute Architect` | GPU Acceleration | `Accelerator` | `CUDA Accelerator`, `GLSL Accelerator` |
| `Backend Developer` | Enterprise Code | `Architect` | `Java Architect`, `C# Architect` |
| `Declarative Mathematician` | Functional Purity | `Purist` | `Haskell Purist`, `Elixir Purist` |
| `Logic Inquisitor` | Formal Verification | `Inquisitor` | `Prolog Inquisitor`, `Coq Inquisitor` |
| `Frontend Artisan` | Pixel Artistry | `Sculptor` | `TypeScript Sculptor`, `React Sculptor` |
| `Style Sculptor` | Visual Aesthetics | `Weaver` | `CSS Weaver`, `Sass Weaver` |
| `Data Alchemist` | Statistical Sorcery | `Sorcerer` | `Python Sorcerer`, `R Sorcerer` |
| `Bioinformatician` | Organic Computation | `Sequencer` | `FASTA Sequencer`, `PDB Sequencer` |
| `Database Administrator` | Data Sovereignty | `Archivist` | `SQL Archivist`, `SQLite Archivist` |
| `NoSQL Specialist` | Schemaless Void | `Indexer` | `MongoDB Indexer`, `Redis Indexer` |
| `Protocol Arbiter` | Interface Harmony | `Sentinel` | `GraphQL Sentinel`, `Protobuf Sentinel` |
| `Codec Keeper` | Data Crypts | `Keeper` | `JSON Keeper`, `YAML Keeper` |
| `DevOps Engineer` | Automation Void | `Commander` | `Docker Commander`, `Makefile Commander` |
| `IaC Architect` | Declarative Systems | `Terraformer` | `Terraform Terraformer`, `Nix Terraformer` |
| `Mobile Developer` | Handheld Horizons | `Operator` | `Android Operator`, `Swift Operator` |
| `Virtual Architect` | Reality Forging | `Weaver` | `Unity Weaver`, `Godot Weaver` |
| `3D Designer` | Geometric Space | `Sculptor` | `Blender Sculptor`, `CAD Sculptor` |
| `Acoustic Designer` | Sonic Synthesis | `Composer` | `VST Composer`, `SuperCollider Composer` |
| `FPGA Engineer` | Gate Array Logic | `Alchemist` | `Verilog Alchemist`, `VHDL Alchemist` |
| `PCB Layout Engineer` | Copper Flow | `Circuit Weaver` | `KiCad Circuit Weaver`, `Altium Circuit Weaver` |
| `Red Team Operator` | Infiltration Tactics | `Infiltrator` | `Wireshark Infiltrator`, `Nmap Infiltrator` |
| `Blue Team Operator` | Shielding Signatures | `Specter` | `Yara Specter`, `Rules Specter` |
| `QA Engineer` | Chaos Tamer | `Tester` | `Gherkin Tester`, `Robot Tester` |
| `Code Sanitarian` | Workspace Sanitation | `Purifier` | `Gitignore Purifier`, `ESLint Purifier` |
| `Chronicler` | Scribal Archives | `Scribe` | `Markdown Scribe`, `LaTeX Scribe` |
| `Desktop Configurator` | Desktop Ecosystem | `Integrator` | `Desktop Integrator`, `Registry Integrator` |

## Feats and XP Modifiers

### Core Feats
* **Publish a Production Release**: `+100 XP` (rewards shipping major milestones)
* **Merge a Pull Request**: `+50 XP`
* **Close an Issue (Completed)**: `+30 XP`
* **Submit an Approved PR Review**: `+25 XP`
* **Contribute to Wiki**: `+20 XP` per page created or updated
* **Open a Pull Request / Issue**: `+10 XP`
* **Start a Discussion**: `+10 XP`
* **Answer a Discussion**: `+20 XP` (rewards community support)
* **Discussion Comment**: `+3 XP`
* **Submit an Inline PR Review Comment**: `+5 XP` per line comment
* **Submit a Direct Commit Comment**: `+5 XP`
* **Take Ownership (Task Assigned)**: `+5 XP` (triggers when assigned to an Issue or PR)
* **Review Requested**: `+5 XP` (rewards review queue participation)
* **Add a Comment to an Active Issue**: `+2 XP`

### Modifiers and Multipliers
* **The Refactoring Wizard**: `+25 XP` if a merged PR modifies `> 5` files but adds `0` new files (rewards clean code consolidation).
* **The Precision Strike**: `+20 XP` if a merged PR alters `3` lines or less in total (rewards surgical bug-fixing).
* **The Colossal Contribution**: `+40 XP` if a merged PR alters `> 500` lines of code.
* **The Documentation Evangelist**: `+15 XP` if a merged PR consists *entirely* of documentation files (`.md`, `.txt`, `.rst`, `.tex`).
* **The Quick Merger**: `+15 XP` if a PR is opened and merged in less than `2` hours.
* **The Epic Issue**: `+20 XP` (instead of 10) if an opened issue contains a detailed description `> 500` characters.
* **The Direct Committer**: `+10 XP` bonus for pushing commits directly to `main` or `master` branches (Solo Ranger contribution).
* **The Batch Committer**: `+15 XP` bonus if a push contains a batch of `5` or more distinct commits.
* **The Thorough Mentor**: `+15 XP` bonus if a reviewer submits a review requesting changes (`changes_requested`) with feedback `> 150` characters.
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

To enable debug or info logs, set the `RUST_LOG` environment variable:
```bash
RUST_LOG=info cargo run
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

