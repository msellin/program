#!/usr/bin/env bash
# QA-2 · Landing↔app sync check wrapper.
#
# Run this before any batch commit that touches:
#   - next-app/public/data/programs/manifest.json
#   - next-app/public/data/citations.json
#   - landing/src/i18n/dictionaries/en.ts
#
# The Python script does the actual work; this wrapper handles pathing
# so you can run it from anywhere in the repo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "${SCRIPT_DIR}/check-landing-sync.py" "$@"
