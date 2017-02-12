export default function eq (dash, r, connection) {
  let dtable = dash.db(dbName).table(dbTable)
  let rtable = r.db(dbName).table(dbTable)

  const q1 = {
    name: 'Dog'
  }

  describe('Test eq', () => {
    it('Should return a result (rethinkdbdash)', done => {
      docQuery(dash, dtable, q1)
        .run()
        .then(result => {
          console.log(result)
          return done()
        }, done)
    })
  })
}

