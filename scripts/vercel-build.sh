#!/usr/bin/env bash
set -euo pipefail

export VITE_VERIFICATION_ENABLED=false
export VITE_AUTH_ENABLED=false
export VITE_LEARNER_DATA_ENABLED=false
export VITE_ENQUIRIES_ENABLED=false

if [[ "${VERCEL_ENV:-preview}" == "production" ]]; then
  export VITE_INDEXING_ENABLED=true
else
  export VITE_INDEXING_ENABLED=false
fi

npm run build
