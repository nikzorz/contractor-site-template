#!/usr/bin/env node
// Standalone on purpose: this file imports nothing from Astro, so it survives
// the Eleventy fallback named in ADR 0002 and runs before the site generator
// does. It enforces the two rules that are only worth having if a machine
// checks them:
//
//   1. No photo, no publish. A Service or Project without a usable photo fails
//      the build rather than quietly not appearing.
//   2. The Worker boundary from ADR 0001. Nothing under worker/ may reach into
//      astro or into src/.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

const rel = (abs) => relative(root, abs).split(sep).join('/');

/* ── 1. No photo, no publish ─────────────────────────────────────────────── */

const COLLECTIONS = [
  { dir: 'src/content/services', noun: 'Service' },
  { dir: 'src/content/projects', noun: 'Project' },
];

function parseFrontmatter(raw) {
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const data = {};
  let listKey = null;
  for (const line of block[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(unquote(item[1]));
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, value] = pair;
    if (value === '' || value === '[]') {
      data[key] = [];
      listKey = value === '' ? key : null;
    } else {
      data[key] = unquote(value);
      listKey = null;
    }
  }
  return data;
}

const unquote = (s) => s.trim().replace(/^["'](.*)["']$/, '$1');

// A photo is written the way the content file sees it: usually a file sitting
// next to it, occasionally a path from public/.
function photoOnDisk(entryPath, value) {
  const raw = String(value);
  return raw.startsWith('/')
    ? join(root, 'public', raw.slice(1))
    : resolve(dirname(entryPath), raw);
}

function checkPhoto(entryPath, field, value) {
  const abs = photoOnDisk(entryPath, value);
  if (existsSync(abs) && statSync(abs).isFile()) return;
  const folder = rel(dirname(entryPath));
  problems.push(
    `${rel(entryPath)} asks for the photo "${value}", but that file is not in ${folder} — ` +
      `either put the photo back in that folder, or change the ${field} line to the name of a photo that is already there.`,
  );
}

for (const { dir, noun } of COLLECTIONS) {
  const abs = join(root, dir);
  if (!existsSync(abs)) {
    problems.push(`${dir} is missing, so no ${noun} can be read.`);
    continue;
  }
  for (const name of readdirSync(abs).filter((f) => f.endsWith('.md'))) {
    const entryPath = join(abs, name);
    const data = parseFrontmatter(readFileSync(entryPath, 'utf8'));

    if (!data) {
      problems.push(`${dir}/${name} has no settings block at the top — the file has to start with a line of three dashes.`);
      continue;
    }
    if (!data.title) {
      problems.push(`${dir}/${name} has no title, and a ${noun} needs one — add a line reading 'title: ' followed by its name.`);
    }
    if (!data.photo || (Array.isArray(data.photo) && data.photo.length === 0)) {
      problems.push(
        `${dir}/${name} has no photo, and a ${noun} cannot go on the site without one — ` +
          `add a line reading 'photo: ./your-photo.jpg' and put that photo in the same folder as this file.`,
      );
    } else {
      checkPhoto(entryPath, 'photo', data.photo);
    }
    for (const extra of data.gallery ?? []) checkPhoto(entryPath, 'gallery', extra);
  }
}

/* ── 2. The Worker boundary ──────────────────────────────────────────────── */

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)["']([^"']+)["']/g;
const CODE = /\.(ts|tsx|js|mjs|cjs)$/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    return e.isDirectory() ? walk(path) : CODE.test(e.name) ? [path] : [];
  });
}

const srcDir = join(root, 'src');
const workerDir = join(root, 'worker');

function reachesIntoSrc(file, specifier) {
  if (specifier.startsWith('.')) {
    const target = resolve(dirname(file), specifier);
    return target === srcDir || target.startsWith(srcDir + sep);
  }
  return specifier.startsWith('src/') || specifier.startsWith('@/');
}

const isAstro = (s) => s === 'astro' || s.startsWith('astro/') || s.startsWith('astro:') || s.startsWith('@astrojs/');

if (existsSync(workerDir)) {
  for (const file of walk(workerDir)) {
    const source = readFileSync(file, 'utf8');
    for (const [, specifier] of source.matchAll(SPECIFIER)) {
      if (isAstro(specifier)) {
        problems.push(
          `${rel(file)} imports "${specifier}". The Worker must not use Astro: it runs in production and Astro only runs at build time (ADR 0001).`,
        );
      } else if (reachesIntoSrc(file, specifier)) {
        problems.push(
          `${rel(file)} imports "${specifier}" from src/. The Worker must not reach into the site's source: move what it needs into site.config.json or into worker/ (ADR 0001).`,
        );
      }
    }
  }

  const workerTsconfig = join(workerDir, 'tsconfig.json');
  if (existsSync(workerTsconfig)) {
    const stripped = readFileSync(workerTsconfig, 'utf8').replace(/^\s*\/\/.*$/gm, '');
    const paths = JSON.parse(stripped).compilerOptions?.paths;
    if (paths && Object.keys(paths).length > 0) {
      problems.push(
        `worker/tsconfig.json defines a "paths" alias. The Worker must not have a shortcut into src/, so there is never a paths entry here (ADR 0001).`,
      );
    }
  }
}

/* ── Report ──────────────────────────────────────────────────────────────── */

if (problems.length > 0) {
  const count = problems.length === 1 ? '1 problem' : `${problems.length} problems`;
  console.error(`\n${count} stopped the site from building:\n`);
  for (const problem of problems) console.error(`  - ${problem}\n`);
  process.exit(1);
}

console.log('Content and Worker boundary OK.');
