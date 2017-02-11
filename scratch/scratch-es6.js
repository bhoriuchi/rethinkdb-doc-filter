import rethinkdbdash from 'rethinkdbdash'
import docFilter from '../src/index'

let r = rethinkdbdash({ silent: true })

let table = r.db('test').table('doc')

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

let search5 = {
  likes: {
    activity: { $not: { $exists: true, $eq: 'walks' } }
  }
}

docFilter(r, table, search5).run().then(result => {
  console.log(result)
  process.exit()
}, error => {
  console.dir(error)
  process.exit()
})