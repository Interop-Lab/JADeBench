'use strict'

const yaml = require('js-yaml')

const commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/
const commentMatcherOpening = /^<!--/
const commentMatcherClosing = /-->/

const magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/,
]

const directiveNames = [
  'headingDivider',
  'style',
  'theme',
  'lang',
  'backgroundColor',
  'backgroundImage',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'class',
  'color',
  'footer',
  'header',
  'paginate',
]

function createPatterns(names) {
  const patterns = new Set()

  for (const name of names) {
    const escaped = `_?${name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')}`
    patterns.add(escaped)
    patterns.add(`"${escaped}"`)
    patterns.add(`'${escaped}'`)
  }

  return [...patterns]
}

// In loose mode, quote unquoted directive values. This allows values that
// contain YAML punctuation to be treated as strings by the failsafe schema.
function convertLoose(source, names) {
  const key = `(?:${createPatterns(names).join('|')})`
  const linePattern = new RegExp(`^(\\s*${key}\\s*:\\s*)(.*)$`)
  let converted = ''

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(linePattern, (whole, prefix, value) => {
      const trimmed = value.trim()
      if (trimmed.length === 0 || '-?[]{}'.includes(trimmed[0])) return whole

      const leadingLength = value.length - value.trimStart().length
      const leading = value.slice(0, leadingLength)
      return `${prefix}${leading}"${trimmed.split('"').join('\\"')}"`
    }) + '\n'
  }

  return converted.trim()
}

function parseYaml(source) {
  try {
    const parsed = yaml.load(source, { schema: yaml.FAILSAFE_SCHEMA })
    if (parsed === null || typeof parsed !== 'object') return false
    return parsed
  } catch {
    return false
  }
}

function parse(source, loose) {
  const input = loose
    ? convertLoose(source, directiveNames.concat(Array.isArray(loose) ? loose : []))
    : source
  return parseYaml(input)
}

function markAsParsed(token, value) {
  token.meta = token.meta || {}
  token.meta.marpitCommentParsed = value
}

function populateMetadata(token, content, md) {
  const loose = !!md.marpit.options.looseYAML
  const directives = parse(content, loose)

  token.meta = token.meta || {}
  token.meta.marpitParsedDirectives = directives === false ? {} : directives

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(content.trim())) {
      markAsParsed(token, 'well-known-magic-comment')
      break
    }
  }
}

function installCommentRules(md) {
  const blockRule = (state, startLine, endLine, silent) => {
    let start = state.bMarks[startLine] + state.tShift[startLine]
    if (state.src.charCodeAt(start) !== 0x3c) return false

    let markup = state.src.slice(start, state.eMarks[startLine])
    if (!commentMatcherOpening.test(markup)) return false
    if (silent) return true

    let nextLine = startLine + 1
    if (!commentMatcherClosing.test(markup)) {
      while (nextLine < endLine) {
        if (state.sCount && state.sCount[nextLine] < state.blkIndent) break

        start = state.bMarks[nextLine] + state.tShift[nextLine]
        markup = state.src.slice(start, state.eMarks[nextLine])
        nextLine += 1
        if (commentMatcherClosing.test(markup)) break
      }
    }

    state.line = nextLine
    const token = state.push('marpit_comment', '', 0)
    token.map = [startLine, nextLine]
    token.markup = state.getLines(startLine, nextLine, state.blkIndent, true)
    token.hidden = true

    const match = commentMatcher.exec(token.markup)
    token.content = match ? match[1].trim() : ''
    populateMetadata(token, token.content, md)
    return true
  }

  const inlineRule = (state, silent) => {
    const { pos, posMax, src } = state
    if (pos + 4 > posMax || src.charCodeAt(pos) !== 0x3c || src.charCodeAt(pos + 1) !== 0x21) {
      return false
    }

    const match = src.slice(pos).match(commentMatcher)
    if (!match) return false

    if (!silent) {
      const token = state.push('marpit_comment', '', 0)
      token.hidden = true
      token.markup = src.slice(pos, pos + match[0].length)
      token.content = match[1].trim()
      populateMetadata(token, token.content, md)
    }

    state.pos += match[0].length
    return true
  }

  md.block.ruler.before('html_block', 'marpit_comment', blockRule)
  md.inline.ruler.before('html_inline', 'marpit_inline_comment', inlineRule)
}

function comment(md) {
  if (!md || !md.marpit || !md.block || !md.inline) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.')
  }

  installCommentRules(md)
}

module.exports = {
  get comment() {
    return comment
  },
  get default() {
    return comment
  },
  get markAsParsed() {
    return markAsParsed
  },
}
