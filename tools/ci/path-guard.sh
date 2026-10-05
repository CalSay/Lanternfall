#!/usr/bin/env bash
# Fails when a PR diff touches a protected area, unless the PR carries the label `cal-approved`.
# usage: tools/ci/path-guard.sh <base-sha> <head-sha> <labels-csv>
set -euo pipefail
base="$1"; head="$2"; labels="${3:-}"
hits=()
files="$(git diff --name-only "$base...$head")"
for f in src/js/80-online.js src/js/52-raid.js src/js/74-ui-raid.js netlify.toml; do
  grep -qxF "$f" <<<"$files" && hits+=("$f")
done
if grep -qxF src/js/30-state.js <<<"$files" \
   && git diff -U0 "$base...$head" -- src/js/30-state.js | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' | grep -qE "^[+-]const KEY\s*="; then
  hits+=("src/js/30-state.js (save key line)")
fi
if [ "${#hits[@]}" -eq 0 ]; then echo "path guard: no protected area touched"; exit 0; fi
printf 'protected area touched: %s\n' "${hits[@]}"
if [[ ",$labels," == *",cal-approved,"* ]]; then echo "path guard: label cal-approved present, allowed"; exit 0; fi
echo "::error::This PR touches a protected area. Cal must add the label cal-approved."
exit 1
