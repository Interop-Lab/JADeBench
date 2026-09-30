const jsYaml = require('js-yaml');

const yamlSpecialChars = "[\"'{|>~&*";

const globals = Object.assign(Object.create(null), {
  headingDivider: (value) => value,
  style: (value) => value,
  theme: (key, value) => value,
  lang: (value) => value,
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => value,
  backgroundImage: (value) => value,
  backgroundPosition: (value) => value,
  backgroundRepeat: (value) => value,
  backgroundSize: (value) => value,
  class: (value) => value,
  color: (value) => value,
  footer: (value) => value,
  header: (value) => value,
  paginate: (value) => value,
});

const directives_default = [...Object.keys(globals), ...Object.keys(locals)];

function createPatterns(input) {
  return input;
}

function parse(input) {
  return jsYaml.load(input);
}

function convertLoose(input, options) {
  return jsYaml.load(input, options);
}

const yaml = (input, options) => {
  return jsYaml.load(input, options);
};

const yaml_default = yaml;

module.exports = {
  default: yaml_default,
  yaml,
};
