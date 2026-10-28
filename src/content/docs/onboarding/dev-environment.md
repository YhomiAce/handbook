---
title: Dev environment setup
description: Get from a fresh laptop to a passing test suite.
sidebar:
  order: 2
---

This guide takes a fresh macOS or Linux machine to the point where you can run every service and the
test suite locally. It should take about two hours. If a step fails, fix this page as part of your
first PR.

## 1. System tools

On macOS install [Homebrew](https://brew.sh) first, then:

```bash
brew install git gh jq direnv mise
```

On Ubuntu/Debian:

```bash
sudo apt update && sudo apt install -y git jq direnv build-essential curl
curl https://mise.run | sh
```

Then install Docker: Docker Desktop on macOS, or Docker Engine plus the Compose plugin on Linux.
Make sure `docker compose version` works.

## 2. Language runtimes

We pin runtime versions per repository in `.tool-versions` / `mise.toml`, and `mise` installs whatever
the repo asks for:

```bash
cd ~/code/platform
mise install      # installs the pinned Node.js, Go and Python versions
node --version    # should match the version in mise.toml
```

Hook `mise` and `direnv` into your shell (add to `~/.zshrc` or `~/.bashrc`):

```bash
eval "$(mise activate zsh)"
eval "$(direnv hook zsh)"
```

## 3. Git and GitHub

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global pull.rebase true
git config --global init.defaultBranch main
gh auth login                      # choose SSH, and upload a new key
```

Sign your commits. Branch protection on `main` rejects unsigned commits:

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

Then add the same key in GitHub as a **signing key** (not only an authentication key).

## 4. Clone and configure

```bash
mkdir -p ~/code && cd ~/code
gh repo clone acme/platform
cd platform
cp .env.example .env               # local-only values; never commit .env
direnv allow
```

Local secrets (third-party sandbox keys, for example) live in the shared **Engineering - Local Dev**
vault in the password manager. See [secrets handling](/security/secrets/) for why they never go in Slack.

## 5. Run it

```bash
docker compose up -d postgres redis   # backing services
npm ci
npm run db:migrate && npm run db:seed
npm run dev                           # web on :3000, API on :4000
```

Open `http://localhost:3000` and sign in with the seeded account `dev@example.com` / `password`.

## 6. Run the tests

```bash
npm test                 # unit + integration, needs postgres and redis running
npm run test:e2e         # Playwright, optional on day one
```

If everything is green, you're done. Post a screenshot in your team channel, it's tradition.

## Editor setup

Any editor is fine. The repository includes recommended settings for VS Code (`.vscode/extensions.json`)
and an `.editorconfig` that most editors respect. Whatever you use, enable:

- format on save, using the repo's Prettier config
- ESLint integration, so you see errors before CI does
- TypeScript from the workspace (`node_modules/typescript`), not the editor's bundled version

## Troubleshooting

| Symptom                                    | Likely cause and fix                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:5432`              | Postgres isn't running: `docker compose up -d postgres`                                       |
| `node: command not found` inside the repo  | Your shell isn't hooked into `mise`; see step 2                                               |
| Migrations fail with "relation exists"     | Stale local database: `docker compose down -v` then migrate again                             |
| Push rejected: "commits must be signed"    | Signing isn't configured, or the key isn't registered as a signing key in GitHub (step 3)     |
