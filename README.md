# rethinkdb-doc-filter
MongoDB query documents in RethinkDB

---

Creates a rethinkdb filter using MongoDB [query document](https://docs.mongodb.com/v3.2/tutorial/query-documents/)

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

### API

##### docfilter (`driver`, `selection`, `query`) => `filter`

* `driver` - rethinkdb driver
* `selection` - rethinkdb selection to filter
* `query` - document query (see [`mongo documentation`](https://docs.mongodb.com/v3.2/tutorial/query-documents/))

### Notes

* `$regex` - uses RE2 syntax