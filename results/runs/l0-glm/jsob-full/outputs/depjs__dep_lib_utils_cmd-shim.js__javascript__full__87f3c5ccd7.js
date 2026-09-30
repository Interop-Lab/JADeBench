import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

var replaceDollarWithPercentPair = (str) => {
  const regex = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
  let result = '';
  let lastIndex = 0;
  let match;
  do {
    match = regex.exec(str);
    if (match) {
      result += (str.substring(lastIndex, match.index) || '') + '%' + match[1] + '%';
      lastIndex = regex.lastIndex;
    }
  } while (regex.lastIndex !== 0);
  return result + str.substring(lastIndex);
};

var convertToSetCommands = (str) => {
  let result = '';
  for (const part of str.split(' ')) {
    const [key, value] = part.split('=');
    const trimmedKey = (key || '').trim();
    const trimmedValue = (value || '').trim();
    if (trimmedKey && trimmedValue) {
      result += 'set ' + trimmedKey + '=' + replaceDollarWithPercentPair(trimmedValue) + '\r\n';
    }
  }
  return result;
};

var rm = (path) => unlink(path).catch(() => {});

var writeShim = (from, to, shebangExprMatch, args, env) => {
  let targetPath = relative(dirname(to), from).replace(/\\/g, '/');
  let nodePath = targetPath.split('/').join('\\');
  let cmdShimPath = targetPath;
  let pwshPath;
  let pwshPath2 = shebangExprMatch && shebangExprMatch.split('\\').join('/');
  let pwshPath3;
  let cmdShimArgs = pwshPath2 && '"' + pwshPath2 + '"\n';
  let powershellScript;
  args = (args || '');
  env = (env || '');

  if (!shebangExprMatch) {
    pwshPath2 = '"$basedir/' + targetPath + '"';
    nodePath = '';
    args = '';
    shebangExprMatch = '"$basedir/' + nodePath + '"';
    cmdShimArgs = pwshPath2;
    targetPath = '';
    cmdShimPath = '';
  } else {
    powershellScript = '"$basedir/' + shebangExprMatch + '"\n';
    nodePath = '"$basedir/' + nodePath + '"';
    cmdShimPath = '"$basedir/' + cmdShimPath + '"';
    pwshPath3 = '"$basedir/' + shebangExprMatch + '"\n';
    pwshPath = '"$basedir/' + shebangExprMatch + '"\n';
  }

  const cmdShim = '#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e \'s,\\\\,/,g\')")\n\ncase `uname` in\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;\nesac\n\nif [ -x "$basedir/' + nodePath + '" ]; then\n  exec "$basedir/' + nodePath + '" ' + args + ' "$basedir/' + targetPath + '" "$@"\nelse \n  exec ' + shebangExprMatch + ' ' + args + ' "$basedir/' + targetPath + '" "$@"\nfi\n';

  let cmdShimContent;
  if (pwshPath) {
    args = args.trim();
    cmdShimContent = cmdShim + convertToSetCommands(env) + '""$basedir/' + pwshPath.replace(/(^")|("$)/g, '') + '" ' + args + ' "$basedir/' + shebangExprMatch.replace(/(^")|("$)/g, '') + '" "$@"\nexit $ExitCode\n' + powershellScript + args + ' "$basedir/' + cmdShimPath + '" "$@"\nexit $ExitCode\n' + cmdShimArgs + ' "$basedir/' + cmdShimPath + '" "$@"\nexit $ExitCode\n';
  } else {
    cmdShimContent = '' + cmdShim + shebangExprMatch + ' ' + args + ' "$basedir/' + targetPath + '" "$@"\n';
  }

  let powershellContent = '#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  # Fix case when both the Windows and Linux builds of Node\n  # are installed in the same directory\n  $exe=".exe"\n}\n';

  if (pwshPath3) {
    powershellContent = powershellContent + '$ret=0\nif (Test-Path "$basedir/' + pwshPath3.replace(/"$/, '') + '" -PathType leaf) {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & "$basedir/' + pwshPath3 + '" ' + env + ' $args\n  } else {\n    & "$basedir/' + pwshPath3 + '" ' + env + ' $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ' + pwshPath2 + ' ' + env + ' "$basedir/' + cmdShimArgs + ' $args\n  } else {\n    & ' + pwshPath2 + ' ' + env + ' "$basedir/' + cmdShimArgs + ' $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n';
  } else {
    powershellContent = powershellContent + 'if (Test-Path "$basedir/' + pwshPath2 + '") {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & "$basedir/' + pwshPath2 + '" $args\n  } else {\n    & "$basedir/' + pwshPath2 + '" $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  # Support pipeline input\n  if ($MyInvocation.ExpectingInput) {\n    $input | & ' + pwshPath2 + ' "$basedir/' + cmdShimArgs + ' $args\n  } else {\n    & ' + pwshPath2 + ' "$basedir/' + cmdShimArgs + ' $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n';
  }

  return Promise.all([
    writeFile(to + '.cmd', cmdShimContent, 'utf8'),
    writeFile(to + '.ps1', cmdShimContent, 'utf8'),
    writeFile(to, powershellContent, 'utf8')
  ]).then(() => Promise.all([
    chmod(to, 0o755),
    chmod(to + '.cmd', 0o644),
    chmod(to + '.ps1', 0o644)
  ]));
};

var prepare = (from, to) => mkdir(dirname(to), { recursive: true })
  .catch(() => readFile(from, 'utf8'))
  .then(data => {
    const firstLine = data.toString().split(/\r*\n/)[0];
    const match = firstLine.match(shebangExpr);
    if (!match) return writeShim(from, to);
    return writeShim(from, to, match[2], match[1] || '', match[3] || '');
  }, () => writeShim(from, to));

var cmdShim = (from, to) => stat(from)
  .catch(() => Promise.all([
    rm(to),
    rm(to + '.cmd'),
    rm(to + '.ps1')
  ]))
  .then(() => prepare(from, to));

var cmd_shim_default = cmdShim;

export { cmd_shim_default as default };
