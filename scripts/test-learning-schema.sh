#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PG_BIN=${PG_BIN:-/usr/lib/postgresql/16/bin}
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/clinova-learning-pg.XXXXXX")
DATA_DIR="$TMP_DIR/data"
SOCKET_DIR="$TMP_DIR/socket"
PORT=$((50000 + RANDOM % 10000))
DB_NAME=postgres
cd "$ROOT_DIR"
unset PGHOSTADDR PGSERVICE PGSERVICEFILE PGOPTIONS
export PGHOST="$SOCKET_DIR" PGPORT="$PORT" PGUSER="$(id -un)" PGDATABASE="$DB_NAME"

cleanup() {
  if [[ -f "$DATA_DIR/postmaster.pid" ]]; then
    "$PG_BIN/pg_ctl" -D "$DATA_DIR" -m immediate stop >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

mkdir -p "$SOCKET_DIR"
"$PG_BIN/initdb" -D "$DATA_DIR" --no-locale --encoding=UTF8 --auth=trust >/dev/null
"$PG_BIN/pg_ctl" -D "$DATA_DIR" -o "-c listen_addresses='' -c unix_socket_directories=$SOCKET_DIR -c port=$PORT" -w start >/dev/null

"$PG_BIN/psql" -X -v ON_ERROR_STOP=1 -f "$ROOT_DIR/tests/sql/learning-foundation.sql"
"$PG_BIN/psql" -X -v ON_ERROR_STOP=1 -f "$ROOT_DIR/tests/sql/assessment-workflows.sql"
printf '\nLearning foundation and assessment workflow schema tests: PASS\n'
