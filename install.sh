#!/usr/bin/env bash
set -euo pipefail

PACKAGE="@syxs/godspeed-cli"
DRY_RUN=false
VERBOSE=false
RUNTIME=""

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --verbose) VERBOSE=true ;;
    *) ;;
  esac
done

info() { printf "\033[36m[godspeed]\033[0m %s\n" "$1"; }
success() { printf "\033[32m[ok]\033[0m %s\n" "$1"; }
warn() { printf "\033[33m[warn]\033[0m %s\n" "$1"; }
fail() { printf "\033[31m[error]\033[0m %s\n" "$1"; exit 1; }

run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    printf "[dry-run] %s\n" "$*"
    return 0
  fi

  if [ "$VERBOSE" = true ]; then
    printf "+ %s\n" "$*"
  fi

  "$@"
}

detect_runtime() {
  if command -v npm >/dev/null 2>&1; then
    RUNTIME="npm"
    return
  fi

  if command -v bun >/dev/null 2>&1; then
    RUNTIME="bun"
    return
  fi

  fail "Neither npm nor bun was found. Install Node.js 18+ (npm) or Bun and retry."
}

install_cli() {
  if [ "$RUNTIME" = "npm" ]; then
    info "Runtime detected: npm"
    run_cmd npm install -g "$PACKAGE"
  else
    info "Runtime detected: bun"
    run_cmd bun install -g "$PACKAGE"
  fi
}

verify_install() {
  if [ "$DRY_RUN" = true ]; then
    info "Dry-run complete. No changes were made."
    return
  fi

  if ! command -v godspeed >/dev/null 2>&1; then
    fail "Installation finished but 'godspeed' is not on PATH. Open a new shell and try again."
  fi

  VERSION=$(godspeed --version 2>/dev/null || true)
  if [ -z "$VERSION" ]; then
    fail "Could not verify installation with 'godspeed --version'."
  fi

  success "Installed Godspeed CLI ($VERSION)"
}

main() {
  info "Installing $PACKAGE"
  detect_runtime
  install_cli
  verify_install

  cat <<'EOF'

Next steps:
  godspeed login --token <your-token>
  godspeed --help
EOF
}

main
