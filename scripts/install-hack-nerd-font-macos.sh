#!/usr/bin/env bash
set -euo pipefail

if fc-list | grep -qi "Hack Nerd"; then
  echo "✓ Hack Nerd Font ya está instalada"
  exit 0
fi

if command -v brew >/dev/null 2>&1; then
  echo "➡  Instalando con Homebrew cask: font-hack-nerd-font"
  brew tap homebrew/cask-fonts || true
  brew install --cask font-hack-nerd-font || true
  if fc-list | grep -qi "Hack Nerd"; then
    echo "✓ Fuente instalada con Homebrew"
    exit 0
  fi
fi

# Fallback: descarga directa
ZIP_URL="https://github.com/ryanoasis/nerd-fonts/releases/latest/download/Hack.zip"
TMP_ZIP="$(mktemp -t hacknf_XXXX).zip"
TMP_DIR="$(mktemp -d -t hacknf_dir_XXXX)"

echo "➡  Descargando $ZIP_URL"
curl -L "$ZIP_URL" -o "$TMP_ZIP"

echo "➡  Extrayendo"
unzip -q "$TMP_ZIP" -d "$TMP_DIR"

dest_dir="$HOME/Library/Fonts"
mkdir -p "$dest_dir"
shopt -s nullglob
count=0
for f in "$TMP_DIR"/*.ttf; do
  cp -f "$f" "$dest_dir/" && count=$((count+1))
done

rm -f "$TMP_ZIP"; rm -rf "$TMP_DIR"

if (( count > 0 )); then
  echo "✓ Fuente instalada en $dest_dir"
  exit 0
else
  echo "✗ No se pudo instalar la fuente"
  exit 1
fi
