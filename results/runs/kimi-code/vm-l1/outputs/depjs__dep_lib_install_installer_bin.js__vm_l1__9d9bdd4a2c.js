import { mkdir, readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

const shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

const replaceDollarWithPercentPair = value => {
  const variable = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let index = 0;
  let match;

  while ((match = variable.exec(value))) {
    result += `${value.substring(index, match.index)}%${match[1]}%`;
    index = match.index + match[0].length;
  }

  return result + value.slice(index);
};

const convertToSetCommands = variables => variables
  .split(' ')
  .filter(variable => variable.trim())
  .map(variable => `@SET ${replaceDollarWithPercentPair(variable)}`)
  .join('\r\n');

const rm = file => fs.promises.unlink(file).catch(() => {});

const writeShim = (from, to, prog, args, variables) => {
  const target = path.relative(path.dirname(to), from).split('\\').join('/');
  const cmdVariables = variables ? `${convertToSetCommands(variables.trim())}\r\n` : '';
  const cmdProg = prog ? `"${prog}"` : `"%dp0%\\${target}"`;
  const shProg = prog ? `"${prog}"` : `"$basedir/${target}"`;
  const shFallbackProg = prog ? `"${prog}"` : `"$basedir_win/${target}"`;
  const ps1Prog = prog ? `"${prog}$exe"` : `"$basedir/${target}$exe"`;
  const ps1FallbackProg = prog ? `"${prog}"` : `"$basedir/${target}"`;
  const commandArgs = args ? args.trim() : '';
  const spacedArgs = commandArgs ? `${commandArgs} ` : '';

  const cmd = `@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n` +
    cmdVariables +
    `IF EXIST ${cmdProg}.exe (\r\n  SET "_prog=${cmdProg.replace(/(^")|("$)/g, '')}.exe"\r\n) ELSE (\r\n  SET "_prog=${cmdProg.replace(/(^")|("$)/g, '')}"\r\n)\r\n\r\n` +
    `endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & set PATHEXT=%PATHEXT:;.JS;=;% & "%_prog%" ${spacedArgs}%*\r\n`;

  const sh = `#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\nbasedir_win="$basedir"\n\ncase \`uname -a\` in\n  *CYGWIN*|*MINGW*|*MSYS*)\n    if command -v cygpath > /dev/null 2>&1; then\n      basedir_win=\`cygpath -w "$basedir"\`\n    fi\n  ;;\n  *WSL2*)\n    if command -v wslpath > /dev/null 2>&1; then\n      basedir_win="$(wslpath -w "$basedir" 2> /dev/null)"\n      if [ $? -ne 0 ] || [ -z "$basedir_win" ]; then\n        echo "Error: wslpath failed to convert path. WSL environment may be misconfigured." >&2\n        exit 1\n      fi\n    fi\n  ;;\nesac\n\n` +
    (prog
      ? `PROG_EXE=${shProg}\nif ! [ -x "$PROG_EXE" ]; then\n  PROG_EXE=${shFallbackProg}\n  if ! [ -x "$PROG_EXE" ]; then\n    PROG_EXE=${shProg}.exe\n    if ! [ -x "$PROG_EXE" ]; then\n      PROG_EXE=${shFallbackProg}.exe\n    fi\n  fi\nfi\n\nexec "$PROG_EXE" ${spacedArgs}"$@"\n`
      : `exec ${shProg} ${spacedArgs}"$@"\n`);

  const ps1Header = `#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=".exe"\n}\n`;
  const ps1 = ps1Header + (prog
    ? `$ret=0\nif (Test-Path ${ps1Prog}) {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ${ps1Prog} ${spacedArgs}$args\n  } else {\n    & ${ps1Prog} ${spacedArgs}$args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ${ps1FallbackProg} ${spacedArgs}$args\n  } else {\n    & ${ps1FallbackProg} ${spacedArgs}$args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n`
    : `# Support pipeline input\nif ($MyInvocation.ExpectingInput) {\n  $input | & ${ps1Prog} ${spacedArgs}$args\n} else {\n  & ${ps1Prog} ${spacedArgs}$args\n}\nexit $LASTEXITCODE\n`);

  return Promise.all([
    writeFile(to, sh, 'utf8'),
    writeFile(`${to}.cmd`, cmd, 'utf8'),
    writeFile(`${to}.ps1`, ps1, 'utf8'),
  ]).then(() => fs.promises.chmod(to, 0o755));
};

const prepare = (from, to) => mkdir(path.dirname(to), { recursive: true })
  .then(() => readFile(from, 'utf8'))
  .then(source => {
    const shebang = source.match(shebangExpr);
    return shebang
      ? writeShim(from, to, shebang[2], shebang[3], shebang[1])
      : writeShim(from, to);
  });

const cmdShim = (from, to) => fs.promises.stat(from)
  .then(() => Promise.all([rm(to), rm(`${to}.cmd`), rm(`${to}.ps1`)]))
  .then(() => prepare(from, to));

const nodeModules = path.join(process.cwd(), 'node_modules');
const isWin = process.platform === 'win32';

const link = (from, to) => {
  if (isWin) {
    return cmdShim(from, to);
  }

  try {
    fs.unlinkSync(to);
  } catch {}
  fs.symlinkSync(from, to);
  fs.chmodSync(to, '0755');
};

const bin = async (packageDirectory, packageJson, global) => {
  const pkg = typeof packageJson === 'object' && packageJson !== null
    ? packageJson
    : JSON.parse(await readFile(path.join(packageDirectory, 'package.json')));
  const entries = pkg.bin;
  if (!entries) {
    return;
  }

  const targetDirectory = path.join(nodeModules, '.bin');
  fs.mkdirSync(targetDirectory, { recursive: true });

  if (typeof entries === 'string') {
    const name = pkg.name.charAt(0) === '@' ? pkg.name.split('/')[1] : pkg.name;
    return link(path.join(packageDirectory, entries), path.join(targetDirectory, name));
  }

  if (typeof entries === 'object') {
    return Promise.all(Object.keys(entries).map(name =>
      link(path.join(packageDirectory, entries[name]), path.join(targetDirectory, name))));
  }
};

export default bin;
