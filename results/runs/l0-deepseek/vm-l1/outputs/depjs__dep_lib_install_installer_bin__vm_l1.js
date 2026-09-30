const fs = require('fs');
const path = require('path');
const { chmod, mkdir, readFile, stat, unlink, writeFile } = require('fs/promises');
const { dirname, relative } = require('path');

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

function replaceDollarWithPercentPair(input) {
  return input.replace(/\$(\w+)/g, '%$1%');
}

function convertToSetCommands(input) {
  return input.split(/\r?\n/).filter(line => line.trim() !== '');
}

function rm(file) {
  return unlink(file);
}

async function writeShim(target, source, opts, cb) {
  const data = await readFile(source);
  await writeFile(target, data);
  if (opts && opts.mode) {
    await chmod(target, opts.mode);
  }
  if (cb) cb();
}

async function prepare(src, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await writeShim(dest, src);
}

async function cmdShim(src, dest) {
  await prepare(src, dest);
}

const cmd_shim_default = cmdShim;

const nm_default = path.join(process.cwd(), 'node_modules');

const isWin = process.platform === 'win32';

async function link(src, dest) {
  await mkdir(dirname(dest), { recursive: true });
  try {
    await unlink(dest);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  await fs.promises.symlink(relative(dirname(dest), src), dest);
}

async function bin(src, dest, opts) {
  await prepare(src, dest);
}

const bin_default = bin;

export { bin_default as default };
