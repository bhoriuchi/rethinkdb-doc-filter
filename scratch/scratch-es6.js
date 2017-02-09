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

let search2 = {
  $or: [
    { name: 'Cat' },
    { name: 'Pig' }
  ]
}

let search3 = {
  $and: [
    { owner: { $eq: 'you' } },
    { name: { $not: { $eq: 'Cat' } } }
  ]
}

let search4 = {
  $where (rec) {
    return rec('owner').eq('you')
  }
}

docFilter(r, table, search3).run().then(console.log, console.error)