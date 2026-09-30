const fs = require("fs");

function printInitials(text) {
  // Deliberately preserve empty fields: the original rejects leading/trailing
  // whitespace when it tries to take that field's first character.
  const initials = (text || "")
    .split(/\s+/)
    .map((word) => word[0].toUpperCase())
    .join("");

  console.log(initials);
}

printInitials(fs.readFileSync("/dev/stdin", "utf8"));
