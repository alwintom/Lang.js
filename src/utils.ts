import { FlattenObject } from "./types";

export function inferLocale() {
  if (document && document.documentElement) {
    return document.documentElement.lang
  }
}

export function convertNumber(str: string) {
  if (str === '-Inf') {
    return -Infinity
  } else if (str === '+Inf' || str === 'Inf' || str === '*') {
    return Infinity
  }
  return parseInt(str, 10)
}

export function applyReplacements(message: string, replacements: object) {
  const keys = Object.keys(replacements).sort((a, b) => b.length - a.length)

  keys.forEach((replace) => {
    message = message.replace(new RegExp(':' + replace, 'gi'), (key) => {
      const value = replacements[replace]

      // Capitalize all characters.
      const allCaps = key === key.toUpperCase()
      if (allCaps) {
        return value.toUpperCase()
      }

      // Capitalize first letter.
      const firstCap = key === key.replace(/\w/i, (letter) => {
        return letter.toUpperCase()
      })

      if (firstCap) {
        return value.charAt(0).toUpperCase() + value.slice(1)
      }

      return value
    })
  })

  return message
}

const intervalRegexp = /^({\s*(\-?\d+(\.\d+)?[\s*,\s*\-?\d+(\.\d+)?]*)\s*})|([\[\]])\s*(-Inf|\*|\-?\d+(\.\d+)?)\s*,\s*(\+?Inf|\*|\-?\d+(\.\d+)?)\s*([\[\]])$/

export function testInterval(count: number, interval: string) : boolean {
  /**
   * From the Symfony\Component\Translation\Interval Docs
   *
   * Tests if a given number belongs to a given math interval.
   *
   * An interval can represent a finite set of numbers:
   *
   *  {1,2,3,4}
   *
   * An interval can represent numbers between two numbers:
   *
   *  [1, +Inf]
   *  ]-1,2[
   *
   * The left delimiter can be [ (inclusive) or ] (exclusive).
   * The right delimiter can be [ (exclusive) or ] (inclusive).
   * Beside numbers, you can use -Inf and +Inf for the infinite.
   */

  interval = interval.trim()

  let matches = interval.match(intervalRegexp)
  if (!matches) {
    throw new Error(`Invalid interval: ${interval}`)
  }

  if (matches[2]) {
    const items = matches[2].split(',')
    for (let i = 0; i < items.length; i++) {
      if (parseInt(items[i], 10) === count) {
        return true
      }
    }
  } else {
    // Remove falsy values.
    matches = matches.filter((match) => {
      return !!match
    })

    const leftDelimiter = matches[1]
    let leftNumber = convertNumber(matches[2])

    if (leftNumber === Infinity) {
      leftNumber = -Infinity
    }

    const rightNumber = convertNumber(matches[3])
    const rightDelimiter = matches[4]

    return (leftDelimiter === '[' ? count >= leftNumber : count > leftNumber)
      && (rightDelimiter === ']' ? count <= rightNumber : count < rightNumber)
  }

  return false
}

/**
 * Returns the plural position to use for the given locale and number.
 *
 * The plural rules are derived from code of the Zend Framework (2010-09-25),
 * which is subject to the new BSD license (http://framework.zend.com/license/new-bsd).
 * Copyright (c) 2005-2010 Zend Technologies USA Inc. (http://www.zend.com)
 */
export function getPluralForm (count: number, locale: string) : number {
  switch (locale) {
    case 'az':
    case 'bo':
    case 'dz':
    case 'id':
    case 'ja':
    case 'jv':
    case 'ka':
    case 'km':
    case 'kn':
    case 'ko':
    case 'ms':
    case 'th':
    case 'tr':
    case 'vi':
    case 'zh':
      return 0

    case 'af':
    case 'bn':
    case 'bg':
    case 'ca':
    case 'da':
    case 'de':
    case 'el':
    case 'en':
    case 'eo':
    case 'es':
    case 'et':
    case 'eu':
    case 'fa':
    case 'fi':
    case 'fo':
    case 'fur':
    case 'fy':
    case 'gl':
    case 'gu':
    case 'ha':
    case 'he':
    case 'hu':
    case 'is':
    case 'it':
    case 'ku':
    case 'lb':
    case 'ml':
    case 'mn':
    case 'mr':
    case 'nah':
    case 'nb':
    case 'ne':
    case 'nl':
    case 'nn':
    case 'no':
    case 'om':
    case 'or':
    case 'pa':
    case 'pap':
    case 'ps':
    case 'pt':
    case 'so':
    case 'sq':
    case 'sv':
    case 'sw':
    case 'ta':
    case 'te':
    case 'tk':
    case 'ur':
    case 'zu':
      return (count == 1)
        ? 0
        : 1

    case 'am':
    case 'bh':
    case 'fil':
    case 'fr':
    case 'gun':
    case 'hi':
    case 'hy':
    case 'ln':
    case 'mg':
    case 'nso':
    case 'xbr':
    case 'ti':
    case 'wa':
      return ((count === 0) || (count === 1))
        ? 0
        : 1

    case 'be':
    case 'bs':
    case 'hr':
    case 'ru':
    case 'sr':
    case 'uk':
      return ((count % 10 == 1) && (count % 100 != 11))
        ? 0
        : (((count % 10 >= 2) && (count % 10 <= 4) && ((count % 100 < 10) || (count % 100 >= 20)))
          ? 1
          : 2)

    case 'cs':
    case 'sk':
      return (count == 1)
        ? 0
        : (((count >= 2) && (count <= 4))
          ? 1
          : 2)

    case 'ga':
      return (count == 1)
        ? 0
        : ((count == 2)
          ? 1
          : 2)

    case 'lt':
      return ((count % 10 == 1) && (count % 100 != 11))
        ? 0
        : (((count % 10 >= 2) && ((count % 100 < 10) || (count % 100 >= 20)))
          ? 1
          : 2)

    case 'sl':
      return (count % 100 == 1)
        ? 0
        : ((count % 100 == 2)
          ? 1
          : (((count % 100 == 3) || (count % 100 == 4))
            ? 2
            : 3))

    case 'mk':
      return (count % 10 == 1)
        ? 0
        : 1

    case 'mt':
      return (count == 1)
        ? 0
        : (((count === 0) || ((count % 100 > 1) && (count % 100 < 11)))
          ? 1
          : (((count % 100 > 10) && (count % 100 < 20))
            ? 2
            : 3))

    case 'lv':
      return (count === 0)
        ? 0
        : (((count % 10 == 1) && (count % 100 != 11))
          ? 1
          : 2)

    case 'pl':
      return (count == 1)
        ? 0
        : (((count % 10 >= 2) && (count % 10 <= 4) && ((count % 100 < 12) || (count % 100 > 14)))
          ? 1
          : 2)

    case 'cy':
      return (count == 1)
        ? 0
        : ((count == 2)
          ? 1
          : (((count == 8) || (count == 11))
            ? 2
            : 3))

    case 'ro':
      return (count == 1)
        ? 0
        : (((count === 0) || ((count % 100 > 0) && (count % 100 < 20)))
          ? 1
          : 2)

    case 'ar':
      return (count === 0)
        ? 0
        : ((count == 1)
          ? 1
          : ((count == 2)
            ? 2
            : (((count % 100 >= 3) && (count % 100 <= 10))
              ? 3
              : (((count % 100 >= 11) && (count % 100 <= 99))
                ? 4
                : 5))))

    default:
      return 0
  }
}

export function flat(obj: object, path?: string) : FlattenObject {
  return Object.keys(obj).reduce((flatten, key) => {
    const value = obj[key]
    const flattenPath = path ? `${path}.${key}` : key

    if (typeof value === 'string') {
      flatten[flattenPath] = obj[key]
      return flatten
    }

    return {
      ...flatten,
      ...flat(value, flattenPath)
    }
  }, {})
}