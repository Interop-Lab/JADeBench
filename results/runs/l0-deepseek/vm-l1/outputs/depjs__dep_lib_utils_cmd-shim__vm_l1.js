import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

function replaceDollarWithPercentPair(input) {
  return input.replace(/\$(\w+)/g, '%$1%');
}

function convertToSetCommands(input) {
  const lines = input.split(/\r?\n/);
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    result.push(`set ${line}`);
  }
  return result.join('\n');
}

function rm(path) {
  return unlink(path);
}

async function writeShim(target, source, mode, preserve, cb) {
  try {
    const sourceStat = await stat(source);
    const targetStat = await stat(target).catch(() => null);
    if (targetStat && targetStat.isDirectory()) {
      target = `${target}/${source}`;
    }
    await writeFile(target, await readFile(source));
    if (mode !== undefined) {
      await chmod(target, mode);
    }
    if (cb) cb(null);
  } catch (err) {
    if (cb) cb(err);
    else throw err;
  }
}

async function prepare(src, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, await readFile(src));
}

async function cmdShim(src, dest) {
  const source = relative(dirname(dest), src);
  const shim = `#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
  exec "$basedir/node" "$basedir/${source}" "$@"
else
  exec node "$basedir/${source}" "$@"
fi
`;
  await writeFile(dest, shim);
  await chmod(dest, 0o755);
}

const cmd_shim_default = cmdShim;

export { cmd_shim_default as default };
