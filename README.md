# @syxs/godspeed-cli

Official standalone CLI for the Godspeed API.

## Installation

```bash
npm install -g @syxs/godspeed-cli
```

## Quick start

```bash
godspeed login --token <your-token>
godspeed status --json
godspeed tasks list --status incomplete --json
```

## Setup Skills

If you use an AI coding agent, install the Godspeed skill with:

```bash
godspeed setup skills
```

Alias:

```bash
godspeed setup skill
```

Under the hood this runs:

```bash
npx skills add Lag0/godspeed-cli
```

To use a different source repository:

```bash
godspeed setup skills --repo <owner/repo>
```

## Common commands

```bash
godspeed doctor --json
godspeed tasks create --title "Buy milk" --json
godspeed tasks update <task-id> --complete --json
godspeed lists list --json
```

## Security

- Prefer `GODSPEED_TOKEN` in CI/agents
- Avoid exposing tokens in terminal history
- Use `--json` for structured automation output
