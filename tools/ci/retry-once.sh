#!/usr/bin/env bash
# Runs a command; if it fails, runs it once more. A pass on the second go is NOT hidden: the first attempt's FAIL lines go
# to a warning annotation and the job summary, so every flake stays on record. A second failure fails the job.
# usage: tools/ci/retry-once.sh <label> <command> [args...]   (output of each attempt goes to $RETRY_LOG, default retry.log)
set -uo pipefail
label="$1"; shift
log="${RETRY_LOG:-retry.log}"
# A file, not a pipe: the check run dies partway when its stdout is a pipe.
"$@" > "$log" 2>&1; rc=$?
cat "$log"
[ "$rc" -eq 0 ] && exit 0
[ "$rc" -eq 2 ] && exit 2   # a usage or setup error (eyes.mjs exits 2) will not change on a retry
first="$(grep -E '^ {2}FAIL |\*\*FAIL\*\*|##\[error\]' "$log" | head -8 | tr '\n' ' ' | cut -c1-600)"
echo "::warning title=$label failed once, retrying::${first:-exit $rc}"
echo "--- retry: $label (first attempt exited $rc) ---"
"$@" > "$log" 2>&1; rc2=$?
cat "$log"
{
  echo "### $label: $([ "$rc2" -eq 0 ] && echo 'FLAKE (passed on the retry)' || echo 'failed twice')"
  echo "First attempt: ${first:-exit $rc}"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
[ "$rc2" -eq 0 ] && echo "::warning title=$label flake::passed on the retry. First attempt: ${first:-exit $rc}"
exit "$rc2"
