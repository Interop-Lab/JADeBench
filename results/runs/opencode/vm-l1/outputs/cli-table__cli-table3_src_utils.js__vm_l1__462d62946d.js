"use strict";

const stringWidth = require("string-width");

const ANSI_PATTERN = /[\u001B\u009B][[\]()#;?]*(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*)?\u0007|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

const DEFAULT_OPTIONS = {
  chars: {
    top: "─", "top-mid": "┬", "top-left": "┌", "top-right": "┐",
    bottom: "─", "bottom-mid": "┴", "bottom-left": "└", "bottom-right": "┘",
    left: "│", "left-mid": "├", mid: "─", "mid-mid": "┼",
    right: "│", "right-mid": "┤", middle: "│",
  },
  truncate: "…",
  colWidths: [],
  rowHeights: [],
  colAligns: [],
  rowAligns: [],
  style: {
    "padding-left": 1,
    "padding-right": 1,
    head: ["red"],
    border: ["grey"],
    compact: false,
  },
  head: [],
};

function stripAnsi(value) {
  return String(value).replace(ANSI_PATTERN, "");
}

function strlen(value) {
  return stringWidth(stripAnsi(value));
}

function repeat(value, count) {
  return new Array(count + 1).join(value);
}

function pad(value, targetWidth, fill = ",", alignment = "left") {
  const missing = targetWidth - strlen(value);
  if (missing <= 0) return value;
  const padding = repeat(fill, missing);
  if (alignment === "right") return padding + value;
  if (alignment === "center") {
    const left = Math.floor(missing / 2);
    return repeat(fill, left) + value + repeat(fill, missing - left);
  }
  return value + padding;
}

function truncate(value, targetWidth, marker = "…") {
  if (strlen(value) <= targetWidth) return value;
  const contentWidth = Math.max(0, targetWidth - strlen(marker));
  let visibleWidth = 0;
  let result = "";
  let match;
  let position = 0;
  ANSI_PATTERN.lastIndex = 0;
  while ((match = ANSI_PATTERN.exec(value))) {
    result += takeVisible(value.slice(position, match.index), contentWidth - visibleWidth);
    visibleWidth = strlen(result);
    if (visibleWidth >= contentWidth) break;
    result += normalizeClosingAnsi(match[0]);
    position = match.index + match[0].length;
  }
  if (visibleWidth < contentWidth) result += takeVisible(value.slice(position), contentWidth - visibleWidth);
  return result + marker;
}

function takeVisible(text, width) {
  let result = "";
  for (const character of text) {
    if (strlen(result + character) > width) break;
    result += character;
  }
  return result;
}

function normalizeClosingAnsi(code) {
  if (code === "\u001b[0m") return "\u001b[39m";
  return code;
}

function mergeOptions(options, defaults) {
  const base = defaults == null ? DEFAULT_OPTIONS : defaults;
  const supplied = options || {};
  return {
    ...base,
    ...supplied,
    chars: { ...(base.chars || {}), ...(supplied.chars || {}) },
    style: { ...(base.style || {}), ...(supplied.style || {}) },
  };
}

function wordWrap(width, text) {
  const lines = [];
  for (const sourceLine of String(text).split("\n")) {
    if (width <= 0 || strlen(sourceLine) <= width) {
      lines.push(sourceLine);
      continue;
    }
    const words = sourceLine.split(/\s+/).filter(Boolean);
    let line = sourceLine.startsWith(" ") ? " " : "";
    for (const word of words) {
      const candidate = line && line !== " " ? `${line} ${word}` : line + word;
      if (line && strlen(candidate) > width) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (sourceLine.endsWith(" ")) line += " ";
    lines.push(line);
  }
  return lines;
}

function colorizeLines(lines) {
  let activeColor = "";
  return lines.map((line) => {
    const opens = line.match(/\u001b\[(?:3\d|9\d)m/g) || [];
    let colored = activeColor + line;
    for (const code of opens) {
      if (code === "\u001b[39m") activeColor = "";
      else activeColor = code;
    }
    if (activeColor) colored += "\u001b[39m";
    return colored;
  });
}

function hyperlink(url, text) {
  return `\u001b]8;;${url}\u0007${text || url}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  const match = value.match(/#([\da-f]{3,8})/i);
  if (!match) return "#000";
  const digits = match[1];
  if (digits.length === 3 || digits.length === 4) return `#${digits}`;
  if (digits.length >= 6) return `#${digits.slice(0, 6)}`;
  return "#000";
}

module.exports = {
  strlen,
  repeat,
  pad,
  truncate,
  mergeOptions,
  wordWrap,
  colorizeLines,
  hyperlink,
  parseHexValue,
};
