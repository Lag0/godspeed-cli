# Godspeed CLI Commands

## Auth

```bash
godspeed login --token <token> --json
godspeed status --json
godspeed logout --json
```

## Tasks

```bash
godspeed tasks list --status incomplete --json
godspeed tasks get <task_id> --json
godspeed tasks create --title "Task" --json
godspeed tasks update <task_id> --notes "Updated" --json
godspeed tasks delete <task_id> --json
```

## Lists

```bash
godspeed lists list --json
godspeed lists duplicate <list_id> --name "Copy" --json
```

## Setup Skills

```bash
godspeed setup skills
godspeed setup skill
godspeed setup skills --non-interactive
```

> Internally executes: `npx -y skills add Lag0/godspeed-cli`
>
> Non-interactive mode executes: `npx -y skills add Lag0/godspeed-cli --all`

## Diagnostics

```bash
godspeed doctor --json
godspeed --help
```
