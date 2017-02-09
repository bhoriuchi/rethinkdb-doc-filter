'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash'));

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
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

function reqlPath(record, path) {
  return _.reduce(_.toPath(path), function (accum, cur) {
    return accum(cur);
  }, record);
}

function buildFilter(r, record, selection, search) {
  // reduce the entire search
  return _.reduce(search, function (accum, cur, key) {
    var rec = reqlPath(record, key);

    // first check for and/or operators and reduce their value
    switch (key) {
      case '$and':
        return _.reduce(cur, function (accum, cur) {
          return accum.and(buildFilter(r, record, selection, cur));
        }, r.expr(true));

      case '$or':
        return _.reduce(cur, function (accum, cur) {
          return accum.or(buildFilter(r, record, selection, cur));
        }, r.expr(false));

      case '$nor':
        return accum.and(_.reduce(cur, function (accum, cur) {
          return accum.and(buildFilter(r, record, selection, cur).eq(false));
        }, r.expr(true)));

      // all other operators can be immediately evaluated
      default:
        var op = _.first(_.keys(cur));
        var val = cur[op];

        switch (op) {
          case '$eq':
            return rec.eq(val);
          case '$ne':
            return rec.ne(val);
          case '$regex':
            return rec.match(val);
          case '$gt':
            return rec.gt(val);
          case '$gte':
            return rec.ge(val);
          case '$lt':
            return rec.lt(val);
          case '$lte':
            return rec.le(val);
          case '$in':
            return r.expr(val).contains(rec);
          case '$nin':
            return r.expr(val).contains(rec).not();
          case '$not':
            return buildFilter(r, record, selection, defineProperty({}, key, val)).not();
          case '$exists':
            return record.hasFields(_.set({}, key, true));
          case '$mod':
            var _val = slicedToArray(val, 2),
                divisor = _val[0],
                remainder = _val[1];

            remainder = _.isNumber(remainder) ? Math.floor(remainder) : 0;
            return _.isNumber(divisor) ? rec.mod(Math.floor(divisor)).eq(remainder) : r.error('bad query: BadValue malformed mod, not enough elements');
          case '$all':
            return r.expr(val).reduce(function (left, right) {
              return left.and(rec.contains(right));
            }, r.expr(true));
          case '$size':
            return rec.coerceTo('array').count().eq(val);

          // default to record(key) === currentValue
          default:
            return rec.eq(cur);
        }
    }
  }, r.expr(true));
}

function Filter(r, selection, search) {
  return selection.filter(function (record) {
    return buildFilter(r, record, selection, search);
  });
}

module.exports = Filter;
