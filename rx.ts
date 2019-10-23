/**
 * Sanitize function, removes special regex characters from a string.
 * -> Creates a literal part of a RegExp
 * So you can do this without worrying about special chars:
 * new RegExp(sanitize(anyString))
 */
function sanitizeRegex(value: string) {
  return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

/**
 * A template tag for ES2015 tagged template literals
 */
interface TemplateTag<T = string> {
  (string: TemplateStringsArray, ...values: any[]): T
}

/**
 * A regular expression literal
 */
class RxLiteral {
  public constructor(private value: string) {}

  public toString() {
    return this.value
  }
}

/**
 * Factory function for a template tag which creates regular expressions
 *
 * @param flags Flags to use in the regular expression
 */
function rx(flags: string): TemplateTag<RegExp>

/**
 * A template tag for creating regular expressions; embedded values will be escaped
 *
 * @param strings String partials of the regular expression
 * @param values  Values to escape
 */
function rx(strings: TemplateStringsArray, ...values: any[]): RegExp
function rx(...args: any[]) {
  function handlePlaceholder(placeholder: any): string {
    if (placeholder instanceof RegExp) {
      return placeholder.source
    } else if (placeholder instanceof RxLiteral) {
      return String(placeholder)
    } else if (Array.isArray(placeholder)) {
      return placeholder.map(handlePlaceholder).join('|')
    } else {
      return sanitizeRegex(placeholder)
    }
  }

  function replacer(
    flags: string,
    strings: TemplateStringsArray,
    ...values: any[]
  ) {
    return new RegExp(
      strings.slice(1).reduce((carry, string, index) => {
        return carry.concat(handlePlaceholder(values[index]), string)
      }, strings[0]),
      flags
    )
  }

  // If the first argument is an array, use this function as template tag
  if (Array.isArray(args[0])) {
    return replacer('', ...(args as Parameters<TemplateTag>))
  }

  // Otherwise, use it as template tag factory
  return replacer.bind(undefined, args[0])
}

/**
 * Create an RxLiteral from a string
 *
 * @param value
 */
function createRxLiteral(value: string): RxLiteral

/**
 * Create an RxLiteral from a template literal
 *
 * @param strings
 * @param values
 */
function createRxLiteral(
  strings: TemplateStringsArray,
  ...values: any[]
): RxLiteral
function createRxLiteral(...args: any[]) {
  if (Array.isArray(args[0])) {
    const strings = (args[0] as unknown) as TemplateStringsArray
    const values = args.slice(1)
    return new RxLiteral(
      strings
        .slice(1)
        .reduce(
          (carry, string, index) => carry.concat(values[index], string),
          strings[0]
        )
    )
  } else {
    return new RxLiteral(args[0])
  }
}
rx.raw = createRxLiteral

export default rx
