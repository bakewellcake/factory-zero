# Factory Zero

A [factory_bot](https://github.com/thoughtbot/factory_bot_rails) inspired fixtures seeding utility with seamless associations.

**Currently in early development. Not recommended for production (yet!).**
**Node 14 or higher required.**

## Intro

This is a seeding utility that uses [Knex](https://github.com/knex/knex) for the insert queries to keep this package lightweight but also usable by all major RDBMS. You don't necessarily have to maintain your own Knex instance for this to run if you use something like [Sequelize](https://github.com/sequelize/sequelize) - just provide a connection object instead, as you would with Knex.

### Installing

```
npm i factory-zero
```

## Usage

Setting up fixtures with this utility is reasonably straight forward although there are some important formatting details that need to be considered when creating your fixture files.

Running Zero can be as simple as:

```javascript
import { seed } from 'factory-zero'

seed({
  client: 'pg',
  connection: '...'
}, {
  directory: './fixtures'
})
```

This will insert all the fixtures found in the given directory into your database, automagically resolving all of the associations you define in your fixtures.

### Fixtures

The formatting of fixtures is important, but easy to follow. Each fixture *file* must export or contain a single object with each child representing a single row of a database. The fixture file itself and the name you save to disk with represents the table of a database. Each fixture row must be named, as per standard JSON, as this enables association resolution. Objects and arrays as column values are allowed, such as for `jsonb` columns, since they are simply stringified before being inserted.

Column keys that you use need to match the names of the columns you have defined in your database. Technically speaking, however, you can put anything in these fixtures that don't exist on your database, as they will be automagically filtered out via `information_schema`.

By default, fixture files must be a file type of one of the following:

- `mjs`
- `js`
- `json`

It's highly recommended to use `mjs` as this will enable utilisation of more functionality than the others. Using `json` has a limitation that you will have to define your model options within the fixture itself as well as losing the power of JavaScript should you want to create dynamic fixtures of any kind.

When `mjs` is used, per model configuration can be defined as an individual export named `model` with the fixture data as the `default` export. You can see examples of this format [here](/tests/fixtures) or you can see below.

> /tests/fixtures/posts.mjs
```javascript
export const model = {
  name: 'Post'
}

export default {
  first_post: {
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lacinia mauris eget quam fringilla aliquet.',
    user_id: '@users.john'
  },
  second_post: {
    body: 'Suspendisse vestibulum arcu non ipsum egestas, non vestibulum ipsum vehicula',
    user_id: '@users.john'
  }
}
```

When `json` is used, or any other file type that doesn't allow JavaScript exports, you must configure your model via a `_model` property as shown below. The property key you have to use here is configurable.

> /tests/fixtures/posts.json
```json
{
  "_model": {
    "name": "Post"
  },
  "first_post": {
    "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lacinia mauris eget quam fringilla aliquet.",
    "user_id": "@users.john"
  },
  "second_post": {
    "body": "Suspendisse vestibulum arcu non ipsum egestas, non vestibulum ipsum vehicula",
    "user_id": "@users.john"
  }
}
```

### Associations

Setting up associations is a breeze with Zero. As you might have noticed in the examples above, `user_id` has a value of `@users.john` - what gives? Well, since all of these fixtures are named by key and namespaced by table name, we can reference them!

All column values that begin with `@` are treated as references that are resolved just before insertion. References resolve to that model's configured primary key, so when I set the value of `user_id` to `@users.john`, that will later be inserted as the primary key column field value of `john` defined in the fixture file `users`.

Primary keys on models are auto generated as UUIDs so the values that are referenced don't need to be manually typed in an `id` for example.

## Documentation

The default export is the `Zero` class, but there is a named export called `seed` that instantiates the Zero for you while accepting the same arguments. For most standard configurations, `seed` will suffice, unless you're interested in the other methods that Zero provides.

[Documentation](/DOCS.md) generated by [jsdoc2md/jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).