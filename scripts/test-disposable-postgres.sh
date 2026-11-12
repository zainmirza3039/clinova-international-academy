#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" == "0" ]]; then
  echo "Refusing to run initdb as root; run this local-only test as an unprivileged user." >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATION="$ROOT/supabase/migrations/20261023010000_create_secure_learner_records.sql"
PG_BIN="${PG_BIN:-}"
if [[ -z "$PG_BIN" ]]; then
  for candidate in /usr/lib/postgresql/*/bin; do
    if [[ -x "$candidate/postgres" && -x "$candidate/initdb" ]]; then PG_BIN="$candidate"; break; fi
  done
fi
if [[ -z "$PG_BIN" || ! -x "$PG_BIN/postgres" ]]; then
  echo "PostgreSQL server binaries were not found. Set PG_BIN to a local PostgreSQL bin directory." >&2
  exit 2
fi

BASE="$(mktemp -d "${TMPDIR:-/tmp}/clinova-disposable-pg.XXXXXX")"
DATA="$BASE/data"
SOCKET="$BASE/socket"
LOG="$BASE/postgres.log"
mkdir -m 700 "$SOCKET"
PORT="$(python3 - <<'PY'
import socket
with socket.socket() as sock:
    sock.bind(('127.0.0.1', 0))
    print(sock.getsockname()[1])
PY
)"
cleanup() {
  if [[ -d "$DATA" ]] && "$PG_BIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
    "$PG_BIN/pg_ctl" -D "$DATA" -m immediate -w stop >/dev/null 2>&1 || true
  fi
  rm -rf "$BASE"
}
trap cleanup EXIT INT TERM

"$PG_BIN/initdb" -D "$DATA" --username=postgres --auth-local=trust --auth-host=trust --no-sync >/dev/null
"$PG_BIN/pg_ctl" -D "$DATA" -l "$LOG" -o "-p $PORT -h 127.0.0.1 -k $SOCKET -c listen_addresses=127.0.0.1 -c unix_socket_directories=$SOCKET" -w start >/dev/null
PSQL=("$PG_BIN/psql" -X -v ON_ERROR_STOP=1 -h "$SOCKET" -p "$PORT" -U postgres)
"${PSQL[@]}" -d postgres -c 'CREATE DATABASE clinova_local_test;' >/dev/null
"${PSQL[@]}" -d clinova_local_test -f "$ROOT/tests/database/bootstrap.local.sql" >/dev/null
"${PSQL[@]}" -d clinova_local_test -f "$MIGRATION" >/dev/null
"${PSQL[@]}" -d clinova_local_test -f "$ROOT/supabase/migrations/20261112010000_create_database_role_authorization.sql" >/dev/null
"${PSQL[@]}" -d clinova_local_test -f "$ROOT/tests/database/secure-learner-records.local.sql"
"${PSQL[@]}" -d clinova_local_test -f "$ROOT/tests/database/role-authorization.local.sql"
