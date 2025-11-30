#!/usr/bin/env bash
set -euo pipefail

if fc-list | grep -qi "Hack Nerd"; then
  echo "✓ Hack Nerd Font ya está instalada"
  exit 0
fi

ZIP_URL="https://github.com/ryanoasis/nerd-fonts/releases/latest/download/Hack.zip"
TMP_ZIP="$(mktemp -t hacknf_XXXX).zip"
TMP_DIR="$(mktemp -d -t hacknf_dir_XXXX)"

echo "➡  Descargando $ZIP_URL"
wget -qO "$TMP_ZIP" "$ZIP_URL" || curl -L "$ZIP_URL" -o "$TMP_ZIP"

echo "➡  Extrayendo"
unzip -q "$TMP_ZIP" -d "$TMP_DIR"

dest_dir="$HOME/.local/share/fonts"
mkdir -p "$dest_dir"
shopt -s nullglob
count=0
for f in "$TMP_DIR"/*.ttf; do
  cp -f "$f" "$dest_dir/" && count=$((count+1))
done

fc-cache -f -v >/dev/null 2>&1 || true
rm -f "$TMP_ZIP"; rm -rf "$TMP_DIR"

if (( count > 0 )); then
  echo "✓ Fuente instalada en $dest_dir"
  exit 0
else
  echo "✗ No se pudo instalar la fuente"
  exit 1
fi
