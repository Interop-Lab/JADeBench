import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;
globalThis.shebangExpr = shebangExpr;

var replaceDollarWithPercentPair = (str) => {
  return str.replace(/\$\$/g, '%%');
};
globalThis.replaceDollarWithPercentPair = replaceDollarWithPercentPair;

var convertToSetCommands = (str) => {
  return str.split('\n').map(line => 'set ' + line).join('\n');
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

var writeShim = async (to, from, mode, cmdShimContents, shebangContents) => {
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, cmdShimContents);
  await chmod(to, mode);
  if (shebangContents) {
    await writeFile(from, shebangContents);
    await chmod(from, mode);
  }
};
globalThis.writeShim = writeShim;

var prepare = async (args, shebangExpr) => {
  return args;
};
globalThis.prepare = prepare;

var cmdShim = async (from, to) => {
  const fromStat = await stat(from);
  const targetPath = await readFile(from, 'utf8');
  const shebangMatch = targetPath.match(shebangExpr);
  let shebangContents = null;
  let cmdShimContents = targetPath;
  if (shebangMatch) {
    shebangContents = shebangMatch[0];
    cmdShimContents = targetPath.replace(shebangExpr, '');
  }
  const mode = fromStat.mode & 0o777;
  await writeShim(to, from, mode, cmdShimContents, shebangContents);
};
globalThis.cmdShim = cmdShim;

var cmd_shim_default = cmdShim;
globalThis.cmd_shim_default = cmd_shim_default;

export { cmd_shim_default as default };
