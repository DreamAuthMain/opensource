#!/usr/bin/env node
import cp from 'node:child_process';
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

const dependencies = Object.values(
  JSON.parse(
    cp.spawnSync('npm', ['list', '--json', '--omit=dev'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).stdout,
  ).dependencies,
)[0].dependencies;

const isPackageJsonModified = ['dependencies', 'peerDependencies', 'optionalDependencies']
  .filter((scope) => scope in packageJson)
  .reduce(
    (result, scope) =>
      Object.entries(packageJson[scope])
        .filter(([id, version]) => version === '*' && dependencies[id].resolved.startsWith('file:'))
        .map(([id]) => void (packageJson[scope][id] = `^${dependencies[id].version}`)).length > 0 || result,
    false,
  );

if (isPackageJsonModified) {
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
}
