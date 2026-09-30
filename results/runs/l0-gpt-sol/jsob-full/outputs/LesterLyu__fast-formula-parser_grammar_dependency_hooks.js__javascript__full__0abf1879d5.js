class Parser {
  constructor(options = {}) {
    this.options = options;
    this.functions = options.functions || {};
    this.dependencies = [];
    this.tokens = [];
    this.errors = [];
  }

  parse(formula) {
    if (typeof formula !== "string") {
      throw new TypeError("Formula must be a string");
    }

    this.dependencies = [];
    this.errors = [];
    this.tokens = this.tokenize(formula);

    for (const token of this.tokens) {
      if (token.type === "Cell" || token.type === "Range") {
        this.dependencies.push(token.value);
      }
    }

    return this.dependencies;
  }

  tokenize(formula) {
    const tokens = [];
    const pattern =
      /(?:'((?:''|[^'])+)'|([A-Za-z_][A-Za-z0-9_ .]*)!)?(\$?[A-Z]{1,3}\$?\d+)(?::(\$?[A-Z]{1,3}\$?\d+))?/g;

    let match;
    while ((match = pattern.exec(formula)) !== null) {
      const sheet = match[1] ? match[1].replace(/''/g, "'") : match[2];
      const first = match[3];
      const second = match[4];

      const value = {
        address: second ? `${first}:${second}` : first
      };

      if (sheet) {
        value.sheet = sheet;
      }

      tokens.push({
        type: second ? "Range" : "Cell",
        value
      });
    }

    return tokens;
  }
}

module.exports = {
  Parser
};
