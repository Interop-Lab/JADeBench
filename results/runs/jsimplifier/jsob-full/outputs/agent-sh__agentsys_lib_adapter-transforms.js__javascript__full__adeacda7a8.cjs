'use strict';
function _createForOfIteratorHelper(r, e)
    /*Scope Closed:false | writes:false*/
    {
        var t = typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
        if (!(typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'])) {
            if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == 'number') {
                if (t) {
                    r = t;
                }
                var _n = 0;
                var F = function F()
                    /* Called:undefined | Scope Closed:true*/
                    {
                    };
                return {
                    s: F,
                    n() {
                        if (_n >= r.length) {
                            return { done: true };
                        } else {
                            return {
                                done: false,
                                value: r[_n++]
                            };
                        }
                    },
                    e(r) {
                        throw r;
                    },
                    f: F
                };
            }
            throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
        }
        var o;
        var a = true;
        var u = false;
        return {
            s() {
                t = t.call(r);
            },
            n() {
                var r = t.next();
                a = r.done;
                return r;
            },
            e(r) {
                u = true;
                o = r;
            },
            f() {
                try {
                    if (!a && t.return != null) {
                        t.return();
                    }
                } finally {
                    if (u) {
                        throw o;
                    }
                }
            }
        };
    }
function _unsupportedIterableToArray(r, a)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            if (typeof r == 'string') {
                return _arrayLikeToArray(r, a);
            }
            var t = {}.toString.call(r).slice(8, -1);
            if (t === 'Object' && r.constructor) {
                t = r.constructor.name;
            }
            {
                return undefined;
            }
        }
    }
function _arrayLikeToArray(r, a)
    /*Scope Closed:true*/
    {
        if (a == null || a > r.length) {
            a = r.length;
        }
        for (var e = 0, n = Array(a); e < a; e++) {
            n[e] = r[e];
        }
        return n;
    }
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x2a896f, _0x44d04a)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x5186e8()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x44d04a) {
                    _0x2a896f[Object.getOwnPropertyNames(_0x2a896f)[0]]((_0x44d04a = { exports: {} }).exports, _0x44d04a);
                }
                return _0x44d04a.exports;
            };
    };
var require_discovery = function _0x5186e8()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x44d04a) {
            _0x2a896f[Object.getOwnPropertyNames(_0x2a896f)[0]]((_0x44d04a = { exports: {} }).exports, _0x44d04a);
        }
        return _0x44d04a.exports;
    };
var discovery = require_discovery();
function transformBodyForOpenCode(_0x292888, _0x2cf3ea)
    /*Scope Closed:false | writes:false*/
    {
        _0x292888 = _0x292888.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, '${PLUGIN_ROOT}');
        _0x292888 = _0x292888.replace(/\$CLAUDE_PLUGIN_ROOT/g, '$PLUGIN_ROOT');
        _0x292888 = _0x292888.replace(/\.claude\//g, function (_0x6a4a23, _0x26221c)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x55c6bf = _0x292888.substring(Math.max(0, _0x26221c - 60), _0x26221c + _0x6a4a23.length + 10);
                if (/Claude Code:/.test(_0x55c6bf)) {
                    return _0x6a4a23;
                }
                return '.opencode/';
            });
        _0x292888 = _0x292888.replace(/\.claude'/g, function (_0x5c4608, _0x1ad121)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x28ae5d = _0x292888.substring(Math.max(0, _0x1ad121 - 60), _0x1ad121 + _0x5c4608.length + 10);
                if (/Claude Code:/.test(_0x28ae5d)) {
                    return _0x5c4608;
                }
                return '.opencode\'';
            });
        _0x292888 = _0x292888.replace(/\.claude"/g, function (_0x2da446, _0x19e142)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0xd39a8 = _0x292888.substring(Math.max(0, _0x19e142 - 60), _0x19e142 + _0x2da446.length + 10);
                if (/Claude Code:/.test(_0xd39a8)) {
                    return _0x2da446;
                }
                return '.opencode"';
            });
        _0x292888 = _0x292888.replace(/\.claude`/g, function (_0x463f0f, _0x4e979a)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x423d0d = _0x292888.substring(Math.max(0, _0x4e979a - 60), _0x4e979a + _0x463f0f.length + 10);
                if (/Claude Code:/.test(_0x423d0d)) {
                    return _0x463f0f;
                }
                return '.opencode`';
            });
        var _0x253d0c = discovery.discoverPlugins(_0x2cf3ea);
        if (_0x253d0c.length > 0) {
            var _0x441a00 = _0x253d0c.join('|');
            _0x292888 = _0x292888.replace(new RegExp('`(' + _0x253d0c.join('|') + '):([a-z-]+)`', 'g'), '`$2`');
            _0x292888 = _0x292888.replace(new RegExp('(' + _0x253d0c.join('|') + '):([a-z-]+)', 'g'), '$2');
        }
        _0x292888 = _0x292888.replace(/```(\w*)\n([\s\S]*?)```/g, function (_0xc76803, _0x5791cf, _0x43d663)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x4e1a2b = (_0x5791cf || '').toLowerCase();
                if (_0x4e1a2b === 'bash' || _0x4e1a2b === 'shell' || _0x4e1a2b === 'sh') {
                    if (_0x43d663.includes('node -e') && _0x43d663.includes('require(')) {
                        return '*(Bash command with Node.js require - adapt for OpenCode)*';
                    }
                    return _0xc76803;
                }
                if (!_0x5791cf && (_0x43d663.trim().startsWith('gh ') || _0x43d663.trim().startsWith('glab ') || _0x43d663.trim().startsWith('git ') || _0x43d663.trim().startsWith('#!'))) {
                    return _0xc76803;
                }
                if (_0x43d663.includes('require(') || _0x43d663.includes('Task(') || /^\s*const\s+[a-zA-Z_$[{]/m.test(_0x43d663) || /^\s*let\s+[a-zA-Z_$[{]/m.test(_0x43d663) || _0x43d663.includes('function ') || _0x43d663.includes('=>') || _0x43d663.includes('async ') || _0x43d663.includes('await ') || _0x43d663.includes('completePhase')) {
                    var _0x19d71b = '';
                    var _0x5c723e = [_0x43d663.matchAll(/(?:await\s+)?Task\s*\(\s*\{[^}]*subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["'][^}]*\}\s*\)/g)];
                    var _iterator8 = _createForOfIteratorHelper(_0x5c723e);
                    var _step8;
                    try {
                        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                            var _0x20b7ff = _step8.value;
                            var _0x47d210 = _0x20b7ff[1];
                            _0x19d71b += '- Invoke `@' + _0x20b7ff[1] + '` agent\n';
                        }
                    } catch (err) {
                        _iterator8.e(err);
                    } finally {
                        _iterator8.f();
                    }
                    var _0x818b7b = _0x43d663.match(/startPhase\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
                    if (_0x818b7b) {
                        var _iterator9 = _createForOfIteratorHelper(_0x818b7b);
                        var _step9;
                        try {
                            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                                var _0xbd343b = _step9.value;
                                var _0x152bc7 = _0xbd343b.match(/['"]([^'"]+)['"]/)[1];
                                _0x19d71b += '- Phase: ' + _0x152bc7 + '\n';
                            }
                        } catch (err) {
                            _iterator9.e(err);
                        } finally {
                            _iterator9.f();
                        }
                    }
                    if (_0x43d663.includes('AskUserQuestion')) {
                        _0x19d71b = '- Phase: ' + _0x152bc7 + '\n' + '- Use AskUserQuestion tool for user input\n';
                    }
                    if (_0x43d663.includes('EnterPlanMode')) {
                        _0x19d71b = '- Phase: ' + _0x152bc7 + '\n' + '- Use AskUserQuestion tool for user input\n' + '- Use EnterPlanMode for user approval\n';
                    }
                    if (_0x43d663.includes('completePhase')) {
                        _0x19d71b = '- Phase: ' + _0x152bc7 + '\n' + '- Use AskUserQuestion tool for user input\n' + '- Use EnterPlanMode for user approval\n' + '- Call `workflowState.completePhase(result)` to advance workflow state\n';
                    }
                    if (_0x19d71b) {
                        return _0x19d71b;
                    }
                    return '*(JavaScript reference - not executable in OpenCode)*';
                }
                return _0xc76803;
            });
        _0x292888 = _0x292888.replace(/\*\(Reference - adapt for OpenCode\)\*/g, '');
        _0x292888 = _0x292888.replace(/await\s+Task\s*\(\s*\{[\s\S]*?\}\s*\);?/g, function (_0x3c8ee7)
            /* Called:undefined | Scope Closed:true*/
            {
                var _0x3c5cb1 = _0x3c8ee7.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
                if (_0x3c5cb1) {
                    return 'Invoke `@undefined` agent';
                }
                return '*(Task call - use @agent-name syntax)*';
            });
        _0x292888 = _0x292888.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
        _0x292888 = _0x292888.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
        if (_0x292888.includes('agent')) {
            var _0x4f14ca = '\n> **OpenCode Note**: Invoke agents using `@agent-name` syntax.\n> Available agents: task-discoverer, exploration-agent, planning-agent,\n> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent\n> Example: `@exploration-agent analyze the codebase`\n\n';
            _0x292888 = _0x292888.replace(/^(---\n[\s\S]*?---\n)/, '$1\n> **OpenCode Note**: Invoke agents using `@agent-name` syntax.\n> Available agents: task-discoverer, exploration-agent, planning-agent,\n> implementation-agent, deslop-agent, delivery-validator, sync-docs-agent, consult-agent\n> Example: `@exploration-agent analyze the codebase`\n\n');
        }
        if (_0x292888.includes('Master Workflow Orchestrator') && _0x292888.includes('No Shortcuts Policy')) {
            var _0x1a0658 = '\n## Phase 1: Policy Selection (Built-in Options)\n\nAsk the user these questions using AskUserQuestion:\n\n**Question 1 - Source**: "Where should I look for tasks?"\n- GitHub Issues - Use `gh issue list` to find issues\n- GitHub Projects - Issues from a GitHub Project board\n- GitLab Issues - Use `glab issue list` to find issues\n- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repo\n- Custom - User specifies their own source\n- Other - User describes source, you figure it out\n\nIf user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.\n\n**Question 2 - Priority**: "What type of tasks to prioritize?"\n- All - Consider all tasks, pick by score\n- Bugs - Focus on bug fixes\n- Security - Security issues first\n- Features - New feature development\n\n**Question 3 - Stop Point**: "How far should I take this task?"\n- Merged - Until PR is merged to main\n- PR Created - Stop after creating PR\n- Implemented - Stop after local implementation\n- Deployed - Deploy to staging\n- Production - Full production deployment\n\nAfter user answers, proceed to Phase 2 with the selected policy.\n\n';
            if (_0x292888.includes('OpenCode Note')) {
                _0x292888 = _0x292888.replace(/(Example:.*analyze the codebase\`\n\n)/, '$1\n## Phase 1: Policy Selection (Built-in Options)\n\nAsk the user these questions using AskUserQuestion:\n\n**Question 1 - Source**: "Where should I look for tasks?"\n- GitHub Issues - Use `gh issue list` to find issues\n- GitHub Projects - Issues from a GitHub Project board\n- GitLab Issues - Use `glab issue list` to find issues\n- Local tasks.md - Read from PLAN.md, tasks.md, or TODO.md in the repo\n- Custom - User specifies their own source\n- Other - User describes source, you figure it out\n\nIf user selects GitHub Projects, ask two follow-up questions: project number (positive integer from the project URL, e.g. 1, 5, 42) and project owner (@me for your own projects, or the org/username). Pass as responses.project = { number, owner } to parseAndCachePolicy.\n\n**Question 2 - Priority**: "What type of tasks to prioritize?"\n- All - Consider all tasks, pick by score\n- Bugs - Focus on bug fixes\n- Security - Security issues first\n- Features - New feature development\n\n**Question 3 - Stop Point**: "How far should I take this task?"\n- Merged - Until PR is merged to main\n- PR Created - Stop after creating PR\n- Implemented - Stop after local implementation\n- Deployed - Deploy to staging\n- Production - Full production deployment\n\nAfter user answers, proceed to Phase 2 with the selected policy.\n\n');
            }
        }
        return _0x292888;
    }
function transformCommandFrontmatterForOpenCode(_0x2dbd9d)
    /*Scope Closed:true*/
    {
        return _0x2dbd9d.replace(/^---\n([\s\S]*?)^---/m, function (_0x252206, _0x30c641)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x1ce8a6 = _0x30c641.trim().split('\n');
                var _0x251269 = {};
                var _iterator0 = _createForOfIteratorHelper(_0x1ce8a6);
                var _step0;
                try {
                    for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
                        var _0xc9cd5f = _step0.value;
                        var _0x5a930b = _0xc9cd5f.indexOf(':');
                        if (_0x5a930b > 0) {
                            var _0x491658 = _0xc9cd5f.substring(0, _0x5a930b).trim();
                            var _0x526a71 = _0xc9cd5f.substring(_0xc9cd5f.indexOf(':') + 1).trim();
                            _0x251269[_0x491658] = _0x526a71;
                        }
                    }
                } catch (err) {
                    _iterator0.e(err);
                } finally {
                    _iterator0.f();
                }
                var _0x4ad4ea = '---\n';
                if (_0x251269.description) {
                    _0x4ad4ea = '---\n' + ('description: ' + _0x251269.description + '\n');
                }
                _0x4ad4ea = '---\n' + ('description: ' + _0x251269.description + '\n') + 'agent: general\n';
                _0x4ad4ea = '---\n' + ('description: ' + _0x251269.description + '\n') + 'agent: general\n' + '---';
                return _0x4ad4ea;
            });
    }
function transformAgentFrontmatterForOpenCode(_0x1845b2, _0x4b8e7c)
    /*Scope Closed:true*/
    {
        var _ref = _0x4b8e7c || {};
        var _ref$stripModels = _ref.stripModels;
        var stripModels = _ref$stripModels === undefined ? true : _ref$stripModels;
        return _0x1845b2.replace(/^---\n([\s\S]*?)^---/m, function (_0x4d3f5a, _0x50360b)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x46335e = _0x50360b.trim().split('\n');
                var _0x3ac149 = {};
                var _iterator1 = _createForOfIteratorHelper(_0x46335e);
                var _step1;
                try {
                    for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
                        var _0x359061 = _step1.value;
                        var _0x14aaa0 = _0x359061.indexOf(':');
                        if (_0x14aaa0 > 0) {
                            var _0x22e4eb = _0x359061.substring(0, _0x14aaa0).trim();
                            var _0x5b4b41 = _0x359061.substring(_0x359061.indexOf(':') + 1).trim();
                            _0x3ac149[_0x22e4eb] = _0x5b4b41;
                        }
                    }
                } catch (err) {
                    _iterator1.e(err);
                } finally {
                    _iterator1.f();
                }
                var _0x1ba1d0 = '---\n';
                if (_0x3ac149.name) {
                    _0x1ba1d0 = '---\n' + ('name: ' + _0x3ac149.name + '\n');
                }
                if (_0x3ac149.description) {
                    _0x1ba1d0 = _0x1ba1d0 + ('description: ' + _0x3ac149.description + '\n');
                }
                _0x1ba1d0 = _0x1ba1d0 + ('description: ' + _0x3ac149.description + '\n') + 'mode: subagent\n';
                if (_0x3ac149.model && !(_ref$stripModels === undefined ? true : _ref$stripModels)) {
                    var _0x50ed8c = {
                        sonnet: 'anthropic/claude-sonnet-4',
                        opus: 'anthropic/claude-opus-4',
                        haiku: 'anthropic/claude-haiku-3-5'
                    };
                    _0x1ba1d0 = _0x1ba1d0 + ('model: ' + (_0x50ed8c[_0x3ac149.model] || _0x3ac149.model) + '\n');
                }
                if (_0x3ac149.tools) {
                    _0x1ba1d0 = _0x1ba1d0 + ('model: ' + (_0x50ed8c[_0x3ac149.model] || _0x3ac149.model) + '\n') + 'permission:\n';
                    var _0x197d6f = _0x3ac149.tools.toLowerCase();
                    _0x1ba1d0 = _0x1ba1d0 + ('  read: ' + (_0x197d6f.includes('read') ? 'allow' : 'deny') + '\n');
                    _0x1ba1d0 = _0x1ba1d0 + ('  edit: ' + (_0x197d6f.includes('edit') || _0x197d6f.includes('write') ? 'allow' : 'deny') + '\n');
                    _0x1ba1d0 = _0x1ba1d0 + ('  bash: ' + (_0x197d6f.includes('bash') ? 'allow' : 'ask') + '\n');
                    _0x1ba1d0 = _0x1ba1d0 + ('  glob: ' + (_0x197d6f.includes('glob') ? 'allow' : 'deny') + '\n');
                    _0x1ba1d0 = _0x1ba1d0 + ('  grep: ' + (_0x197d6f.includes('grep') ? 'allow' : 'deny') + '\n');
                }
                _0x1ba1d0 = _0x1ba1d0 + ('  grep: ' + (_0x197d6f.includes('grep') ? 'allow' : 'deny') + '\n') + '---';
                return _0x1ba1d0;
            });
    }
function transformSkillBodyForOpenCode(_0x10d7a9, _0x2b9af4)
    /*Scope Closed:false | writes:false*/
    {
        return transformBodyForOpenCode(_0x10d7a9, _0x2b9af4);
    }
function transformForCodex(_0x329f38, _0x1b85df)
    /*Scope Closed:false | writes:false*/
    {
        var _0x571911 = _0x1b85df.skillName;
        var _0x5d67d1 = _0x1b85df.description;
        var _0x29f07a = _0x1b85df.pluginInstallPath;
        var _0x176b94 = _0x5d67d1.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        var _0x15ea01 = '"' + _0x5d67d1.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        if (_0x329f38.startsWith('---')) {
            _0x329f38 = _0x329f38.replace(/^---\n[\s\S]*?\n---\n/, '---\nname: ' + _0x1b85df.skillName + '\ndescription: ' + ('"' + _0x5d67d1.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"') + '\n---\n');
        } else {
            _0x329f38 = '---\nname: ' + _0x1b85df.skillName + '\ndescription: ' + ('"' + _0x5d67d1.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"') + '\n---\n\n' + _0x329f38.replace(/^---\n[\s\S]*?\n---\n/, '---\nname: ' + _0x1b85df.skillName + '\ndescription: ' + ('"' + _0x5d67d1.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"') + '\n---\n');
        }
        _0x329f38 = _0x329f38.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, _0x29f07a);
        _0x329f38 = _0x329f38.replace(/\$CLAUDE_PLUGIN_ROOT/g, _0x29f07a);
        _0x329f38 = _0x329f38.replace(/\$\{PLUGIN_ROOT\}/g, _0x29f07a);
        _0x329f38 = _0x329f38.replace(/\$PLUGIN_ROOT/g, _0x29f07a);
        _0x329f38 = _0x329f38.replace(/AskUserQuestion/g, 'request_user_input');
        _0x329f38 = _0x329f38.replace(/^[ \t]*multiSelect:.*\n?/gm, '');
        _0x329f38 = _0x329f38.replace(/^([ \t]*request_user_input:\s*)$/gm, '$1\n> **Codex**: Each question MUST include a unique `id` field (e.g., `id: "q1"`).');
        return _0x329f38;
    }
function transformRuleForCursor(_0x53bfda, _0x5c6c78)
    /*Scope Closed:false | writes:false*/
    {
        var _x5c6c78$description = _0x5c6c78.description;
        var description = _x5c6c78$description === undefined ? '' : _x5c6c78$description;
        var _0x27541f = _0x5c6c78.pluginInstallPath;
        var _x5c6c78$globs = _0x5c6c78.globs;
        var globs = _x5c6c78$globs === undefined ? '' : _x5c6c78$globs;
        var _x5c6c78$alwaysApply = _0x5c6c78.alwaysApply;
        var alwaysApply = _x5c6c78$alwaysApply === undefined ? true : _x5c6c78$alwaysApply;
        var _0x156658 = description.replace(/[\u0000-\u001f\u007f]/g, ' ');
        var _0xa8fcaa = _0x156658.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        var _0x16e3a6 = '"' + _0x156658.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        var _0x35a10d = '---\ndescription: ' + ('"' + _0x156658.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"') + '\n';
        if (globs) {
            _0x35a10d = _0x35a10d + ('globs: ' + JSON.stringify(globs) + '\n');
        }
        _0x35a10d = _0x35a10d + ('alwaysApply: ' + (_x5c6c78$alwaysApply === undefined ? true : _x5c6c78$alwaysApply) + '\n---\n');
        if (_0x53bfda.startsWith('---')) {
            _0x53bfda = _0x53bfda.replace(/^---\n[\s\S]*?\n---\n?/, '');
        }
        _0x53bfda = _0x35a10d + _0x53bfda.replace(/^---\n[\s\S]*?\n---\n?/, '');
        _0x53bfda = _0x53bfda.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x27541f;
            });
        _0x53bfda = _0x53bfda.replace(/\$CLAUDE_PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x27541f;
            });
        _0x53bfda = _0x53bfda.replace(/\$\{PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x27541f;
            });
        _0x53bfda = _0x53bfda.replace(/\$PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x27541f;
            });
        _0x53bfda = _0x53bfda.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, function (_0x26e923)
            /* Called:undefined | Scope Closed:true*/
            {
                var _0x35c801 = _0x26e923.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
                if (_0x35c801) {
                    return 'Invoke the undefined agent';
                }
                return '';
            });
        _0x53bfda = _0x53bfda.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
        _0x53bfda = _0x53bfda.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
        _0x53bfda = _0x53bfda.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
        return _0x53bfda;
    }
function transformSkillForCursor(_0x2d996c, _0x31ff07)
    /*Scope Closed:true*/
    {
        var _0x3fc230 = _0x31ff07.pluginInstallPath;
        _0x2d996c = _0x2d996c.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x3fc230;
            });
        _0x2d996c = _0x2d996c.replace(/\$CLAUDE_PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x3fc230;
            });
        _0x2d996c = _0x2d996c.replace(/\$\{PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x3fc230;
            });
        _0x2d996c = _0x2d996c.replace(/\$PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x3fc230;
            });
        _0x2d996c = _0x2d996c.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
        return _0x2d996c;
    }
function transformCommandForCursor(_0x571bae, _0x5bf5a0)
    /*Scope Closed:true*/
    {
        var _0x48f08d = _0x5bf5a0.pluginInstallPath;
        if (_0x571bae.startsWith('---')) {
            _0x571bae = _0x571bae.replace(/^---\n[\s\S]*?\n---\n?/, '');
        }
        _0x571bae = _0x571bae.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x48f08d;
            });
        _0x571bae = _0x571bae.replace(/\$CLAUDE_PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x48f08d;
            });
        _0x571bae = _0x571bae.replace(/\$\{PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x48f08d;
            });
        _0x571bae = _0x571bae.replace(/\$PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x48f08d;
            });
        _0x571bae = _0x571bae.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
        _0x571bae = _0x571bae.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
        _0x571bae = _0x571bae.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, function (_0x5b13db)
            /* Called:undefined | Scope Closed:true*/
            {
                var _0x308bbd = _0x5b13db.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
                if (_0x308bbd) {
                    return 'Invoke the undefined agent';
                }
                return '';
            });
        _0x571bae = _0x571bae.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
        return _0x571bae;
    }
function transformSkillForKiro(_0x49e9cb, _0x527b56)
    /*Scope Closed:true*/
    {
        var _0x496ca4 = _0x527b56.pluginInstallPath;
        _0x49e9cb = _0x49e9cb.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x496ca4;
            });
        _0x49e9cb = _0x49e9cb.replace(/\$CLAUDE_PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x496ca4;
            });
        _0x49e9cb = _0x49e9cb.replace(/\$\{PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x496ca4;
            });
        _0x49e9cb = _0x49e9cb.replace(/\$PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x496ca4;
            });
        _0x49e9cb = _0x49e9cb.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
        return _0x49e9cb;
    }
function transformCommandForKiro(_0x53c006, _0x38a000)
    /*Scope Closed:false | writes:false*/
    {
        var _0x12ec7f = _0x38a000.pluginInstallPath;
        var _x38a000$name = _0x38a000.name;
        var name = _x38a000$name === undefined ? '' : _x38a000$name;
        var _x38a000$description = _0x38a000.description;
        var description = _x38a000$description === undefined ? '' : _x38a000$description;
        if (_0x53c006.startsWith('---')) {
            _0x53c006 = _0x53c006.replace(/^---\n[\s\S]*?\n---\n?/, '');
        }
        var _0x329649 = description.replace(/[\u0000-\u001f\u007f]/g, ' ');
        var _0x275d4d = _0x329649.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        var _0x16a2e3 = '---\n';
        _0x16a2e3 = '---\ninclusion: manual\n';
        if (name) {
            _0x16a2e3 = '---\ninclusion: manual\n' + ('name: "' + (_x38a000$name === undefined ? '' : _x38a000$name) + '"\n');
        }
        if (description) {
            _0x16a2e3 = _0x16a2e3 + ('description: "' + _0x329649.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"\n');
        }
        _0x16a2e3 = _0x16a2e3 + ('description: "' + _0x329649.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"\n') + '---\n';
        _0x53c006 = _0x16a2e3 + _0x53c006.replace(/^---\n[\s\S]*?\n---\n?/, '');
        _0x53c006 = _0x53c006.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x12ec7f;
            });
        _0x53c006 = _0x53c006.replace(/\$CLAUDE_PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x12ec7f;
            });
        _0x53c006 = _0x53c006.replace(/\$\{PLUGIN_ROOT\}/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x12ec7f;
            });
        _0x53c006 = _0x53c006.replace(/\$PLUGIN_ROOT/g, function ()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x12ec7f;
            });
        _0x53c006 = _0x53c006.replace(/(?:const|let|var)\s+\{?[^}=\n]+\}?\s*=\s*require\s*\([^)]+\);?/g, '');
        _0x53c006 = _0x53c006.replace(/require\s*\(['"][^'"]+['"]\)/g, '');
        _0x53c006 = _0x53c006.replace(/^```(?:javascript|js)?\n([\s\S]*?)^```$/gm, function (_0x35f954, _0x2943b6)
            /* Called:undefined | Scope Closed:true*/
            {
                if (!_0x2943b6.includes('Promise.all') || !_0x2943b6.includes('Task(')) {
                    return _0x35f954;
                }
                var _0x3a35d4 = [_0x2943b6.matchAll(/Task\s*\(\s*\{[\s\S]*?subagent_type:\s*['"](?:[^"':]+:)?([^'"]+)['"][\s\S]*?prompt:\s*`([\s\S]*?)`/g)];
                if (_0x3a35d4.length < 2) {
                    return _0x35f954;
                }
                var _0x2636d6 = _0x3a35d4.map(function (_0x589977)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x3f5c89 = _0x589977[1];
                        var _0x276391 = _0x589977[2].split('\n').find(function (_0x7801da)
                            /* Called:undefined | Scope Closed:true*/
                            {
                                return _0x7801da.trim();
                            }) || '';
                        return 'Delegate to the `' + _0x3f5c89 + '` subagent:\n> ' + _0x276391.trim();
                    });
                var _0x236fc1 = _0x2636d6.join('\n\n');
                var _0x59ccbe = _0x2636d6.some(function (_0x1142af)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        return /review|quality|security|performance|test|coverage/i.test(_0x1142af);
                    });
                if (_0x2636d6.length >= 4 && _0x59ccbe) {
                    _0x236fc1 = '**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n\n' + _0x2636d6.join('\n\n') + '\n\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.';
                }
                return _0x236fc1;
            });
        _0x53c006 = _0x53c006.replace(/await\s+Task\s*\(\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*\);?/g, function (_0x3753bf)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x1e51bb = _0x3753bf.match(/subagent_type:\s*["'](?:[^"':]+:)?([^"']+)["']/);
                var _0x1ab9ac = _0x3753bf.match(/prompt:\s*[`"']([\s\S]*?)[`"']/);
                if (_0x1e51bb) {
                    var _0x33ace6 = _0x1e51bb[1];
                    var _0x3d4440 = _0x1ab9ac ? _0x1ab9ac[1].replace(/\\n/g, '\n').trim() : '';
                    if (_0x3d4440) {
                        return 'Delegate to the `' + _0x33ace6 + '` subagent:\n> ' + _0x3d4440.split('\n')[0];
                    }
                    return 'Delegate to the `' + _0x33ace6 + '` subagent.';
                }
                return '';
            });
        _0x53c006 = _0x53c006.replace(/(?:await\s+)?AskUserQuestion\s*\(\s*\{[\s\S]*?\}\s*\);?/g, function (_0x574551)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                var _0x4e6af3 = _0x574551.match(/question:\s*["'`]([\s\S]*?)["'`]/);
                var _0xb87e95 = _0x4e6af3 ? _0x4e6af3[1] : 'Please choose:';
                var _0x42e173 = [_0x574551.matchAll(/label:\s*["'`]([^"'`]+)["'`][\s\S]*?description:\s*["'`]([^"'`]+)["'`]/g)];
                if (_0x42e173.length > 0) {
                    var _0x35cf82 = _0x42e173.map(function (_0xebca78, _0x2ab269)
                        /* Called:undefined | Scope Closed:true*/
                        {
                            return _0x2ab269 + 1 + '. **' + _0xebca78[1] + '** - ' + _0xebca78[2];
                        }).join('\n');
                    return '**' + _0xb87e95 + '**\n\n' + _0x35cf82 + '\n\nReply with the number or name of your choice.';
                }
                return '**' + _0xb87e95 + '**\n\nReply in chat with your choice.';
            });
        _0x53c006 = _0x53c006.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
        var _0x3cb4d7 = /((?:Delegate to the `[^`]*` subagent[^\n]*\n){4,})/g;
        _0x53c006 = _0x53c006.replace(_0x3cb4d7, function (_0x46214d)
            /* Called:undefined | Scope Closed:true*/
            {
                var _0x476f20 = _0x46214d.match(/Delegate to the `([^`]+)` subagent/g) || [];
                if (_0x476f20.length < 4) {
                    return _0x46214d;
                }
                var _0x52f215 = _0x476f20.some(function (_0x5782bc)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        return /review|quality|security|performance|test|coverage/i.test(_0x5782bc);
                    });
                if (!_0x476f20.some(function (_0x5782bc)
                        /* Called:undefined | Scope Closed:true*/
                        {
                            return /review|quality|security|performance|test|coverage/i.test(_0x5782bc);
                        })) {
                    return _0x46214d;
                }
                return '**Review phase (Kiro - max 4 agents, fallback to 2 sequential):**\n\nTry delegating to these subagents (experimental parallel spawning):\n' + _0x46214d + '\nIf parallel spawning is unavailable, run 2 combined reviewers sequentially:\n1. Delegate to the `reviewer-quality-security` subagent (code quality + security)\n2. Then delegate to the `reviewer-perf-test` subagent (performance + test coverage)\n\nAggregate all findings from whichever execution path succeeded.\n';
            });
        return _0x53c006;
    }
function transformAgentForKiro(_0x113784, _0x2f4ae6)
    /*Scope Closed:false | writes:false*/
    {
        var _ref2 = _0x2f4ae6 || {};
        var _0x4a4088 = _ref2.pluginInstallPath;
        var _0x3c0af6 = discovery.parseFrontmatter(_0x113784);
        var _0x46b89b = _0x113784;
        if (_0x113784.startsWith('---')) {
            var _0x2be801 = _0x113784.indexOf('\n---', 3);
            if (_0x2be801 !== -1) {
                _0x46b89b = _0x113784.substring(_0x113784.indexOf('\n---', 3) + 4).replace(/^\n/, '');
            }
        }
        if (_0x4a4088) {
            _0x46b89b = _0x46b89b.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return _0x4a4088;
                });
            _0x46b89b = _0x46b89b.replace(/\$CLAUDE_PLUGIN_ROOT/g, function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return _0x4a4088;
                });
            _0x46b89b = _0x46b89b.replace(/\$\{PLUGIN_ROOT\}/g, function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return _0x4a4088;
                });
            _0x46b89b = _0x46b89b.replace(/\$PLUGIN_ROOT/g, function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return _0x4a4088;
                });
        }
        _0x46b89b = _0x46b89b.replace(/(?:next-task|deslop|ship|sync-docs|audit-project|enhance|perf|repo-map|drift-detect|consult|debate|learn|web-ctl):([a-z][a-z0-9-]*)/g, '$1');
        var _0x499b71 = {
            name: _0x3c0af6.name || '',
            description: _0x3c0af6.description || '',
            prompt: _0x46b89b.trim()
        };
        if (_0x3c0af6.tools) {
            var _0x53b886 = Array.isArray(_0x3c0af6.tools) ? _0x3c0af6.tools.map(function (_0xc16e5f)
                /* Called:undefined | Scope Closed:true*/
                {
                    return _0xc16e5f.toLowerCase();
                }) : [_0x3c0af6.tools.toLowerCase()];
            var _0x41fd21 = _0x53b886.join(' ');
            var _0x1c2e4a = [];
            if (_0x41fd21.includes('read')) {
                _0x1c2e4a.push('read');
            }
            if (_0x41fd21.includes('edit') || _0x41fd21.includes('write')) {
                _0x1c2e4a.push('write');
            }
            if (_0x41fd21.includes('bash') || _0x41fd21.includes('shell')) {
                _0x1c2e4a.push('shell');
            }
            if (_0x41fd21.includes('glob')) {
                _0x1c2e4a.push('read');
            }
            if (_0x41fd21.includes('grep')) {
                _0x1c2e4a.push('read');
            }
            if (_0x41fd21.includes('task') || _0x41fd21.includes('agent')) {
                _0x1c2e4a.push('shell');
            }
            if (_0x41fd21.includes('web') || _0x41fd21.includes('fetch')) {
                _0x1c2e4a.push('shell');
            }
            if (_0x41fd21.includes('notebook')) {
                _0x1c2e4a.push('write');
            }
            if (_0x41fd21.includes('lsp')) {
                _0x1c2e4a.push('read');
            }
            var _0x494daf = [new Set(_0x1c2e4a)];
            if (_0x494daf.length > 0) {
                _0x499b71.tools = [new Set(_0x1c2e4a)];
            } else {
                _0x499b71.tools = ['read'];
            }
        } else {
            _0x499b71.tools = ['read'];
        }
        _0x499b71.resources = ['file://.kiro/prompts/**/*.md'];
        return JSON.stringify(_0x499b71, null, 2);
    }
function generateCombinedReviewerAgent(_0x4e9351, _0x429a93, _0xfe882c)
    /*Scope Closed:false | writes:false*/
    {
        var _0x145a7f = _0x4e9351.map(function (_0x10e948)
            /* Called:undefined | Scope Closed:true*/
            {
                return '## undefined Review\n\nFocus: undefined';
            }).join('\n\n---\n\n');
        var _0xe54db8 = {
            name: _0x429a93,
            description: _0xfe882c,
            prompt: 'You are a combined code reviewer covering multiple review passes in a single session.\n\n' + _0x4e9351.map(function (_0x10e948)
                /* Called:undefined | Scope Closed:true*/
                {
                    return '## undefined Review\n\nFocus: undefined';
                }).join('\n\n---\n\n') + '\n\nFor each file you review, check ALL of the above review dimensions. Return findings as a JSON array with objects containing: pass (which review), file, line, severity (critical/high/medium/low), description, suggestion.',
            tools: ['read'],
            resources: ['file://.kiro/prompts/**/*.md']
        };
        var _0x688927 = _0xe54db8;
        return JSON.stringify(_0x688927, null, 2);
    }
var _0x4d71e4 = {
    transformBodyForOpenCode: transformBodyForOpenCode,
    transformCommandFrontmatterForOpenCode: transformCommandFrontmatterForOpenCode,
    transformAgentFrontmatterForOpenCode: transformAgentFrontmatterForOpenCode,
    transformSkillBodyForOpenCode: transformSkillBodyForOpenCode,
    transformForCodex: transformForCodex,
    transformRuleForCursor: transformRuleForCursor,
    transformSkillForCursor: transformSkillForCursor,
    transformCommandForCursor: transformCommandForCursor,
    transformForCursor: transformRuleForCursor,
    transformSkillForKiro: transformSkillForKiro,
    transformCommandForKiro: transformCommandForKiro,
    transformAgentForKiro: transformAgentForKiro,
    generateCombinedReviewerAgent: generateCombinedReviewerAgent
};
module.exports = _0x4d71e4;