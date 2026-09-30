'use strict'

/**
 * Insert invisible horizontal-rule tokens before selected headings.
 * Marpit's slide rule subsequently interprets these tokens as slide breaks.
 */
function split(state, headingLevels) {
  if (state.inlineMode || !Array.isArray(headingLevels)) return

  for (let index = 1; index < state.tokens.length; index += 1) {
    const token = state.tokens[index]
    if (token.type !== 'heading_open') continue

    const level = Number(token.tag.slice(1))
    if (!headingLevels.includes(level)) continue

    const divider = new state.Token('hr', '', 0)
    divider.map = token.map
    divider.hidden = true
    state.tokens.splice(index, 0, divider)
    index += 1
  }
}

function _headingDivider(md) {
  const marpit = md.marpit
  if (!marpit) {
    throw new Error('Marpit plugin has detected incompatible markdown-it instance.')
  }

  md.core.ruler.before('marpit_slide', 'marpit_heading_divider', state => {
    const directives = marpit.lastGlobalDirectives
    const configured = directives && 'headingDivider' in directives
      ? directives.headingDivider
      : marpit.options.headingDivider

    if (configured === false || configured == null) return

    const levels = Array.isArray(configured)
      ? configured
      : Number.isInteger(configured) && configured >= 1 && configured <= 6
        ? Array.from({ length: configured }, (_, index) => index + 1)
        : []

    split(state, levels)
  })
}

// The original module applies Marpit's plugin wrapper to this callback. The
// wrapper's observable purpose here is validating the markdown-it instance.
const headingDivider = _headingDivider

Object.defineProperty(exports, '__esModule', { value: true })
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => headingDivider },
  headingDivider: { enumerable: true, get: () => headingDivider },
})
