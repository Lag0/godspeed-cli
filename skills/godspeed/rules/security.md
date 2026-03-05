# Security Rules

## Token Handling

- NEVER log tokens
- NEVER commit tokens
- NEVER place tokens in task content/metadata

## CI / Agent Environments

Use environment variable auth in automation:

```bash
export GODSPEED_TOKEN=$SECRET_TOKEN
godspeed tasks list --json
```

## Stored Credentials

- Local storage: `~/.godspeed/config.json`
- File mode should be user-only (`600`)
- Remove credentials: `godspeed logout` or `rm ~/.godspeed/config.json`

## Validation

Always use `--json` in pipelines and parse structured stderr errors.
