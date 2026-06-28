#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const ignoreDirs = new Set(['.git', 'node_modules', 'data', '.github', 'tmp', 'temp']);
const ignoredNames = new Set(['package-lock.json', 'yarn.lock']);
const jsFiles = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example' && entry.name !== '.github') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js') && !ignoredNames.has(entry.name)) {
      jsFiles.push(fullPath);
    }
  }
}

walk(root);

let failed = false;
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    failed = true;
    const message = error.stderr?.toString().trim() || error.stdout?.toString().trim() || error.message;
    console.error(`Syntax error in ${path.relative(root, file)}: ${message}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${jsFiles.length} JavaScript file(s) for syntax.`);
