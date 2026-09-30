var yaml;
var yaml_default;

var yaml_exports = {};
Object.defineProperty(yaml_exports, "__esModule", { value: true });
Object.defineProperty(yaml_exports, "default", {
  enumerable: true,
  get: function () {
    return yaml_default;
  },
});
Object.defineProperty(yaml_exports, "yaml", {
  enumerable: true,
  get: function () {
    return yaml;
  },
});
module.exports = yaml_exports;

var globals = Object.assign(Object.create(null), {
  headingDivider: function (value) {
    var allowedDividers = [1, 2, 3, 4, 5, 6];

    var normalize = function (divider) {
      if (Array.isArray(divider) || Number.isInteger(divider)) return divider;
      return Number.parseInt(divider, 10);
    };

    var normalized = normalize(value);

    if (Array.isArray(normalized)) {
      var dividers = normalized.map(normalize);
      return {
        headingDivider: allowedDividers.filter(function (divider) {
          return dividers.includes(divider);
        }),
      };
    }

    if (value === false) return { headingDivider: false };

    if (allowedDividers.includes(normalized)) {
      return { headingDivider: normalized };
    }

    return {};
  },

  style: function (value) {
    return { style: value };
  },

  theme: function (value, context) {
    return context.themeSet.has(value) ? { theme: value } : {};
  },

  lang: function (value) {
    return { lang: value };
  },
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: function (value) {
    return { backgroundColor: value };
  },

  backgroundImage: function (value) {
    return { backgroundImage: value };
  },

  backgroundPosition: function (value) {
    return { backgroundPosition: value };
  },

  backgroundRepeat: function (value) {
    return { backgroundRepeat: value };
  },

  backgroundSize: function (value) {
    return { backgroundSize: value };
  },

  class: function (value) {
    return { class: Array.isArray(value) ? value.join(" ") : value };
  },

  color: function (value) {
    return { color: value };
  },

  footer: function (value) {
    return typeof value === "string" ? { footer: value } : {};
  },

  header: function (value) {
    return typeof value === "string" ? { header: value } : {};
  },

  paginate: function (value) {
    var paginate = (value || "").toLowerCase();

    if (["skip", "hold"].includes(paginate)) {
      return { paginate: paginate };
    }

    return { paginate: paginate === "true" };
  },
});

var directives_default = [
  ...Object.keys(globals),
  ...Object.keys(locals),
];

var jsYaml = require("js-yaml");

function createPatterns(directives) {
  var patterns = new Set();

  for (var directive of directives) {
    var pattern =
      "_?" +
      directive.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");

    patterns.add(pattern);
    patterns.add('"' + pattern + '"');
    patterns.add("'" + pattern + "'");
  }

  return [...patterns.values()];
}

var yamlSpecialChars = "-?:,[]{}#&!|>'\"%@`*";

function parse(source) {
  try {
    var parsed = jsYaml.load(source, { schema: jsYaml.JSON_SCHEMA });

    if (parsed === null || typeof parsed !== "object") return false;
    return parsed;
  } catch {
    return false;
  }
}

function convertLoose(source, directives) {
  var directivePattern =
    "(?:" + createPatterns(directives).join("|") + ")";

  var directiveLine = new RegExp(
    "^(" + directivePattern + "\\s*:)(.*)$"
  );

  var converted = "";

  for (var line of source.split(/\r?\n/)) {
    converted +=
      line.replace(
        directiveLine,
        function (matched, key, rawValue) {
          var value = rawValue.trim();

          if (
            value.length === 0 ||
            yamlSpecialChars.includes(value[0])
          ) {
            return matched;
          }

          var leadingSpaceLength =
            rawValue.length - rawValue.trimStart().length;
          var leadingSpace = rawValue.substring(0, leadingSpaceLength);

          return (
            key +
            leadingSpace +
            '"' +
            value.split('"').join('\\"') +
            '"'
          );
        }
      ) + "\n";
  }

  return converted.trim();
}

yaml = function (source, loose) {
  if (loose === undefined) loose = false;

  return parse(
    loose
      ? convertLoose(source, [
          ...directives_default,
          ...(Array.isArray(loose) ? loose : []),
        ])
      : source
  );
};

yaml_default = yaml;
