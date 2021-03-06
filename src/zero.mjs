import defaults from 'lodash/defaults.js'
import knex from 'knex'
import { loadFixtures } from './loader.mjs'
import { getTablesInfo } from './schemaInfo.mjs'
import { toJson, log } from './utils.mjs'
import Resolver from './lib/resolver.mjs'

/**
 * @typedef {object} ZeroOptions - Factory Zero options schema.
 * @property {Array.<string>} extensions - Fixture file extensions to search for.
 * @property {boolean} snaked - Should file names be serialised in snake case?
 * @property {string|object} pk - Default primary key for all models.
 * @property {string} [col] - Primary key column name.
 * @property {string} [type] - Primary key column type.
 * @property {string} directory - Path to fixture files.
 * @property {object} keys - Configurable keys for storing options relating to this program.
 * @property {string} keys.model - Key to use for model options within the fixtures.
 * @property {object} suffixes - Polymorphic column suffixes.
 * @property {string} suffixes.type - Suffix used for the polymorphic type column.
 * @property {string} suffixes.id - Suffix used for the polymorphic id column.
 */

const { assign, keys } = Object

export const DEFAULT_OPTIONS = {
  extensions: ['mjs', 'js', 'json'],
  snaked: true,
  pk: {
    col: 'id',
    type: 'uuid'
  },
  keys: {
    model: '_model'
  },
  suffixes: {
    type: '_type',
    id: '_id'
  }
}

/**
 * Entry class instance for Factory Zero.
 */
export class Zero {
  /**
   * @param {object|Knex} connection - Database connection options for this Knex instance.
   * @param {ZeroOptions} options - Configuration for Factory Zero.
   */
  constructor (connection, options = {}) {
    this.db = this.createKnex(connection)
    this.options = defaults(options, DEFAULT_OPTIONS)

    if (!options.directory) {
      throw new Error('Directory is a required option')
    }
  }

  /**
   * Seeding method that runs all the necessary queries to seed all available fixtures
   * into the configured database.
   *
   * @returns {Promise} - A chained Promise instance of all queries on this instance.
   */
  seed () {
    return this.setup()
      .then(this.clear.bind(this))
      .then(this.fixtures.bind(this))
      .then(this.insert.bind(this))
      .catch(console.error)
      .finally(this.db.destroy.bind(this.db))
  }

  /**
   * Sets up Factory Zero for seeding by loading fixtures and fetching schema
   * information via information_schema.
   *
   * @returns {void}
   */
  async setup () {
    const fixtures = await loadFixtures(this.options)
    const tablesInfo = await getTablesInfo(this.db, fixtures)

    assign(this.options, {
      fixtures,
      tablesInfo
    })
  }

  /**
   * Clears data from all tables found in the fixtures directory.
   *
   * @returns {Promise} - A collection of all DELETE queries.
   */
  clear () {
    const tableNames = keys(this.options.tablesInfo)
    const queries = tableNames.map(tableName => this.db(tableName).del())

    return Promise.all(queries).then(() => log('Tables cleared'))
  }

  /**
   * Insert all fixtures into the configured database with all fixtures
   * found in the fixtures directory.
   *
   * @param {Map.<string,object>} fixtures - All fixtures to insert into the database.
   *
   * @returns {Promise} - A collection of all INSERT queries.
   */
  async insert (fixtures) {
    const queries = Array
      .from(fixtures)
      .map(([path, fixture]) => {
        const tableName = path
          .split('.')
          .shift()
          .slice(1)

        return this
          .db(tableName)
          .insert(toJson(fixture))
      })

    await Promise.all(queries)

    log('Fixtures seeded')

    return fixtures
  }

  /**
   * Fetches all fixtures with all relations resolved via lib/Resolver.
   *
   * @returns {Map.<string,object>} - A collection of all fixtures ready to insert.
   */
  fixtures () {
    return new Resolver(this.options).fixtures()
  }

  /**
   * Creates an individual Knex database instance.
   *
   * @param {object|Knex} kx - Knex connection instance.
   *
   * @returns {Knex} - Knex database instance.
   */
  createKnex (kx) {
    return this.isKnex(kx) ? kx : knex(kx)
  }

  /**
   * Checks if [kx] is an instance of Knex.
   *
   * @param {any} kx - Any value that might be an instance of Knex.
   *
   * @returns {boolean} - Is [kx] an instance of Knex?
   */
  isKnex (kx) {
    return typeof kx === 'function' && kx.name === 'knex' && kx.context
  }
}
