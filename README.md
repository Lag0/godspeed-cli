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

For non-interactive agent execution:

```bash
godspeed setup skills --non-interactive
```

Under the hood this runs:

```bash
npx -y skills add Lag0/godspeed-cli
```

And in non-interactive mode:

```bash
npx -y skills add Lag0/godspeed-cli --all
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
