const data = [
  {
    name: 'Dog',
    owner: 'John',
    likes: {
      food: ['dog food', 'bones', 'jerkey'],
      activity: 'walks'
    }
  },
  {
    name: 'Cat',
    owner: 'John',
    likes: {
      food: ['milk', 'tuna'],
      activity: 'sleeping'
    }
  },
  {
    name: 'Horse',
    owner: 'Jane',
    likes: {
      food: ['apples', 'hay'],
      activity: 'jumping'
    }
  }
]

export default function seed (r, callback) {
  return r.dbList().contains(dbName).branch(
    r.db(dbName).tableList().contains(dbTable).branch(
      r.db(dbName).tableDrop(dbTable)
        .do(() => {
          r.db(dbName).tableCreate(dbTable)
            .do(() => r.db(dbName).table(dbTable).insert(data))
        }),
      r.db(dbName).tableCreate(dbTable)
        .do(() => r.db(dbName).table(dbTable).insert(data))
    ),
    r.dbCreate(dbName)
      .do(() => {
        r.db(dbName).tableCreate(dbTable)
          .do(() => r.db(dbName).table(dbTable).insert(data))
      })
  )
    .run()
    .then(() => {
      return callback()
    }, callback)
}
