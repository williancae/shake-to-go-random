#!/usr/bin/env bash
# export.sh
# Script completo para gerar arquivos de conteúdo e estrutura do projeto

set -euo pipefail

echo "🚀 Iniciando exportação dos arquivos do projeto..."

# Parte 1: Exportar arquivos TS de apps/
OUTPUT="src.txt"
: > "$OUTPUT"

find src  \
  \( -path '*/dist/*' -o -path '*/node_modules/*' \) -prune -o \
  -type f \( -name '*.ts' -o -name '*.js' -o -name '*.json' -o -name '*.tsx' \) -print0 | while IFS= read -r -d '' FILE; do
  {
    echo "======== $FILE ========="
    cat "$FILE"
    echo "\n"
  } >> "$OUTPUT"
done
echo "\n✅ $OUTPUT"
