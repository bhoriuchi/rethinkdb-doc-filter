import chai from 'chai'
import unitTests from './unit/index'
import seed from './seed'
import rethinkdbdash from 'rethinkdbdash'
import r from 'rethinkdb'
import docQuery from '../index'

const dash = rethinkdbdash({ silent: true })

global.chai = chai
global.expect = chai.expect
global.dbName = 'test'
global.dbTable = 'docfilter'
global.docQuery = docQuery

seed(dash, (error) => {
  if (error) {
    console.dir(error)
    process.exit()
  }

  return r.connect({}, (error, connection) => {
    if (error) {
      console.dir(error)
      process.exit()
    }
    // run tests
    describe('Document Filter Tests', () => {
      unitTests(dash, r, connection)
    })
  })
})