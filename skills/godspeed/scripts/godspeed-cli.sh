#!/usr/bin/env bash
set -euo pipefail

if ! command -v godspeed >/dev/null 2>&1; then
  echo "godspeed CLI not found on PATH" >&2
  exit 1
fi

godspeed "$@"
