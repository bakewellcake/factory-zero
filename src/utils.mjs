import isPlainObject from 'lodash/isPlainObject.js'
import isArray from 'lodash/isArray.js'
import debug from 'debug'
import * as uuidLib from 'uuid'
import { OPTIONS } from './symbols.mjs'

const {
  keys,
  entries,
  create,
  fromEntries,
  getPrototypeOf,
  getOwnPropertyDescriptors
} = Object

export const log = debug('zero')

export const uuid = uuidLib.default?.v4 ?? uuidLib.v4

/**
 * Converts a Model instance to a plain object.
 *
 * @param {Model} instance - Instance of a Model.
 *
 * @returns {object} - Plain object of the given Model instance.
 */
export function toJson (instance) {
  const modelMap = keys(instance)
    .filter(key => !!instance[OPTIONS].table.columns[key])
    .map(key => {
      const cell = instance[key]
      const isJson = isPlainObject(cell) || isArray(cell)

      return [key, isJson ? JSON.stringify(cell) : cell]
    })

  return fromEntries(modelMap)
}

/**
 * Clones an object, including getters/setters and class prototypes.
 *
 * @param {object} object - Data object to clone.
 *
 * @returns {object} - Cloned object.
 */
export function clone (object) {
  return create(getPrototypeOf(object), getOwnPropertyDescriptors(object))
}

/**
 * Filters an object via a predicate over the object's keys.
 *
 * @param {object} object - Object data to filter over.
 * @param {Function} predicate - Test function.
 *
 * @returns {object} - Filtered object.
 */
export function filterKeys (object, predicate) {
  const objectClone = clone(object)

  for (const key of keys(object)) {
    if (predicate(key)) continue

    delete objectClone[key]
  }

  return objectClone
}

/**
 * Filters an object via a predicate over the object's values.
 *
 * @param {object} object - Object data to filter over.
 * @param {Function} predicate - Test function.
 *
 * @returns {object} - Filtered object.
 */
export function filterValues (object, predicate) {
  const objectClone = clone(object)

  for (const [key, value] of entries(objectClone)) {
    if (predicate(value)) continue

    delete objectClone[key]
  }

  return objectClone
}
