'use strict'

const yamlParser = require('js-yaml')

const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
]

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/
const commentMatcherOpening = /^<!--/
const commentMatcherClosing = /-->/
const yamlSpecialChars = `["'{|>~&*`

const propertyDirective = name => value => ({ [name]: value })

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    const divider = Number.parseInt(value, 10)
    return divider > 0 ? { headingDivider: divider } : {}
  },

  style: propertyDirective('style'),

  theme(value, marpit) {
    return marpit.themeSet.has(value) ? { theme: value } : {}
  },

  lang: propertyDirective('lang'),
})

const locals = Object.assign(Object.create(null), {
  backgroundColor: propertyDirective('backgroundColor'),
  backgroundImage: propertyDirective('backgroundImage'),
  backgroundPosition: propertyDirective('backgroundPosition'),
  backgroundRepeat: propertyDirective('backgroundRepeat'),
  backgroundSize: propertyDirective('backgroundSize'),
  class: propertyDirective('class'),
  color: propertyDirective('color'),
  footer: propertyDirective('footer'),
  header: propertyDirective('header'),
  paginate: value => ({ paginate: value === 'true' }),
})

const directiveNames = [...Object.keys(globals), ...Object.keys(locals)]

function createPatterns(names) {
  return names.flatMap(name => [`_?${name}`, `"_?${name}"`, `'_?${name}'`])
}

function parse(source) {
  if (typeof source !== 'string') return [String(source)]

  try {
    const value = yamlParser.load(source, { schema: yamlParser.FAILSAFE_SCHEMA })
    return value !== null && typeof value === 'object' ? value : false
  } catch {
    return false
  }
}

function convertLoose(source, parsed) {
  const patterns = createPatterns(directiveNames)
  const matcher = new RegExp(`^(${patterns.join('|')})\\s*:\\s*(.*)$`, 'i')

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(matcher)
    if (match) parsed[match[1].replace(/^['"]|['"]$/g, '')] = match[2]
  }

  return parsed
}

function yaml(source, marpit) {
  const parsed = parse(source)
  if (!parsed || Array.isArray(parsed)) return false

  const converted = {}
  for (const [rawName, value] of Object.entries(parsed)) {
    const local = rawName.startsWith('_')
    const name = local ? rawName.slice(1) : rawName
    const converter = (local ? locals : globals)[name]
    if (converter) Object.assign(converted, converter(value, marpit))
  }

  return converted
}

function markAsParsed(token, parsed = true) {
  token.meta = { ...token.meta, marpitCommentParsed: parsed }
}

function isMagicComment(content) {
  return magicCommentMatchers.some(matcher => matcher.test(content.trim()))
}

function pushCommentToken(state, content) {
  const token = state.push('marpit_comment', '', 0)
  token.content = content
  token.hidden = true
  markAsParsed(token, false)
  return token
}

function blockComment(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine]
  if (!commentMatcherOpening.test(state.src.slice(start))) return false

  let finishLine = startLine
  let finish = state.eMarks[startLine]
  while (!commentMatcherClosing.test(state.src.slice(start, finish)) && finishLine + 1 < endLine) {
    finishLine++
    finish = state.eMarks[finishLine]
  }

  const match = state.src.slice(start, finish).match(commentMatcher)
  if (!match || isMagicComment(match[1])) return false
  if (silent) return true

  pushCommentToken(state, match[1])
  state.line = finishLine + 1
  return true
}

function inlineComment(state, silent) {
  const source = state.src.slice(state.pos, state.posMax)
  if (!commentMatcherOpening.test(source)) return false

  const match = source.match(commentMatcher)
  if (!match || match.index !== 0 || isMagicComment(match[1])) return false
  if (silent) return true

  pushCommentToken(state, match[1])
  state.pos += match[0].length
  return true
}

function comment(markdown) {
  markdown.block.ruler.before('html_block', 'marpit_comment', blockComment)
  markdown.inline.ruler.before('html_inline', 'marpit_inline_comment', inlineComment)
}

Object.defineProperty(exports, '__esModule', { value: true })
Object.defineProperties(exports, {
  comment: { enumerable: true, get: () => comment },
  default: { enumerable: true, get: () => comment },
  markAsParsed: { enumerable: true, get: () => markAsParsed },
})
