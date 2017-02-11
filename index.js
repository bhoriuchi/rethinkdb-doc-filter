'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









































var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var OPERATORS = ['all', 'and', 'eq', 'exists', 'gt', 'gte', 'in', 'lt', 'lte', 'mod', 'ne', 'nin', 'nor', 'not', 'or', 'regex', 'size'];

function docFilter(r, selection, query) {
  var operatorPrefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '$';

  var operation = _.mapValues(_.keyBy(OPERATORS), function (op) {
    return '' + operatorPrefix + op;
  });
  var isOp = function isOp(key) {
    return _.includes(_.values(operation), key);
  };
  var firstKey = function firstKey(obj) {
    return _.first(_.keys(obj));
  };
  var hasOp = function hasOp(sub) {
    return isOp(firstKey(sub));
  };
  var getProp = function getProp(key) {
    return isOp(key) ? null : _.isString(key) ? key : null;
  };
  var getOp = function getOp(key) {
    return isOp(key) ? key : null;
  };

  var _filter = function _filter(record, op, prop, subQuery) {
    var _ret = function () {
      switch (op) {
        case operation.and:
          return {
            v: _.reduce(subQuery, function (accum, cur) {
              return accum.and(_filter(record, null, null, cur));
            }, r.expr(true))
          };

        case operation.nor:
          return {
            v: _.reduce(subQuery, function (accum, cur) {
              return accum.and(_filter(record, null, null, cur).eq(false));
            }, r.expr(true))
          };

        case operation.or:
          return {
            v: _.reduce(subQuery, function (accum, cur) {
              return accum.or(_filter(record, null, null, cur));
            }, r.expr(false))
          };

        default:
          if (!_.isObject(subQuery) || _.isDate(subQuery)) return {
              v: record.eq(subQuery)
            };
          var subRecord = prop ? record(prop) : record;

          return {
            v: _.reduce(subQuery, function (accum, cur, key) {
              var subOp = getOp(key);
              var subProp = getProp(key);

              switch (subOp) {
                case operation.all:
                  return accum.and(r.expr(cur).reduce(function (left, right) {
                    return left.and(subRecord.contains(right));
                  }, r.expr(true)));

                case operation.eq:
                  return accum.and(subRecord.eq(cur));

                case operation.exists:
                  if (!_.isBoolean(cur)) return r.error('exists not boolean');
                  return accum.and(cur ? record.default({}).hasFields(prop) : record.default({}).hasFields(prop).not());

                case operation.gt:
                  return accum.and(subRecord.gt(cur));

                case operation.gte:
                  return accum.and(subRecord.ge(cur));

                case operation.in:
                  return accum.and(r.expr(cur).contains(subRecord));

                case operation.lt:
                  return accum.and(subRecord.lt(cur));

                case operation.lte:
                  return accum.and(subRecord.le(cur));

                case operation.mod:
                  var _cur = slicedToArray(cur, 2),
                      divisor = _cur[0],
                      remainder = _cur[1];

                  remainder = _.isNumber(remainder) ? Math.floor(remainder) : 0;
                  return _.isNumber(divisor) ? accum.and(record.mod(Math.floor(divisor)).eq(remainder)) : r.error('bad query: BadValue malformed mod, not enough elements');

                case operation.ne:
                  return accum.and(subRecord.ne(cur));

                case operation.nin:
                  return accum.and(r.expr(cur).contains(subRecord).not());

                case operation.not:
                  return accum.and(_filter(record, op, prop, cur).not());

                case operation.regex:
                  return accum.and(subRecord.match(cur));

                case operation.size:
                  return _.isNumber(cur) ? accum.and(subRecord.count().eq(Math.floor(cur))) : r.error('size must be number');

                default:
                  if (hasOp(cur)) return accum.and(_filter(subRecord, subOp, subProp, cur));
                  if (subProp) return accum.and(_filter(subRecord(subProp), subOp, subProp, cur));
                  return subRecord.eq(cur);
              }
            }, r.expr(true))
          };
      }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  };

  return selection.filter(function (record) {
    return _.reduce(query, function (accum, subQuery, key) {
      return accum.and(_filter(record, getOp(key), getProp(key), subQuery));
    }, r.expr(true));
  });
}

module.exports = docFilter;
