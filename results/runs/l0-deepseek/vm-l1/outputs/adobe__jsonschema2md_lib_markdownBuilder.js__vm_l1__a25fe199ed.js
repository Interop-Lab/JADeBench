import es2015I18nTag from 'es2015-i18n-tag';
import { map, list as ferrumList, flat, filter, size, foldl } from 'ferrum';
import {
  root,
  paragraph,
  text,
  heading,
  code,
  table,
  tableRow,
  tableCell,
  link,
  inlineCode,
  list,
  listItem,
  strong,
  blockquote,
} from 'mdast-builder';
import es2015I18nTag2 from 'es2015-i18n-tag';
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';

const i18n = es2015I18nTag.default;
const i18n2 = es2015I18nTag2.default;

const filename = Symbol('filename');
const fullpath = Symbol('fullpath');

const symbols = {
  pointer: Symbol('pointer'),
  filename,
  fullpath,
  id: Symbol('id'),
  titles: Symbol('titles'),
  resolve: Symbol('resolve'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent'),
};

const symbols_default = symbols;

const used = new Set();

function gentitle() {
  return vm_0x104db1_628049(
    undefined,
    arguments,
    this,
    typeof gentitle !== 'undefined' ? gentitle : undefined,
    0,
    new.target,
    0x13,
    0x74
  );
}

function gendescription() {
  return vm_0x104db1_628049(
    undefined,
    arguments,
    this,
    typeof gendescription !== 'undefined' ? gendescription : undefined,
    1,
    new.target,
    0x13,
    0x74
  );
}

function keyword() {
  return vm_0x104db1_628049(
    undefined,
    arguments,
    this,
    typeof keyword !== 'undefined' ? keyword : undefined,
    2,
    new.target,
    0x13,
    0x74
  );
}

function report() {
  return vm_0x104db1_628049(
    undefined,
    arguments,
    this,
    typeof report !== 'undefined' ? report : undefined,
    3,
    new.target,
    0x13,
    0x74
  );
}

function build() {
  return vm_0x104db1_628049(
    undefined,
    arguments,
    this,
    typeof build !== 'undefined' ? build : undefined,
    4,
    new.target,
    0x13,
    0x74
  );
}

export default build;
