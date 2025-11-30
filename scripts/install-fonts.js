#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const { platform } = require('node:process');
const path = require('node:path');

function run(cmd, args, options={}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  return res.status === 0;
}

function main(){
  try {
    if (platform === 'win32') {
      const ps1 = path.join(__dirname, 'install-hack-nerd-font.ps1');
      const ok = run('pwsh', ['-NoProfile','-ExecutionPolicy','Bypass','-File', ps1]);
      if (!ok) console.warn('⚠ Instalación de fuente en Windows no fue exitosa');
      return;
    }
    if (platform === 'darwin') {
      const sh = path.join(__dirname, 'install-hack-nerd-font-macos.sh');
      const ok = run('bash', [sh]);
      if (!ok) console.warn('⚠ Instalación de fuente en macOS no fue exitosa');
      return;
    }
    // Linux
    const sh = path.join(__dirname, 'install-hack-nerd-font-linux.sh');
    const ok = run('bash', [sh]);
    if (!ok) console.warn('⚠ Instalación de fuente en Linux no fue exitosa');
  } catch (err) {
    console.warn('⚠ Instalación de fuente omitida:', err.message);
  }
}

if (require.main === module) main();
