#!/usr/bin/env node
import fs from 'node:fs';

import { globSync } from 'glob';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

if (!packageJson.files) {
  console.error('Missing package.json "files" parameter.');
  process.exit(1);
}

const files = globSync(packageJson.files);

if (files.length === 0) {
  console.error('Missing package files (build may be required).');
  process.exit(1);
}

// Object.values(packageJson.dependencies || {}).forEach((version) => {
//   if (version === '*') {
//     console.error('Dependency has wildcard (*) version.');
//     process.exit(1);
//   }
// });
