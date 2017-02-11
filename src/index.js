import _ from 'lodash'

const OPERATORS = [
  'all',
  'and',
  'eq',
  'exists',
  'gt',
  'gte',
  'in',
  'lt',
  'lte',
  'mod',
  'ne',
  'nin',
  'nor',
  'not',
  'or',
  'regex',
  'size',
]

export default function docFilter (r, selection, query, operatorPrefix = '$') {
  const operation = _.mapValues(_.keyBy(OPERATORS), op => `${operatorPrefix}${op}`)
  const isOp = key => _.includes(_.values(operation), key)
  const firstKey = obj => _.first(_.keys(obj))
  const hasOp = sub => isOp(firstKey(sub))
  const getProp = key => isOp(key) ? null : _.isString(key) ? key : null
  const getOp = key => isOp(key) ? key : null

  const _filter = (record, op, prop, subQuery) => {
    switch (op) {
      case operation.and:
        return _.reduce(subQuery, (accum, cur) => {
          return accum.and(_filter(record, null, null, cur))
        }, r.expr(true))

      case operation.nor:
        return _.reduce(subQuery, (accum, cur) => {
          return accum.and(_filter(record, null, null, cur).eq(false))
        }, r.expr(true))

      case operation.or:
        return _.reduce(subQuery, (accum, cur) => {
          return accum.or(_filter(record, null, null, cur))
        }, r.expr(false))

      default:
        if (!_.isObject(subQuery) || _.isDate(subQuery)) return record.eq(subQuery)
        let subRecord = prop ? record(prop) : record

        return _.reduce(subQuery, (accum, cur, key) => {
          let subOp = getOp(key)
          let subProp = getProp(key)

          switch (subOp) {
            case operation.all:
              return accum.and(
                r.expr(cur).reduce((left, right) => {
                  return left.and(subRecord.contains(right))
                }, r.expr(true))
              )

            case operation.eq:
              return accum.and(subRecord.eq(cur))

            case operation.exists:
              if (!_.isBoolean(cur)) return r.error('exists not boolean')
              return accum.and(
                cur ? record.default({}).hasFields(prop) : record.default({}).hasFields(prop).not()
              )

            case operation.gt:
              return accum.and(subRecord.gt(cur))

            case operation.gte:
              return accum.and(subRecord.ge(cur))

            case operation.in:
              return accum.and(r.expr(cur).contains(subRecord))

            case operation.lt:
              return accum.and(subRecord.lt(cur))

            case operation.lte:
              return accum.and(subRecord.le(cur))

            case operation.mod:
              let [ divisor, remainder ] = cur
              remainder = _.isNumber(remainder)
                ? Math.floor(remainder)
                : 0
              return _.isNumber(divisor)
                ? accum.and(record.mod(Math.floor(divisor)).eq(remainder))
                : r.error('bad query: BadValue malformed mod, not enough elements')

            case operation.ne:
              return accum.and(subRecord.ne(cur))

            case operation.nin:
              return accum.and(r.expr(cur).contains(subRecord).not())

            case operation.not:
              return accum.and(_filter(record, op, prop, cur).not())

            case operation.regex:
              return accum.and(subRecord.match(cur))

            case operation.size:
              return _.isNumber(cur)
                ? accum.and(subRecord.count().eq(Math.floor(cur)))
                : r.error('size must be number')

            default:
              if (hasOp(cur)) return accum.and(_filter(subRecord, subOp, subProp, cur))
              if (subProp) return accum.and(_filter(subRecord(subProp), subOp, subProp, cur))
              return subRecord.eq(cur)
          }
        }, r.expr(true))
    }
  }

  return selection.filter((record) => {
    return _.reduce(query, (accum, subQuery, key) => {
      return accum.and(_filter(record, getOp(key), getProp(key), subQuery))
    }, r.expr(true))
  })
}