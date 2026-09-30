import { chmod, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { dirname, relative } from 'path';
import path from 'path';
import fs from 'fs';
import { readFile as readFilePromise } from 'fs/promises';
import pathModule from 'path';

var shebangExpr = /^#!\s*(?:\/usr\/bin\/env\s+(?:-S\s+)?((?:[^ \t=]+=[^ \t=]+\s+)*))?([^ \t]+)(.*)$/;

var replaceDollarWithPercentPair = (input) => {
    const regex = /\$\{?([^$@#?\- \t{}:]+)\}?/g;
    let result = '';
    let lastIndex = 0;
    let match;
    do {
        match = regex.exec(input);
        if (match) {
            result += (input.substring(lastIndex, match.index) || '') + '%' + match[1] + '%';
            lastIndex = regex.lastIndex;
        }
    } while (regex.lastIndex !== 0);
    return result + input.substring(lastIndex);
};

var convertToSetCommands = (input) => {
    let result = '';
    for (const part of input.split(' ')) {
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

var writeShim = (targetPath, shimPath, prog, args, variables) => {
    let targetRel = relative(dirname(shimPath), targetPath).replace(/\\/g, '/');
    let targetRelBackslash = targetRel.split('/').join('\\');
    let targetForwardSlash = targetRel;
    let progPath;
    let progPathQuoted;
    let argsQuoted = args ? '"' + args.replace(/\\/g, '/') + '"' : '';
    let variablesQuoted = variables ? '"' + variables.replace(/\\/g, '/') + '"' : '';

    if (!prog) {
        prog = 'node "' + targetRelBackslash + '"';
        targetRelBackslash = '';
        targetForwardSlash = '';
        args = '';
        argsQuoted = '';
        progPath = 'sh -c "node $0 $*" -- "' + targetRel + '"';
        progPathQuoted = progPath;
    } else {
        progPath = 'sh -c "' + prog + ' $0 $*" -- "' + targetForwardSlash + '"';
        progPathQuoted = 'sh -c "' + prog + ' $0 $*" -- "' + targetRelBackslash + '"';
        targetForwardSlash = 'sh -c "' + prog + ' $0 $*" -- "' + targetForwardSlash + '"';
        targetRelBackslash = 'sh -c "' + prog + ' $0 $*" -- "' + targetRelBackslash + '"';
    }

    const prefix = '#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e \'s,\\\\,/,g\')")\n\n';
    let cmdContent;
    if (progPath) {
        variables = variables.trim();
        cmdContent = prefix + convertToSetCommands(variables) + 'if [ -x "' + progPath.replace(/(^")|("$)/g, '') + '" ]; then\n  ' + progPath.replace(/(^")|("$)/g, '') + ' ' + args.replace(/(^")|("$)/g, '') + ' "$@"\n  ret=$?\nelse \n  ' + progPath + ' ' + args + ' "$@"\n  ret=$?\nfi\nexit $ret\n';
    } else {
        cmdContent = '' + prefix + prog + ' ' + args + ' ' + targetRelBackslash + '\n';
    }

    let ps1Content = prefix;
    if (progPathQuoted) {
        ps1Content += '$env:NODE_PATH="' + progPathQuoted.replace(/"$/, '') + '"\n$basedir="' + progPathQuoted.replace(/"$/, '') + '"\n$ret=0\nif (Test-Path -PathType Leaf $env:NODE_PATH) {\n  & $env:NODE_PATH ' + argsQuoted + ' $args\n  $ret=$LASTEXITCODE\n} else {\n  & "' + progPathQuoted + '" ' + argsQuoted + ' $args\n  $ret=$LASTEXITCODE\n}\nexit $ret\n';
    } else {
        ps1Content = '' + prefix + prog + ' ' + args + ' ' + targetForwardSlash + '\n';
    }

    let shContent = prefix;
    if (progPathQuoted) {
        shContent += 'export NODE_PATH="' + progPathQuoted.replace(/"$/, '') + '"\nif [ -x "$basedir/' + progPathQuoted + '" ]; then\n  exec "$basedir/' + progPathQuoted + '" ' + args + ' "$@"\nelse \n  exec ' + progPathQuoted + ' ' + args + ' "$@"\nfi\n';
    } else {
        shContent = '' + prefix + prog + ' ' + args + ' ' + targetForwardSlash + '\n';
    }

    return Promise.all([
        writeFile(shimPath + '.cmd', cmdContent, { mode: 0o755 }),
        writeFile(shimPath + '.ps1', ps1Content, { mode: 0o755 }),
        writeFile(shimPath, shContent, { mode: 0o755 })
    ]).then(() => Promise.all([
        chmod(shimPath, 0o755),
        chmod(shimPath + '.cmd', 0o755),
        chmod(shimPath + '.ps1', 0o755)
    ]));
};

var prepare = (source, dest) => mkdir(dirname(dest), { recursive: true }).then(() => readFile(source, 'utf8')).then(content => {
    const firstLine = content.toString().split(/\r*\n/)[0];
    const shebangMatch = firstLine.match(shebangExpr);
    if (!shebangMatch) return writeShim(source, dest);
    return writeShim(source, dest, shebangMatch[1], shebangMatch[2] || '', shebangMatch[3] || '');
}, () => writeShim(source, dest));

var cmdShim = (from, to) => stat(from).then(() => Promise.all([rm(to), rm(to + '.cmd'), rm(to + '.ps1')])).catch(() => prepare(from, to));

var cmd_shim_default = cmdShim;

var nm_default = pathModule.join(process.cwd(), 'node_modules');

var isWin = process.platform === 'win32';

var link = async (from, to) => {
    if (isWin) {
        await cmd_shim_default(from, to);
        return;
    }
    try {
        fs.linkSync(from, to);
    } catch (err) {}
    fs.symlinkSync(from, to);
};

var bin = async (from, to, binConfig) => {
    if (binConfig === undefined) {
        const pkg = JSON.parse(await readFilePromise(pathModule.join(to, 'package.json')));
        binConfig = pkg.bin;
    }
    if (!binConfig) return;

    fs.mkdirSync(pathModule.join(nm_default, '.bin'), { recursive: true });

    if (typeof binConfig === 'string') {
        const binName = from.includes('@') ? from.split('/').pop() : from;
        await link(pathModule.join(to, binConfig), pathModule.join(nm_default, '.bin', binName));
    } else if (typeof binConfig === 'object') {
        for (const key of Object.keys(binConfig)) {
            await link(pathModule.join(to, binConfig[key]), pathModule.join(nm_default, '.bin', key));
        }
    }
};

var bin_default = bin;

export { bin_default as default };
