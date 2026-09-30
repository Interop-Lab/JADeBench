import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

var replaceDollarWithPercentPair = (input) => {
    const regex = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
    let result = '';
    let lastIndex = 0;
    let match;
    do {
        match = regex.exec(input);
        if (match) {
            result += (input.substring(lastIndex, match.index) || '').replace(/%/g, '%%') + '%' + match[1] + '%';
            lastIndex = regex.lastIndex;
        }
    } while (regex.lastIndex > 0);
    return result + input.substring(lastIndex);
};

var convertToSetCommands = (envPairs) => {
    let result = '';
    for (const pair of envPairs.split(' ')) {
        const [key, value] = pair.split('=');
        const trimmedKey = (key || '').trim();
        const trimmedValue = (value || '').trim();
        if (trimmedKey && trimmedValue) {
            result += '@set ' + trimmedKey + '=' + replaceDollarWithPercentPair(trimmedValue) + '\r\n';
        }
    }
    return result;
};

var rm = (path) => unlink(path).catch(() => {});

var writeShim = (targetPath, shimPath, shebang, args, variables) => {
    let relativePath = relative(dirname(shimPath), targetPath).replace(/\\/g, '/');
    let winRelativePath = relativePath.split('/').join('\\');
    let unixRelativePath = relativePath;
    let winShebang, unixShebang, cmdShim;
    let targetQuoted = shebang && shebang.replace(/\\/g, '/');
    let longShebang, longCmd;

    shebang = shebang || '';
    variables = variables || '';

    if (!shebang) {
        relativePath = '';
        winRelativePath = '';
        shebang = '';
        targetQuoted = '"%~dp0' + winRelativePath + '"';
        longShebang = targetQuoted;
        unixShebang = '"$basedir/' + unixRelativePath + '"';
        cmdShim = '@set PATHEXT=%PATHEXT:;.JS;=;%\r\n' + targetQuoted + ' %*';
    } else {
        longShebang = '"%~dp0' + shebang + '"';
        winRelativePath = '"%~dp0' + winRelativePath + '"';
        unixRelativePath = '"$basedir/' + unixRelativePath + '"';
        longCmd = '"%~dp0' + shebang + '"';
        winShebang = '"%~dp0' + shebang + '"';
    }

    const shebangCmd = '@setlocal\r\n@set PATHEXT=%PATHEXT:;.JS;=;%\r\n';

    let cmdContent;
    if (longCmd) {
        shebang = shebang.trim();
        cmdContent = shebangCmd + convertToSetCommands(variables) + '@set _prog=' + longCmd.replace(/"$/, '%~dp0') + '\r\n@if exist %_prog% (\r\n  %_prog% ' + args + ' ' + winRelativePath + ' %*\r\n) else (\r\n  @set _prog=' + longCmd + '\r\n  %_prog% ' + args + ' ' + winRelativePath + ' %*\r\n)';
    } else {
        cmdContent = '' + shebangCmd + targetQuoted + ' ' + args + ' ' + winRelativePath + '\r\n';
    }

    let ps1Content = shebangCmd;
    if (longShebang) {
        ps1Content += '$basedir=' + longShebang.replace(/"$/, '') + '\r\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\r\n  $exe=".exe"\r\n}\r\n$ret=0\r\nif (Test-Path -PathType Leaf $basedir/node$exe) {\r\n  if ($MyInvocation.ExpectingInput) {\r\n    $input | & $basedir/node$exe ' + longShebang + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  } else {\r\n    & $basedir/node$exe ' + longShebang + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  }\r\n  $ret=$LASTEXITCODE\r\n} else {\r\n  if ($MyInvocation.ExpectingInput) {\r\n    $input | & "node$exe" ' + longShebang + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  } else {\r\n    & "node$exe" ' + longShebang + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  }\r\n  $ret=$LASTEXITCODE\r\n}\r\nexit $ret\r\n';
    } else {
        if (targetQuoted) {
            ps1Content += '#!/usr/bin/env pwsh\r\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\r\n$exe=""\r\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\r\n  $exe=".exe"\r\n}\r\n$ret=0\r\nif (Test-Path -PathType Leaf $basedir/node$exe) {\r\n  if ($MyInvocation.ExpectingInput) {\r\n    $input | & $basedir/node$exe ' + targetQuoted + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  } else {\r\n    & $basedir/node$exe ' + targetQuoted + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  }\r\n  $ret=$LASTEXITCODE\r\n} else {\r\n  if ($MyInvocation.ExpectingInput) {\r\n    $input | & "node$exe" ' + targetQuoted + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  } else {\r\n    & "node$exe" ' + targetQuoted + ' ' + args + ' ' + unixRelativePath + ' $args\r\n  }\r\n  $ret=$LASTEXITCODE\r\n}\r\nexit $ret\r\n';
        }
    }

    return Promise.all([
        writeFile(shimPath + '.cmd', cmdContent, 'utf8'),
        writeFile(shimPath + '.ps1', ps1Content, 'utf8'),
        writeFile(shimPath, ps1Content, 'utf8')
    ]).then(() => Promise.all([
        chmod(shimPath, 0o755),
        chmod(shimPath + '.cmd', 0o644),
        chmod(shimPath + '.ps1', 0o644)
    ]));
};

var prepare = (targetPath, shimPath) => mkdir(dirname(shimPath), { recursive: true })
    .then(() => readFile(targetPath, 'utf8'))
    .then(content => {
        const firstLine = content.toString().split(/\r*\n/)[0];
        const shebangMatch = firstLine.match(shebangExpr);
        if (!shebangMatch) return writeShim(targetPath, shimPath);
        return writeShim(targetPath, shimPath, shebangMatch[1], shebangMatch[2] || '', shebangMatch[3] || '');
    }, () => writeShim(targetPath, shimPath));

var cmdShim = (targetPath, shimPath) => stat(targetPath)
    .then(() => Promise.all([rm(shimPath), rm(shimPath + '.cmd'), rm(shimPath + '.ps1')]))
    .catch(() => prepare(targetPath, shimPath));

var cmd_shim_default = cmdShim;

export { cmd_shim_default as default };
