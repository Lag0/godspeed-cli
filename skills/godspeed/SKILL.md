---
name: godspeed
description: Manage Godspeed tasks and lists using the standalone godspeed-cli. Use JSON output for agent-safe automation.
compatibility: any
---

# Godspeed CLI Skill

Use `godspeed` to authenticate, inspect account status, manage tasks/lists, and run diagnostics.

## Prerequisites

- Install the CLI (see `rules/install.md`)
- Follow token safety rules (see `rules/security.md`)
- Prefer `--json` output in all automation flows

## Quick Reference

```bash
godspeed status --json
godspeed doctor --json
godspeed tasks list --status incomplete --json
godspeed tasks get <task_id> --json
godspeed tasks create --title "Buy milk" --json
godspeed tasks update <task_id> --complete --json
godspeed tasks delete <task_id> --json
godspeed lists list --json
godspeed lists duplicate <list_id> --name "Sprint" --json
```

## Authentication

```bash
godspeed login --token <your-token> --json
godspeed status --json
godspeed logout --json
```

## Output Contract

- Use `--json` for all commands in agent pipelines
- Parse stdout JSON only
- Treat stderr as structured error channel

## Extended References

- Full command reference: `references/COMMANDS.md`
- Agent wrapper script: `scripts/godspeed-cli.sh`
- Installation and auth: `rules/install.md`
- Security practices: `rules/security.md`
