// AgentDeobfBench execution tracer (paper §3.2).
//
// Inlined verbatim into a generated tracer module that the shim imports before
// the implementation under test, so that host globals are already patched when
// the implementation's top-level code runs.
//
// What it records is the subject's *observable behaviour*: every call into the
// module's exported surface, with arguments, return value, thrown error, and
// promise settlement, plus the host-API calls made while such a call is on the
// stack. Two runs — one driven against the reference bundle, one against the
// candidate — produce two traces, and the candidate is scored by how far its
// trace follows the reference's.
//
// Host calls are recorded, never stubbed. Stubbing `Date.now` or a timer would
// change the program being measured, and a deobfuscation system would be scored
// against behaviour the original never had.

function __adbInstall(write, options) {
  var opts = options || {};
  var MAX_EVENTS = opts.max_events || 5000;
  var STR_CAP = opts.value_string_cap || 200;
  var DEPTH_CAP = opts.value_depth_cap || 4;
  var ARRAY_CAP = opts.value_array_cap || 20;
  var KEY_CAP = opts.value_key_cap || 30;
  var BUDGET = opts.value_budget || 2000;

  var state = { seq: 0, depth: 0, dropped: 0, budget: BUDGET };

  // Is this constructor ambient — a built-in or a host class — rather than one
  // the subject declares?
  //
  // The distinction decides whether its name may enter the trace. `TypeError`
  // and `Map` are intrinsics: an obfuscator cannot rename them, and which one
  // came back is genuine observable behaviour. A class declared inside the
  // subject is a local identifier, and renaming it is precisely what a
  // deobfuscation system is asked to do — comparing that name for equality
  // would score identifier recovery inside the execution measure, and score it
  // backwards, since only a system that guessed the developer's original name
  // would match.
  function ambientName(ctor) {
    if (!ctor || !ctor.name) return null;
    try {
      return globalThis[ctor.name] === ctor ? ctor.name : null;
    } catch (err) {
      return null;
    }
  }

  function emit(event) {
    if (state.seq >= MAX_EVENTS) { state.dropped++; return; }
    event.seq = state.seq++;
    try { write(JSON.stringify(event) + '\n'); } catch (err) { /* trace loss must not fail the run */ }
  }

  // Serialisation is bounded in depth, width, string length, and total size. An
  // unbounded serialiser turns one large argument into a trace nobody can diff
  // and can itself change the program's behaviour by walking lazy getters.
  //
  // The budget matters as much as the caps: a real subject is called with host
  // objects — a MarkdownIt instance, a request, a DOM node — whose reachable
  // graph is enormous at any depth limit worth having. Traversal order is fixed
  // and keys are sorted, so both runs exhaust the budget at the same point and
  // truncation cannot manufacture a difference.
  function ser(value, depth) {
    depth = depth || 0;
    if (value === null) return null;
    var type = typeof value;
    if (type === 'undefined') return '@undefined';
    if (type === 'boolean') return value;
    if (type === 'number') return isFinite(value) ? value : '@' + String(value);
    if (type === 'bigint') return '@bigint:' + value.toString();
    if (type === 'symbol') return '@symbol:' + String(value.description);
    if (type === 'string') {
      var text = value.length > STR_CAP ? value.slice(0, STR_CAP) + '…+' + (value.length - STR_CAP) : value;
      state.budget -= text.length;
      return text;
    }
    // Arity, not name. A returned function's identifier is the thing under
    // test, not a fact about behaviour; its parameter count is rename-invariant
    // and is what a caller can actually observe.
    if (type === 'function') return '@fn/' + value.length;
    if (depth >= DEPTH_CAP) return '@depth';
    if (state.budget <= 0) return '@budget';

    try {
      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
        return '@buffer:' + value.length + ':' + value.toString('hex').slice(0, 64);
      }
      if (ArrayBuffer.isView(value)) {
        return '@view:' + (value.constructor && value.constructor.name) + ':' + value.byteLength;
      }
      if (Array.isArray(value)) {
        var items = value.slice(0, ARRAY_CAP).map(function (item) { return ser(item, depth + 1); });
        if (value.length > ARRAY_CAP) items.push('@more:' + (value.length - ARRAY_CAP));
        return items;
      }
      if (value instanceof Error) {
        // Built-in error types are named; a subject-declared error class is
        // recorded as `custom`, since its name is renameable. `message` carries
        // the behaviour either way and is compared as before.
        return { '@error': ambientName(value.constructor) || 'custom', message: value.message };
      }
      if (value instanceof Date) return '@date';
      if (value instanceof RegExp) return '@regexp:' + String(value);
      if (typeof Map !== 'undefined' && value instanceof Map) {
        return { '@map': Array.from(value.entries()).slice(0, ARRAY_CAP).map(function (entry) {
          return [ser(entry[0], depth + 1), ser(entry[1], depth + 1)];
        }) };
      }
      if (typeof Set !== 'undefined' && value instanceof Set) {
        return { '@set': Array.from(value).slice(0, ARRAY_CAP).map(function (item) { return ser(item, depth + 1); }) };
      }
      if (typeof value.then === 'function') return '@thenable';

      var out = {};
      var ctor = ambientName(value.constructor);
      if (ctor && ctor !== 'Object') out['@class'] = ctor;
      else if (value.constructor && value.constructor.name
               && value.constructor.name !== 'Object') out['@class'] = '@custom';
      // Own property names are compared as-is. That is sound only because the
      // obfuscation suite keeps `renameProperties` off throughout; if it were
      // ever enabled, keys would leak renameable identifiers exactly as the
      // constructor name did above.
      var keys = Object.keys(value).sort().slice(0, KEY_CAP);
      for (var i = 0; i < keys.length; i++) {
        if (state.budget <= 0) { out['@budget'] = keys.length - i; break; }
        state.budget -= keys[i].length;
        try { out[keys[i]] = ser(value[keys[i]], depth + 1); } catch (err) { out[keys[i]] = '@throws'; }
      }
      return out;
    } catch (err) {
      return '@unserialisable';
    }
  }

  // Each recorded event gets its own budget, so one large argument cannot
  // starve the events after it.
  function serTop(value) {
    state.budget = BUDGET;
    return ser(value, 0);
  }

  function record(kind, name, payload) {
    var event = { kind: kind, name: name };
    for (var key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) event[key] = payload[key];
    }
    emit(event);
  }

  function traceCall(name, invoke, args, kind) {
    record(kind, name, { args: serTop(args) });
    state.depth++;
    var result;
    try {
      result = invoke();
    } catch (err) {
      state.depth--;
      record('throw', name, { error: serTop(err) });
      throw err;
    }
    state.depth--;
    if (result && (typeof result === 'object' || typeof result === 'function')
        && typeof result.then === 'function') {
      record('return', name, { value: '@promise' });
      try {
        result.then(
          function (value) { record('resolve', name, { value: serTop(value) }); },
          function (err) { record('reject', name, { error: serTop(err) }); }
        );
      } catch (err) { /* a non-standard thenable is not worth failing over */ }
    } else {
      record(kind === 'new' ? 'constructed' : 'return', name, { value: serTop(result) });
    }
    return result;
  }

  // A Proxy rather than a wrapper function: it preserves identity-adjacent
  // behaviour the tests may rely on — `instanceof`, prototype, own properties,
  // arity — while still observing calls and constructions.
  function wrapCallable(name, fn) {
    return new Proxy(fn, {
      apply: function (target, thisArg, args) {
        return traceCall(name, function () { return Reflect.apply(target, thisArg, args); }, args, 'call');
      },
      construct: function (target, args, newTarget) {
        return traceCall(name, function () { return Reflect.construct(target, args, newTarget); }, args, 'new');
      },
    });
  }

  function isPlainish(value) {
    if (!value || typeof value !== 'object') return false;
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  // Objects are proxied instead of copied so that mutation, deletion, and
  // property addition by the test still reach the real export object.
  function wrapObject(prefix, obj) {
    var cache = new Map();
    return new Proxy(obj, {
      get: function (target, prop, receiver) {
        var value = Reflect.get(target, prop, receiver);
        if (typeof value !== 'function' || typeof prop === 'symbol') return value;
        if (cache.has(prop) && cache.get(prop).raw === value) return cache.get(prop).wrapped;
        var wrapped = wrapCallable(prefix ? prefix + '.' + String(prop) : String(prop), value);
        cache.set(prop, { raw: value, wrapped: wrapped });
        return wrapped;
      },
    });
  }

  function wrapValue(name, value) {
    if (typeof value === 'function') return wrapCallable(name, value);
    if (isPlainish(value)) return wrapObject(name, value);
    return value;
  }

  // --- host-API spy --------------------------------------------------------
  // Only records while a traced call is on the stack, so the test runner's own
  // console output, timers, and clock reads never enter the trace.
  function spy(path) {
    var parts = path.split('.');
    var owner = globalThis;
    for (var i = 0; i < parts.length - 1; i++) {
      owner = owner && owner[parts[i]];
      if (!owner) return;
    }
    var prop = parts[parts.length - 1];
    var original;
    try { original = owner[prop]; } catch (err) { return; }
    if (typeof original !== 'function') return;
    try {
      var descriptor = Object.getOwnPropertyDescriptor(owner, prop);
      if (descriptor && !descriptor.writable && !descriptor.set) return;
      owner[prop] = function () {
        if (state.depth > 0) {
          record('host', path, { args: serTop(Array.prototype.slice.call(arguments)) });
        }
        return original.apply(this, arguments);
      };
    } catch (err) { /* frozen host object */ }
  }

  var hosts = opts.host_globals || [];
  for (var h = 0; h < hosts.length; h++) spy(hosts[h]);

  return {
    state: state,
    wrapValue: wrapValue,
    wrapNamespace: function (ns) {
      if (typeof ns === 'function') return wrapCallable('module', ns);
      if (!ns || typeof ns !== 'object') return ns;
      return wrapObject('', ns);
    },
    pick: function (ns, key) {
      return wrapValue(key, ns ? ns[key] : undefined);
    },
  };
}
