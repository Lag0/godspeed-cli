# Install & Authentication

## Installation

One-liner (macOS/Linux):

```bash
curl -fsSL https://raw.githubusercontent.com/Lag0/godspeed-cli/master/install.sh | bash
```

Or via npm:

```bash
npm install -g @syxs/godspeed-cli
```

## Authentication

Obtain your token from Godspeed app (Settings → API).

Option 1 — Persist token locally:

```bash
godspeed login --token <your-token>
```

Option 2 — Environment variable (CI/agents):

```bash
export GODSPEED_TOKEN=<your-token>
```

## Verify

```bash
godspeed status --json
godspeed doctor --json
```
