import { uuid } from '../utils.mjs'
import { OPTIONS } from '../symbols.mjs'

export const NOW = new Date().toISOString()

/**
 * An instance of a single model which represents an instance
 * of a Fixture, which in turn represents a record in the
 * database.
 */
class Model {
  /**
   * @param {ZeroOptions} options - Configuration for Factory Zero.
   * @param {Table} table - Table instance defined for this Model.
   * @param {object} data - Data object to bind to this instance.
   */
  constructor (options, table, data) {
    Object.assign(this, data)

    this.#configure(table)

    this[OPTIONS] = {
      ...options,
      table
    }
  }

  created_at = NOW

  updated_at = NOW

  #configure ({ pk, serial }) {
    switch (pk.type) {
    case 'uuid':
      this[pk.col] = uuid()
      break
    case 'serial':
      this[pk.col] = serial++
      break
    default:
      throw new Error('Invalid primary key column type')
    }
  }
}

export default Model
