# rethinkdb-doc-filter
MongoDB document queries in RethinkDB

---

Creates a rethinkdb filter using MongoDB document queries

### Operators

`$and`, `$or`, `$nor`, `$eq`, `$ne`, `$regex`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$not`, `$exists`, `$mod`, `$all`, `$size`

### Example (ES6)

```js
import rethinkdbdash from 'rethinkdbdash'
import docFilter from '../src/index'

let r = rethinkdbdash()
let table = r.db('test').table('Animals')

let search = {
  $and: [
    { owner: { $eq: 'you' } },
    { name: 'Cat' }
  ]
}

docFilter(r, table, search)
  .run()
  .then(console.log, console.error)
```

### Notes

* `$regex` - uses RE2 syntax