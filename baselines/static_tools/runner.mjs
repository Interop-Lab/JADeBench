#!/usr/bin/env node
/**
 * Run one pinned traditional deobfuscator over one JavaScript program.
 *
 * This adapter deliberately has a file-to-file contract. AgentDeobfBench scores
 * one complete replacement program, so bundle extraction directories and other
 * auxiliary artifacts must not become hidden extra inputs to the evaluator.
 *
 * Usage:
 *   node runner.mjs webcrack input.cjs output.cjs metadata.json
 *   node runner.mjs synchrony input.cjs output.cjs metadata.json
 *   node runner.mjs --versions
 *   node runner.mjs --smoke
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXPECTED = Object.freeze({ webcrack: "2.16.0", synchrony: "2.4.6" });

async function packageVersion(packageName) {
  const file = resolve(HERE, "node_modules", packageName, "package.json");
  const data = JSON.parse(await readFile(file, "utf8"));
  return data.version;
}

async function versions() {
  return {
    node: process.versions.node,
    webcrack: await packageVersion("webcrack"),
    synchrony: await packageVersion("deobfuscator"),
  };
}

async function assertVersions() {
  const found = await versions();
  for (const [name, expected] of Object.entries(EXPECTED)) {
    if (found[name] !== expected) {
      throw new Error(`${name} version mismatch: expected ${expected}, found ${found[name]}`);
    }
  }
  return found;
}

async function runWebcrack(source) {
  const { webcrack } = await import("webcrack");
  // The paper gives traditional tools their recommended configuration. These
  // are webcrack's documented defaults. `result.code` remains the single-file
  // replacement artifact even when bundle discovery also succeeds.
  const result = await webcrack(source, {
    jsx: true,
    unpack: true,
    unminify: true,
    deobfuscate: true,
    mangle: false,
  });
  return {
    code: result.code,
    detail: {
      bundle_type: result.bundle?.type ?? null,
      bundle_modules: result.bundle?.modules?.size ?? null,
    },
  };
}

function runProcess(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code, signal) => resolvePromise({ code, signal, stdout, stderr }));
  });
}

async function findSynchronyOutput(root, inputName) {
  const input = resolve(root, inputName);
  const entries = await readdir(root, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(root, entry.name))
    .filter((file) => file !== input);
  const cleaned = files.find((file) => basename(file).includes(".cleaned."));
  if (cleaned) return cleaned;
  if (files.length === 1) return files[0];
  throw new Error(`Synchrony did not produce one identifiable cleaned file; found ${files.length}`);
}

async function runSynchrony(source, inputPath) {
  const scratch = await mkdtemp(join(tmpdir(), "adb-synchrony-"));
  try {
    const suffix = extname(inputPath) || ".js";
    const inputName = `subject${suffix}`;
    await writeFile(join(scratch, inputName), source, "utf8");
    const binary = resolve(HERE, "node_modules", ".bin", "synchrony");
    // Parser mode follows the build's module extension. This selects syntax,
    // not a stronger transformation configuration; all transformers remain at
    // Synchrony's documented defaults.
    const sourceType = suffix === ".mjs" ? "module" : "script";
    const proc = await runProcess(
      binary, ["deobfuscate", inputName, "--sourceType", sourceType],
      { cwd: scratch });
    if (proc.code !== 0) {
      const diagnostic = (proc.stderr || proc.stdout || `exit ${proc.code}`).trim();
      throw new Error(`Synchrony failed: ${diagnostic.slice(-4000)}`);
    }
    const cleaned = await findSynchronyOutput(scratch, inputName);
    return {
      code: await readFile(cleaned, "utf8"),
      detail: {
        stdout: proc.stdout.trim().slice(-2000),
        stderr: proc.stderr.trim().slice(-2000),
        emitted_file: basename(cleaned),
        source_type: sourceType,
      },
    };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

async function transform(tool, inputPath, outputPath, metadataPath) {
  const installed = await assertVersions();
  const source = await readFile(inputPath, "utf8");
  const started = performance.now();
  const transformed = tool === "webcrack"
    ? await runWebcrack(source)
    : tool === "synchrony"
      ? await runSynchrony(source, inputPath)
      : (() => { throw new Error(`unknown tool: ${tool}`); })();
  if (typeof transformed.code !== "string" || !transformed.code.trim()) {
    throw new Error(`${tool} returned an empty program`);
  }
  await writeFile(outputPath, transformed.code, "utf8");
  await writeFile(metadataPath, JSON.stringify({
    ok: true,
    tool,
    version: installed[tool],
    input_chars: source.length,
    output_chars: transformed.code.length,
    milliseconds: Math.round((performance.now() - started) * 1000) / 1000,
    detail: transformed.detail,
  }, null, 2) + "\n", "utf8");
}

async function smoke() {
  await assertVersions();
  const source = "const n=(0x10+2);module.exports={value:n};\n";
  const root = await mkdtemp(join(tmpdir(), "adb-static-smoke-"));
  try {
    for (const tool of Object.keys(EXPECTED)) {
      const input = join(root, `${tool}.cjs`);
      const output = join(root, `${tool}.out.cjs`);
      const meta = join(root, `${tool}.json`);
      await writeFile(input, source, "utf8");
      await transform(tool, input, output, meta);
      const code = await readFile(output, "utf8");
      if (!code.trim()) throw new Error(`${tool} smoke output is empty`);
      process.stdout.write(`${tool}: ok (${code.length} chars)\n`);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--versions") {
    process.stdout.write(JSON.stringify(await versions(), null, 2) + "\n");
    return;
  }
  if (args[0] === "--smoke") {
    await smoke();
    return;
  }
  if (args.length !== 4) {
    throw new Error("usage: runner.mjs <webcrack|synchrony> <input> <output> <metadata>");
  }
  await transform(args[0], resolve(args[1]), resolve(args[2]), resolve(args[3]));
}

main().catch(async (error) => {
  const args = process.argv.slice(2);
  const metadataPath = args.length === 4 ? resolve(args[3]) : null;
  const record = {
    ok: false,
    error: `${error?.name || "Error"}: ${error?.message || String(error)}`,
  };
  if (metadataPath) {
    try { await writeFile(metadataPath, JSON.stringify(record, null, 2) + "\n", "utf8"); }
    catch { /* the Python driver also records stderr */ }
  }
  process.stderr.write(record.error + "\n");
  process.exitCode = 1;
});
