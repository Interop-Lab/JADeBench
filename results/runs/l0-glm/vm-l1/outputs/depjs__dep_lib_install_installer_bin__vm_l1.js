import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';
import path from 'path';
import fs from 'fs';
import { readFile as readFile2 } from 'fs/promises';
import path2 from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
globalThis.shebangExpr = shebangExpr;

var replaceDollarWithPercentPair = (str) => {
  return str.replace(/\$(\d+)/g, '%$1');
};
globalThis.replaceDollarWithPercentPair = replaceDollarWithPercentPair;

var convertToSetCommands = (str) => {
  return str.split('\n').map(line => {
    return line.replace(/\$(\d+)/g, '%$1');
  }).join('\n');
};
globalThis.convertToSetCommands = convertToSetCommands;

var rm = async (path) => {
  try {
    await unlink(path);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
};
globalThis.rm = rm;

var writeShim = async (to, from, absFrom, cmdShimArgs, opts) => {
  const isWin = process.platform === 'win32';
  if (isWin) {
    await mkdir(dirname(to), { recursive: true });
    const cmdContent = `@setlocal\r\n@echo off\r\nset "_prog=${absFrom}"\nset "_args=%*"\n%_prog% %_args%\r\nendlocal\r\n`;
    await writeFile(to + '.cmd', cmdContent);
    await writeFile(to + '.ps1', `#!/usr/bin/env pwsh\n& '${absFrom}' $args\n`);
    await chmod(to + '.cmd', 0o755);
    await chmod(to + '.ps1', 0o755);
  } else {
    await mkdir(dirname(to), { recursive: true });
    await writeFile(to, `#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\n\ncase \`uname -s\` in\n  *CYGWIN*) basedir=\`cygpath -w "$basedir"\`;;\nesac\n\nif [ -x "$basedir/node" ]; then\n  exec "$basedir/node"  "$basedir/${relative(dirname(to), from)}" "$@"\nelse\n  exec node  "$basedir/${relative(dirname(to), from)}" "$@"\nfi\n`);
    await chmod(to, 0o755);
  }
};
globalThis.writeShim = writeShim;

var prepare = async (args, opts) => {
  const nm = path.join(process.cwd(), 'node_modules');
  return { nm, opts: opts || {} };
};
globalThis.prepare = prepare;

var cmdShim = async (to, from) => {
  const absFrom = path.resolve(from);
  await writeShim(to, from, absFrom, [], {});
};
globalThis.cmdShim = cmdShim;

var cmd_shim_default = cmdShim;
globalThis.cmd_shim_default = cmd_shim_default;

var nm_default = path.join(process.cwd(), 'node_modules');
globalThis.nm_default = nm_default;

var isWin = process.platform === 'win32';
globalThis.isWin = isWin;

var link = async (from, to) => {
  await rm(to);
  await rm(to + '.cmd');
  await rm(to + '.ps1');
  await writeShim(to, from, path.resolve(from), [], {});
};
globalThis.link = link;

var bin = async (name, from, to) => {
  const nm = path.join(process.cwd(), 'node_modules');
  const toPath = to || path.join(nm, '.bin', name);
  await link(from, toPath);
  return toPath;
};
globalThis.bin = bin;

var bin_default = bin;
globalThis.bin_default = bin_default;

export { bin_default as default };
