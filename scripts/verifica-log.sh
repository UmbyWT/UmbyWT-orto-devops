#!/usr/bin/env bash
# Controlla che i secret non compaiano nei log di una run della pipeline.
#
#   ./scripts/verifica-log.sh <id-della-run>
#
# L'id è il numero alla fine dell'indirizzo della run su GitHub
# (.../actions/runs/<id>). Serve la CLI di GitHub (gh) con il login fatto.
# I valori da cercare si incollano quando lo script li chiede: non
# compaiono a schermo e non restano nella history della shell.
set -euo pipefail

run_id="${1:?Indica l'id della run, per esempio ./scripts/verifica-log.sh 1234567890}"
log=$(mktemp)
trap 'rm -f "$log"' EXIT

gh run view "$run_id" --log > "$log"
echo "Log della run $run_id: $(wc -l < "$log") righe"

found=0
for name in VERCEL_TOKEN SPOONACULAR_API_KEY SENTRY_AUTH_TOKEN; do
  read -rsp "Incolla il valore di $name (invio per saltarlo): " value
  echo
  [ -z "$value" ] && continue
  if grep -qF -- "$value" "$log"; then
    echo "ATTENZIONE: $name compare in chiaro nel log"
    found=1
  else
    echo "$name: non compare nel log"
  fi
done

echo "Punti in cui GitHub ha mascherato un valore con ***: $(grep -c '\*\*\*' "$log" || true)"
exit "$found"
