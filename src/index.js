import _ from 'lodash'

function reqlPath (record, path) {
  return _.reduce(_.toPath(path), (accum, cur) => {
    return accum(cur)
  }, record)
}

function buildFilter (r, record, selection, search) {
  // reduce the entire search
  return _.reduce(search, (accum, cur, key) => {
    let rec = reqlPath(record, key)

    // first check for and/or operators and reduce their value
    switch (key) {
      case '$and':
        return _.reduce(cur, (accum, cur) => {
          return accum.and(buildFilter(r, record, selection, cur))
        }, r.expr(true))

      case '$or':
        return _.reduce(cur, (accum, cur) => {
          return accum.or(buildFilter(r, record, selection, cur))
        }, r.expr(false))

      case '$nor':
        return accum.and(_.reduce(cur, (accum, cur) => {
          return accum.and(buildFilter(r, record, selection, cur).eq(false))
        }, r.expr(true)))

      // all other operators can be immediately evaluated
      default:
        let op = _.first(_.keys(cur))
        let val = cur[op]

        switch (op) {
          case '$eq':
            return rec.eq(val)
          case '$ne':
            return rec.ne(val)
          case '$regex':
            return rec.match(val)
          case '$gt':
            return rec.gt(val)
          case '$gte':
            return rec.ge(val)
          case '$lt':
            return rec.lt(val)
          case '$lte':
            return rec.le(val)
          case '$in':
            return r.expr(val).contains(rec)
          case '$nin':
            return r.expr(val).contains(rec).not()
          case '$not':
            return buildFilter(r, record, selection, { [key]: val }).not()
          case '$exists':
            return record.hasFields(_.set({}, key, true))
          case '$mod':
            let [ divisor, remainder ] = val
            remainder = _.isNumber(remainder)
              ? Math.floor(remainder)
              : 0
            return _.isNumber(divisor)
              ? rec.mod(Math.floor(divisor)).eq(remainder)
              : r.error('bad query: BadValue malformed mod, not enough elements')
          case '$all':
            return r.expr(val).reduce((left, right) => {
              return left.and(rec.contains(right))
            }, r.expr(true))
          case '$size':
            return rec.coerceTo('array').count().eq(val)


          // default to record(key) === currentValue
          default:
            return rec.eq(cur)
        }
    }
  }, r.expr(true))
}

export default function Filter (r, selection, search) {
  return selection.filter((record) => {
    return buildFilter(r, record, selection, search)
  })
}