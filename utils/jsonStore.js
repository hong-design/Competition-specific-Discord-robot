const fs = require('fs');
const path = require('path');

function cloneFallback(value) {
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return JSON.parse(JSON.stringify(value));
  }

  return value;
}

function ensureDirectory(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureJsonFile(filePath, initialValue) {
  ensureDirectory(filePath);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2), 'utf8');
  }
}

function readJsonFile(filePath, fallbackValue) {
  ensureJsonFile(filePath, fallbackValue);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return cloneFallback(fallbackValue);
    return JSON.parse(raw);
  } catch (_) {
    return cloneFallback(fallbackValue);
  }
}

function writeJsonFile(filePath, value) {
  ensureDirectory(filePath);
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

module.exports = {
  ensureJsonFile,
  readJsonFile,
  writeJsonFile,
};
