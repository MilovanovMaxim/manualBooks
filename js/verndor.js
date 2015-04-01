//! moment.js
//! version : 2.9.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function (undefined) {
  /************************************
        Constants
    ************************************/
  var moment, VERSION = '2.9.0',
    // the global-scope this is NOT the global object in Node.js
    globalScope = typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window) ? global : this, oldGlobalMoment, round = Math.round, hasOwnProperty = Object.prototype.hasOwnProperty, i, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6,
    // internal storage for locale config files
    locales = {},
    // extra moment internal properties (plugins register props here)
    momentProperties = [],
    // check for nodeJS
    hasModule = typeof module !== 'undefined' && module && module.exports,
    // ASP.NET json date format regex
    aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,
    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,
    // format tokens
    formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
    // parsing token regexes
    parseTokenOneOrTwoDigits = /\d\d?/,
    // 0 - 99
    parseTokenOneToThreeDigits = /\d{1,3}/,
    // 0 - 999
    parseTokenOneToFourDigits = /\d{1,4}/,
    // 0 - 9999
    parseTokenOneToSixDigits = /[+\-]?\d{1,6}/,
    // -999,999 - 999,999
    parseTokenDigits = /\d+/,
    // nonzero number of digits
    parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
    // any word (or two) characters or numbers including two/three word month in arabic.
    parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi,
    // +00:00 -00:00 +0000 -0000 or Z
    parseTokenT = /T/i,
    // T (ISO separator)
    parseTokenOffsetMs = /[\+\-]?\d+/,
    // 1234567890123
    parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/,
    // 123456789 123456789.123
    //strict parsing regexes
    parseTokenOneDigit = /\d/,
    // 0 - 9
    parseTokenTwoDigits = /\d\d/,
    // 00 - 99
    parseTokenThreeDigits = /\d{3}/,
    // 000 - 999
    parseTokenFourDigits = /\d{4}/,
    // 0000 - 9999
    parseTokenSixDigits = /[+-]?\d{6}/,
    // -999,999 - 999,999
    parseTokenSignedNumber = /[+-]?\d+/,
    // -inf - inf
    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = 'YYYY-MM-DDTHH:mm:ssZ', isoDates = [
      [
        'YYYYYY-MM-DD',
        /[+-]\d{6}-\d{2}-\d{2}/
      ],
      [
        'YYYY-MM-DD',
        /\d{4}-\d{2}-\d{2}/
      ],
      [
        'GGGG-[W]WW-E',
        /\d{4}-W\d{2}-\d/
      ],
      [
        'GGGG-[W]WW',
        /\d{4}-W\d{2}/
      ],
      [
        'YYYY-DDD',
        /\d{4}-\d{3}/
      ]
    ],
    // iso time formats and regexes
    isoTimes = [
      [
        'HH:mm:ss.SSSS',
        /(T| )\d\d:\d\d:\d\d\.\d+/
      ],
      [
        'HH:mm:ss',
        /(T| )\d\d:\d\d:\d\d/
      ],
      [
        'HH:mm',
        /(T| )\d\d:\d\d/
      ],
      [
        'HH',
        /(T| )\d\d/
      ]
    ],
    // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']
    parseTimezoneChunker = /([\+\-]|\d\d)/gi,
    // getter and setter names
    proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'), unitMillisecondFactors = {
      'Milliseconds': 1,
      'Seconds': 1000,
      'Minutes': 60000,
      'Hours': 3600000,
      'Days': 86400000,
      'Months': 2592000000,
      'Years': 31536000000
    }, unitAliases = {
      ms: 'millisecond',
      s: 'second',
      m: 'minute',
      h: 'hour',
      d: 'day',
      D: 'date',
      w: 'week',
      W: 'isoWeek',
      M: 'month',
      Q: 'quarter',
      y: 'year',
      DDD: 'dayOfYear',
      e: 'weekday',
      E: 'isoWeekday',
      gg: 'weekYear',
      GG: 'isoWeekYear'
    }, camelFunctions = {
      dayofyear: 'dayOfYear',
      isoweekday: 'isoWeekday',
      isoweek: 'isoWeek',
      weekyear: 'weekYear',
      isoweekyear: 'isoWeekYear'
    },
    // format function strings
    formatFunctions = {},
    // default relative time thresholds
    relativeTimeThresholds = {
      s: 45,
      m: 45,
      h: 22,
      d: 26,
      M: 11
    },
    // tokens to ordinalize and pad
    ordinalizeTokens = 'DDD w W M D d'.split(' '), paddedTokens = 'M D H h m s w W'.split(' '), formatTokenFunctions = {
      M: function () {
        return this.month() + 1;
      },
      MMM: function (format) {
        return this.localeData().monthsShort(this, format);
      },
      MMMM: function (format) {
        return this.localeData().months(this, format);
      },
      D: function () {
        return this.date();
      },
      DDD: function () {
        return this.dayOfYear();
      },
      d: function () {
        return this.day();
      },
      dd: function (format) {
        return this.localeData().weekdaysMin(this, format);
      },
      ddd: function (format) {
        return this.localeData().weekdaysShort(this, format);
      },
      dddd: function (format) {
        return this.localeData().weekdays(this, format);
      },
      w: function () {
        return this.week();
      },
      W: function () {
        return this.isoWeek();
      },
      YY: function () {
        return leftZeroFill(this.year() % 100, 2);
      },
      YYYY: function () {
        return leftZeroFill(this.year(), 4);
      },
      YYYYY: function () {
        return leftZeroFill(this.year(), 5);
      },
      YYYYYY: function () {
        var y = this.year(), sign = y >= 0 ? '+' : '-';
        return sign + leftZeroFill(Math.abs(y), 6);
      },
      gg: function () {
        return leftZeroFill(this.weekYear() % 100, 2);
      },
      gggg: function () {
        return leftZeroFill(this.weekYear(), 4);
      },
      ggggg: function () {
        return leftZeroFill(this.weekYear(), 5);
      },
      GG: function () {
        return leftZeroFill(this.isoWeekYear() % 100, 2);
      },
      GGGG: function () {
        return leftZeroFill(this.isoWeekYear(), 4);
      },
      GGGGG: function () {
        return leftZeroFill(this.isoWeekYear(), 5);
      },
      e: function () {
        return this.weekday();
      },
      E: function () {
        return this.isoWeekday();
      },
      a: function () {
        return this.localeData().meridiem(this.hours(), this.minutes(), true);
      },
      A: function () {
        return this.localeData().meridiem(this.hours(), this.minutes(), false);
      },
      H: function () {
        return this.hours();
      },
      h: function () {
        return this.hours() % 12 || 12;
      },
      m: function () {
        return this.minutes();
      },
      s: function () {
        return this.seconds();
      },
      S: function () {
        return toInt(this.milliseconds() / 100);
      },
      SS: function () {
        return leftZeroFill(toInt(this.milliseconds() / 10), 2);
      },
      SSS: function () {
        return leftZeroFill(this.milliseconds(), 3);
      },
      SSSS: function () {
        return leftZeroFill(this.milliseconds(), 3);
      },
      Z: function () {
        var a = this.utcOffset(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
      },
      ZZ: function () {
        var a = this.utcOffset(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
      },
      z: function () {
        return this.zoneAbbr();
      },
      zz: function () {
        return this.zoneName();
      },
      x: function () {
        return this.valueOf();
      },
      X: function () {
        return this.unix();
      },
      Q: function () {
        return this.quarter();
      }
    }, deprecations = {}, lists = [
      'months',
      'monthsShort',
      'weekdays',
      'weekdaysShort',
      'weekdaysMin'
    ], updateInProgress = false;
  // Pick the first defined of two or three arguments. dfl comes from
  // default.
  function dfl(a, b, c) {
    switch (arguments.length) {
    case 2:
      return a != null ? a : b;
    case 3:
      return a != null ? a : b != null ? b : c;
    default:
      throw new Error('Implement me');
    }
  }
  function hasOwnProp(a, b) {
    return hasOwnProperty.call(a, b);
  }
  function defaultParsingFlags() {
    // We need to deep clone this object, and es5 standard is not very
    // helpful.
    return {
      empty: false,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: false,
      invalidMonth: null,
      invalidFormat: false,
      userInvalidated: false,
      iso: false
    };
  }
  function printMsg(msg) {
    if (moment.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
      console.warn('Deprecation warning: ' + msg);
    }
  }
  function deprecate(msg, fn) {
    var firstTime = true;
    return extend(function () {
      if (firstTime) {
        printMsg(msg);
        firstTime = false;
      }
      return fn.apply(this, arguments);
    }, fn);
  }
  function deprecateSimple(name, msg) {
    if (!deprecations[name]) {
      printMsg(msg);
      deprecations[name] = true;
    }
  }
  function padToken(func, count) {
    return function (a) {
      return leftZeroFill(func.call(this, a), count);
    };
  }
  function ordinalizeToken(func, period) {
    return function (a) {
      return this.localeData().ordinal(func.call(this, a), period);
    };
  }
  function monthDiff(a, b) {
    // difference in months
    var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
      // b is in (anchor - 1 month, anchor + 1 month)
      anchor = a.clone().add(wholeMonthDiff, 'months'), anchor2, adjust;
    if (b - anchor < 0) {
      anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
      // linear across the month
      adjust = (b - anchor) / (anchor - anchor2);
    } else {
      anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
      // linear across the month
      adjust = (b - anchor) / (anchor2 - anchor);
    }
    return -(wholeMonthDiff + adjust);
  }
  while (ordinalizeTokens.length) {
    i = ordinalizeTokens.pop();
    formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
  }
  while (paddedTokens.length) {
    i = paddedTokens.pop();
    formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
  }
  formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
  function meridiemFixWrap(locale, hour, meridiem) {
    var isPm;
    if (meridiem == null) {
      // nothing to do
      return hour;
    }
    if (locale.meridiemHour != null) {
      return locale.meridiemHour(hour, meridiem);
    } else if (locale.isPM != null) {
      // Fallback
      isPm = locale.isPM(meridiem);
      if (isPm && hour < 12) {
        hour += 12;
      }
      if (!isPm && hour === 12) {
        hour = 0;
      }
      return hour;
    } else {
      // thie is not supposed to happen
      return hour;
    }
  }
  /************************************
        Constructors
    ************************************/
  function Locale() {
  }
  // Moment prototype object
  function Moment(config, skipOverflow) {
    if (skipOverflow !== false) {
      checkOverflow(config);
    }
    copyConfig(this, config);
    this._d = new Date(+config._d);
    // Prevent infinite loop in case updateOffset creates new moment
    // objects.
    if (updateInProgress === false) {
      updateInProgress = true;
      moment.updateOffset(this);
      updateInProgress = false;
    }
  }
  // Duration Constructor
  function Duration(duration) {
    var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
    // representation for dateAddRemove
    this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
    // 1000 * 60 * 60
    // Because of dateAddRemove treats 24 hours as different from a
    // day when working around DST, we need to store them separately
    this._days = +days + weeks * 7;
    // It is impossible translate months into days without knowing
    // which months you are are talking about, so we have to store
    // it separately.
    this._months = +months + quarters * 3 + years * 12;
    this._data = {};
    this._locale = moment.localeData();
    this._bubble();
  }
  /************************************
        Helpers
    ************************************/
  function extend(a, b) {
    for (var i in b) {
      if (hasOwnProp(b, i)) {
        a[i] = b[i];
      }
    }
    if (hasOwnProp(b, 'toString')) {
      a.toString = b.toString;
    }
    if (hasOwnProp(b, 'valueOf')) {
      a.valueOf = b.valueOf;
    }
    return a;
  }
  function copyConfig(to, from) {
    var i, prop, val;
    if (typeof from._isAMomentObject !== 'undefined') {
      to._isAMomentObject = from._isAMomentObject;
    }
    if (typeof from._i !== 'undefined') {
      to._i = from._i;
    }
    if (typeof from._f !== 'undefined') {
      to._f = from._f;
    }
    if (typeof from._l !== 'undefined') {
      to._l = from._l;
    }
    if (typeof from._strict !== 'undefined') {
      to._strict = from._strict;
    }
    if (typeof from._tzm !== 'undefined') {
      to._tzm = from._tzm;
    }
    if (typeof from._isUTC !== 'undefined') {
      to._isUTC = from._isUTC;
    }
    if (typeof from._offset !== 'undefined') {
      to._offset = from._offset;
    }
    if (typeof from._pf !== 'undefined') {
      to._pf = from._pf;
    }
    if (typeof from._locale !== 'undefined') {
      to._locale = from._locale;
    }
    if (momentProperties.length > 0) {
      for (i in momentProperties) {
        prop = momentProperties[i];
        val = from[prop];
        if (typeof val !== 'undefined') {
          to[prop] = val;
        }
      }
    }
    return to;
  }
  function absRound(number) {
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }
  // left zero fill a number
  // see http://jsperf.com/left-zero-filling for performance comparison
  function leftZeroFill(number, targetLength, forceSign) {
    var output = '' + Math.abs(number), sign = number >= 0;
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return (sign ? forceSign ? '+' : '' : '-') + output;
  }
  function positiveMomentsDifference(base, other) {
    var res = {
        milliseconds: 0,
        months: 0
      };
    res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
    if (base.clone().add(res.months, 'M').isAfter(other)) {
      --res.months;
    }
    res.milliseconds = +other - +base.clone().add(res.months, 'M');
    return res;
  }
  function momentsDifference(base, other) {
    var res;
    other = makeAs(other, base);
    if (base.isBefore(other)) {
      res = positiveMomentsDifference(base, other);
    } else {
      res = positiveMomentsDifference(other, base);
      res.milliseconds = -res.milliseconds;
      res.months = -res.months;
    }
    return res;
  }
  // TODO: remove 'name' arg after deprecation is removed
  function createAdder(direction, name) {
    return function (val, period) {
      var dur, tmp;
      //invert the arguments, but complain about it
      if (period !== null && !isNaN(+period)) {
        deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
        tmp = val;
        val = period;
        period = tmp;
      }
      val = typeof val === 'string' ? +val : val;
      dur = moment.duration(val, period);
      addOrSubtractDurationFromMoment(this, dur, direction);
      return this;
    };
  }
  function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
    var milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
    updateOffset = updateOffset == null ? true : updateOffset;
    if (milliseconds) {
      mom._d.setTime(+mom._d + milliseconds * isAdding);
    }
    if (days) {
      rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
    }
    if (months) {
      rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
    }
    if (updateOffset) {
      moment.updateOffset(mom, days || months);
    }
  }
  // check if is an array
  function isArray(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  }
  function isDate(input) {
    return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
  }
  // compare two arrays, return the number of differences
  function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
    for (i = 0; i < len; i++) {
      if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
        diffs++;
      }
    }
    return diffs + lengthDiff;
  }
  function normalizeUnits(units) {
    if (units) {
      var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
      units = unitAliases[units] || camelFunctions[lowered] || lowered;
    }
    return units;
  }
  function normalizeObjectUnits(inputObject) {
    var normalizedInput = {}, normalizedProp, prop;
    for (prop in inputObject) {
      if (hasOwnProp(inputObject, prop)) {
        normalizedProp = normalizeUnits(prop);
        if (normalizedProp) {
          normalizedInput[normalizedProp] = inputObject[prop];
        }
      }
    }
    return normalizedInput;
  }
  function makeList(field) {
    var count, setter;
    if (field.indexOf('week') === 0) {
      count = 7;
      setter = 'day';
    } else if (field.indexOf('month') === 0) {
      count = 12;
      setter = 'month';
    } else {
      return;
    }
    moment[field] = function (format, index) {
      var i, getter, method = moment._locale[field], results = [];
      if (typeof format === 'number') {
        index = format;
        format = undefined;
      }
      getter = function (i) {
        var m = moment().utc().set(setter, i);
        return method.call(moment._locale, m, format || '');
      };
      if (index != null) {
        return getter(index);
      } else {
        for (i = 0; i < count; i++) {
          results.push(getter(i));
        }
        return results;
      }
    };
  }
  function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion, value = 0;
    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
      if (coercedNumber >= 0) {
        value = Math.floor(coercedNumber);
      } else {
        value = Math.ceil(coercedNumber);
      }
    }
    return value;
  }
  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }
  function weeksInYear(year, dow, doy) {
    return weekOfYear(moment([
      year,
      11,
      31 + dow - doy
    ]), dow, doy).week;
  }
  function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }
  function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  function checkOverflow(m) {
    var overflow;
    if (m._a && m._pf.overflow === -2) {
      overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 24 || m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 || m._a[SECOND] !== 0 || m._a[MILLISECOND] !== 0) ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
      if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
        overflow = DATE;
      }
      m._pf.overflow = overflow;
    }
  }
  function isValid(m) {
    if (m._isValid == null) {
      m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
      if (m._strict) {
        m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0 && m._pf.bigHour === undefined;
      }
    }
    return m._isValid;
  }
  function normalizeLocale(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
  }
  // pick the locale from the array
  // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
  // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
  function chooseLocale(names) {
    var i = 0, j, next, locale, split;
    while (i < names.length) {
      split = normalizeLocale(names[i]).split('-');
      j = split.length;
      next = normalizeLocale(names[i + 1]);
      next = next ? next.split('-') : null;
      while (j > 0) {
        locale = loadLocale(split.slice(0, j).join('-'));
        if (locale) {
          return locale;
        }
        if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
          //the next array item is better than a shallower substring of this one
          break;
        }
        j--;
      }
      i++;
    }
    return null;
  }
  function loadLocale(name) {
    var oldLocale = null;
    if (!locales[name] && hasModule) {
      try {
        oldLocale = moment.locale();
        require('./locale/' + name);
        // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
        moment.locale(oldLocale);
      } catch (e) {
      }
    }
    return locales[name];
  }
  // Return a moment from input, that is local/utc/utcOffset equivalent to
  // model.
  function makeAs(input, model) {
    var res, diff;
    if (model._isUTC) {
      res = model.clone();
      diff = (moment.isMoment(input) || isDate(input) ? +input : +moment(input)) - +res;
      // Use low-level api, because this fn is low-level api.
      res._d.setTime(+res._d + diff);
      moment.updateOffset(res, false);
      return res;
    } else {
      return moment(input).local();
    }
  }
  /************************************
        Locale
    ************************************/
  extend(Locale.prototype, {
    set: function (config) {
      var prop, i;
      for (i in config) {
        prop = config[i];
        if (typeof prop === 'function') {
          this[i] = prop;
        } else {
          this['_' + i] = prop;
        }
      }
      // Lenient ordinal parsing accepts just a number in addition to
      // number + (possibly) stuff coming from _ordinalParseLenient.
      this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
    },
    _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    months: function (m) {
      return this._months[m.month()];
    },
    _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
    monthsShort: function (m) {
      return this._monthsShort[m.month()];
    },
    monthsParse: function (monthName, format, strict) {
      var i, mom, regex;
      if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
      }
      for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = moment.utc([
          2000,
          i
        ]);
        if (strict && !this._longMonthsParse[i]) {
          this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
          this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
        }
        if (!strict && !this._monthsParse[i]) {
          regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
          this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
          return i;
        } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
          return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    },
    _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdays: function (m) {
      return this._weekdays[m.day()];
    },
    _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysShort: function (m) {
      return this._weekdaysShort[m.day()];
    },
    _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    weekdaysMin: function (m) {
      return this._weekdaysMin[m.day()];
    },
    weekdaysParse: function (weekdayName) {
      var i, mom, regex;
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
      }
      for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        if (!this._weekdaysParse[i]) {
          mom = moment([
            2000,
            1
          ]).day(i);
          regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
          this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    },
    _longDateFormat: {
      LTS: 'h:mm:ss A',
      LT: 'h:mm A',
      L: 'MM/DD/YYYY',
      LL: 'MMMM D, YYYY',
      LLL: 'MMMM D, YYYY LT',
      LLLL: 'dddd, MMMM D, YYYY LT'
    },
    longDateFormat: function (key) {
      var output = this._longDateFormat[key];
      if (!output && this._longDateFormat[key.toUpperCase()]) {
        output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
          return val.slice(1);
        });
        this._longDateFormat[key] = output;
      }
      return output;
    },
    isPM: function (input) {
      // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
      // Using charAt should be more compatible.
      return (input + '').toLowerCase().charAt(0) === 'p';
    },
    _meridiemParse: /[ap]\.?m?\.?/i,
    meridiem: function (hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm' : 'PM';
      } else {
        return isLower ? 'am' : 'AM';
      }
    },
    _calendar: {
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      nextWeek: 'dddd [at] LT',
      lastDay: '[Yesterday at] LT',
      lastWeek: '[Last] dddd [at] LT',
      sameElse: 'L'
    },
    calendar: function (key, mom, now) {
      var output = this._calendar[key];
      return typeof output === 'function' ? output.apply(mom, [now]) : output;
    },
    _relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'a few seconds',
      m: 'a minute',
      mm: '%d minutes',
      h: 'an hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years'
    },
    relativeTime: function (number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    },
    pastFuture: function (diff, output) {
      var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
      return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    },
    ordinal: function (number) {
      return this._ordinal.replace('%d', number);
    },
    _ordinal: '%d',
    _ordinalParse: /\d{1,2}/,
    preparse: function (string) {
      return string;
    },
    postformat: function (string) {
      return string;
    },
    week: function (mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    },
    _week: {
      dow: 0,
      doy: 6
    },
    firstDayOfWeek: function () {
      return this._week.dow;
    },
    firstDayOfYear: function () {
      return this._week.doy;
    },
    _invalidDate: 'Invalid date',
    invalidDate: function () {
      return this._invalidDate;
    }
  });
  /************************************
        Formatting
    ************************************/
  function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
      return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
  }
  function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;
    for (i = 0, length = array.length; i < length; i++) {
      if (formatTokenFunctions[array[i]]) {
        array[i] = formatTokenFunctions[array[i]];
      } else {
        array[i] = removeFormattingTokens(array[i]);
      }
    }
    return function (mom) {
      var output = '';
      for (i = 0; i < length; i++) {
        output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
      }
      return output;
    };
  }
  // format date using native date object
  function formatMoment(m, format) {
    if (!m.isValid()) {
      return m.localeData().invalidDate();
    }
    format = expandFormat(format, m.localeData());
    if (!formatFunctions[format]) {
      formatFunctions[format] = makeFormatFunction(format);
    }
    return formatFunctions[format](m);
  }
  function expandFormat(format, locale) {
    var i = 5;
    function replaceLongDateFormatTokens(input) {
      return locale.longDateFormat(input) || input;
    }
    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
      format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
      localFormattingTokens.lastIndex = 0;
      i -= 1;
    }
    return format;
  }
  /************************************
        Parsing
    ************************************/
  // get the regex to find the next token
  function getParseRegexForToken(token, config) {
    var a, strict = config._strict;
    switch (token) {
    case 'Q':
      return parseTokenOneDigit;
    case 'DDDD':
      return parseTokenThreeDigits;
    case 'YYYY':
    case 'GGGG':
    case 'gggg':
      return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
    case 'Y':
    case 'G':
    case 'g':
      return parseTokenSignedNumber;
    case 'YYYYYY':
    case 'YYYYY':
    case 'GGGGG':
    case 'ggggg':
      return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
    case 'S':
      if (strict) {
        return parseTokenOneDigit;
      }
    /* falls through */
    case 'SS':
      if (strict) {
        return parseTokenTwoDigits;
      }
    /* falls through */
    case 'SSS':
      if (strict) {
        return parseTokenThreeDigits;
      }
    /* falls through */
    case 'DDD':
      return parseTokenOneToThreeDigits;
    case 'MMM':
    case 'MMMM':
    case 'dd':
    case 'ddd':
    case 'dddd':
      return parseTokenWord;
    case 'a':
    case 'A':
      return config._locale._meridiemParse;
    case 'x':
      return parseTokenOffsetMs;
    case 'X':
      return parseTokenTimestampMs;
    case 'Z':
    case 'ZZ':
      return parseTokenTimezone;
    case 'T':
      return parseTokenT;
    case 'SSSS':
      return parseTokenDigits;
    case 'MM':
    case 'DD':
    case 'YY':
    case 'GG':
    case 'gg':
    case 'HH':
    case 'hh':
    case 'mm':
    case 'ss':
    case 'ww':
    case 'WW':
      return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
    case 'M':
    case 'D':
    case 'd':
    case 'H':
    case 'h':
    case 'm':
    case 's':
    case 'w':
    case 'W':
    case 'e':
    case 'E':
      return parseTokenOneOrTwoDigits;
    case 'Do':
      return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
    default:
      a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
      return a;
    }
  }
  function utcOffsetFromString(string) {
    string = string || '';
    var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + '').match(parseTimezoneChunker) || [
        '-',
        0,
        0
      ], minutes = +(parts[1] * 60) + toInt(parts[2]);
    return parts[0] === '+' ? minutes : -minutes;
  }
  // function to convert string input to date
  function addTimeToArrayFromToken(token, input, config) {
    var a, datePartArray = config._a;
    switch (token) {
    // QUARTER
    case 'Q':
      if (input != null) {
        datePartArray[MONTH] = (toInt(input) - 1) * 3;
      }
      break;
    // MONTH
    case 'M':
    // fall through to MM
    case 'MM':
      if (input != null) {
        datePartArray[MONTH] = toInt(input) - 1;
      }
      break;
    case 'MMM':
    // fall through to MMMM
    case 'MMMM':
      a = config._locale.monthsParse(input, token, config._strict);
      // if we didn't find a month name, mark the date as invalid.
      if (a != null) {
        datePartArray[MONTH] = a;
      } else {
        config._pf.invalidMonth = input;
      }
      break;
    // DAY OF MONTH
    case 'D':
    // fall through to DD
    case 'DD':
      if (input != null) {
        datePartArray[DATE] = toInt(input);
      }
      break;
    case 'Do':
      if (input != null) {
        datePartArray[DATE] = toInt(parseInt(input.match(/\d{1,2}/)[0], 10));
      }
      break;
    // DAY OF YEAR
    case 'DDD':
    // fall through to DDDD
    case 'DDDD':
      if (input != null) {
        config._dayOfYear = toInt(input);
      }
      break;
    // YEAR
    case 'YY':
      datePartArray[YEAR] = moment.parseTwoDigitYear(input);
      break;
    case 'YYYY':
    case 'YYYYY':
    case 'YYYYYY':
      datePartArray[YEAR] = toInt(input);
      break;
    // AM / PM
    case 'a':
    // fall through to A
    case 'A':
      config._meridiem = input;
      // config._isPm = config._locale.isPM(input);
      break;
    // HOUR
    case 'h':
    // fall through to hh
    case 'hh':
      config._pf.bigHour = true;
    /* falls through */
    case 'H':
    // fall through to HH
    case 'HH':
      datePartArray[HOUR] = toInt(input);
      break;
    // MINUTE
    case 'm':
    // fall through to mm
    case 'mm':
      datePartArray[MINUTE] = toInt(input);
      break;
    // SECOND
    case 's':
    // fall through to ss
    case 'ss':
      datePartArray[SECOND] = toInt(input);
      break;
    // MILLISECOND
    case 'S':
    case 'SS':
    case 'SSS':
    case 'SSSS':
      datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
      break;
    // UNIX OFFSET (MILLISECONDS)
    case 'x':
      config._d = new Date(toInt(input));
      break;
    // UNIX TIMESTAMP WITH MS
    case 'X':
      config._d = new Date(parseFloat(input) * 1000);
      break;
    // TIMEZONE
    case 'Z':
    // fall through to ZZ
    case 'ZZ':
      config._useUTC = true;
      config._tzm = utcOffsetFromString(input);
      break;
    // WEEKDAY - human
    case 'dd':
    case 'ddd':
    case 'dddd':
      a = config._locale.weekdaysParse(input);
      // if we didn't get a weekday name, mark the date as invalid
      if (a != null) {
        config._w = config._w || {};
        config._w['d'] = a;
      } else {
        config._pf.invalidWeekday = input;
      }
      break;
    // WEEK, WEEK DAY - numeric
    case 'w':
    case 'ww':
    case 'W':
    case 'WW':
    case 'd':
    case 'e':
    case 'E':
      token = token.substr(0, 1);
    /* falls through */
    case 'gggg':
    case 'GGGG':
    case 'GGGGG':
      token = token.substr(0, 2);
      if (input) {
        config._w = config._w || {};
        config._w[token] = toInt(input);
      }
      break;
    case 'gg':
    case 'GG':
      config._w = config._w || {};
      config._w[token] = moment.parseTwoDigitYear(input);
    }
  }
  function dayOfYearFromWeekInfo(config) {
    var w, weekYear, week, weekday, dow, doy, temp;
    w = config._w;
    if (w.GG != null || w.W != null || w.E != null) {
      dow = 1;
      doy = 4;
      // TODO: We need to take the current isoWeekYear, but that depends on
      // how we interpret now (local, utc, fixed offset). So create
      // a now version of current config (take local/utc/offset flags, and
      // create now).
      weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
      week = dfl(w.W, 1);
      weekday = dfl(w.E, 1);
    } else {
      dow = config._locale._week.dow;
      doy = config._locale._week.doy;
      weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
      week = dfl(w.w, 1);
      if (w.d != null) {
        // weekday -- low day numbers are considered next week
        weekday = w.d;
        if (weekday < dow) {
          ++week;
        }
      } else if (w.e != null) {
        // local weekday -- counting starts from begining of week
        weekday = w.e + dow;
      } else {
        // default to begining of week
        weekday = dow;
      }
    }
    temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
    config._a[YEAR] = temp.year;
    config._dayOfYear = temp.dayOfYear;
  }
  // convert an array to a date.
  // the array should mirror the parameters below
  // note: all values past the year are optional and will default to the lowest possible value.
  // [year, month, day , hour, minute, second, millisecond]
  function dateFromConfig(config) {
    var i, date, input = [], currentDate, yearToUse;
    if (config._d) {
      return;
    }
    currentDate = currentDateArray(config);
    //compute day of the year from weeks and weekdays
    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
      dayOfYearFromWeekInfo(config);
    }
    //if the day of the year is set, figure out what it is
    if (config._dayOfYear) {
      yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);
      if (config._dayOfYear > daysInYear(yearToUse)) {
        config._pf._overflowDayOfYear = true;
      }
      date = makeUTCDate(yearToUse, 0, config._dayOfYear);
      config._a[MONTH] = date.getUTCMonth();
      config._a[DATE] = date.getUTCDate();
    }
    // Default to current date.
    // * if no year, month, day of month are given, default to today
    // * if day of month is given, default month and year
    // * if month is given, default only year
    // * if year is given, don't default anything
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
      config._a[i] = input[i] = currentDate[i];
    }
    // Zero out whatever was not defaulted, including time
    for (; i < 7; i++) {
      config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
    }
    // Check for 24:00:00.000
    if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
      config._nextDay = true;
      config._a[HOUR] = 0;
    }
    config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
    // Apply timezone offset from input. The actual utcOffset can be changed
    // with parseZone.
    if (config._tzm != null) {
      config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
    }
    if (config._nextDay) {
      config._a[HOUR] = 24;
    }
  }
  function dateFromObject(config) {
    var normalizedInput;
    if (config._d) {
      return;
    }
    normalizedInput = normalizeObjectUnits(config._i);
    config._a = [
      normalizedInput.year,
      normalizedInput.month,
      normalizedInput.day || normalizedInput.date,
      normalizedInput.hour,
      normalizedInput.minute,
      normalizedInput.second,
      normalizedInput.millisecond
    ];
    dateFromConfig(config);
  }
  function currentDateArray(config) {
    var now = new Date();
    if (config._useUTC) {
      return [
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ];
    } else {
      return [
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ];
    }
  }
  // date from string and format string
  function makeDateFromStringAndFormat(config) {
    if (config._f === moment.ISO_8601) {
      parseISO(config);
      return;
    }
    config._a = [];
    config._pf.empty = true;
    // This array is used to make a Date, either with `new Date` or `Date.UTC`
    var string = '' + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
    tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
      if (parsedInput) {
        skipped = string.substr(0, string.indexOf(parsedInput));
        if (skipped.length > 0) {
          config._pf.unusedInput.push(skipped);
        }
        string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
        totalParsedInputLength += parsedInput.length;
      }
      // don't parse if it's not a known token
      if (formatTokenFunctions[token]) {
        if (parsedInput) {
          config._pf.empty = false;
        } else {
          config._pf.unusedTokens.push(token);
        }
        addTimeToArrayFromToken(token, parsedInput, config);
      } else if (config._strict && !parsedInput) {
        config._pf.unusedTokens.push(token);
      }
    }
    // add remaining unparsed input length to the string
    config._pf.charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
      config._pf.unusedInput.push(string);
    }
    // clear _12h flag if hour is <= 12
    if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
      config._pf.bigHour = undefined;
    }
    // handle meridiem
    config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
    dateFromConfig(config);
    checkOverflow(config);
  }
  function unescapeFormat(s) {
    return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
      return p1 || p2 || p3 || p4;
    });
  }
  // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  // date from string and array of format strings
  function makeDateFromStringAndArray(config) {
    var tempConfig, bestMoment, scoreToBeat, i, currentScore;
    if (config._f.length === 0) {
      config._pf.invalidFormat = true;
      config._d = new Date(NaN);
      return;
    }
    for (i = 0; i < config._f.length; i++) {
      currentScore = 0;
      tempConfig = copyConfig({}, config);
      if (config._useUTC != null) {
        tempConfig._useUTC = config._useUTC;
      }
      tempConfig._pf = defaultParsingFlags();
      tempConfig._f = config._f[i];
      makeDateFromStringAndFormat(tempConfig);
      if (!isValid(tempConfig)) {
        continue;
      }
      // if there is any input that was not parsed add a penalty for that format
      currentScore += tempConfig._pf.charsLeftOver;
      //or tokens
      currentScore += tempConfig._pf.unusedTokens.length * 10;
      tempConfig._pf.score = currentScore;
      if (scoreToBeat == null || currentScore < scoreToBeat) {
        scoreToBeat = currentScore;
        bestMoment = tempConfig;
      }
    }
    extend(config, bestMoment || tempConfig);
  }
  // date from iso format
  function parseISO(config) {
    var i, l, string = config._i, match = isoRegex.exec(string);
    if (match) {
      config._pf.iso = true;
      for (i = 0, l = isoDates.length; i < l; i++) {
        if (isoDates[i][1].exec(string)) {
          // match[5] should be 'T' or undefined
          config._f = isoDates[i][0] + (match[6] || ' ');
          break;
        }
      }
      for (i = 0, l = isoTimes.length; i < l; i++) {
        if (isoTimes[i][1].exec(string)) {
          config._f += isoTimes[i][0];
          break;
        }
      }
      if (string.match(parseTokenTimezone)) {
        config._f += 'Z';
      }
      makeDateFromStringAndFormat(config);
    } else {
      config._isValid = false;
    }
  }
  // date from iso format or fallback
  function makeDateFromString(config) {
    parseISO(config);
    if (config._isValid === false) {
      delete config._isValid;
      moment.createFromInputFallback(config);
    }
  }
  function map(arr, fn) {
    var res = [], i;
    for (i = 0; i < arr.length; ++i) {
      res.push(fn(arr[i], i));
    }
    return res;
  }
  function makeDateFromInput(config) {
    var input = config._i, matched;
    if (input === undefined) {
      config._d = new Date();
    } else if (isDate(input)) {
      config._d = new Date(+input);
    } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
      config._d = new Date(+matched[1]);
    } else if (typeof input === 'string') {
      makeDateFromString(config);
    } else if (isArray(input)) {
      config._a = map(input.slice(0), function (obj) {
        return parseInt(obj, 10);
      });
      dateFromConfig(config);
    } else if (typeof input === 'object') {
      dateFromObject(config);
    } else if (typeof input === 'number') {
      // from milliseconds
      config._d = new Date(input);
    } else {
      moment.createFromInputFallback(config);
    }
  }
  function makeDate(y, m, d, h, M, s, ms) {
    //can't just apply() to create a date:
    //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
    var date = new Date(y, m, d, h, M, s, ms);
    //the date constructor doesn't accept years < 1970
    if (y < 1970) {
      date.setFullYear(y);
    }
    return date;
  }
  function makeUTCDate(y) {
    var date = new Date(Date.UTC.apply(null, arguments));
    if (y < 1970) {
      date.setUTCFullYear(y);
    }
    return date;
  }
  function parseWeekday(input, locale) {
    if (typeof input === 'string') {
      if (!isNaN(input)) {
        input = parseInt(input, 10);
      } else {
        input = locale.weekdaysParse(input);
        if (typeof input !== 'number') {
          return null;
        }
      }
    }
    return input;
  }
  /************************************
        Relative Time
    ************************************/
  // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
  function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
  }
  function relativeTime(posNegDuration, withoutSuffix, locale) {
    var duration = moment.duration(posNegDuration).abs(), seconds = round(duration.as('s')), minutes = round(duration.as('m')), hours = round(duration.as('h')), days = round(duration.as('d')), months = round(duration.as('M')), years = round(duration.as('y')), args = seconds < relativeTimeThresholds.s && [
        's',
        seconds
      ] || minutes === 1 && ['m'] || minutes < relativeTimeThresholds.m && [
        'mm',
        minutes
      ] || hours === 1 && ['h'] || hours < relativeTimeThresholds.h && [
        'hh',
        hours
      ] || days === 1 && ['d'] || days < relativeTimeThresholds.d && [
        'dd',
        days
      ] || months === 1 && ['M'] || months < relativeTimeThresholds.M && [
        'MM',
        months
      ] || years === 1 && ['y'] || [
        'yy',
        years
      ];
    args[2] = withoutSuffix;
    args[3] = +posNegDuration > 0;
    args[4] = locale;
    return substituteTimeAgo.apply({}, args);
  }
  /************************************
        Week of Year
    ************************************/
  // firstDayOfWeek       0 = sun, 6 = sat
  //                      the day of the week that starts the week
  //                      (usually sunday or monday)
  // firstDayOfWeekOfYear 0 = sun, 6 = sat
  //                      the first week is the week that contains the first
  //                      of this day of the week
  //                      (eg. ISO weeks use thursday (4))
  function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
    var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
    if (daysToDayOfWeek > end) {
      daysToDayOfWeek -= 7;
    }
    if (daysToDayOfWeek < end - 7) {
      daysToDayOfWeek += 7;
    }
    adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
    return {
      week: Math.ceil(adjustedMoment.dayOfYear() / 7),
      year: adjustedMoment.year()
    };
  }
  //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
  function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
    var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;
    d = d === 0 ? 7 : d;
    weekday = weekday != null ? weekday : firstDayOfWeek;
    daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
    dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
    return {
      year: dayOfYear > 0 ? year : year - 1,
      dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
    };
  }
  /************************************
        Top Level Functions
    ************************************/
  function makeMoment(config) {
    var input = config._i, format = config._f, res;
    config._locale = config._locale || moment.localeData(config._l);
    if (input === null || format === undefined && input === '') {
      return moment.invalid({ nullInput: true });
    }
    if (typeof input === 'string') {
      config._i = input = config._locale.preparse(input);
    }
    if (moment.isMoment(input)) {
      return new Moment(input, true);
    } else if (format) {
      if (isArray(format)) {
        makeDateFromStringAndArray(config);
      } else {
        makeDateFromStringAndFormat(config);
      }
    } else {
      makeDateFromInput(config);
    }
    res = new Moment(config);
    if (res._nextDay) {
      // Adding is smart enough around DST
      res.add(1, 'd');
      res._nextDay = undefined;
    }
    return res;
  }
  moment = function (input, format, locale, strict) {
    var c;
    if (typeof locale === 'boolean') {
      strict = locale;
      locale = undefined;
    }
    // object construction must be done this way.
    // https://github.com/moment/moment/issues/1423
    c = {};
    c._isAMomentObject = true;
    c._i = input;
    c._f = format;
    c._l = locale;
    c._strict = strict;
    c._isUTC = false;
    c._pf = defaultParsingFlags();
    return makeMoment(c);
  };
  moment.suppressDeprecationWarnings = false;
  moment.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function (config) {
    config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
  });
  // Pick a moment m from moments so that m[fn](other) is true for all
  // other. This relies on the function fn to be transitive.
  //
  // moments should either be an array of moment objects or an array, whose
  // first element is an array of moment objects.
  function pickBy(fn, moments) {
    var res, i;
    if (moments.length === 1 && isArray(moments[0])) {
      moments = moments[0];
    }
    if (!moments.length) {
      return moment();
    }
    res = moments[0];
    for (i = 1; i < moments.length; ++i) {
      if (moments[i][fn](res)) {
        res = moments[i];
      }
    }
    return res;
  }
  moment.min = function () {
    var args = [].slice.call(arguments, 0);
    return pickBy('isBefore', args);
  };
  moment.max = function () {
    var args = [].slice.call(arguments, 0);
    return pickBy('isAfter', args);
  };
  // creating with utc
  moment.utc = function (input, format, locale, strict) {
    var c;
    if (typeof locale === 'boolean') {
      strict = locale;
      locale = undefined;
    }
    // object construction must be done this way.
    // https://github.com/moment/moment/issues/1423
    c = {};
    c._isAMomentObject = true;
    c._useUTC = true;
    c._isUTC = true;
    c._l = locale;
    c._i = input;
    c._f = format;
    c._strict = strict;
    c._pf = defaultParsingFlags();
    return makeMoment(c).utc();
  };
  // creating with unix timestamp (in seconds)
  moment.unix = function (input) {
    return moment(input * 1000);
  };
  // duration
  moment.duration = function (input, key) {
    var duration = input,
      // matching against regexp is expensive, do it on demand
      match = null, sign, ret, parseIso, diffRes;
    if (moment.isDuration(input)) {
      duration = {
        ms: input._milliseconds,
        d: input._days,
        M: input._months
      };
    } else if (typeof input === 'number') {
      duration = {};
      if (key) {
        duration[key] = input;
      } else {
        duration.milliseconds = input;
      }
    } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
      sign = match[1] === '-' ? -1 : 1;
      duration = {
        y: 0,
        d: toInt(match[DATE]) * sign,
        h: toInt(match[HOUR]) * sign,
        m: toInt(match[MINUTE]) * sign,
        s: toInt(match[SECOND]) * sign,
        ms: toInt(match[MILLISECOND]) * sign
      };
    } else if (!!(match = isoDurationRegex.exec(input))) {
      sign = match[1] === '-' ? -1 : 1;
      parseIso = function (inp) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
      };
      duration = {
        y: parseIso(match[2]),
        M: parseIso(match[3]),
        d: parseIso(match[4]),
        h: parseIso(match[5]),
        m: parseIso(match[6]),
        s: parseIso(match[7]),
        w: parseIso(match[8])
      };
    } else if (duration == null) {
      // checks for null or undefined
      duration = {};
    } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
      diffRes = momentsDifference(moment(duration.from), moment(duration.to));
      duration = {};
      duration.ms = diffRes.milliseconds;
      duration.M = diffRes.months;
    }
    ret = new Duration(duration);
    if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
      ret._locale = input._locale;
    }
    return ret;
  };
  // version number
  moment.version = VERSION;
  // default format
  moment.defaultFormat = isoFormat;
  // constant that refers to the ISO standard
  moment.ISO_8601 = function () {
  };
  // Plugins that add properties should also add the key here (null value),
  // so we can properly clone ourselves.
  moment.momentProperties = momentProperties;
  // This function will be called whenever a moment is mutated.
  // It is intended to keep the offset in sync with the timezone.
  moment.updateOffset = function () {
  };
  // This function allows you to set a threshold for relative time strings
  moment.relativeTimeThreshold = function (threshold, limit) {
    if (relativeTimeThresholds[threshold] === undefined) {
      return false;
    }
    if (limit === undefined) {
      return relativeTimeThresholds[threshold];
    }
    relativeTimeThresholds[threshold] = limit;
    return true;
  };
  moment.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', function (key, value) {
    return moment.locale(key, value);
  });
  // This function will load locale and then set the global locale.  If
  // no arguments are passed in, it will simply return the current global
  // locale key.
  moment.locale = function (key, values) {
    var data;
    if (key) {
      if (typeof values !== 'undefined') {
        data = moment.defineLocale(key, values);
      } else {
        data = moment.localeData(key);
      }
      if (data) {
        moment.duration._locale = moment._locale = data;
      }
    }
    return moment._locale._abbr;
  };
  moment.defineLocale = function (name, values) {
    if (values !== null) {
      values.abbr = name;
      if (!locales[name]) {
        locales[name] = new Locale();
      }
      locales[name].set(values);
      // backwards compat for now: also set the locale
      moment.locale(name);
      return locales[name];
    } else {
      // useful for testing
      delete locales[name];
      return null;
    }
  };
  moment.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', function (key) {
    return moment.localeData(key);
  });
  // returns locale data
  moment.localeData = function (key) {
    var locale;
    if (key && key._locale && key._locale._abbr) {
      key = key._locale._abbr;
    }
    if (!key) {
      return moment._locale;
    }
    if (!isArray(key)) {
      //short-circuit everything else
      locale = loadLocale(key);
      if (locale) {
        return locale;
      }
      key = [key];
    }
    return chooseLocale(key);
  };
  // compare moment object
  moment.isMoment = function (obj) {
    return obj instanceof Moment || obj != null && hasOwnProp(obj, '_isAMomentObject');
  };
  // for typechecking Duration objects
  moment.isDuration = function (obj) {
    return obj instanceof Duration;
  };
  for (i = lists.length - 1; i >= 0; --i) {
    makeList(lists[i]);
  }
  moment.normalizeUnits = function (units) {
    return normalizeUnits(units);
  };
  moment.invalid = function (flags) {
    var m = moment.utc(NaN);
    if (flags != null) {
      extend(m._pf, flags);
    } else {
      m._pf.userInvalidated = true;
    }
    return m;
  };
  moment.parseZone = function () {
    return moment.apply(null, arguments).parseZone();
  };
  moment.parseTwoDigitYear = function (input) {
    return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
  };
  moment.isDate = isDate;
  /************************************
        Moment Prototype
    ************************************/
  extend(moment.fn = Moment.prototype, {
    clone: function () {
      return moment(this);
    },
    valueOf: function () {
      return +this._d - (this._offset || 0) * 60000;
    },
    unix: function () {
      return Math.floor(+this / 1000);
    },
    toString: function () {
      return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    },
    toDate: function () {
      return this._offset ? new Date(+this) : this._d;
    },
    toISOString: function () {
      var m = moment(this).utc();
      if (0 < m.year() && m.year() <= 9999) {
        if ('function' === typeof Date.prototype.toISOString) {
          // native implementation is ~50x faster, use it when we can
          return this.toDate().toISOString();
        } else {
          return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
      } else {
        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
      }
    },
    toArray: function () {
      var m = this;
      return [
        m.year(),
        m.month(),
        m.date(),
        m.hours(),
        m.minutes(),
        m.seconds(),
        m.milliseconds()
      ];
    },
    isValid: function () {
      return isValid(this);
    },
    isDSTShifted: function () {
      if (this._a) {
        return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
      }
      return false;
    },
    parsingFlags: function () {
      return extend({}, this._pf);
    },
    invalidAt: function () {
      return this._pf.overflow;
    },
    utc: function (keepLocalTime) {
      return this.utcOffset(0, keepLocalTime);
    },
    local: function (keepLocalTime) {
      if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;
        if (keepLocalTime) {
          this.subtract(this._dateUtcOffset(), 'm');
        }
      }
      return this;
    },
    format: function (inputString) {
      var output = formatMoment(this, inputString || moment.defaultFormat);
      return this.localeData().postformat(output);
    },
    add: createAdder(1, 'add'),
    subtract: createAdder(-1, 'subtract'),
    diff: function (input, units, asFloat) {
      var that = makeAs(input, this), zoneDiff = (that.utcOffset() - this.utcOffset()) * 60000, anchor, diff, output, daysAdjust;
      units = normalizeUnits(units);
      if (units === 'year' || units === 'month' || units === 'quarter') {
        output = monthDiff(this, that);
        if (units === 'quarter') {
          output = output / 3;
        } else if (units === 'year') {
          output = output / 12;
        }
      } else {
        diff = this - that;
        output = units === 'second' ? diff / 1000 : units === 'minute' ? diff / 60000 : units === 'hour' ? diff / 3600000 : units === 'day' ? (diff - zoneDiff) / 86400000 : units === 'week' ? (diff - zoneDiff) / 604800000 : diff;
      }
      return asFloat ? output : absRound(output);
    },
    from: function (time, withoutSuffix) {
      return moment.duration({
        to: this,
        from: time
      }).locale(this.locale()).humanize(!withoutSuffix);
    },
    fromNow: function (withoutSuffix) {
      return this.from(moment(), withoutSuffix);
    },
    calendar: function (time) {
      // We want to compare the start of today, vs this.
      // Getting start-of-today depends on whether we're locat/utc/offset
      // or not.
      var now = time || moment(), sod = makeAs(now, this).startOf('day'), diff = this.diff(sod, 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
      return this.format(this.localeData().calendar(format, this, moment(now)));
    },
    isLeapYear: function () {
      return isLeapYear(this.year());
    },
    isDST: function () {
      return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
    },
    day: function (input) {
      var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
      if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, 'd');
      } else {
        return day;
      }
    },
    month: makeAccessor('Month', true),
    startOf: function (units) {
      units = normalizeUnits(units);
      // the following switch intentionally omits break keywords
      // to utilize falling through the cases.
      switch (units) {
      case 'year':
        this.month(0);
      /* falls through */
      case 'quarter':
      case 'month':
        this.date(1);
      /* falls through */
      case 'week':
      case 'isoWeek':
      case 'day':
        this.hours(0);
      /* falls through */
      case 'hour':
        this.minutes(0);
      /* falls through */
      case 'minute':
        this.seconds(0);
      /* falls through */
      case 'second':
        this.milliseconds(0);  /* falls through */
      }
      // weeks are a special case
      if (units === 'week') {
        this.weekday(0);
      } else if (units === 'isoWeek') {
        this.isoWeekday(1);
      }
      // quarters are also special
      if (units === 'quarter') {
        this.month(Math.floor(this.month() / 3) * 3);
      }
      return this;
    },
    endOf: function (units) {
      units = normalizeUnits(units);
      if (units === undefined || units === 'millisecond') {
        return this;
      }
      return this.startOf(units).add(1, units === 'isoWeek' ? 'week' : units).subtract(1, 'ms');
    },
    isAfter: function (input, units) {
      var inputMs;
      units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
      if (units === 'millisecond') {
        input = moment.isMoment(input) ? input : moment(input);
        return +this > +input;
      } else {
        inputMs = moment.isMoment(input) ? +input : +moment(input);
        return inputMs < +this.clone().startOf(units);
      }
    },
    isBefore: function (input, units) {
      var inputMs;
      units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
      if (units === 'millisecond') {
        input = moment.isMoment(input) ? input : moment(input);
        return +this < +input;
      } else {
        inputMs = moment.isMoment(input) ? +input : +moment(input);
        return +this.clone().endOf(units) < inputMs;
      }
    },
    isBetween: function (from, to, units) {
      return this.isAfter(from, units) && this.isBefore(to, units);
    },
    isSame: function (input, units) {
      var inputMs;
      units = normalizeUnits(units || 'millisecond');
      if (units === 'millisecond') {
        input = moment.isMoment(input) ? input : moment(input);
        return +this === +input;
      } else {
        inputMs = +moment(input);
        return +this.clone().startOf(units) <= inputMs && inputMs <= +this.clone().endOf(units);
      }
    },
    min: deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function (other) {
      other = moment.apply(null, arguments);
      return other < this ? this : other;
    }),
    max: deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function (other) {
      other = moment.apply(null, arguments);
      return other > this ? this : other;
    }),
    zone: deprecate('moment().zone is deprecated, use moment().utcOffset instead. ' + 'https://github.com/moment/moment/issues/1779', function (input, keepLocalTime) {
      if (input != null) {
        if (typeof input !== 'string') {
          input = -input;
        }
        this.utcOffset(input, keepLocalTime);
        return this;
      } else {
        return -this.utcOffset();
      }
    }),
    utcOffset: function (input, keepLocalTime) {
      var offset = this._offset || 0, localAdjust;
      if (input != null) {
        if (typeof input === 'string') {
          input = utcOffsetFromString(input);
        }
        if (Math.abs(input) < 16) {
          input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
          localAdjust = this._dateUtcOffset();
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
          this.add(localAdjust, 'm');
        }
        if (offset !== input) {
          if (!keepLocalTime || this._changeInProgress) {
            addOrSubtractDurationFromMoment(this, moment.duration(input - offset, 'm'), 1, false);
          } else if (!this._changeInProgress) {
            this._changeInProgress = true;
            moment.updateOffset(this, true);
            this._changeInProgress = null;
          }
        }
        return this;
      } else {
        return this._isUTC ? offset : this._dateUtcOffset();
      }
    },
    isLocal: function () {
      return !this._isUTC;
    },
    isUtcOffset: function () {
      return this._isUTC;
    },
    isUtc: function () {
      return this._isUTC && this._offset === 0;
    },
    zoneAbbr: function () {
      return this._isUTC ? 'UTC' : '';
    },
    zoneName: function () {
      return this._isUTC ? 'Coordinated Universal Time' : '';
    },
    parseZone: function () {
      if (this._tzm) {
        this.utcOffset(this._tzm);
      } else if (typeof this._i === 'string') {
        this.utcOffset(utcOffsetFromString(this._i));
      }
      return this;
    },
    hasAlignedHourOffset: function (input) {
      if (!input) {
        input = 0;
      } else {
        input = moment(input).utcOffset();
      }
      return (this.utcOffset() - input) % 60 === 0;
    },
    daysInMonth: function () {
      return daysInMonth(this.year(), this.month());
    },
    dayOfYear: function (input) {
      var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
      return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    },
    quarter: function (input) {
      return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    },
    weekYear: function (input) {
      var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
      return input == null ? year : this.add(input - year, 'y');
    },
    isoWeekYear: function (input) {
      var year = weekOfYear(this, 1, 4).year;
      return input == null ? year : this.add(input - year, 'y');
    },
    week: function (input) {
      var week = this.localeData().week(this);
      return input == null ? week : this.add((input - week) * 7, 'd');
    },
    isoWeek: function (input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add((input - week) * 7, 'd');
    },
    weekday: function (input) {
      var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
      return input == null ? weekday : this.add(input - weekday, 'd');
    },
    isoWeekday: function (input) {
      // behaves the same as moment#day except
      // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
      // as a setter, sunday should belong to the previous week.
      return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    },
    isoWeeksInYear: function () {
      return weeksInYear(this.year(), 1, 4);
    },
    weeksInYear: function () {
      var weekInfo = this.localeData()._week;
      return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units]();
    },
    set: function (units, value) {
      var unit;
      if (typeof units === 'object') {
        for (unit in units) {
          this.set(unit, units[unit]);
        }
      } else {
        units = normalizeUnits(units);
        if (typeof this[units] === 'function') {
          this[units](value);
        }
      }
      return this;
    },
    locale: function (key) {
      var newLocaleData;
      if (key === undefined) {
        return this._locale._abbr;
      } else {
        newLocaleData = moment.localeData(key);
        if (newLocaleData != null) {
          this._locale = newLocaleData;
        }
        return this;
      }
    },
    lang: deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function (key) {
      if (key === undefined) {
        return this.localeData();
      } else {
        return this.locale(key);
      }
    }),
    localeData: function () {
      return this._locale;
    },
    _dateUtcOffset: function () {
      // On Firefox.24 Date#getTimezoneOffset returns a floating point.
      // https://github.com/moment/moment/pull/1871
      return -Math.round(this._d.getTimezoneOffset() / 15) * 15;
    }
  });
  function rawMonthSetter(mom, value) {
    var dayOfMonth;
    // TODO: Move this out of here!
    if (typeof value === 'string') {
      value = mom.localeData().monthsParse(value);
      // TODO: Another silent failure?
      if (typeof value !== 'number') {
        return mom;
      }
    }
    dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
    mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
    return mom;
  }
  function rawGetter(mom, unit) {
    return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
  }
  function rawSetter(mom, unit, value) {
    if (unit === 'Month') {
      return rawMonthSetter(mom, value);
    } else {
      return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }
  }
  function makeAccessor(unit, keepTime) {
    return function (value) {
      if (value != null) {
        rawSetter(this, unit, value);
        moment.updateOffset(this, keepTime);
        return this;
      } else {
        return rawGetter(this, unit);
      }
    };
  }
  moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
  moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
  moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
  // Setting the hour should keep the time, because the user explicitly
  // specified which hour he wants. So trying to maintain the same hour (in
  // a new timezone) makes sense. Adding/subtracting hours does not follow
  // this rule.
  moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
  // moment.fn.month is defined separately
  moment.fn.date = makeAccessor('Date', true);
  moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
  moment.fn.year = makeAccessor('FullYear', true);
  moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));
  // add plural methods
  moment.fn.days = moment.fn.day;
  moment.fn.months = moment.fn.month;
  moment.fn.weeks = moment.fn.week;
  moment.fn.isoWeeks = moment.fn.isoWeek;
  moment.fn.quarters = moment.fn.quarter;
  // add aliased format methods
  moment.fn.toJSON = moment.fn.toISOString;
  // alias isUtc for dev-friendliness
  moment.fn.isUTC = moment.fn.isUtc;
  /************************************
        Duration Prototype
    ************************************/
  function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
  }
  function yearsToDays(years) {
    // years * 365 + absRound(years / 4) -
    //     absRound(years / 100) + absRound(years / 400);
    return years * 146097 / 400;
  }
  extend(moment.duration.fn = Duration.prototype, {
    _bubble: function () {
      var milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data, seconds, minutes, hours, years = 0;
      // The following code bubbles up values, see the tests for
      // examples of what that means.
      data.milliseconds = milliseconds % 1000;
      seconds = absRound(milliseconds / 1000);
      data.seconds = seconds % 60;
      minutes = absRound(seconds / 60);
      data.minutes = minutes % 60;
      hours = absRound(minutes / 60);
      data.hours = hours % 24;
      days += absRound(hours / 24);
      // Accurately convert days to years, assume start from year 0.
      years = absRound(daysToYears(days));
      days -= absRound(yearsToDays(years));
      // 30 days to a month
      // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
      months += absRound(days / 30);
      days %= 30;
      // 12 months -> 1 year
      years += absRound(months / 12);
      months %= 12;
      data.days = days;
      data.months = months;
      data.years = years;
    },
    abs: function () {
      this._milliseconds = Math.abs(this._milliseconds);
      this._days = Math.abs(this._days);
      this._months = Math.abs(this._months);
      this._data.milliseconds = Math.abs(this._data.milliseconds);
      this._data.seconds = Math.abs(this._data.seconds);
      this._data.minutes = Math.abs(this._data.minutes);
      this._data.hours = Math.abs(this._data.hours);
      this._data.months = Math.abs(this._data.months);
      this._data.years = Math.abs(this._data.years);
      return this;
    },
    weeks: function () {
      return absRound(this.days() / 7);
    },
    valueOf: function () {
      return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
    },
    humanize: function (withSuffix) {
      var output = relativeTime(this, !withSuffix, this.localeData());
      if (withSuffix) {
        output = this.localeData().pastFuture(+this, output);
      }
      return this.localeData().postformat(output);
    },
    add: function (input, val) {
      // supports only 2.0-style add(1, 's') or add(moment)
      var dur = moment.duration(input, val);
      this._milliseconds += dur._milliseconds;
      this._days += dur._days;
      this._months += dur._months;
      this._bubble();
      return this;
    },
    subtract: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds -= dur._milliseconds;
      this._days -= dur._days;
      this._months -= dur._months;
      this._bubble();
      return this;
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units.toLowerCase() + 's']();
    },
    as: function (units) {
      var days, months;
      units = normalizeUnits(units);
      if (units === 'month' || units === 'year') {
        days = this._days + this._milliseconds / 86400000;
        months = this._months + daysToYears(days) * 12;
        return units === 'month' ? months : months / 12;
      } else {
        // handle milliseconds separately because of floating point math errors (issue #1867)
        days = this._days + Math.round(yearsToDays(this._months / 12));
        switch (units) {
        case 'week':
          return days / 7 + this._milliseconds / 604800000;
        case 'day':
          return days + this._milliseconds / 86400000;
        case 'hour':
          return days * 24 + this._milliseconds / 3600000;
        case 'minute':
          return days * 24 * 60 + this._milliseconds / 60000;
        case 'second':
          return days * 24 * 60 * 60 + this._milliseconds / 1000;
        // Math.floor prevents floating point math errors here
        case 'millisecond':
          return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
        default:
          throw new Error('Unknown unit ' + units);
        }
      }
    },
    lang: moment.fn.lang,
    locale: moment.fn.locale,
    toIsoString: deprecate('toIsoString() is deprecated. Please use toISOString() instead ' + '(notice the capitals)', function () {
      return this.toISOString();
    }),
    toISOString: function () {
      // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
      var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
      if (!this.asSeconds()) {
        // this is the same as C#'s (Noda) and python (isodate)...
        // but not other JS (goog.date)
        return 'P0D';
      }
      return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '');
    },
    localeData: function () {
      return this._locale;
    },
    toJSON: function () {
      return this.toISOString();
    }
  });
  moment.duration.fn.toString = moment.duration.fn.toISOString;
  function makeDurationGetter(name) {
    moment.duration.fn[name] = function () {
      return this._data[name];
    };
  }
  for (i in unitMillisecondFactors) {
    if (hasOwnProp(unitMillisecondFactors, i)) {
      makeDurationGetter(i.toLowerCase());
    }
  }
  moment.duration.fn.asMilliseconds = function () {
    return this.as('ms');
  };
  moment.duration.fn.asSeconds = function () {
    return this.as('s');
  };
  moment.duration.fn.asMinutes = function () {
    return this.as('m');
  };
  moment.duration.fn.asHours = function () {
    return this.as('h');
  };
  moment.duration.fn.asDays = function () {
    return this.as('d');
  };
  moment.duration.fn.asWeeks = function () {
    return this.as('weeks');
  };
  moment.duration.fn.asMonths = function () {
    return this.as('M');
  };
  moment.duration.fn.asYears = function () {
    return this.as('y');
  };
  /************************************
        Default Locale
    ************************************/
  // Set default locale, other locale will inherit from English.
  moment.locale('en', {
    ordinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal: function (number) {
      var b = number % 10, output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
      return number + output;
    }
  });
  /* EMBED_LOCALES */
  /************************************
        Exposing Moment
    ************************************/
  function makeGlobal(shouldDeprecate) {
    /*global ender:false */
    if (typeof ender !== 'undefined') {
      return;
    }
    oldGlobalMoment = globalScope.moment;
    if (shouldDeprecate) {
      globalScope.moment = deprecate('Accessing Moment through the global scope is ' + 'deprecated, and will be removed in an upcoming ' + 'release.', moment);
    } else {
      globalScope.moment = moment;
    }
  }
  // CommonJS module is defined
  if (hasModule) {
    module.exports = moment;
  } else if (typeof define === 'function' && define.amd) {
    define(function (require, exports, module) {
      if (module.config && module.config() && module.config().noGlobal === true) {
        // release the global variable
        globalScope.moment = oldGlobalMoment;
      }
      return moment;
    });
    makeGlobal(true);
  } else {
    makeGlobal();
  }
}.call(this));
/*! jQuery v2.1.3 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function (a, b) {
  'object' == typeof module && 'object' == typeof module.exports ? module.exports = a.document ? b(a, !0) : function (a) {
    if (!a.document)
      throw new Error('jQuery requires a window with a document');
    return b(a);
  } : b(a);
}('undefined' != typeof window ? window : this, function (a, b) {
  var c = [], d = c.slice, e = c.concat, f = c.push, g = c.indexOf, h = {}, i = h.toString, j = h.hasOwnProperty, k = {}, l = a.document, m = '2.1.3', n = function (a, b) {
      return new n.fn.init(a, b);
    }, o = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, p = /^-ms-/, q = /-([\da-z])/gi, r = function (a, b) {
      return b.toUpperCase();
    };
  n.fn = n.prototype = {
    jquery: m,
    constructor: n,
    selector: '',
    length: 0,
    toArray: function () {
      return d.call(this);
    },
    get: function (a) {
      return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this);
    },
    pushStack: function (a) {
      var b = n.merge(this.constructor(), a);
      return b.prevObject = this, b.context = this.context, b;
    },
    each: function (a, b) {
      return n.each(this, a, b);
    },
    map: function (a) {
      return this.pushStack(n.map(this, function (b, c) {
        return a.call(b, c, b);
      }));
    },
    slice: function () {
      return this.pushStack(d.apply(this, arguments));
    },
    first: function () {
      return this.eq(0);
    },
    last: function () {
      return this.eq(-1);
    },
    eq: function (a) {
      var b = this.length, c = +a + (0 > a ? b : 0);
      return this.pushStack(c >= 0 && b > c ? [this[c]] : []);
    },
    end: function () {
      return this.prevObject || this.constructor(null);
    },
    push: f,
    sort: c.sort,
    splice: c.splice
  }, n.extend = n.fn.extend = function () {
    var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1;
    for ('boolean' == typeof g && (j = g, g = arguments[h] || {}, h++), 'object' == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)
      if (null != (a = arguments[h]))
        for (b in a)
          c = g[b], d = a[b], g !== d && (j && d && (n.isPlainObject(d) || (e = n.isArray(d))) ? (e ? (e = !1, f = c && n.isArray(c) ? c : []) : f = c && n.isPlainObject(c) ? c : {}, g[b] = n.extend(j, f, d)) : void 0 !== d && (g[b] = d));
    return g;
  }, n.extend({
    expando: 'jQuery' + (m + Math.random()).replace(/\D/g, ''),
    isReady: !0,
    error: function (a) {
      throw new Error(a);
    },
    noop: function () {
    },
    isFunction: function (a) {
      return 'function' === n.type(a);
    },
    isArray: Array.isArray,
    isWindow: function (a) {
      return null != a && a === a.window;
    },
    isNumeric: function (a) {
      return !n.isArray(a) && a - parseFloat(a) + 1 >= 0;
    },
    isPlainObject: function (a) {
      return 'object' !== n.type(a) || a.nodeType || n.isWindow(a) ? !1 : a.constructor && !j.call(a.constructor.prototype, 'isPrototypeOf') ? !1 : !0;
    },
    isEmptyObject: function (a) {
      var b;
      for (b in a)
        return !1;
      return !0;
    },
    type: function (a) {
      return null == a ? a + '' : 'object' == typeof a || 'function' == typeof a ? h[i.call(a)] || 'object' : typeof a;
    },
    globalEval: function (a) {
      var b, c = eval;
      a = n.trim(a), a && (1 === a.indexOf('use strict') ? (b = l.createElement('script'), b.text = a, l.head.appendChild(b).parentNode.removeChild(b)) : c(a));
    },
    camelCase: function (a) {
      return a.replace(p, 'ms-').replace(q, r);
    },
    nodeName: function (a, b) {
      return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
    },
    each: function (a, b, c) {
      var d, e = 0, f = a.length, g = s(a);
      if (c) {
        if (g) {
          for (; f > e; e++)
            if (d = b.apply(a[e], c), d === !1)
              break;
        } else
          for (e in a)
            if (d = b.apply(a[e], c), d === !1)
              break;
      } else if (g) {
        for (; f > e; e++)
          if (d = b.call(a[e], e, a[e]), d === !1)
            break;
      } else
        for (e in a)
          if (d = b.call(a[e], e, a[e]), d === !1)
            break;
      return a;
    },
    trim: function (a) {
      return null == a ? '' : (a + '').replace(o, '');
    },
    makeArray: function (a, b) {
      var c = b || [];
      return null != a && (s(Object(a)) ? n.merge(c, 'string' == typeof a ? [a] : a) : f.call(c, a)), c;
    },
    inArray: function (a, b, c) {
      return null == b ? -1 : g.call(b, a, c);
    },
    merge: function (a, b) {
      for (var c = +b.length, d = 0, e = a.length; c > d; d++)
        a[e++] = b[d];
      return a.length = e, a;
    },
    grep: function (a, b, c) {
      for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++)
        d = !b(a[f], f), d !== h && e.push(a[f]);
      return e;
    },
    map: function (a, b, c) {
      var d, f = 0, g = a.length, h = s(a), i = [];
      if (h)
        for (; g > f; f++)
          d = b(a[f], f, c), null != d && i.push(d);
      else
        for (f in a)
          d = b(a[f], f, c), null != d && i.push(d);
      return e.apply([], i);
    },
    guid: 1,
    proxy: function (a, b) {
      var c, e, f;
      return 'string' == typeof b && (c = a[b], b = a, a = c), n.isFunction(a) ? (e = d.call(arguments, 2), f = function () {
        return a.apply(b || this, e.concat(d.call(arguments)));
      }, f.guid = a.guid = a.guid || n.guid++, f) : void 0;
    },
    now: Date.now,
    support: k
  }), n.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (a, b) {
    h['[object ' + b + ']'] = b.toLowerCase();
  });
  function s(a) {
    var b = a.length, c = n.type(a);
    return 'function' === c || n.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : 'array' === c || 0 === b || 'number' == typeof b && b > 0 && b - 1 in a;
  }
  var t = function (a) {
      var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = 'sizzle' + 1 * new Date(), v = a.document, w = 0, x = 0, y = hb(), z = hb(), A = hb(), B = function (a, b) {
          return a === b && (l = !0), 0;
        }, C = 1 << 31, D = {}.hasOwnProperty, E = [], F = E.pop, G = E.push, H = E.push, I = E.slice, J = function (a, b) {
          for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b)
              return c;
          return -1;
        }, K = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped', L = '[\\x20\\t\\r\\n\\f]', M = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+', N = M.replace('w', 'w#'), O = '\\[' + L + '*(' + M + ')(?:' + L + '*([*^$|!~]?=)' + L + '*(?:\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)"|(' + N + '))|)' + L + '*\\]', P = ':(' + M + ')(?:\\(((\'((?:\\\\.|[^\\\\\'])*)\'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|' + O + ')*)|.*)\\)|)', Q = new RegExp(L + '+', 'g'), R = new RegExp('^' + L + '+|((?:^|[^\\\\])(?:\\\\.)*)' + L + '+$', 'g'), S = new RegExp('^' + L + '*,' + L + '*'), T = new RegExp('^' + L + '*([>+~]|' + L + ')' + L + '*'), U = new RegExp('=' + L + '*([^\\]\'"]*?)' + L + '*\\]', 'g'), V = new RegExp(P), W = new RegExp('^' + N + '$'), X = {
          ID: new RegExp('^#(' + M + ')'),
          CLASS: new RegExp('^\\.(' + M + ')'),
          TAG: new RegExp('^(' + M.replace('w', 'w*') + ')'),
          ATTR: new RegExp('^' + O),
          PSEUDO: new RegExp('^' + P),
          CHILD: new RegExp('^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(' + L + '*(even|odd|(([+-]|)(\\d*)n|)' + L + '*(?:([+-]|)' + L + '*(\\d+)|))' + L + '*\\)|)', 'i'),
          bool: new RegExp('^(?:' + K + ')$', 'i'),
          needsContext: new RegExp('^' + L + '*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(' + L + '*((?:-\\d)?\\d*)' + L + '*\\)|)(?=[^-]|$)', 'i')
        }, Y = /^(?:input|select|textarea|button)$/i, Z = /^h\d$/i, $ = /^[^{]+\{\s*\[native \w/, _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, ab = /[+~]/, bb = /'|\\/g, cb = new RegExp('\\\\([\\da-f]{1,6}' + L + '?|(' + L + ')|.)', 'ig'), db = function (a, b, c) {
          var d = '0x' + b - 65536;
          return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320);
        }, eb = function () {
          m();
        };
      try {
        H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType;
      } catch (fb) {
        H = {
          apply: E.length ? function (a, b) {
            G.apply(a, I.call(b));
          } : function (a, b) {
            var c = a.length, d = 0;
            while (a[c++] = b[d++]);
            a.length = c - 1;
          }
        };
      }
      function gb(a, b, d, e) {
        var f, h, j, k, l, o, r, s, w, x;
        if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], k = b.nodeType, 'string' != typeof a || !a || 1 !== k && 9 !== k && 11 !== k)
          return d;
        if (!e && p) {
          if (11 !== k && (f = _.exec(a)))
            if (j = f[1]) {
              if (9 === k) {
                if (h = b.getElementById(j), !h || !h.parentNode)
                  return d;
                if (h.id === j)
                  return d.push(h), d;
              } else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j)
                return d.push(h), d;
            } else {
              if (f[2])
                return H.apply(d, b.getElementsByTagName(a)), d;
              if ((j = f[3]) && c.getElementsByClassName)
                return H.apply(d, b.getElementsByClassName(j)), d;
            }
          if (c.qsa && (!q || !q.test(a))) {
            if (s = r = u, w = b, x = 1 !== k && a, 1 === k && 'object' !== b.nodeName.toLowerCase()) {
              o = g(a), (r = b.getAttribute('id')) ? s = r.replace(bb, '\\$&') : b.setAttribute('id', s), s = '[id=\'' + s + '\'] ', l = o.length;
              while (l--)
                o[l] = s + rb(o[l]);
              w = ab.test(a) && pb(b.parentNode) || b, x = o.join(',');
            }
            if (x)
              try {
                return H.apply(d, w.querySelectorAll(x)), d;
              } catch (y) {
              } finally {
                r || b.removeAttribute('id');
              }
          }
        }
        return i(a.replace(R, '$1'), b, d, e);
      }
      function hb() {
        var a = [];
        function b(c, e) {
          return a.push(c + ' ') > d.cacheLength && delete b[a.shift()], b[c + ' '] = e;
        }
        return b;
      }
      function ib(a) {
        return a[u] = !0, a;
      }
      function jb(a) {
        var b = n.createElement('div');
        try {
          return !!a(b);
        } catch (c) {
          return !1;
        } finally {
          b.parentNode && b.parentNode.removeChild(b), b = null;
        }
      }
      function kb(a, b) {
        var c = a.split('|'), e = a.length;
        while (e--)
          d.attrHandle[c[e]] = b;
      }
      function lb(a, b) {
        var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C);
        if (d)
          return d;
        if (c)
          while (c = c.nextSibling)
            if (c === b)
              return -1;
        return a ? 1 : -1;
      }
      function mb(a) {
        return function (b) {
          var c = b.nodeName.toLowerCase();
          return 'input' === c && b.type === a;
        };
      }
      function nb(a) {
        return function (b) {
          var c = b.nodeName.toLowerCase();
          return ('input' === c || 'button' === c) && b.type === a;
        };
      }
      function ob(a) {
        return ib(function (b) {
          return b = +b, ib(function (c, d) {
            var e, f = a([], c.length, b), g = f.length;
            while (g--)
              c[e = f[g]] && (c[e] = !(d[e] = c[e]));
          });
        });
      }
      function pb(a) {
        return a && 'undefined' != typeof a.getElementsByTagName && a;
      }
      c = gb.support = {}, f = gb.isXML = function (a) {
        var b = a && (a.ownerDocument || a).documentElement;
        return b ? 'HTML' !== b.nodeName : !1;
      }, m = gb.setDocument = function (a) {
        var b, e, g = a ? a.ownerDocument || a : v;
        return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = g.documentElement, e = g.defaultView, e && e !== e.top && (e.addEventListener ? e.addEventListener('unload', eb, !1) : e.attachEvent && e.attachEvent('onunload', eb)), p = !f(g), c.attributes = jb(function (a) {
          return a.className = 'i', !a.getAttribute('className');
        }), c.getElementsByTagName = jb(function (a) {
          return a.appendChild(g.createComment('')), !a.getElementsByTagName('*').length;
        }), c.getElementsByClassName = $.test(g.getElementsByClassName), c.getById = jb(function (a) {
          return o.appendChild(a).id = u, !g.getElementsByName || !g.getElementsByName(u).length;
        }), c.getById ? (d.find.ID = function (a, b) {
          if ('undefined' != typeof b.getElementById && p) {
            var c = b.getElementById(a);
            return c && c.parentNode ? [c] : [];
          }
        }, d.filter.ID = function (a) {
          var b = a.replace(cb, db);
          return function (a) {
            return a.getAttribute('id') === b;
          };
        }) : (delete d.find.ID, d.filter.ID = function (a) {
          var b = a.replace(cb, db);
          return function (a) {
            var c = 'undefined' != typeof a.getAttributeNode && a.getAttributeNode('id');
            return c && c.value === b;
          };
        }), d.find.TAG = c.getElementsByTagName ? function (a, b) {
          return 'undefined' != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0;
        } : function (a, b) {
          var c, d = [], e = 0, f = b.getElementsByTagName(a);
          if ('*' === a) {
            while (c = f[e++])
              1 === c.nodeType && d.push(c);
            return d;
          }
          return f;
        }, d.find.CLASS = c.getElementsByClassName && function (a, b) {
          return p ? b.getElementsByClassName(a) : void 0;
        }, r = [], q = [], (c.qsa = $.test(g.querySelectorAll)) && (jb(function (a) {
          o.appendChild(a).innerHTML = '<a id=\'' + u + '\'></a><select id=\'' + u + '-\f]\' msallowcapture=\'\'><option selected=\'\'></option></select>', a.querySelectorAll('[msallowcapture^=\'\']').length && q.push('[*^$]=' + L + '*(?:\'\'|"")'), a.querySelectorAll('[selected]').length || q.push('\\[' + L + '*(?:value|' + K + ')'), a.querySelectorAll('[id~=' + u + '-]').length || q.push('~='), a.querySelectorAll(':checked').length || q.push(':checked'), a.querySelectorAll('a#' + u + '+*').length || q.push('.#.+[+~]');
        }), jb(function (a) {
          var b = g.createElement('input');
          b.setAttribute('type', 'hidden'), a.appendChild(b).setAttribute('name', 'D'), a.querySelectorAll('[name=d]').length && q.push('name' + L + '*[*^$|!~]?='), a.querySelectorAll(':enabled').length || q.push(':enabled', ':disabled'), a.querySelectorAll('*,:x'), q.push(',.*:');
        })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && jb(function (a) {
          c.disconnectedMatch = s.call(a, 'div'), s.call(a, '[s!=\'\']:x'), r.push('!=', P);
        }), q = q.length && new RegExp(q.join('|')), r = r.length && new RegExp(r.join('|')), b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function (a, b) {
          var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode;
          return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)));
        } : function (a, b) {
          if (b)
            while (b = b.parentNode)
              if (b === a)
                return !0;
          return !1;
        }, B = b ? function (a, b) {
          if (a === b)
            return l = !0, 0;
          var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
          return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === g || a.ownerDocument === v && t(v, a) ? -1 : b === g || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1);
        } : function (a, b) {
          if (a === b)
            return l = !0, 0;
          var c, d = 0, e = a.parentNode, f = b.parentNode, h = [a], i = [b];
          if (!e || !f)
            return a === g ? -1 : b === g ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0;
          if (e === f)
            return lb(a, b);
          c = a;
          while (c = c.parentNode)
            h.unshift(c);
          c = b;
          while (c = c.parentNode)
            i.unshift(c);
          while (h[d] === i[d])
            d++;
          return d ? lb(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0;
        }, g) : n;
      }, gb.matches = function (a, b) {
        return gb(a, null, null, b);
      }, gb.matchesSelector = function (a, b) {
        if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, '=\'$1\']'), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b)))
          try {
            var d = s.call(a, b);
            if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType)
              return d;
          } catch (e) {
          }
        return gb(b, n, null, [a]).length > 0;
      }, gb.contains = function (a, b) {
        return (a.ownerDocument || a) !== n && m(a), t(a, b);
      }, gb.attr = function (a, b) {
        (a.ownerDocument || a) !== n && m(a);
        var e = d.attrHandle[b.toLowerCase()], f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
        return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null;
      }, gb.error = function (a) {
        throw new Error('Syntax error, unrecognized expression: ' + a);
      }, gb.uniqueSort = function (a) {
        var b, d = [], e = 0, f = 0;
        if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
          while (b = a[f++])
            b === a[f] && (e = d.push(f));
          while (e--)
            a.splice(d[e], 1);
        }
        return k = null, a;
      }, e = gb.getText = function (a) {
        var b, c = '', d = 0, f = a.nodeType;
        if (f) {
          if (1 === f || 9 === f || 11 === f) {
            if ('string' == typeof a.textContent)
              return a.textContent;
            for (a = a.firstChild; a; a = a.nextSibling)
              c += e(a);
          } else if (3 === f || 4 === f)
            return a.nodeValue;
        } else
          while (b = a[d++])
            c += e(b);
        return c;
      }, d = gb.selectors = {
        cacheLength: 50,
        createPseudo: ib,
        match: X,
        attrHandle: {},
        find: {},
        relative: {
          '>': {
            dir: 'parentNode',
            first: !0
          },
          ' ': { dir: 'parentNode' },
          '+': {
            dir: 'previousSibling',
            first: !0
          },
          '~': { dir: 'previousSibling' }
        },
        preFilter: {
          ATTR: function (a) {
            return a[1] = a[1].replace(cb, db), a[3] = (a[3] || a[4] || a[5] || '').replace(cb, db), '~=' === a[2] && (a[3] = ' ' + a[3] + ' '), a.slice(0, 4);
          },
          CHILD: function (a) {
            return a[1] = a[1].toLowerCase(), 'nth' === a[1].slice(0, 3) ? (a[3] || gb.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ('even' === a[3] || 'odd' === a[3])), a[5] = +(a[7] + a[8] || 'odd' === a[3])) : a[3] && gb.error(a[0]), a;
          },
          PSEUDO: function (a) {
            var b, c = !a[6] && a[2];
            return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || '' : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(')', c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3));
          }
        },
        filter: {
          TAG: function (a) {
            var b = a.replace(cb, db).toLowerCase();
            return '*' === a ? function () {
              return !0;
            } : function (a) {
              return a.nodeName && a.nodeName.toLowerCase() === b;
            };
          },
          CLASS: function (a) {
            var b = y[a + ' '];
            return b || (b = new RegExp('(^|' + L + ')' + a + '(' + L + '|$)')) && y(a, function (a) {
              return b.test('string' == typeof a.className && a.className || 'undefined' != typeof a.getAttribute && a.getAttribute('class') || '');
            });
          },
          ATTR: function (a, b, c) {
            return function (d) {
              var e = gb.attr(d, a);
              return null == e ? '!=' === b : b ? (e += '', '=' === b ? e === c : '!=' === b ? e !== c : '^=' === b ? c && 0 === e.indexOf(c) : '*=' === b ? c && e.indexOf(c) > -1 : '$=' === b ? c && e.slice(-c.length) === c : '~=' === b ? (' ' + e.replace(Q, ' ') + ' ').indexOf(c) > -1 : '|=' === b ? e === c || e.slice(0, c.length + 1) === c + '-' : !1) : !0;
            };
          },
          CHILD: function (a, b, c, d, e) {
            var f = 'nth' !== a.slice(0, 3), g = 'last' !== a.slice(-4), h = 'of-type' === b;
            return 1 === d && 0 === e ? function (a) {
              return !!a.parentNode;
            } : function (b, c, i) {
              var j, k, l, m, n, o, p = f !== g ? 'nextSibling' : 'previousSibling', q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h;
              if (q) {
                if (f) {
                  while (p) {
                    l = b;
                    while (l = l[p])
                      if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType)
                        return !1;
                    o = p = 'only' === a && !o && 'nextSibling';
                  }
                  return !0;
                }
                if (o = [g ? q.firstChild : q.lastChild], g && s) {
                  k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], l = n && q.childNodes[n];
                  while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                    if (1 === l.nodeType && ++m && l === b) {
                      k[a] = [
                        w,
                        n,
                        m
                      ];
                      break;
                    }
                } else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w)
                  m = j[1];
                else
                  while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                    if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (s && ((l[u] || (l[u] = {}))[a] = [
                        w,
                        m
                      ]), l === b))
                      break;
                return m -= e, m === d || m % d === 0 && m / d >= 0;
              }
            };
          },
          PSEUDO: function (a, b) {
            var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || gb.error('unsupported pseudo: ' + a);
            return e[u] ? e(b) : e.length > 1 ? (c = [
              a,
              a,
              '',
              b
            ], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ib(function (a, c) {
              var d, f = e(a, b), g = f.length;
              while (g--)
                d = J(a, f[g]), a[d] = !(c[d] = f[g]);
            }) : function (a) {
              return e(a, 0, c);
            }) : e;
          }
        },
        pseudos: {
          not: ib(function (a) {
            var b = [], c = [], d = h(a.replace(R, '$1'));
            return d[u] ? ib(function (a, b, c, e) {
              var f, g = d(a, null, e, []), h = a.length;
              while (h--)
                (f = g[h]) && (a[h] = !(b[h] = f));
            }) : function (a, e, f) {
              return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop();
            };
          }),
          has: ib(function (a) {
            return function (b) {
              return gb(a, b).length > 0;
            };
          }),
          contains: ib(function (a) {
            return a = a.replace(cb, db), function (b) {
              return (b.textContent || b.innerText || e(b)).indexOf(a) > -1;
            };
          }),
          lang: ib(function (a) {
            return W.test(a || '') || gb.error('unsupported lang: ' + a), a = a.replace(cb, db).toLowerCase(), function (b) {
              var c;
              do
                if (c = p ? b.lang : b.getAttribute('xml:lang') || b.getAttribute('lang'))
                  return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + '-');
              while ((b = b.parentNode) && 1 === b.nodeType);
              return !1;
            };
          }),
          target: function (b) {
            var c = a.location && a.location.hash;
            return c && c.slice(1) === b.id;
          },
          root: function (a) {
            return a === o;
          },
          focus: function (a) {
            return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex);
          },
          enabled: function (a) {
            return a.disabled === !1;
          },
          disabled: function (a) {
            return a.disabled === !0;
          },
          checked: function (a) {
            var b = a.nodeName.toLowerCase();
            return 'input' === b && !!a.checked || 'option' === b && !!a.selected;
          },
          selected: function (a) {
            return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
          },
          empty: function (a) {
            for (a = a.firstChild; a; a = a.nextSibling)
              if (a.nodeType < 6)
                return !1;
            return !0;
          },
          parent: function (a) {
            return !d.pseudos.empty(a);
          },
          header: function (a) {
            return Z.test(a.nodeName);
          },
          input: function (a) {
            return Y.test(a.nodeName);
          },
          button: function (a) {
            var b = a.nodeName.toLowerCase();
            return 'input' === b && 'button' === a.type || 'button' === b;
          },
          text: function (a) {
            var b;
            return 'input' === a.nodeName.toLowerCase() && 'text' === a.type && (null == (b = a.getAttribute('type')) || 'text' === b.toLowerCase());
          },
          first: ob(function () {
            return [0];
          }),
          last: ob(function (a, b) {
            return [b - 1];
          }),
          eq: ob(function (a, b, c) {
            return [0 > c ? c + b : c];
          }),
          even: ob(function (a, b) {
            for (var c = 0; b > c; c += 2)
              a.push(c);
            return a;
          }),
          odd: ob(function (a, b) {
            for (var c = 1; b > c; c += 2)
              a.push(c);
            return a;
          }),
          lt: ob(function (a, b, c) {
            for (var d = 0 > c ? c + b : c; --d >= 0;)
              a.push(d);
            return a;
          }),
          gt: ob(function (a, b, c) {
            for (var d = 0 > c ? c + b : c; ++d < b;)
              a.push(d);
            return a;
          })
        }
      }, d.pseudos.nth = d.pseudos.eq;
      for (b in {
          radio: !0,
          checkbox: !0,
          file: !0,
          password: !0,
          image: !0
        })
        d.pseudos[b] = mb(b);
      for (b in {
          submit: !0,
          reset: !0
        })
        d.pseudos[b] = nb(b);
      function qb() {
      }
      qb.prototype = d.filters = d.pseudos, d.setFilters = new qb(), g = gb.tokenize = function (a, b) {
        var c, e, f, g, h, i, j, k = z[a + ' '];
        if (k)
          return b ? 0 : k.slice(0);
        h = a, i = [], j = d.preFilter;
        while (h) {
          (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({
            value: c,
            type: e[0].replace(R, ' ')
          }), h = h.slice(c.length));
          for (g in d.filter)
            !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({
              value: c,
              type: g,
              matches: e
            }), h = h.slice(c.length));
          if (!c)
            break;
        }
        return b ? h.length : h ? gb.error(a) : z(a, i).slice(0);
      };
      function rb(a) {
        for (var b = 0, c = a.length, d = ''; c > b; b++)
          d += a[b].value;
        return d;
      }
      function sb(a, b, c) {
        var d = b.dir, e = c && 'parentNode' === d, f = x++;
        return b.first ? function (b, c, f) {
          while (b = b[d])
            if (1 === b.nodeType || e)
              return a(b, c, f);
        } : function (b, c, g) {
          var h, i, j = [
              w,
              f
            ];
          if (g) {
            while (b = b[d])
              if ((1 === b.nodeType || e) && a(b, c, g))
                return !0;
          } else
            while (b = b[d])
              if (1 === b.nodeType || e) {
                if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f)
                  return j[2] = h[2];
                if (i[d] = j, j[2] = a(b, c, g))
                  return !0;
              }
        };
      }
      function tb(a) {
        return a.length > 1 ? function (b, c, d) {
          var e = a.length;
          while (e--)
            if (!a[e](b, c, d))
              return !1;
          return !0;
        } : a[0];
      }
      function ub(a, b, c) {
        for (var d = 0, e = b.length; e > d; d++)
          gb(a, b[d], c);
        return c;
      }
      function vb(a, b, c, d, e) {
        for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)
          (f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));
        return g;
      }
      function wb(a, b, c, d, e, f) {
        return d && !d[u] && (d = wb(d)), e && !e[u] && (e = wb(e, f)), ib(function (f, g, h, i) {
          var j, k, l, m = [], n = [], o = g.length, p = f || ub(b || '*', h.nodeType ? [h] : h, []), q = !a || !f && b ? p : vb(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q;
          if (c && c(q, r, h, i), d) {
            j = vb(r, n), d(j, [], h, i), k = j.length;
            while (k--)
              (l = j[k]) && (r[n[k]] = !(q[n[k]] = l));
          }
          if (f) {
            if (e || a) {
              if (e) {
                j = [], k = r.length;
                while (k--)
                  (l = r[k]) && j.push(q[k] = l);
                e(null, r = [], j, i);
              }
              k = r.length;
              while (k--)
                (l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l));
            }
          } else
            r = vb(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r);
        });
      }
      function xb(a) {
        for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[' '], i = g ? 1 : 0, k = sb(function (a) {
              return a === b;
            }, h, !0), l = sb(function (a) {
              return J(b, a) > -1;
            }, h, !0), m = [function (a, c, d) {
                var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
                return b = null, e;
              }]; f > i; i++)
          if (c = d.relative[a[i].type])
            m = [sb(tb(m), c)];
          else {
            if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
              for (e = ++i; f > e; e++)
                if (d.relative[a[e].type])
                  break;
              return wb(i > 1 && tb(m), i > 1 && rb(a.slice(0, i - 1).concat({ value: ' ' === a[i - 2].type ? '*' : '' })).replace(R, '$1'), c, e > i && xb(a.slice(i, e)), f > e && xb(a = a.slice(e)), f > e && rb(a));
            }
            m.push(c);
          }
        return tb(m);
      }
      function yb(a, b) {
        var c = b.length > 0, e = a.length > 0, f = function (f, g, h, i, k) {
            var l, m, o, p = 0, q = '0', r = f && [], s = [], t = j, u = f || e && d.find.TAG('*', k), v = w += null == t ? 1 : Math.random() || 0.1, x = u.length;
            for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) {
              if (e && l) {
                m = 0;
                while (o = a[m++])
                  if (o(l, g, h)) {
                    i.push(l);
                    break;
                  }
                k && (w = v);
              }
              c && ((l = !o && l) && p--, f && r.push(l));
            }
            if (p += q, c && q !== p) {
              m = 0;
              while (o = b[m++])
                o(r, s, g, h);
              if (f) {
                if (p > 0)
                  while (q--)
                    r[q] || s[q] || (s[q] = F.call(i));
                s = vb(s);
              }
              H.apply(i, s), k && !f && s.length > 0 && p + b.length > 1 && gb.uniqueSort(i);
            }
            return k && (w = v, j = t), r;
          };
        return c ? ib(f) : f;
      }
      return h = gb.compile = function (a, b) {
        var c, d = [], e = [], f = A[a + ' '];
        if (!f) {
          b || (b = g(a)), c = b.length;
          while (c--)
            f = xb(b[c]), f[u] ? d.push(f) : e.push(f);
          f = A(a, yb(e, d)), f.selector = a;
        }
        return f;
      }, i = gb.select = function (a, b, e, f) {
        var i, j, k, l, m, n = 'function' == typeof a && a, o = !f && g(a = n.selector || a);
        if (e = e || [], 1 === o.length) {
          if (j = o[0] = o[0].slice(0), j.length > 2 && 'ID' === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
            if (b = (d.find.ID(k.matches[0].replace(cb, db), b) || [])[0], !b)
              return e;
            n && (b = b.parentNode), a = a.slice(j.shift().value.length);
          }
          i = X.needsContext.test(a) ? 0 : j.length;
          while (i--) {
            if (k = j[i], d.relative[l = k.type])
              break;
            if ((m = d.find[l]) && (f = m(k.matches[0].replace(cb, db), ab.test(j[0].type) && pb(b.parentNode) || b))) {
              if (j.splice(i, 1), a = f.length && rb(j), !a)
                return H.apply(e, f), e;
              break;
            }
          }
        }
        return (n || h(a, o))(f, b, !p, e, ab.test(a) && pb(b.parentNode) || b), e;
      }, c.sortStable = u.split('').sort(B).join('') === u, c.detectDuplicates = !!l, m(), c.sortDetached = jb(function (a) {
        return 1 & a.compareDocumentPosition(n.createElement('div'));
      }), jb(function (a) {
        return a.innerHTML = '<a href=\'#\'></a>', '#' === a.firstChild.getAttribute('href');
      }) || kb('type|href|height|width', function (a, b, c) {
        return c ? void 0 : a.getAttribute(b, 'type' === b.toLowerCase() ? 1 : 2);
      }), c.attributes && jb(function (a) {
        return a.innerHTML = '<input/>', a.firstChild.setAttribute('value', ''), '' === a.firstChild.getAttribute('value');
      }) || kb('value', function (a, b, c) {
        return c || 'input' !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue;
      }), jb(function (a) {
        return null == a.getAttribute('disabled');
      }) || kb(K, function (a, b, c) {
        var d;
        return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null;
      }), gb;
    }(a);
  n.find = t, n.expr = t.selectors, n.expr[':'] = n.expr.pseudos, n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains;
  var u = n.expr.match.needsContext, v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, w = /^.[^:#\[\.,]*$/;
  function x(a, b, c) {
    if (n.isFunction(b))
      return n.grep(a, function (a, d) {
        return !!b.call(a, d, a) !== c;
      });
    if (b.nodeType)
      return n.grep(a, function (a) {
        return a === b !== c;
      });
    if ('string' == typeof b) {
      if (w.test(b))
        return n.filter(b, a, c);
      b = n.filter(b, a);
    }
    return n.grep(a, function (a) {
      return g.call(b, a) >= 0 !== c;
    });
  }
  n.filter = function (a, b, c) {
    var d = b[0];
    return c && (a = ':not(' + a + ')'), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function (a) {
      return 1 === a.nodeType;
    }));
  }, n.fn.extend({
    find: function (a) {
      var b, c = this.length, d = [], e = this;
      if ('string' != typeof a)
        return this.pushStack(n(a).filter(function () {
          for (b = 0; c > b; b++)
            if (n.contains(e[b], this))
              return !0;
        }));
      for (b = 0; c > b; b++)
        n.find(a, e[b], d);
      return d = this.pushStack(c > 1 ? n.unique(d) : d), d.selector = this.selector ? this.selector + ' ' + a : a, d;
    },
    filter: function (a) {
      return this.pushStack(x(this, a || [], !1));
    },
    not: function (a) {
      return this.pushStack(x(this, a || [], !0));
    },
    is: function (a) {
      return !!x(this, 'string' == typeof a && u.test(a) ? n(a) : a || [], !1).length;
    }
  });
  var y, z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, A = n.fn.init = function (a, b) {
      var c, d;
      if (!a)
        return this;
      if ('string' == typeof a) {
        if (c = '<' === a[0] && '>' === a[a.length - 1] && a.length >= 3 ? [
            null,
            a,
            null
          ] : z.exec(a), !c || !c[1] && b)
          return !b || b.jquery ? (b || y).find(a) : this.constructor(b).find(a);
        if (c[1]) {
          if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : l, !0)), v.test(c[1]) && n.isPlainObject(b))
            for (c in b)
              n.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
          return this;
        }
        return d = l.getElementById(c[2]), d && d.parentNode && (this.length = 1, this[0] = d), this.context = l, this.selector = a, this;
      }
      return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? 'undefined' != typeof y.ready ? y.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this));
    };
  A.prototype = n.fn, y = n(l);
  var B = /^(?:parents|prev(?:Until|All))/, C = {
      children: !0,
      contents: !0,
      next: !0,
      prev: !0
    };
  n.extend({
    dir: function (a, b, c) {
      var d = [], e = void 0 !== c;
      while ((a = a[b]) && 9 !== a.nodeType)
        if (1 === a.nodeType) {
          if (e && n(a).is(c))
            break;
          d.push(a);
        }
      return d;
    },
    sibling: function (a, b) {
      for (var c = []; a; a = a.nextSibling)
        1 === a.nodeType && a !== b && c.push(a);
      return c;
    }
  }), n.fn.extend({
    has: function (a) {
      var b = n(a, this), c = b.length;
      return this.filter(function () {
        for (var a = 0; c > a; a++)
          if (n.contains(this, b[a]))
            return !0;
      });
    },
    closest: function (a, b) {
      for (var c, d = 0, e = this.length, f = [], g = u.test(a) || 'string' != typeof a ? n(a, b || this.context) : 0; e > d; d++)
        for (c = this[d]; c && c !== b; c = c.parentNode)
          if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) {
            f.push(c);
            break;
          }
      return this.pushStack(f.length > 1 ? n.unique(f) : f);
    },
    index: function (a) {
      return a ? 'string' == typeof a ? g.call(n(a), this[0]) : g.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
    },
    add: function (a, b) {
      return this.pushStack(n.unique(n.merge(this.get(), n(a, b))));
    },
    addBack: function (a) {
      return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
    }
  });
  function D(a, b) {
    while ((a = a[b]) && 1 !== a.nodeType);
    return a;
  }
  n.each({
    parent: function (a) {
      var b = a.parentNode;
      return b && 11 !== b.nodeType ? b : null;
    },
    parents: function (a) {
      return n.dir(a, 'parentNode');
    },
    parentsUntil: function (a, b, c) {
      return n.dir(a, 'parentNode', c);
    },
    next: function (a) {
      return D(a, 'nextSibling');
    },
    prev: function (a) {
      return D(a, 'previousSibling');
    },
    nextAll: function (a) {
      return n.dir(a, 'nextSibling');
    },
    prevAll: function (a) {
      return n.dir(a, 'previousSibling');
    },
    nextUntil: function (a, b, c) {
      return n.dir(a, 'nextSibling', c);
    },
    prevUntil: function (a, b, c) {
      return n.dir(a, 'previousSibling', c);
    },
    siblings: function (a) {
      return n.sibling((a.parentNode || {}).firstChild, a);
    },
    children: function (a) {
      return n.sibling(a.firstChild);
    },
    contents: function (a) {
      return a.contentDocument || n.merge([], a.childNodes);
    }
  }, function (a, b) {
    n.fn[a] = function (c, d) {
      var e = n.map(this, b, c);
      return 'Until' !== a.slice(-5) && (d = c), d && 'string' == typeof d && (e = n.filter(d, e)), this.length > 1 && (C[a] || n.unique(e), B.test(a) && e.reverse()), this.pushStack(e);
    };
  });
  var E = /\S+/g, F = {};
  function G(a) {
    var b = F[a] = {};
    return n.each(a.match(E) || [], function (a, c) {
      b[c] = !0;
    }), b;
  }
  n.Callbacks = function (a) {
    a = 'string' == typeof a ? F[a] || G(a) : n.extend({}, a);
    var b, c, d, e, f, g, h = [], i = !a.once && [], j = function (l) {
        for (b = a.memory && l, c = !0, g = e || 0, e = 0, f = h.length, d = !0; h && f > g; g++)
          if (h[g].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
            b = !1;
            break;
          }
        d = !1, h && (i ? i.length && j(i.shift()) : b ? h = [] : k.disable());
      }, k = {
        add: function () {
          if (h) {
            var c = h.length;
            !function g(b) {
              n.each(b, function (b, c) {
                var d = n.type(c);
                'function' === d ? a.unique && k.has(c) || h.push(c) : c && c.length && 'string' !== d && g(c);
              });
            }(arguments), d ? f = h.length : b && (e = c, j(b));
          }
          return this;
        },
        remove: function () {
          return h && n.each(arguments, function (a, b) {
            var c;
            while ((c = n.inArray(b, h, c)) > -1)
              h.splice(c, 1), d && (f >= c && f--, g >= c && g--);
          }), this;
        },
        has: function (a) {
          return a ? n.inArray(a, h) > -1 : !(!h || !h.length);
        },
        empty: function () {
          return h = [], f = 0, this;
        },
        disable: function () {
          return h = i = b = void 0, this;
        },
        disabled: function () {
          return !h;
        },
        lock: function () {
          return i = void 0, b || k.disable(), this;
        },
        locked: function () {
          return !i;
        },
        fireWith: function (a, b) {
          return !h || c && !i || (b = b || [], b = [
            a,
            b.slice ? b.slice() : b
          ], d ? i.push(b) : j(b)), this;
        },
        fire: function () {
          return k.fireWith(this, arguments), this;
        },
        fired: function () {
          return !!c;
        }
      };
    return k;
  }, n.extend({
    Deferred: function (a) {
      var b = [
          [
            'resolve',
            'done',
            n.Callbacks('once memory'),
            'resolved'
          ],
          [
            'reject',
            'fail',
            n.Callbacks('once memory'),
            'rejected'
          ],
          [
            'notify',
            'progress',
            n.Callbacks('memory')
          ]
        ], c = 'pending', d = {
          state: function () {
            return c;
          },
          always: function () {
            return e.done(arguments).fail(arguments), this;
          },
          then: function () {
            var a = arguments;
            return n.Deferred(function (c) {
              n.each(b, function (b, f) {
                var g = n.isFunction(a[b]) && a[b];
                e[f[1]](function () {
                  var a = g && g.apply(this, arguments);
                  a && n.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + 'With'](this === d ? c.promise() : this, g ? [a] : arguments);
                });
              }), a = null;
            }).promise();
          },
          promise: function (a) {
            return null != a ? n.extend(a, d) : d;
          }
        }, e = {};
      return d.pipe = d.then, n.each(b, function (a, f) {
        var g = f[2], h = f[3];
        d[f[1]] = g.add, h && g.add(function () {
          c = h;
        }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () {
          return e[f[0] + 'With'](this === e ? d : this, arguments), this;
        }, e[f[0] + 'With'] = g.fireWith;
      }), d.promise(e), a && a.call(e, e), e;
    },
    when: function (a) {
      var b = 0, c = d.call(arguments), e = c.length, f = 1 !== e || a && n.isFunction(a.promise) ? e : 0, g = 1 === f ? a : n.Deferred(), h = function (a, b, c) {
          return function (e) {
            b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c);
          };
        }, i, j, k;
      if (e > 1)
        for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++)
          c[b] && n.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;
      return f || g.resolveWith(k, c), g.promise();
    }
  });
  var H;
  n.fn.ready = function (a) {
    return n.ready.promise().done(a), this;
  }, n.extend({
    isReady: !1,
    readyWait: 1,
    holdReady: function (a) {
      a ? n.readyWait++ : n.ready(!0);
    },
    ready: function (a) {
      (a === !0 ? --n.readyWait : n.isReady) || (n.isReady = !0, a !== !0 && --n.readyWait > 0 || (H.resolveWith(l, [n]), n.fn.triggerHandler && (n(l).triggerHandler('ready'), n(l).off('ready'))));
    }
  });
  function I() {
    l.removeEventListener('DOMContentLoaded', I, !1), a.removeEventListener('load', I, !1), n.ready();
  }
  n.ready.promise = function (b) {
    return H || (H = n.Deferred(), 'complete' === l.readyState ? setTimeout(n.ready) : (l.addEventListener('DOMContentLoaded', I, !1), a.addEventListener('load', I, !1))), H.promise(b);
  }, n.ready.promise();
  var J = n.access = function (a, b, c, d, e, f, g) {
      var h = 0, i = a.length, j = null == c;
      if ('object' === n.type(c)) {
        e = !0;
        for (h in c)
          n.access(a, b, h, c[h], !0, f, g);
      } else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function (a, b, c) {
          return j.call(n(a), c);
        })), b))
        for (; i > h; h++)
          b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
      return e ? a : j ? b.call(a) : i ? b(a[0], c) : f;
    };
  n.acceptData = function (a) {
    return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType;
  };
  function K() {
    Object.defineProperty(this.cache = {}, 0, {
      get: function () {
        return {};
      }
    }), this.expando = n.expando + K.uid++;
  }
  K.uid = 1, K.accepts = n.acceptData, K.prototype = {
    key: function (a) {
      if (!K.accepts(a))
        return 0;
      var b = {}, c = a[this.expando];
      if (!c) {
        c = K.uid++;
        try {
          b[this.expando] = { value: c }, Object.defineProperties(a, b);
        } catch (d) {
          b[this.expando] = c, n.extend(a, b);
        }
      }
      return this.cache[c] || (this.cache[c] = {}), c;
    },
    set: function (a, b, c) {
      var d, e = this.key(a), f = this.cache[e];
      if ('string' == typeof b)
        f[b] = c;
      else if (n.isEmptyObject(f))
        n.extend(this.cache[e], b);
      else
        for (d in b)
          f[d] = b[d];
      return f;
    },
    get: function (a, b) {
      var c = this.cache[this.key(a)];
      return void 0 === b ? c : c[b];
    },
    access: function (a, b, c) {
      var d;
      return void 0 === b || b && 'string' == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, n.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b);
    },
    remove: function (a, b) {
      var c, d, e, f = this.key(a), g = this.cache[f];
      if (void 0 === b)
        this.cache[f] = {};
      else {
        n.isArray(b) ? d = b.concat(b.map(n.camelCase)) : (e = n.camelCase(b), b in g ? d = [
          b,
          e
        ] : (d = e, d = d in g ? [d] : d.match(E) || [])), c = d.length;
        while (c--)
          delete g[d[c]];
      }
    },
    hasData: function (a) {
      return !n.isEmptyObject(this.cache[a[this.expando]] || {});
    },
    discard: function (a) {
      a[this.expando] && delete this.cache[a[this.expando]];
    }
  };
  var L = new K(), M = new K(), N = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, O = /([A-Z])/g;
  function P(a, b, c) {
    var d;
    if (void 0 === c && 1 === a.nodeType)
      if (d = 'data-' + b.replace(O, '-$1').toLowerCase(), c = a.getAttribute(d), 'string' == typeof c) {
        try {
          c = 'true' === c ? !0 : 'false' === c ? !1 : 'null' === c ? null : +c + '' === c ? +c : N.test(c) ? n.parseJSON(c) : c;
        } catch (e) {
        }
        M.set(a, b, c);
      } else
        c = void 0;
    return c;
  }
  n.extend({
    hasData: function (a) {
      return M.hasData(a) || L.hasData(a);
    },
    data: function (a, b, c) {
      return M.access(a, b, c);
    },
    removeData: function (a, b) {
      M.remove(a, b);
    },
    _data: function (a, b, c) {
      return L.access(a, b, c);
    },
    _removeData: function (a, b) {
      L.remove(a, b);
    }
  }), n.fn.extend({
    data: function (a, b) {
      var c, d, e, f = this[0], g = f && f.attributes;
      if (void 0 === a) {
        if (this.length && (e = M.get(f), 1 === f.nodeType && !L.get(f, 'hasDataAttrs'))) {
          c = g.length;
          while (c--)
            g[c] && (d = g[c].name, 0 === d.indexOf('data-') && (d = n.camelCase(d.slice(5)), P(f, d, e[d])));
          L.set(f, 'hasDataAttrs', !0);
        }
        return e;
      }
      return 'object' == typeof a ? this.each(function () {
        M.set(this, a);
      }) : J(this, function (b) {
        var c, d = n.camelCase(a);
        if (f && void 0 === b) {
          if (c = M.get(f, a), void 0 !== c)
            return c;
          if (c = M.get(f, d), void 0 !== c)
            return c;
          if (c = P(f, d, void 0), void 0 !== c)
            return c;
        } else
          this.each(function () {
            var c = M.get(this, d);
            M.set(this, d, b), -1 !== a.indexOf('-') && void 0 !== c && M.set(this, a, b);
          });
      }, null, b, arguments.length > 1, null, !0);
    },
    removeData: function (a) {
      return this.each(function () {
        M.remove(this, a);
      });
    }
  }), n.extend({
    queue: function (a, b, c) {
      var d;
      return a ? (b = (b || 'fx') + 'queue', d = L.get(a, b), c && (!d || n.isArray(c) ? d = L.access(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0;
    },
    dequeue: function (a, b) {
      b = b || 'fx';
      var c = n.queue(a, b), d = c.length, e = c.shift(), f = n._queueHooks(a, b), g = function () {
          n.dequeue(a, b);
        };
      'inprogress' === e && (e = c.shift(), d--), e && ('fx' === b && c.unshift('inprogress'), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
    },
    _queueHooks: function (a, b) {
      var c = b + 'queueHooks';
      return L.get(a, c) || L.access(a, c, {
        empty: n.Callbacks('once memory').add(function () {
          L.remove(a, [
            b + 'queue',
            c
          ]);
        })
      });
    }
  }), n.fn.extend({
    queue: function (a, b) {
      var c = 2;
      return 'string' != typeof a && (b = a, a = 'fx', c--), arguments.length < c ? n.queue(this[0], a) : void 0 === b ? this : this.each(function () {
        var c = n.queue(this, a, b);
        n._queueHooks(this, a), 'fx' === a && 'inprogress' !== c[0] && n.dequeue(this, a);
      });
    },
    dequeue: function (a) {
      return this.each(function () {
        n.dequeue(this, a);
      });
    },
    clearQueue: function (a) {
      return this.queue(a || 'fx', []);
    },
    promise: function (a, b) {
      var c, d = 1, e = n.Deferred(), f = this, g = this.length, h = function () {
          --d || e.resolveWith(f, [f]);
        };
      'string' != typeof a && (b = a, a = void 0), a = a || 'fx';
      while (g--)
        c = L.get(f[g], a + 'queueHooks'), c && c.empty && (d++, c.empty.add(h));
      return h(), e.promise(b);
    }
  });
  var Q = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, R = [
      'Top',
      'Right',
      'Bottom',
      'Left'
    ], S = function (a, b) {
      return a = b || a, 'none' === n.css(a, 'display') || !n.contains(a.ownerDocument, a);
    }, T = /^(?:checkbox|radio)$/i;
  !function () {
    var a = l.createDocumentFragment(), b = a.appendChild(l.createElement('div')), c = l.createElement('input');
    c.setAttribute('type', 'radio'), c.setAttribute('checked', 'checked'), c.setAttribute('name', 't'), b.appendChild(c), k.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = '<textarea>x</textarea>', k.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue;
  }();
  var U = 'undefined';
  k.focusinBubbles = 'onfocusin' in a;
  var V = /^key/, W = /^(?:mouse|pointer|contextmenu)|click/, X = /^(?:focusinfocus|focusoutblur)$/, Y = /^([^.]*)(?:\.(.+)|)$/;
  function Z() {
    return !0;
  }
  function $() {
    return !1;
  }
  function _() {
    try {
      return l.activeElement;
    } catch (a) {
    }
  }
  n.event = {
    global: {},
    add: function (a, b, c, d, e) {
      var f, g, h, i, j, k, l, m, o, p, q, r = L.get(a);
      if (r) {
        c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = n.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function (b) {
          return typeof n !== U && n.event.triggered !== b.type ? n.event.dispatch.apply(a, arguments) : void 0;
        }), b = (b || '').match(E) || [''], j = b.length;
        while (j--)
          h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || '').split('.').sort(), o && (l = n.event.special[o] || {}, o = (e ? l.delegateType : l.bindType) || o, l = n.event.special[o] || {}, k = n.extend({
            type: o,
            origType: q,
            data: d,
            handler: c,
            guid: c.guid,
            selector: e,
            needsContext: e && n.expr.match.needsContext.test(e),
            namespace: p.join('.')
          }, f), (m = i[o]) || (m = i[o] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(o, g, !1)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), n.event.global[o] = !0);
      }
    },
    remove: function (a, b, c, d, e) {
      var f, g, h, i, j, k, l, m, o, p, q, r = L.hasData(a) && L.get(a);
      if (r && (i = r.events)) {
        b = (b || '').match(E) || [''], j = b.length;
        while (j--)
          if (h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || '').split('.').sort(), o) {
            l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = i[o] || [], h = h[2] && new RegExp('(^|\\.)' + p.join('\\.(?:.*\\.|)') + '(\\.|$)'), g = f = m.length;
            while (f--)
              k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ('**' !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k));
            g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete i[o]);
          } else
            for (o in i)
              n.event.remove(a, o + b[j], c, d, !0);
        n.isEmptyObject(i) && (delete r.handle, L.remove(a, 'events'));
      }
    },
    trigger: function (b, c, d, e) {
      var f, g, h, i, k, m, o, p = [d || l], q = j.call(b, 'type') ? b.type : b, r = j.call(b, 'namespace') ? b.namespace.split('.') : [];
      if (g = h = d = d || l, 3 !== d.nodeType && 8 !== d.nodeType && !X.test(q + n.event.triggered) && (q.indexOf('.') >= 0 && (r = q.split('.'), q = r.shift(), r.sort()), k = q.indexOf(':') < 0 && 'on' + q, b = b[n.expando] ? b : new n.Event(q, 'object' == typeof b && b), b.isTrigger = e ? 2 : 3, b.namespace = r.join('.'), b.namespace_re = b.namespace ? new RegExp('(^|\\.)' + r.join('\\.(?:.*\\.|)') + '(\\.|$)') : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : n.makeArray(c, [b]), o = n.event.special[q] || {}, e || !o.trigger || o.trigger.apply(d, c) !== !1)) {
        if (!e && !o.noBubble && !n.isWindow(d)) {
          for (i = o.delegateType || q, X.test(i + q) || (g = g.parentNode); g; g = g.parentNode)
            p.push(g), h = g;
          h === (d.ownerDocument || l) && p.push(h.defaultView || h.parentWindow || a);
        }
        f = 0;
        while ((g = p[f++]) && !b.isPropagationStopped())
          b.type = f > 1 ? i : o.bindType || q, m = (L.get(g, 'events') || {})[b.type] && L.get(g, 'handle'), m && m.apply(g, c), m = k && g[k], m && m.apply && n.acceptData(g) && (b.result = m.apply(g, c), b.result === !1 && b.preventDefault());
        return b.type = q, e || b.isDefaultPrevented() || o._default && o._default.apply(p.pop(), c) !== !1 || !n.acceptData(d) || k && n.isFunction(d[q]) && !n.isWindow(d) && (h = d[k], h && (d[k] = null), n.event.triggered = q, d[q](), n.event.triggered = void 0, h && (d[k] = h)), b.result;
      }
    },
    dispatch: function (a) {
      a = n.event.fix(a);
      var b, c, e, f, g, h = [], i = d.call(arguments), j = (L.get(this, 'events') || {})[a.type] || [], k = n.event.special[a.type] || {};
      if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
        h = n.event.handlers.call(this, a, j), b = 0;
        while ((f = h[b++]) && !a.isPropagationStopped()) {
          a.currentTarget = f.elem, c = 0;
          while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped())
            (!a.namespace_re || a.namespace_re.test(g.namespace)) && (a.handleObj = g, a.data = g.data, e = ((n.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== e && (a.result = e) === !1 && (a.preventDefault(), a.stopPropagation()));
        }
        return k.postDispatch && k.postDispatch.call(this, a), a.result;
      }
    },
    handlers: function (a, b) {
      var c, d, e, f, g = [], h = b.delegateCount, i = a.target;
      if (h && i.nodeType && (!a.button || 'click' !== a.type))
        for (; i !== this; i = i.parentNode || this)
          if (i.disabled !== !0 || 'click' !== a.type) {
            for (d = [], c = 0; h > c; c++)
              f = b[c], e = f.selector + ' ', void 0 === d[e] && (d[e] = f.needsContext ? n(e, this).index(i) >= 0 : n.find(e, this, null, [i]).length), d[e] && d.push(f);
            d.length && g.push({
              elem: i,
              handlers: d
            });
          }
      return h < b.length && g.push({
        elem: this,
        handlers: b.slice(h)
      }), g;
    },
    props: 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' '),
    fixHooks: {},
    keyHooks: {
      props: 'char charCode key keyCode'.split(' '),
      filter: function (a, b) {
        return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a;
      }
    },
    mouseHooks: {
      props: 'button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement'.split(' '),
      filter: function (a, b) {
        var c, d, e, f = b.button;
        return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || l, d = c.documentElement, e = c.body, a.pageX = b.clientX + (d && d.scrollLeft || e && e.scrollLeft || 0) - (d && d.clientLeft || e && e.clientLeft || 0), a.pageY = b.clientY + (d && d.scrollTop || e && e.scrollTop || 0) - (d && d.clientTop || e && e.clientTop || 0)), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a;
      }
    },
    fix: function (a) {
      if (a[n.expando])
        return a;
      var b, c, d, e = a.type, f = a, g = this.fixHooks[e];
      g || (this.fixHooks[e] = g = W.test(e) ? this.mouseHooks : V.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new n.Event(f), b = d.length;
      while (b--)
        c = d[b], a[c] = f[c];
      return a.target || (a.target = l), 3 === a.target.nodeType && (a.target = a.target.parentNode), g.filter ? g.filter(a, f) : a;
    },
    special: {
      load: { noBubble: !0 },
      focus: {
        trigger: function () {
          return this !== _() && this.focus ? (this.focus(), !1) : void 0;
        },
        delegateType: 'focusin'
      },
      blur: {
        trigger: function () {
          return this === _() && this.blur ? (this.blur(), !1) : void 0;
        },
        delegateType: 'focusout'
      },
      click: {
        trigger: function () {
          return 'checkbox' === this.type && this.click && n.nodeName(this, 'input') ? (this.click(), !1) : void 0;
        },
        _default: function (a) {
          return n.nodeName(a.target, 'a');
        }
      },
      beforeunload: {
        postDispatch: function (a) {
          void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result);
        }
      }
    },
    simulate: function (a, b, c, d) {
      var e = n.extend(new n.Event(), c, {
          type: a,
          isSimulated: !0,
          originalEvent: {}
        });
      d ? n.event.trigger(e, null, b) : n.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
    }
  }, n.removeEvent = function (a, b, c) {
    a.removeEventListener && a.removeEventListener(b, c, !1);
  }, n.Event = function (a, b) {
    return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? Z : $) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void (this[n.expando] = !0)) : new n.Event(a, b);
  }, n.Event.prototype = {
    isDefaultPrevented: $,
    isPropagationStopped: $,
    isImmediatePropagationStopped: $,
    preventDefault: function () {
      var a = this.originalEvent;
      this.isDefaultPrevented = Z, a && a.preventDefault && a.preventDefault();
    },
    stopPropagation: function () {
      var a = this.originalEvent;
      this.isPropagationStopped = Z, a && a.stopPropagation && a.stopPropagation();
    },
    stopImmediatePropagation: function () {
      var a = this.originalEvent;
      this.isImmediatePropagationStopped = Z, a && a.stopImmediatePropagation && a.stopImmediatePropagation(), this.stopPropagation();
    }
  }, n.each({
    mouseenter: 'mouseover',
    mouseleave: 'mouseout',
    pointerenter: 'pointerover',
    pointerleave: 'pointerout'
  }, function (a, b) {
    n.event.special[a] = {
      delegateType: b,
      bindType: b,
      handle: function (a) {
        var c, d = this, e = a.relatedTarget, f = a.handleObj;
        return (!e || e !== d && !n.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c;
      }
    };
  }), k.focusinBubbles || n.each({
    focus: 'focusin',
    blur: 'focusout'
  }, function (a, b) {
    var c = function (a) {
      n.event.simulate(b, a.target, n.event.fix(a), !0);
    };
    n.event.special[b] = {
      setup: function () {
        var d = this.ownerDocument || this, e = L.access(d, b);
        e || d.addEventListener(a, c, !0), L.access(d, b, (e || 0) + 1);
      },
      teardown: function () {
        var d = this.ownerDocument || this, e = L.access(d, b) - 1;
        e ? L.access(d, b, e) : (d.removeEventListener(a, c, !0), L.remove(d, b));
      }
    };
  }), n.fn.extend({
    on: function (a, b, c, d, e) {
      var f, g;
      if ('object' == typeof a) {
        'string' != typeof b && (c = c || b, b = void 0);
        for (g in a)
          this.on(g, b, c, a[g], e);
        return this;
      }
      if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ('string' == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1)
        d = $;
      else if (!d)
        return this;
      return 1 === e && (f = d, d = function (a) {
        return n().off(a), f.apply(this, arguments);
      }, d.guid = f.guid || (f.guid = n.guid++)), this.each(function () {
        n.event.add(this, a, d, c, b);
      });
    },
    one: function (a, b, c, d) {
      return this.on(a, b, c, d, 1);
    },
    off: function (a, b, c) {
      var d, e;
      if (a && a.preventDefault && a.handleObj)
        return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + '.' + d.namespace : d.origType, d.selector, d.handler), this;
      if ('object' == typeof a) {
        for (e in a)
          this.off(e, b, a[e]);
        return this;
      }
      return (b === !1 || 'function' == typeof b) && (c = b, b = void 0), c === !1 && (c = $), this.each(function () {
        n.event.remove(this, a, c, b);
      });
    },
    trigger: function (a, b) {
      return this.each(function () {
        n.event.trigger(a, b, this);
      });
    },
    triggerHandler: function (a, b) {
      var c = this[0];
      return c ? n.event.trigger(a, b, c, !0) : void 0;
    }
  });
  var ab = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, bb = /<([\w:]+)/, cb = /<|&#?\w+;/, db = /<(?:script|style|link)/i, eb = /checked\s*(?:[^=]|=\s*.checked.)/i, fb = /^$|\/(?:java|ecma)script/i, gb = /^true\/(.*)/, hb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, ib = {
      option: [
        1,
        '<select multiple=\'multiple\'>',
        '</select>'
      ],
      thead: [
        1,
        '<table>',
        '</table>'
      ],
      col: [
        2,
        '<table><colgroup>',
        '</colgroup></table>'
      ],
      tr: [
        2,
        '<table><tbody>',
        '</tbody></table>'
      ],
      td: [
        3,
        '<table><tbody><tr>',
        '</tr></tbody></table>'
      ],
      _default: [
        0,
        '',
        ''
      ]
    };
  ib.optgroup = ib.option, ib.tbody = ib.tfoot = ib.colgroup = ib.caption = ib.thead, ib.th = ib.td;
  function jb(a, b) {
    return n.nodeName(a, 'table') && n.nodeName(11 !== b.nodeType ? b : b.firstChild, 'tr') ? a.getElementsByTagName('tbody')[0] || a.appendChild(a.ownerDocument.createElement('tbody')) : a;
  }
  function kb(a) {
    return a.type = (null !== a.getAttribute('type')) + '/' + a.type, a;
  }
  function lb(a) {
    var b = gb.exec(a.type);
    return b ? a.type = b[1] : a.removeAttribute('type'), a;
  }
  function mb(a, b) {
    for (var c = 0, d = a.length; d > c; c++)
      L.set(a[c], 'globalEval', !b || L.get(b[c], 'globalEval'));
  }
  function nb(a, b) {
    var c, d, e, f, g, h, i, j;
    if (1 === b.nodeType) {
      if (L.hasData(a) && (f = L.access(a), g = L.set(b, f), j = f.events)) {
        delete g.handle, g.events = {};
        for (e in j)
          for (c = 0, d = j[e].length; d > c; c++)
            n.event.add(b, e, j[e][c]);
      }
      M.hasData(a) && (h = M.access(a), i = n.extend({}, h), M.set(b, i));
    }
  }
  function ob(a, b) {
    var c = a.getElementsByTagName ? a.getElementsByTagName(b || '*') : a.querySelectorAll ? a.querySelectorAll(b || '*') : [];
    return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], c) : c;
  }
  function pb(a, b) {
    var c = b.nodeName.toLowerCase();
    'input' === c && T.test(a.type) ? b.checked = a.checked : ('input' === c || 'textarea' === c) && (b.defaultValue = a.defaultValue);
  }
  n.extend({
    clone: function (a, b, c) {
      var d, e, f, g, h = a.cloneNode(!0), i = n.contains(a.ownerDocument, a);
      if (!(k.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a)))
        for (g = ob(h), f = ob(a), d = 0, e = f.length; e > d; d++)
          pb(f[d], g[d]);
      if (b)
        if (c)
          for (f = f || ob(a), g = g || ob(h), d = 0, e = f.length; e > d; d++)
            nb(f[d], g[d]);
        else
          nb(a, h);
      return g = ob(h, 'script'), g.length > 0 && mb(g, !i && ob(a, 'script')), h;
    },
    buildFragment: function (a, b, c, d) {
      for (var e, f, g, h, i, j, k = b.createDocumentFragment(), l = [], m = 0, o = a.length; o > m; m++)
        if (e = a[m], e || 0 === e)
          if ('object' === n.type(e))
            n.merge(l, e.nodeType ? [e] : e);
          else if (cb.test(e)) {
            f = f || k.appendChild(b.createElement('div')), g = (bb.exec(e) || [
              '',
              ''
            ])[1].toLowerCase(), h = ib[g] || ib._default, f.innerHTML = h[1] + e.replace(ab, '<$1></$2>') + h[2], j = h[0];
            while (j--)
              f = f.lastChild;
            n.merge(l, f.childNodes), f = k.firstChild, f.textContent = '';
          } else
            l.push(b.createTextNode(e));
      k.textContent = '', m = 0;
      while (e = l[m++])
        if ((!d || -1 === n.inArray(e, d)) && (i = n.contains(e.ownerDocument, e), f = ob(k.appendChild(e), 'script'), i && mb(f), c)) {
          j = 0;
          while (e = f[j++])
            fb.test(e.type || '') && c.push(e);
        }
      return k;
    },
    cleanData: function (a) {
      for (var b, c, d, e, f = n.event.special, g = 0; void 0 !== (c = a[g]); g++) {
        if (n.acceptData(c) && (e = c[L.expando], e && (b = L.cache[e]))) {
          if (b.events)
            for (d in b.events)
              f[d] ? n.event.remove(c, d) : n.removeEvent(c, d, b.handle);
          L.cache[e] && delete L.cache[e];
        }
        delete M.cache[c[M.expando]];
      }
    }
  }), n.fn.extend({
    text: function (a) {
      return J(this, function (a) {
        return void 0 === a ? n.text(this) : this.empty().each(function () {
          (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = a);
        });
      }, null, a, arguments.length);
    },
    append: function () {
      return this.domManip(arguments, function (a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = jb(this, a);
          b.appendChild(a);
        }
      });
    },
    prepend: function () {
      return this.domManip(arguments, function (a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = jb(this, a);
          b.insertBefore(a, b.firstChild);
        }
      });
    },
    before: function () {
      return this.domManip(arguments, function (a) {
        this.parentNode && this.parentNode.insertBefore(a, this);
      });
    },
    after: function () {
      return this.domManip(arguments, function (a) {
        this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
      });
    },
    remove: function (a, b) {
      for (var c, d = a ? n.filter(a, this) : this, e = 0; null != (c = d[e]); e++)
        b || 1 !== c.nodeType || n.cleanData(ob(c)), c.parentNode && (b && n.contains(c.ownerDocument, c) && mb(ob(c, 'script')), c.parentNode.removeChild(c));
      return this;
    },
    empty: function () {
      for (var a, b = 0; null != (a = this[b]); b++)
        1 === a.nodeType && (n.cleanData(ob(a, !1)), a.textContent = '');
      return this;
    },
    clone: function (a, b) {
      return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () {
        return n.clone(this, a, b);
      });
    },
    html: function (a) {
      return J(this, function (a) {
        var b = this[0] || {}, c = 0, d = this.length;
        if (void 0 === a && 1 === b.nodeType)
          return b.innerHTML;
        if ('string' == typeof a && !db.test(a) && !ib[(bb.exec(a) || [
            '',
            ''
          ])[1].toLowerCase()]) {
          a = a.replace(ab, '<$1></$2>');
          try {
            for (; d > c; c++)
              b = this[c] || {}, 1 === b.nodeType && (n.cleanData(ob(b, !1)), b.innerHTML = a);
            b = 0;
          } catch (e) {
          }
        }
        b && this.empty().append(a);
      }, null, a, arguments.length);
    },
    replaceWith: function () {
      var a = arguments[0];
      return this.domManip(arguments, function (b) {
        a = this.parentNode, n.cleanData(ob(this)), a && a.replaceChild(b, this);
      }), a && (a.length || a.nodeType) ? this : this.remove();
    },
    detach: function (a) {
      return this.remove(a, !0);
    },
    domManip: function (a, b) {
      a = e.apply([], a);
      var c, d, f, g, h, i, j = 0, l = this.length, m = this, o = l - 1, p = a[0], q = n.isFunction(p);
      if (q || l > 1 && 'string' == typeof p && !k.checkClone && eb.test(p))
        return this.each(function (c) {
          var d = m.eq(c);
          q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b);
        });
      if (l && (c = n.buildFragment(a, this[0].ownerDocument, !1, this), d = c.firstChild, 1 === c.childNodes.length && (c = d), d)) {
        for (f = n.map(ob(c, 'script'), kb), g = f.length; l > j; j++)
          h = c, j !== o && (h = n.clone(h, !0, !0), g && n.merge(f, ob(h, 'script'))), b.call(this[j], h, j);
        if (g)
          for (i = f[f.length - 1].ownerDocument, n.map(f, lb), j = 0; g > j; j++)
            h = f[j], fb.test(h.type || '') && !L.access(h, 'globalEval') && n.contains(i, h) && (h.src ? n._evalUrl && n._evalUrl(h.src) : n.globalEval(h.textContent.replace(hb, '')));
      }
      return this;
    }
  }), n.each({
    appendTo: 'append',
    prependTo: 'prepend',
    insertBefore: 'before',
    insertAfter: 'after',
    replaceAll: 'replaceWith'
  }, function (a, b) {
    n.fn[a] = function (a) {
      for (var c, d = [], e = n(a), g = e.length - 1, h = 0; g >= h; h++)
        c = h === g ? this : this.clone(!0), n(e[h])[b](c), f.apply(d, c.get());
      return this.pushStack(d);
    };
  });
  var qb, rb = {};
  function sb(b, c) {
    var d, e = n(c.createElement(b)).appendTo(c.body), f = a.getDefaultComputedStyle && (d = a.getDefaultComputedStyle(e[0])) ? d.display : n.css(e[0], 'display');
    return e.detach(), f;
  }
  function tb(a) {
    var b = l, c = rb[a];
    return c || (c = sb(a, b), 'none' !== c && c || (qb = (qb || n('<iframe frameborder=\'0\' width=\'0\' height=\'0\'/>')).appendTo(b.documentElement), b = qb[0].contentDocument, b.write(), b.close(), c = sb(a, b), qb.detach()), rb[a] = c), c;
  }
  var ub = /^margin/, vb = new RegExp('^(' + Q + ')(?!px)[a-z%]+$', 'i'), wb = function (b) {
      return b.ownerDocument.defaultView.opener ? b.ownerDocument.defaultView.getComputedStyle(b, null) : a.getComputedStyle(b, null);
    };
  function xb(a, b, c) {
    var d, e, f, g, h = a.style;
    return c = c || wb(a), c && (g = c.getPropertyValue(b) || c[b]), c && ('' !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), vb.test(g) && ub.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 !== g ? g + '' : g;
  }
  function yb(a, b) {
    return {
      get: function () {
        return a() ? void delete this.get : (this.get = b).apply(this, arguments);
      }
    };
  }
  !function () {
    var b, c, d = l.documentElement, e = l.createElement('div'), f = l.createElement('div');
    if (f.style) {
      f.style.backgroundClip = 'content-box', f.cloneNode(!0).style.backgroundClip = '', k.clearCloneStyle = 'content-box' === f.style.backgroundClip, e.style.cssText = 'border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute', e.appendChild(f);
      function g() {
        f.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute', f.innerHTML = '', d.appendChild(e);
        var g = a.getComputedStyle(f, null);
        b = '1%' !== g.top, c = '4px' === g.width, d.removeChild(e);
      }
      a.getComputedStyle && n.extend(k, {
        pixelPosition: function () {
          return g(), b;
        },
        boxSizingReliable: function () {
          return null == c && g(), c;
        },
        reliableMarginRight: function () {
          var b, c = f.appendChild(l.createElement('div'));
          return c.style.cssText = f.style.cssText = '-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0', c.style.marginRight = c.style.width = '0', f.style.width = '1px', d.appendChild(e), b = !parseFloat(a.getComputedStyle(c, null).marginRight), d.removeChild(e), f.removeChild(c), b;
        }
      });
    }
  }(), n.swap = function (a, b, c, d) {
    var e, f, g = {};
    for (f in b)
      g[f] = a.style[f], a.style[f] = b[f];
    e = c.apply(a, d || []);
    for (f in b)
      a.style[f] = g[f];
    return e;
  };
  var zb = /^(none|table(?!-c[ea]).+)/, Ab = new RegExp('^(' + Q + ')(.*)$', 'i'), Bb = new RegExp('^([+-])=(' + Q + ')', 'i'), Cb = {
      position: 'absolute',
      visibility: 'hidden',
      display: 'block'
    }, Db = {
      letterSpacing: '0',
      fontWeight: '400'
    }, Eb = [
      'Webkit',
      'O',
      'Moz',
      'ms'
    ];
  function Fb(a, b) {
    if (b in a)
      return b;
    var c = b[0].toUpperCase() + b.slice(1), d = b, e = Eb.length;
    while (e--)
      if (b = Eb[e] + c, b in a)
        return b;
    return d;
  }
  function Gb(a, b, c) {
    var d = Ab.exec(b);
    return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || 'px') : b;
  }
  function Hb(a, b, c, d, e) {
    for (var f = c === (d ? 'border' : 'content') ? 4 : 'width' === b ? 1 : 0, g = 0; 4 > f; f += 2)
      'margin' === c && (g += n.css(a, c + R[f], !0, e)), d ? ('content' === c && (g -= n.css(a, 'padding' + R[f], !0, e)), 'margin' !== c && (g -= n.css(a, 'border' + R[f] + 'Width', !0, e))) : (g += n.css(a, 'padding' + R[f], !0, e), 'padding' !== c && (g += n.css(a, 'border' + R[f] + 'Width', !0, e)));
    return g;
  }
  function Ib(a, b, c) {
    var d = !0, e = 'width' === b ? a.offsetWidth : a.offsetHeight, f = wb(a), g = 'border-box' === n.css(a, 'boxSizing', !1, f);
    if (0 >= e || null == e) {
      if (e = xb(a, b, f), (0 > e || null == e) && (e = a.style[b]), vb.test(e))
        return e;
      d = g && (k.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0;
    }
    return e + Hb(a, b, c || (g ? 'border' : 'content'), d, f) + 'px';
  }
  function Jb(a, b) {
    for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++)
      d = a[g], d.style && (f[g] = L.get(d, 'olddisplay'), c = d.style.display, b ? (f[g] || 'none' !== c || (d.style.display = ''), '' === d.style.display && S(d) && (f[g] = L.access(d, 'olddisplay', tb(d.nodeName)))) : (e = S(d), 'none' === c && e || L.set(d, 'olddisplay', e ? c : n.css(d, 'display'))));
    for (g = 0; h > g; g++)
      d = a[g], d.style && (b && 'none' !== d.style.display && '' !== d.style.display || (d.style.display = b ? f[g] || '' : 'none'));
    return a;
  }
  n.extend({
    cssHooks: {
      opacity: {
        get: function (a, b) {
          if (b) {
            var c = xb(a, 'opacity');
            return '' === c ? '1' : c;
          }
        }
      }
    },
    cssNumber: {
      columnCount: !0,
      fillOpacity: !0,
      flexGrow: !0,
      flexShrink: !0,
      fontWeight: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0
    },
    cssProps: { 'float': 'cssFloat' },
    style: function (a, b, c, d) {
      if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
        var e, f, g, h = n.camelCase(b), i = a.style;
        return b = n.cssProps[h] || (n.cssProps[h] = Fb(i, h)), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c ? g && 'get' in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, 'string' === f && (e = Bb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(n.css(a, b)), f = 'number'), null != c && c === c && ('number' !== f || n.cssNumber[h] || (c += 'px'), k.clearCloneStyle || '' !== c || 0 !== b.indexOf('background') || (i[b] = 'inherit'), g && 'set' in g && void 0 === (c = g.set(a, c, d)) || (i[b] = c)), void 0);
      }
    },
    css: function (a, b, c, d) {
      var e, f, g, h = n.camelCase(b);
      return b = n.cssProps[h] || (n.cssProps[h] = Fb(a.style, h)), g = n.cssHooks[b] || n.cssHooks[h], g && 'get' in g && (e = g.get(a, !0, c)), void 0 === e && (e = xb(a, b, d)), 'normal' === e && b in Db && (e = Db[b]), '' === c || c ? (f = parseFloat(e), c === !0 || n.isNumeric(f) ? f || 0 : e) : e;
    }
  }), n.each([
    'height',
    'width'
  ], function (a, b) {
    n.cssHooks[b] = {
      get: function (a, c, d) {
        return c ? zb.test(n.css(a, 'display')) && 0 === a.offsetWidth ? n.swap(a, Cb, function () {
          return Ib(a, b, d);
        }) : Ib(a, b, d) : void 0;
      },
      set: function (a, c, d) {
        var e = d && wb(a);
        return Gb(a, c, d ? Hb(a, b, d, 'border-box' === n.css(a, 'boxSizing', !1, e), e) : 0);
      }
    };
  }), n.cssHooks.marginRight = yb(k.reliableMarginRight, function (a, b) {
    return b ? n.swap(a, { display: 'inline-block' }, xb, [
      a,
      'marginRight'
    ]) : void 0;
  }), n.each({
    margin: '',
    padding: '',
    border: 'Width'
  }, function (a, b) {
    n.cssHooks[a + b] = {
      expand: function (c) {
        for (var d = 0, e = {}, f = 'string' == typeof c ? c.split(' ') : [c]; 4 > d; d++)
          e[a + R[d] + b] = f[d] || f[d - 2] || f[0];
        return e;
      }
    }, ub.test(a) || (n.cssHooks[a + b].set = Gb);
  }), n.fn.extend({
    css: function (a, b) {
      return J(this, function (a, b, c) {
        var d, e, f = {}, g = 0;
        if (n.isArray(b)) {
          for (d = wb(a), e = b.length; e > g; g++)
            f[b[g]] = n.css(a, b[g], !1, d);
          return f;
        }
        return void 0 !== c ? n.style(a, b, c) : n.css(a, b);
      }, a, b, arguments.length > 1);
    },
    show: function () {
      return Jb(this, !0);
    },
    hide: function () {
      return Jb(this);
    },
    toggle: function (a) {
      return 'boolean' == typeof a ? a ? this.show() : this.hide() : this.each(function () {
        S(this) ? n(this).show() : n(this).hide();
      });
    }
  });
  function Kb(a, b, c, d, e) {
    return new Kb.prototype.init(a, b, c, d, e);
  }
  n.Tween = Kb, Kb.prototype = {
    constructor: Kb,
    init: function (a, b, c, d, e, f) {
      this.elem = a, this.prop = c, this.easing = e || 'swing', this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? '' : 'px');
    },
    cur: function () {
      var a = Kb.propHooks[this.prop];
      return a && a.get ? a.get(this) : Kb.propHooks._default.get(this);
    },
    run: function (a) {
      var b, c = Kb.propHooks[this.prop];
      return this.pos = b = this.options.duration ? n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Kb.propHooks._default.set(this), this;
    }
  }, Kb.prototype.init.prototype = Kb.prototype, Kb.propHooks = {
    _default: {
      get: function (a) {
        var b;
        return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = n.css(a.elem, a.prop, ''), b && 'auto' !== b ? b : 0) : a.elem[a.prop];
      },
      set: function (a) {
        n.fx.step[a.prop] ? n.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[n.cssProps[a.prop]] || n.cssHooks[a.prop]) ? n.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
      }
    }
  }, Kb.propHooks.scrollTop = Kb.propHooks.scrollLeft = {
    set: function (a) {
      a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
    }
  }, n.easing = {
    linear: function (a) {
      return a;
    },
    swing: function (a) {
      return 0.5 - Math.cos(a * Math.PI) / 2;
    }
  }, n.fx = Kb.prototype.init, n.fx.step = {};
  var Lb, Mb, Nb = /^(?:toggle|show|hide)$/, Ob = new RegExp('^(?:([+-])=|)(' + Q + ')([a-z%]*)$', 'i'), Pb = /queueHooks$/, Qb = [Vb], Rb = {
      '*': [function (a, b) {
          var c = this.createTween(a, b), d = c.cur(), e = Ob.exec(b), f = e && e[3] || (n.cssNumber[a] ? '' : 'px'), g = (n.cssNumber[a] || 'px' !== f && +d) && Ob.exec(n.css(c.elem, a)), h = 1, i = 20;
          if (g && g[3] !== f) {
            f = f || g[3], e = e || [], g = +d || 1;
            do
              h = h || '.5', g /= h, n.style(c.elem, a, g + f);
            while (h !== (h = c.cur() / d) && 1 !== h && --i);
          }
          return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c;
        }]
    };
  function Sb() {
    return setTimeout(function () {
      Lb = void 0;
    }), Lb = n.now();
  }
  function Tb(a, b) {
    var c, d = 0, e = { height: a };
    for (b = b ? 1 : 0; 4 > d; d += 2 - b)
      c = R[d], e['margin' + c] = e['padding' + c] = a;
    return b && (e.opacity = e.width = a), e;
  }
  function Ub(a, b, c) {
    for (var d, e = (Rb[b] || []).concat(Rb['*']), f = 0, g = e.length; g > f; f++)
      if (d = e[f].call(c, b, a))
        return d;
  }
  function Vb(a, b, c) {
    var d, e, f, g, h, i, j, k, l = this, m = {}, o = a.style, p = a.nodeType && S(a), q = L.get(a, 'fxshow');
    c.queue || (h = n._queueHooks(a, 'fx'), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () {
      h.unqueued || i();
    }), h.unqueued++, l.always(function () {
      l.always(function () {
        h.unqueued--, n.queue(a, 'fx').length || h.empty.fire();
      });
    })), 1 === a.nodeType && ('height' in b || 'width' in b) && (c.overflow = [
      o.overflow,
      o.overflowX,
      o.overflowY
    ], j = n.css(a, 'display'), k = 'none' === j ? L.get(a, 'olddisplay') || tb(a.nodeName) : j, 'inline' === k && 'none' === n.css(a, 'float') && (o.display = 'inline-block')), c.overflow && (o.overflow = 'hidden', l.always(function () {
      o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2];
    }));
    for (d in b)
      if (e = b[d], Nb.exec(e)) {
        if (delete b[d], f = f || 'toggle' === e, e === (p ? 'hide' : 'show')) {
          if ('show' !== e || !q || void 0 === q[d])
            continue;
          p = !0;
        }
        m[d] = q && q[d] || n.style(a, d);
      } else
        j = void 0;
    if (n.isEmptyObject(m))
      'inline' === ('none' === j ? tb(a.nodeName) : j) && (o.display = j);
    else {
      q ? 'hidden' in q && (p = q.hidden) : q = L.access(a, 'fxshow', {}), f && (q.hidden = !p), p ? n(a).show() : l.done(function () {
        n(a).hide();
      }), l.done(function () {
        var b;
        L.remove(a, 'fxshow');
        for (b in m)
          n.style(a, b, m[b]);
      });
      for (d in m)
        g = Ub(p ? q[d] : 0, d, l), d in q || (q[d] = g.start, p && (g.end = g.start, g.start = 'width' === d || 'height' === d ? 1 : 0));
    }
  }
  function Wb(a, b) {
    var c, d, e, f, g;
    for (c in a)
      if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && 'expand' in g) {
        f = g.expand(f), delete a[d];
        for (c in f)
          c in a || (a[c] = f[c], b[c] = e);
      } else
        b[d] = e;
  }
  function Xb(a, b, c) {
    var d, e, f = 0, g = Qb.length, h = n.Deferred().always(function () {
        delete i.elem;
      }), i = function () {
        if (e)
          return !1;
        for (var b = Lb || Sb(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++)
          j.tweens[g].run(f);
        return h.notifyWith(a, [
          j,
          f,
          c
        ]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1);
      }, j = h.promise({
        elem: a,
        props: n.extend({}, b),
        opts: n.extend(!0, { specialEasing: {} }, c),
        originalProperties: b,
        originalOptions: c,
        startTime: Lb || Sb(),
        duration: c.duration,
        tweens: [],
        createTween: function (b, c) {
          var d = n.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
          return j.tweens.push(d), d;
        },
        stop: function (b) {
          var c = 0, d = b ? j.tweens.length : 0;
          if (e)
            return this;
          for (e = !0; d > c; c++)
            j.tweens[c].run(1);
          return b ? h.resolveWith(a, [
            j,
            b
          ]) : h.rejectWith(a, [
            j,
            b
          ]), this;
        }
      }), k = j.props;
    for (Wb(k, j.opts.specialEasing); g > f; f++)
      if (d = Qb[f].call(j, a, k, j.opts))
        return d;
    return n.map(k, Ub, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, {
      elem: a,
      anim: j,
      queue: j.opts.queue
    })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
  }
  n.Animation = n.extend(Xb, {
    tweener: function (a, b) {
      n.isFunction(a) ? (b = a, a = ['*']) : a = a.split(' ');
      for (var c, d = 0, e = a.length; e > d; d++)
        c = a[d], Rb[c] = Rb[c] || [], Rb[c].unshift(b);
    },
    prefilter: function (a, b) {
      b ? Qb.unshift(a) : Qb.push(a);
    }
  }), n.speed = function (a, b, c) {
    var d = a && 'object' == typeof a ? n.extend({}, a) : {
        complete: c || !c && b || n.isFunction(a) && a,
        duration: a,
        easing: c && b || b && !n.isFunction(b) && b
      };
    return d.duration = n.fx.off ? 0 : 'number' == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = 'fx'), d.old = d.complete, d.complete = function () {
      n.isFunction(d.old) && d.old.call(this), d.queue && n.dequeue(this, d.queue);
    }, d;
  }, n.fn.extend({
    fadeTo: function (a, b, c, d) {
      return this.filter(S).css('opacity', 0).show().end().animate({ opacity: b }, a, c, d);
    },
    animate: function (a, b, c, d) {
      var e = n.isEmptyObject(a), f = n.speed(b, c, d), g = function () {
          var b = Xb(this, n.extend({}, a), f);
          (e || L.get(this, 'finish')) && b.stop(!0);
        };
      return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
    },
    stop: function (a, b, c) {
      var d = function (a) {
        var b = a.stop;
        delete a.stop, b(c);
      };
      return 'string' != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || 'fx', []), this.each(function () {
        var b = !0, e = null != a && a + 'queueHooks', f = n.timers, g = L.get(this);
        if (e)
          g[e] && g[e].stop && d(g[e]);
        else
          for (e in g)
            g[e] && g[e].stop && Pb.test(e) && d(g[e]);
        for (e = f.length; e--;)
          f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));
        (b || !c) && n.dequeue(this, a);
      });
    },
    finish: function (a) {
      return a !== !1 && (a = a || 'fx'), this.each(function () {
        var b, c = L.get(this), d = c[a + 'queue'], e = c[a + 'queueHooks'], f = n.timers, g = d ? d.length : 0;
        for (c.finish = !0, n.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;)
          f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));
        for (b = 0; g > b; b++)
          d[b] && d[b].finish && d[b].finish.call(this);
        delete c.finish;
      });
    }
  }), n.each([
    'toggle',
    'show',
    'hide'
  ], function (a, b) {
    var c = n.fn[b];
    n.fn[b] = function (a, d, e) {
      return null == a || 'boolean' == typeof a ? c.apply(this, arguments) : this.animate(Tb(b, !0), a, d, e);
    };
  }), n.each({
    slideDown: Tb('show'),
    slideUp: Tb('hide'),
    slideToggle: Tb('toggle'),
    fadeIn: { opacity: 'show' },
    fadeOut: { opacity: 'hide' },
    fadeToggle: { opacity: 'toggle' }
  }, function (a, b) {
    n.fn[a] = function (a, c, d) {
      return this.animate(b, a, c, d);
    };
  }), n.timers = [], n.fx.tick = function () {
    var a, b = 0, c = n.timers;
    for (Lb = n.now(); b < c.length; b++)
      a = c[b], a() || c[b] !== a || c.splice(b--, 1);
    c.length || n.fx.stop(), Lb = void 0;
  }, n.fx.timer = function (a) {
    n.timers.push(a), a() ? n.fx.start() : n.timers.pop();
  }, n.fx.interval = 13, n.fx.start = function () {
    Mb || (Mb = setInterval(n.fx.tick, n.fx.interval));
  }, n.fx.stop = function () {
    clearInterval(Mb), Mb = null;
  }, n.fx.speeds = {
    slow: 600,
    fast: 200,
    _default: 400
  }, n.fn.delay = function (a, b) {
    return a = n.fx ? n.fx.speeds[a] || a : a, b = b || 'fx', this.queue(b, function (b, c) {
      var d = setTimeout(b, a);
      c.stop = function () {
        clearTimeout(d);
      };
    });
  }, function () {
    var a = l.createElement('input'), b = l.createElement('select'), c = b.appendChild(l.createElement('option'));
    a.type = 'checkbox', k.checkOn = '' !== a.value, k.optSelected = c.selected, b.disabled = !0, k.optDisabled = !c.disabled, a = l.createElement('input'), a.value = 't', a.type = 'radio', k.radioValue = 't' === a.value;
  }();
  var Yb, Zb, $b = n.expr.attrHandle;
  n.fn.extend({
    attr: function (a, b) {
      return J(this, n.attr, a, b, arguments.length > 1);
    },
    removeAttr: function (a) {
      return this.each(function () {
        n.removeAttr(this, a);
      });
    }
  }), n.extend({
    attr: function (a, b, c) {
      var d, e, f = a.nodeType;
      if (a && 3 !== f && 8 !== f && 2 !== f)
        return typeof a.getAttribute === U ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), d = n.attrHooks[b] || (n.expr.match.bool.test(b) ? Zb : Yb)), void 0 === c ? d && 'get' in d && null !== (e = d.get(a, b)) ? e : (e = n.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && 'set' in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ''), c) : void n.removeAttr(a, b));
    },
    removeAttr: function (a, b) {
      var c, d, e = 0, f = b && b.match(E);
      if (f && 1 === a.nodeType)
        while (c = f[e++])
          d = n.propFix[c] || c, n.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c);
    },
    attrHooks: {
      type: {
        set: function (a, b) {
          if (!k.radioValue && 'radio' === b && n.nodeName(a, 'input')) {
            var c = a.value;
            return a.setAttribute('type', b), c && (a.value = c), b;
          }
        }
      }
    }
  }), Zb = {
    set: function (a, b, c) {
      return b === !1 ? n.removeAttr(a, c) : a.setAttribute(c, c), c;
    }
  }, n.each(n.expr.match.bool.source.match(/\w+/g), function (a, b) {
    var c = $b[b] || n.find.attr;
    $b[b] = function (a, b, d) {
      var e, f;
      return d || (f = $b[b], $b[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, $b[b] = f), e;
    };
  });
  var _b = /^(?:input|select|textarea|button)$/i;
  n.fn.extend({
    prop: function (a, b) {
      return J(this, n.prop, a, b, arguments.length > 1);
    },
    removeProp: function (a) {
      return this.each(function () {
        delete this[n.propFix[a] || a];
      });
    }
  }), n.extend({
    propFix: {
      'for': 'htmlFor',
      'class': 'className'
    },
    prop: function (a, b, c) {
      var d, e, f, g = a.nodeType;
      if (a && 3 !== g && 8 !== g && 2 !== g)
        return f = 1 !== g || !n.isXMLDoc(a), f && (b = n.propFix[b] || b, e = n.propHooks[b]), void 0 !== c ? e && 'set' in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && 'get' in e && null !== (d = e.get(a, b)) ? d : a[b];
    },
    propHooks: {
      tabIndex: {
        get: function (a) {
          return a.hasAttribute('tabindex') || _b.test(a.nodeName) || a.href ? a.tabIndex : -1;
        }
      }
    }
  }), k.optSelected || (n.propHooks.selected = {
    get: function (a) {
      var b = a.parentNode;
      return b && b.parentNode && b.parentNode.selectedIndex, null;
    }
  }), n.each([
    'tabIndex',
    'readOnly',
    'maxLength',
    'cellSpacing',
    'cellPadding',
    'rowSpan',
    'colSpan',
    'useMap',
    'frameBorder',
    'contentEditable'
  ], function () {
    n.propFix[this.toLowerCase()] = this;
  });
  var ac = /[\t\r\n\f]/g;
  n.fn.extend({
    addClass: function (a) {
      var b, c, d, e, f, g, h = 'string' == typeof a && a, i = 0, j = this.length;
      if (n.isFunction(a))
        return this.each(function (b) {
          n(this).addClass(a.call(this, b, this.className));
        });
      if (h)
        for (b = (a || '').match(E) || []; j > i; i++)
          if (c = this[i], d = 1 === c.nodeType && (c.className ? (' ' + c.className + ' ').replace(ac, ' ') : ' ')) {
            f = 0;
            while (e = b[f++])
              d.indexOf(' ' + e + ' ') < 0 && (d += e + ' ');
            g = n.trim(d), c.className !== g && (c.className = g);
          }
      return this;
    },
    removeClass: function (a) {
      var b, c, d, e, f, g, h = 0 === arguments.length || 'string' == typeof a && a, i = 0, j = this.length;
      if (n.isFunction(a))
        return this.each(function (b) {
          n(this).removeClass(a.call(this, b, this.className));
        });
      if (h)
        for (b = (a || '').match(E) || []; j > i; i++)
          if (c = this[i], d = 1 === c.nodeType && (c.className ? (' ' + c.className + ' ').replace(ac, ' ') : '')) {
            f = 0;
            while (e = b[f++])
              while (d.indexOf(' ' + e + ' ') >= 0)
                d = d.replace(' ' + e + ' ', ' ');
            g = a ? n.trim(d) : '', c.className !== g && (c.className = g);
          }
      return this;
    },
    toggleClass: function (a, b) {
      var c = typeof a;
      return 'boolean' == typeof b && 'string' === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(n.isFunction(a) ? function (c) {
        n(this).toggleClass(a.call(this, c, this.className, b), b);
      } : function () {
        if ('string' === c) {
          var b, d = 0, e = n(this), f = a.match(E) || [];
          while (b = f[d++])
            e.hasClass(b) ? e.removeClass(b) : e.addClass(b);
        } else
          (c === U || 'boolean' === c) && (this.className && L.set(this, '__className__', this.className), this.className = this.className || a === !1 ? '' : L.get(this, '__className__') || '');
      });
    },
    hasClass: function (a) {
      for (var b = ' ' + a + ' ', c = 0, d = this.length; d > c; c++)
        if (1 === this[c].nodeType && (' ' + this[c].className + ' ').replace(ac, ' ').indexOf(b) >= 0)
          return !0;
      return !1;
    }
  });
  var bc = /\r/g;
  n.fn.extend({
    val: function (a) {
      var b, c, d, e = this[0];
      {
        if (arguments.length)
          return d = n.isFunction(a), this.each(function (c) {
            var e;
            1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = '' : 'number' == typeof e ? e += '' : n.isArray(e) && (e = n.map(e, function (a) {
              return null == a ? '' : a + '';
            })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && 'set' in b && void 0 !== b.set(this, e, 'value') || (this.value = e));
          });
        if (e)
          return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && 'get' in b && void 0 !== (c = b.get(e, 'value')) ? c : (c = e.value, 'string' == typeof c ? c.replace(bc, '') : null == c ? '' : c);
      }
    }
  }), n.extend({
    valHooks: {
      option: {
        get: function (a) {
          var b = n.find.attr(a, 'value');
          return null != b ? b : n.trim(n.text(a));
        }
      },
      select: {
        get: function (a) {
          for (var b, c, d = a.options, e = a.selectedIndex, f = 'select-one' === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)
            if (c = d[i], !(!c.selected && i !== e || (k.optDisabled ? c.disabled : null !== c.getAttribute('disabled')) || c.parentNode.disabled && n.nodeName(c.parentNode, 'optgroup'))) {
              if (b = n(c).val(), f)
                return b;
              g.push(b);
            }
          return g;
        },
        set: function (a, b) {
          var c, d, e = a.options, f = n.makeArray(b), g = e.length;
          while (g--)
            d = e[g], (d.selected = n.inArray(d.value, f) >= 0) && (c = !0);
          return c || (a.selectedIndex = -1), f;
        }
      }
    }
  }), n.each([
    'radio',
    'checkbox'
  ], function () {
    n.valHooks[this] = {
      set: function (a, b) {
        return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) >= 0 : void 0;
      }
    }, k.checkOn || (n.valHooks[this].get = function (a) {
      return null === a.getAttribute('value') ? 'on' : a.value;
    });
  }), n.each('blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu'.split(' '), function (a, b) {
    n.fn[b] = function (a, c) {
      return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
    };
  }), n.fn.extend({
    hover: function (a, b) {
      return this.mouseenter(a).mouseleave(b || a);
    },
    bind: function (a, b, c) {
      return this.on(a, null, b, c);
    },
    unbind: function (a, b) {
      return this.off(a, null, b);
    },
    delegate: function (a, b, c, d) {
      return this.on(b, a, c, d);
    },
    undelegate: function (a, b, c) {
      return 1 === arguments.length ? this.off(a, '**') : this.off(b, a || '**', c);
    }
  });
  var cc = n.now(), dc = /\?/;
  n.parseJSON = function (a) {
    return JSON.parse(a + '');
  }, n.parseXML = function (a) {
    var b, c;
    if (!a || 'string' != typeof a)
      return null;
    try {
      c = new DOMParser(), b = c.parseFromString(a, 'text/xml');
    } catch (d) {
      b = void 0;
    }
    return (!b || b.getElementsByTagName('parsererror').length) && n.error('Invalid XML: ' + a), b;
  };
  var ec = /#.*$/, fc = /([?&])_=[^&]*/, gc = /^(.*?):[ \t]*([^\r\n]*)$/gm, hc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, ic = /^(?:GET|HEAD)$/, jc = /^\/\//, kc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, lc = {}, mc = {}, nc = '*/'.concat('*'), oc = a.location.href, pc = kc.exec(oc.toLowerCase()) || [];
  function qc(a) {
    return function (b, c) {
      'string' != typeof b && (c = b, b = '*');
      var d, e = 0, f = b.toLowerCase().match(E) || [];
      if (n.isFunction(c))
        while (d = f[e++])
          '+' === d[0] ? (d = d.slice(1) || '*', (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c);
    };
  }
  function rc(a, b, c, d) {
    var e = {}, f = a === mc;
    function g(h) {
      var i;
      return e[h] = !0, n.each(a[h] || [], function (a, h) {
        var j = h(b, c, d);
        return 'string' != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1);
      }), i;
    }
    return g(b.dataTypes[0]) || !e['*'] && g('*');
  }
  function sc(a, b) {
    var c, d, e = n.ajaxSettings.flatOptions || {};
    for (c in b)
      void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]);
    return d && n.extend(!0, a, d), a;
  }
  function tc(a, b, c) {
    var d, e, f, g, h = a.contents, i = a.dataTypes;
    while ('*' === i[0])
      i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader('Content-Type'));
    if (d)
      for (e in h)
        if (h[e] && h[e].test(d)) {
          i.unshift(e);
          break;
        }
    if (i[0] in c)
      f = i[0];
    else {
      for (e in c) {
        if (!i[0] || a.converters[e + ' ' + i[0]]) {
          f = e;
          break;
        }
        g || (g = e);
      }
      f = f || g;
    }
    return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0;
  }
  function uc(a, b, c, d) {
    var e, f, g, h, i, j = {}, k = a.dataTypes.slice();
    if (k[1])
      for (g in a.converters)
        j[g.toLowerCase()] = a.converters[g];
    f = k.shift();
    while (f)
      if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift())
        if ('*' === f)
          f = i;
        else if ('*' !== i && i !== f) {
          if (g = j[i + ' ' + f] || j['* ' + f], !g)
            for (e in j)
              if (h = e.split(' '), h[1] === f && (g = j[i + ' ' + h[0]] || j['* ' + h[0]])) {
                g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                break;
              }
          if (g !== !0)
            if (g && a['throws'])
              b = g(b);
            else
              try {
                b = g(b);
              } catch (l) {
                return {
                  state: 'parsererror',
                  error: g ? l : 'No conversion from ' + i + ' to ' + f
                };
              }
        }
    return {
      state: 'success',
      data: b
    };
  }
  n.extend({
    active: 0,
    lastModified: {},
    etag: {},
    ajaxSettings: {
      url: oc,
      type: 'GET',
      isLocal: hc.test(pc[1]),
      global: !0,
      processData: !0,
      async: !0,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      accepts: {
        '*': nc,
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript'
      },
      contents: {
        xml: /xml/,
        html: /html/,
        json: /json/
      },
      responseFields: {
        xml: 'responseXML',
        text: 'responseText',
        json: 'responseJSON'
      },
      converters: {
        '* text': String,
        'text html': !0,
        'text json': n.parseJSON,
        'text xml': n.parseXML
      },
      flatOptions: {
        url: !0,
        context: !0
      }
    },
    ajaxSetup: function (a, b) {
      return b ? sc(sc(a, n.ajaxSettings), b) : sc(n.ajaxSettings, a);
    },
    ajaxPrefilter: qc(lc),
    ajaxTransport: qc(mc),
    ajax: function (a, b) {
      'object' == typeof a && (b = a, a = void 0), b = b || {};
      var c, d, e, f, g, h, i, j, k = n.ajaxSetup({}, b), l = k.context || k, m = k.context && (l.nodeType || l.jquery) ? n(l) : n.event, o = n.Deferred(), p = n.Callbacks('once memory'), q = k.statusCode || {}, r = {}, s = {}, t = 0, u = 'canceled', v = {
          readyState: 0,
          getResponseHeader: function (a) {
            var b;
            if (2 === t) {
              if (!f) {
                f = {};
                while (b = gc.exec(e))
                  f[b[1].toLowerCase()] = b[2];
              }
              b = f[a.toLowerCase()];
            }
            return null == b ? null : b;
          },
          getAllResponseHeaders: function () {
            return 2 === t ? e : null;
          },
          setRequestHeader: function (a, b) {
            var c = a.toLowerCase();
            return t || (a = s[c] = s[c] || a, r[a] = b), this;
          },
          overrideMimeType: function (a) {
            return t || (k.mimeType = a), this;
          },
          statusCode: function (a) {
            var b;
            if (a)
              if (2 > t)
                for (b in a)
                  q[b] = [
                    q[b],
                    a[b]
                  ];
              else
                v.always(a[v.status]);
            return this;
          },
          abort: function (a) {
            var b = a || u;
            return c && c.abort(b), x(0, b), this;
          }
        };
      if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || oc) + '').replace(ec, '').replace(jc, pc[1] + '//'), k.type = b.method || b.type || k.method || k.type, k.dataTypes = n.trim(k.dataType || '*').toLowerCase().match(E) || [''], null == k.crossDomain && (h = kc.exec(k.url.toLowerCase()), k.crossDomain = !(!h || h[1] === pc[1] && h[2] === pc[2] && (h[3] || ('http:' === h[1] ? '80' : '443')) === (pc[3] || ('http:' === pc[1] ? '80' : '443')))), k.data && k.processData && 'string' != typeof k.data && (k.data = n.param(k.data, k.traditional)), rc(lc, k, b, v), 2 === t)
        return v;
      i = n.event && k.global, i && 0 === n.active++ && n.event.trigger('ajaxStart'), k.type = k.type.toUpperCase(), k.hasContent = !ic.test(k.type), d = k.url, k.hasContent || (k.data && (d = k.url += (dc.test(d) ? '&' : '?') + k.data, delete k.data), k.cache === !1 && (k.url = fc.test(d) ? d.replace(fc, '$1_=' + cc++) : d + (dc.test(d) ? '&' : '?') + '_=' + cc++)), k.ifModified && (n.lastModified[d] && v.setRequestHeader('If-Modified-Since', n.lastModified[d]), n.etag[d] && v.setRequestHeader('If-None-Match', n.etag[d])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader('Content-Type', k.contentType), v.setRequestHeader('Accept', k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ('*' !== k.dataTypes[0] ? ', ' + nc + '; q=0.01' : '') : k.accepts['*']);
      for (j in k.headers)
        v.setRequestHeader(j, k.headers[j]);
      if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t))
        return v.abort();
      u = 'abort';
      for (j in {
          success: 1,
          error: 1,
          complete: 1
        })
        v[j](k[j]);
      if (c = rc(mc, k, b, v)) {
        v.readyState = 1, i && m.trigger('ajaxSend', [
          v,
          k
        ]), k.async && k.timeout > 0 && (g = setTimeout(function () {
          v.abort('timeout');
        }, k.timeout));
        try {
          t = 1, c.send(r, x);
        } catch (w) {
          if (!(2 > t))
            throw w;
          x(-1, w);
        }
      } else
        x(-1, 'No Transport');
      function x(a, b, f, h) {
        var j, r, s, u, w, x = b;
        2 !== t && (t = 2, g && clearTimeout(g), c = void 0, e = h || '', v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, f && (u = tc(k, v, f)), u = uc(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader('Last-Modified'), w && (n.lastModified[d] = w), w = v.getResponseHeader('etag'), w && (n.etag[d] = w)), 204 === a || 'HEAD' === k.type ? x = 'nocontent' : 304 === a ? x = 'notmodified' : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = 'error', 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + '', j ? o.resolveWith(l, [
          r,
          x,
          v
        ]) : o.rejectWith(l, [
          v,
          x,
          s
        ]), v.statusCode(q), q = void 0, i && m.trigger(j ? 'ajaxSuccess' : 'ajaxError', [
          v,
          k,
          j ? r : s
        ]), p.fireWith(l, [
          v,
          x
        ]), i && (m.trigger('ajaxComplete', [
          v,
          k
        ]), --n.active || n.event.trigger('ajaxStop')));
      }
      return v;
    },
    getJSON: function (a, b, c) {
      return n.get(a, b, c, 'json');
    },
    getScript: function (a, b) {
      return n.get(a, void 0, b, 'script');
    }
  }), n.each([
    'get',
    'post'
  ], function (a, b) {
    n[b] = function (a, c, d, e) {
      return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax({
        url: a,
        type: b,
        dataType: e,
        data: c,
        success: d
      });
    };
  }), n._evalUrl = function (a) {
    return n.ajax({
      url: a,
      type: 'GET',
      dataType: 'script',
      async: !1,
      global: !1,
      'throws': !0
    });
  }, n.fn.extend({
    wrapAll: function (a) {
      var b;
      return n.isFunction(a) ? this.each(function (b) {
        n(this).wrapAll(a.call(this, b));
      }) : (this[0] && (b = n(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function () {
        var a = this;
        while (a.firstElementChild)
          a = a.firstElementChild;
        return a;
      }).append(this)), this);
    },
    wrapInner: function (a) {
      return this.each(n.isFunction(a) ? function (b) {
        n(this).wrapInner(a.call(this, b));
      } : function () {
        var b = n(this), c = b.contents();
        c.length ? c.wrapAll(a) : b.append(a);
      });
    },
    wrap: function (a) {
      var b = n.isFunction(a);
      return this.each(function (c) {
        n(this).wrapAll(b ? a.call(this, c) : a);
      });
    },
    unwrap: function () {
      return this.parent().each(function () {
        n.nodeName(this, 'body') || n(this).replaceWith(this.childNodes);
      }).end();
    }
  }), n.expr.filters.hidden = function (a) {
    return a.offsetWidth <= 0 && a.offsetHeight <= 0;
  }, n.expr.filters.visible = function (a) {
    return !n.expr.filters.hidden(a);
  };
  var vc = /%20/g, wc = /\[\]$/, xc = /\r?\n/g, yc = /^(?:submit|button|image|reset|file)$/i, zc = /^(?:input|select|textarea|keygen)/i;
  function Ac(a, b, c, d) {
    var e;
    if (n.isArray(b))
      n.each(b, function (b, e) {
        c || wc.test(a) ? d(a, e) : Ac(a + '[' + ('object' == typeof e ? b : '') + ']', e, c, d);
      });
    else if (c || 'object' !== n.type(b))
      d(a, b);
    else
      for (e in b)
        Ac(a + '[' + e + ']', b[e], c, d);
  }
  n.param = function (a, b) {
    var c, d = [], e = function (a, b) {
        b = n.isFunction(b) ? b() : null == b ? '' : b, d[d.length] = encodeURIComponent(a) + '=' + encodeURIComponent(b);
      };
    if (void 0 === b && (b = n.ajaxSettings && n.ajaxSettings.traditional), n.isArray(a) || a.jquery && !n.isPlainObject(a))
      n.each(a, function () {
        e(this.name, this.value);
      });
    else
      for (c in a)
        Ac(c, a[c], b, e);
    return d.join('&').replace(vc, '+');
  }, n.fn.extend({
    serialize: function () {
      return n.param(this.serializeArray());
    },
    serializeArray: function () {
      return this.map(function () {
        var a = n.prop(this, 'elements');
        return a ? n.makeArray(a) : this;
      }).filter(function () {
        var a = this.type;
        return this.name && !n(this).is(':disabled') && zc.test(this.nodeName) && !yc.test(a) && (this.checked || !T.test(a));
      }).map(function (a, b) {
        var c = n(this).val();
        return null == c ? null : n.isArray(c) ? n.map(c, function (a) {
          return {
            name: b.name,
            value: a.replace(xc, '\r\n')
          };
        }) : {
          name: b.name,
          value: c.replace(xc, '\r\n')
        };
      }).get();
    }
  }), n.ajaxSettings.xhr = function () {
    try {
      return new XMLHttpRequest();
    } catch (a) {
    }
  };
  var Bc = 0, Cc = {}, Dc = {
      0: 200,
      1223: 204
    }, Ec = n.ajaxSettings.xhr();
  a.attachEvent && a.attachEvent('onunload', function () {
    for (var a in Cc)
      Cc[a]();
  }), k.cors = !!Ec && 'withCredentials' in Ec, k.ajax = Ec = !!Ec, n.ajaxTransport(function (a) {
    var b;
    return k.cors || Ec && !a.crossDomain ? {
      send: function (c, d) {
        var e, f = a.xhr(), g = ++Bc;
        if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields)
          for (e in a.xhrFields)
            f[e] = a.xhrFields[e];
        a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c['X-Requested-With'] || (c['X-Requested-With'] = 'XMLHttpRequest');
        for (e in c)
          f.setRequestHeader(e, c[e]);
        b = function (a) {
          return function () {
            b && (delete Cc[g], b = f.onload = f.onerror = null, 'abort' === a ? f.abort() : 'error' === a ? d(f.status, f.statusText) : d(Dc[f.status] || f.status, f.statusText, 'string' == typeof f.responseText ? { text: f.responseText } : void 0, f.getAllResponseHeaders()));
          };
        }, f.onload = b(), f.onerror = b('error'), b = Cc[g] = b('abort');
        try {
          f.send(a.hasContent && a.data || null);
        } catch (h) {
          if (b)
            throw h;
        }
      },
      abort: function () {
        b && b();
      }
    } : void 0;
  }), n.ajaxSetup({
    accepts: { script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript' },
    contents: { script: /(?:java|ecma)script/ },
    converters: {
      'text script': function (a) {
        return n.globalEval(a), a;
      }
    }
  }), n.ajaxPrefilter('script', function (a) {
    void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = 'GET');
  }), n.ajaxTransport('script', function (a) {
    if (a.crossDomain) {
      var b, c;
      return {
        send: function (d, e) {
          b = n('<script>').prop({
            async: !0,
            charset: a.scriptCharset,
            src: a.url
          }).on('load error', c = function (a) {
            b.remove(), c = null, a && e('error' === a.type ? 404 : 200, a.type);
          }), l.head.appendChild(b[0]);
        },
        abort: function () {
          c && c();
        }
      };
    }
  });
  var Fc = [], Gc = /(=)\?(?=&|$)|\?\?/;
  n.ajaxSetup({
    jsonp: 'callback',
    jsonpCallback: function () {
      var a = Fc.pop() || n.expando + '_' + cc++;
      return this[a] = !0, a;
    }
  }), n.ajaxPrefilter('json jsonp', function (b, c, d) {
    var e, f, g, h = b.jsonp !== !1 && (Gc.test(b.url) ? 'url' : 'string' == typeof b.data && !(b.contentType || '').indexOf('application/x-www-form-urlencoded') && Gc.test(b.data) && 'data');
    return h || 'jsonp' === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Gc, '$1' + e) : b.jsonp !== !1 && (b.url += (dc.test(b.url) ? '&' : '?') + b.jsonp + '=' + e), b.converters['script json'] = function () {
      return g || n.error(e + ' was not called'), g[0];
    }, b.dataTypes[0] = 'json', f = a[e], a[e] = function () {
      g = arguments;
    }, d.always(function () {
      a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Fc.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0;
    }), 'script') : void 0;
  }), n.parseHTML = function (a, b, c) {
    if (!a || 'string' != typeof a)
      return null;
    'boolean' == typeof b && (c = b, b = !1), b = b || l;
    var d = v.exec(a), e = !c && [];
    return d ? [b.createElement(d[1])] : (d = n.buildFragment([a], b, e), e && e.length && n(e).remove(), n.merge([], d.childNodes));
  };
  var Hc = n.fn.load;
  n.fn.load = function (a, b, c) {
    if ('string' != typeof a && Hc)
      return Hc.apply(this, arguments);
    var d, e, f, g = this, h = a.indexOf(' ');
    return h >= 0 && (d = n.trim(a.slice(h)), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && 'object' == typeof b && (e = 'POST'), g.length > 0 && n.ajax({
      url: a,
      type: e,
      dataType: 'html',
      data: b
    }).done(function (a) {
      f = arguments, g.html(d ? n('<div>').append(n.parseHTML(a)).find(d) : a);
    }).complete(c && function (a, b) {
      g.each(c, f || [
        a.responseText,
        b,
        a
      ]);
    }), this;
  }, n.each([
    'ajaxStart',
    'ajaxStop',
    'ajaxComplete',
    'ajaxError',
    'ajaxSuccess',
    'ajaxSend'
  ], function (a, b) {
    n.fn[b] = function (a) {
      return this.on(b, a);
    };
  }), n.expr.filters.animated = function (a) {
    return n.grep(n.timers, function (b) {
      return a === b.elem;
    }).length;
  };
  var Ic = a.document.documentElement;
  function Jc(a) {
    return n.isWindow(a) ? a : 9 === a.nodeType && a.defaultView;
  }
  n.offset = {
    setOffset: function (a, b, c) {
      var d, e, f, g, h, i, j, k = n.css(a, 'position'), l = n(a), m = {};
      'static' === k && (a.style.position = 'relative'), h = l.offset(), f = n.css(a, 'top'), i = n.css(a, 'left'), j = ('absolute' === k || 'fixed' === k) && (f + i).indexOf('auto') > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), 'using' in b ? b.using.call(a, m) : l.css(m);
    }
  }, n.fn.extend({
    offset: function (a) {
      if (arguments.length)
        return void 0 === a ? this : this.each(function (b) {
          n.offset.setOffset(this, a, b);
        });
      var b, c, d = this[0], e = {
          top: 0,
          left: 0
        }, f = d && d.ownerDocument;
      if (f)
        return b = f.documentElement, n.contains(b, d) ? (typeof d.getBoundingClientRect !== U && (e = d.getBoundingClientRect()), c = Jc(f), {
          top: e.top + c.pageYOffset - b.clientTop,
          left: e.left + c.pageXOffset - b.clientLeft
        }) : e;
    },
    position: function () {
      if (this[0]) {
        var a, b, c = this[0], d = {
            top: 0,
            left: 0
          };
        return 'fixed' === n.css(c, 'position') ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], 'html') || (d = a.offset()), d.top += n.css(a[0], 'borderTopWidth', !0), d.left += n.css(a[0], 'borderLeftWidth', !0)), {
          top: b.top - d.top - n.css(c, 'marginTop', !0),
          left: b.left - d.left - n.css(c, 'marginLeft', !0)
        };
      }
    },
    offsetParent: function () {
      return this.map(function () {
        var a = this.offsetParent || Ic;
        while (a && !n.nodeName(a, 'html') && 'static' === n.css(a, 'position'))
          a = a.offsetParent;
        return a || Ic;
      });
    }
  }), n.each({
    scrollLeft: 'pageXOffset',
    scrollTop: 'pageYOffset'
  }, function (b, c) {
    var d = 'pageYOffset' === c;
    n.fn[b] = function (e) {
      return J(this, function (b, e, f) {
        var g = Jc(b);
        return void 0 === f ? g ? g[c] : b[e] : void (g ? g.scrollTo(d ? a.pageXOffset : f, d ? f : a.pageYOffset) : b[e] = f);
      }, b, e, arguments.length, null);
    };
  }), n.each([
    'top',
    'left'
  ], function (a, b) {
    n.cssHooks[b] = yb(k.pixelPosition, function (a, c) {
      return c ? (c = xb(a, b), vb.test(c) ? n(a).position()[b] + 'px' : c) : void 0;
    });
  }), n.each({
    Height: 'height',
    Width: 'width'
  }, function (a, b) {
    n.each({
      padding: 'inner' + a,
      content: b,
      '': 'outer' + a
    }, function (c, d) {
      n.fn[d] = function (d, e) {
        var f = arguments.length && (c || 'boolean' != typeof d), g = c || (d === !0 || e === !0 ? 'margin' : 'border');
        return J(this, function (b, c, d) {
          var e;
          return n.isWindow(b) ? b.document.documentElement['client' + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body['scroll' + a], e['scroll' + a], b.body['offset' + a], e['offset' + a], e['client' + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g);
        }, b, f ? d : void 0, f, null);
      };
    });
  }), n.fn.size = function () {
    return this.length;
  }, n.fn.andSelf = n.fn.addBack, 'function' == typeof define && define.amd && define('jquery', [], function () {
    return n;
  });
  var Kc = a.jQuery, Lc = a.$;
  return n.noConflict = function (b) {
    return a.$ === n && (a.$ = Lc), b && a.jQuery === n && (a.jQuery = Kc), n;
  }, typeof b === U && (a.jQuery = a.$ = n), n;
});
//# sourceMappingURL=jquery.min.map
/*!
 * ZeroClipboard
 * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
 * Copyright (c) 2009-2014 Jon Rohan, James M. Greene
 * Licensed MIT
 * http://zeroclipboard.org/
 * v2.2.0
 */
!function (a, b) {
  'use strict';
  var c, d, e, f = a, g = f.document, h = f.navigator, i = f.setTimeout, j = f.clearTimeout, k = f.setInterval, l = f.clearInterval, m = f.getComputedStyle, n = f.encodeURIComponent, o = f.ActiveXObject, p = f.Error, q = f.Number.parseInt || f.parseInt, r = f.Number.parseFloat || f.parseFloat, s = f.Number.isNaN || f.isNaN, t = f.Date.now, u = f.Object.keys, v = f.Object.defineProperty, w = f.Object.prototype.hasOwnProperty, x = f.Array.prototype.slice, y = function () {
      var a = function (a) {
        return a;
      };
      if ('function' == typeof f.wrap && 'function' == typeof f.unwrap)
        try {
          var b = g.createElement('div'), c = f.unwrap(b);
          1 === b.nodeType && c && 1 === c.nodeType && (a = f.unwrap);
        } catch (d) {
        }
      return a;
    }(), z = function (a) {
      return x.call(a, 0);
    }, A = function () {
      var a, c, d, e, f, g, h = z(arguments), i = h[0] || {};
      for (a = 1, c = h.length; c > a; a++)
        if (null != (d = h[a]))
          for (e in d)
            w.call(d, e) && (f = i[e], g = d[e], i !== g && g !== b && (i[e] = g));
      return i;
    }, B = function (a) {
      var b, c, d, e;
      if ('object' != typeof a || null == a || 'number' == typeof a.nodeType)
        b = a;
      else if ('number' == typeof a.length)
        for (b = [], c = 0, d = a.length; d > c; c++)
          w.call(a, c) && (b[c] = B(a[c]));
      else {
        b = {};
        for (e in a)
          w.call(a, e) && (b[e] = B(a[e]));
      }
      return b;
    }, C = function (a, b) {
      for (var c = {}, d = 0, e = b.length; e > d; d++)
        b[d] in a && (c[b[d]] = a[b[d]]);
      return c;
    }, D = function (a, b) {
      var c = {};
      for (var d in a)
        -1 === b.indexOf(d) && (c[d] = a[d]);
      return c;
    }, E = function (a) {
      if (a)
        for (var b in a)
          w.call(a, b) && delete a[b];
      return a;
    }, F = function (a, b) {
      if (a && 1 === a.nodeType && a.ownerDocument && b && (1 === b.nodeType && b.ownerDocument && b.ownerDocument === a.ownerDocument || 9 === b.nodeType && !b.ownerDocument && b === a.ownerDocument))
        do {
          if (a === b)
            return !0;
          a = a.parentNode;
        } while (a);
      return !1;
    }, G = function (a) {
      var b;
      return 'string' == typeof a && a && (b = a.split('#')[0].split('?')[0], b = a.slice(0, a.lastIndexOf('/') + 1)), b;
    }, H = function (a) {
      var b, c;
      return 'string' == typeof a && a && (c = a.match(/^(?:|[^:@]*@|.+\)@(?=http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/), c && c[1] ? b = c[1] : (c = a.match(/\)@((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/), c && c[1] && (b = c[1]))), b;
    }, I = function () {
      var a, b;
      try {
        throw new p();
      } catch (c) {
        b = c;
      }
      return b && (a = b.sourceURL || b.fileName || H(b.stack)), a;
    }, J = function () {
      var a, c, d;
      if (g.currentScript && (a = g.currentScript.src))
        return a;
      if (c = g.getElementsByTagName('script'), 1 === c.length)
        return c[0].src || b;
      if ('readyState' in c[0])
        for (d = c.length; d--;)
          if ('interactive' === c[d].readyState && (a = c[d].src))
            return a;
      return 'loading' === g.readyState && (a = c[c.length - 1].src) ? a : (a = I()) ? a : b;
    }, K = function () {
      var a, c, d, e = g.getElementsByTagName('script');
      for (a = e.length; a--;) {
        if (!(d = e[a].src)) {
          c = null;
          break;
        }
        if (d = G(d), null == c)
          c = d;
        else if (c !== d) {
          c = null;
          break;
        }
      }
      return c || b;
    }, L = function () {
      var a = G(J()) || K() || '';
      return a + 'ZeroClipboard.swf';
    }, M = function () {
      return null == a.opener && (!!a.top && a != a.top || !!a.parent && a != a.parent);
    }(), N = {
      bridge: null,
      version: '0.0.0',
      pluginType: 'unknown',
      disabled: null,
      outdated: null,
      sandboxed: null,
      unavailable: null,
      degraded: null,
      deactivated: null,
      overdue: null,
      ready: null
    }, O = '11.0.0', P = {}, Q = {}, R = null, S = 0, T = 0, U = {
      ready: 'Flash communication is established',
      error: {
        'flash-disabled': 'Flash is disabled or not installed. May also be attempting to run Flash in a sandboxed iframe, which is impossible.',
        'flash-outdated': 'Flash is too outdated to support ZeroClipboard',
        'flash-sandboxed': 'Attempting to run Flash in a sandboxed iframe, which is impossible',
        'flash-unavailable': 'Flash is unable to communicate bidirectionally with JavaScript',
        'flash-degraded': 'Flash is unable to preserve data fidelity when communicating with JavaScript',
        'flash-deactivated': 'Flash is too outdated for your browser and/or is configured as click-to-activate.\nThis may also mean that the ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity.\nMay also be attempting to run Flash in a sandboxed iframe, which is impossible.',
        'flash-overdue': 'Flash communication was established but NOT within the acceptable time limit',
        'version-mismatch': 'ZeroClipboard JS version number does not match ZeroClipboard SWF version number',
        'clipboard-error': 'At least one error was thrown while ZeroClipboard was attempting to inject your data into the clipboard',
        'config-mismatch': 'ZeroClipboard configuration does not match Flash\'s reality',
        'swf-not-found': 'The ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity'
      }
    }, V = [
      'flash-unavailable',
      'flash-degraded',
      'flash-overdue',
      'version-mismatch',
      'config-mismatch',
      'clipboard-error'
    ], W = [
      'flash-disabled',
      'flash-outdated',
      'flash-sandboxed',
      'flash-unavailable',
      'flash-degraded',
      'flash-deactivated',
      'flash-overdue'
    ], X = new RegExp('^flash-(' + W.map(function (a) {
      return a.replace(/^flash-/, '');
    }).join('|') + ')$'), Y = new RegExp('^flash-(' + W.slice(1).map(function (a) {
      return a.replace(/^flash-/, '');
    }).join('|') + ')$'), Z = {
      swfPath: L(),
      trustedDomains: a.location.host ? [a.location.host] : [],
      cacheBust: !0,
      forceEnhancedClipboard: !1,
      flashLoadTimeout: 30000,
      autoActivate: !0,
      bubbleEvents: !0,
      containerId: 'global-zeroclipboard-html-bridge',
      containerClass: 'global-zeroclipboard-container',
      swfObjectId: 'global-zeroclipboard-flash-bridge',
      hoverClass: 'zeroclipboard-is-hover',
      activeClass: 'zeroclipboard-is-active',
      forceHandCursor: !1,
      title: null,
      zIndex: 999999999
    }, $ = function (a) {
      if ('object' == typeof a && null !== a)
        for (var b in a)
          if (w.call(a, b))
            if (/^(?:forceHandCursor|title|zIndex|bubbleEvents)$/.test(b))
              Z[b] = a[b];
            else if (null == N.bridge)
              if ('containerId' === b || 'swfObjectId' === b) {
                if (!nb(a[b]))
                  throw new Error('The specified `' + b + '` value is not valid as an HTML4 Element ID');
                Z[b] = a[b];
              } else
                Z[b] = a[b];
      {
        if ('string' != typeof a || !a)
          return B(Z);
        if (w.call(Z, a))
          return Z[a];
      }
    }, _ = function () {
      return Tb(), {
        browser: C(h, [
          'userAgent',
          'platform',
          'appName'
        ]),
        flash: D(N, ['bridge']),
        zeroclipboard: {
          version: Vb.version,
          config: Vb.config()
        }
      };
    }, ab = function () {
      return !!(N.disabled || N.outdated || N.sandboxed || N.unavailable || N.degraded || N.deactivated);
    }, bb = function (a, d) {
      var e, f, g, h = {};
      if ('string' == typeof a && a)
        g = a.toLowerCase().split(/\s+/);
      else if ('object' == typeof a && a && 'undefined' == typeof d)
        for (e in a)
          w.call(a, e) && 'string' == typeof e && e && 'function' == typeof a[e] && Vb.on(e, a[e]);
      if (g && g.length) {
        for (e = 0, f = g.length; f > e; e++)
          a = g[e].replace(/^on/, ''), h[a] = !0, P[a] || (P[a] = []), P[a].push(d);
        if (h.ready && N.ready && Vb.emit({ type: 'ready' }), h.error) {
          for (e = 0, f = W.length; f > e; e++)
            if (N[W[e].replace(/^flash-/, '')] === !0) {
              Vb.emit({
                type: 'error',
                name: W[e]
              });
              break;
            }
          c !== b && Vb.version !== c && Vb.emit({
            type: 'error',
            name: 'version-mismatch',
            jsVersion: Vb.version,
            swfVersion: c
          });
        }
      }
      return Vb;
    }, cb = function (a, b) {
      var c, d, e, f, g;
      if (0 === arguments.length)
        f = u(P);
      else if ('string' == typeof a && a)
        f = a.split(/\s+/);
      else if ('object' == typeof a && a && 'undefined' == typeof b)
        for (c in a)
          w.call(a, c) && 'string' == typeof c && c && 'function' == typeof a[c] && Vb.off(c, a[c]);
      if (f && f.length)
        for (c = 0, d = f.length; d > c; c++)
          if (a = f[c].toLowerCase().replace(/^on/, ''), g = P[a], g && g.length)
            if (b)
              for (e = g.indexOf(b); -1 !== e;)
                g.splice(e, 1), e = g.indexOf(b, e);
            else
              g.length = 0;
      return Vb;
    }, db = function (a) {
      var b;
      return b = 'string' == typeof a && a ? B(P[a]) || null : B(P);
    }, eb = function (a) {
      var b, c, d;
      return a = ob(a), a && !vb(a) ? 'ready' === a.type && N.overdue === !0 ? Vb.emit({
        type: 'error',
        name: 'flash-overdue'
      }) : (b = A({}, a), tb.call(this, b), 'copy' === a.type && (d = Db(Q), c = d.data, R = d.formatMap), c) : void 0;
    }, fb = function () {
      var a = N.sandboxed;
      if (Tb(), 'boolean' != typeof N.ready && (N.ready = !1), N.sandboxed !== a && N.sandboxed === !0)
        N.ready = !1, Vb.emit({
          type: 'error',
          name: 'flash-sandboxed'
        });
      else if (!Vb.isFlashUnusable() && null === N.bridge) {
        var b = Z.flashLoadTimeout;
        'number' == typeof b && b >= 0 && (S = i(function () {
          'boolean' != typeof N.deactivated && (N.deactivated = !0), N.deactivated === !0 && Vb.emit({
            type: 'error',
            name: 'flash-deactivated'
          });
        }, b)), N.overdue = !1, Bb();
      }
    }, gb = function () {
      Vb.clearData(), Vb.blur(), Vb.emit('destroy'), Cb(), Vb.off();
    }, hb = function (a, b) {
      var c;
      if ('object' == typeof a && a && 'undefined' == typeof b)
        c = a, Vb.clearData();
      else {
        if ('string' != typeof a || !a)
          return;
        c = {}, c[a] = b;
      }
      for (var d in c)
        'string' == typeof d && d && w.call(c, d) && 'string' == typeof c[d] && c[d] && (Q[d] = c[d]);
    }, ib = function (a) {
      'undefined' == typeof a ? (E(Q), R = null) : 'string' == typeof a && w.call(Q, a) && delete Q[a];
    }, jb = function (a) {
      return 'undefined' == typeof a ? B(Q) : 'string' == typeof a && w.call(Q, a) ? Q[a] : void 0;
    }, kb = function (a) {
      if (a && 1 === a.nodeType) {
        d && (Lb(d, Z.activeClass), d !== a && Lb(d, Z.hoverClass)), d = a, Kb(a, Z.hoverClass);
        var b = a.getAttribute('title') || Z.title;
        if ('string' == typeof b && b) {
          var c = Ab(N.bridge);
          c && c.setAttribute('title', b);
        }
        var e = Z.forceHandCursor === !0 || 'pointer' === Mb(a, 'cursor');
        Rb(e), Qb();
      }
    }, lb = function () {
      var a = Ab(N.bridge);
      a && (a.removeAttribute('title'), a.style.left = '0px', a.style.top = '-9999px', a.style.width = '1px', a.style.height = '1px'), d && (Lb(d, Z.hoverClass), Lb(d, Z.activeClass), d = null);
    }, mb = function () {
      return d || null;
    }, nb = function (a) {
      return 'string' == typeof a && a && /^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(a);
    }, ob = function (a) {
      var b;
      if ('string' == typeof a && a ? (b = a, a = {}) : 'object' == typeof a && a && 'string' == typeof a.type && a.type && (b = a.type), b) {
        b = b.toLowerCase(), !a.target && (/^(copy|aftercopy|_click)$/.test(b) || 'error' === b && 'clipboard-error' === a.name) && (a.target = e), A(a, {
          type: b,
          target: a.target || d || null,
          relatedTarget: a.relatedTarget || null,
          currentTarget: N && N.bridge || null,
          timeStamp: a.timeStamp || t() || null
        });
        var c = U[a.type];
        return 'error' === a.type && a.name && c && (c = c[a.name]), c && (a.message = c), 'ready' === a.type && A(a, {
          target: null,
          version: N.version
        }), 'error' === a.type && (X.test(a.name) && A(a, {
          target: null,
          minimumVersion: O
        }), Y.test(a.name) && A(a, { version: N.version })), 'copy' === a.type && (a.clipboardData = {
          setData: Vb.setData,
          clearData: Vb.clearData
        }), 'aftercopy' === a.type && (a = Eb(a, R)), a.target && !a.relatedTarget && (a.relatedTarget = pb(a.target)), qb(a);
      }
    }, pb = function (a) {
      var b = a && a.getAttribute && a.getAttribute('data-clipboard-target');
      return b ? g.getElementById(b) : null;
    }, qb = function (a) {
      if (a && /^_(?:click|mouse(?:over|out|down|up|move))$/.test(a.type)) {
        var c = a.target, d = '_mouseover' === a.type && a.relatedTarget ? a.relatedTarget : b, e = '_mouseout' === a.type && a.relatedTarget ? a.relatedTarget : b, h = Nb(c), i = f.screenLeft || f.screenX || 0, j = f.screenTop || f.screenY || 0, k = g.body.scrollLeft + g.documentElement.scrollLeft, l = g.body.scrollTop + g.documentElement.scrollTop, m = h.left + ('number' == typeof a._stageX ? a._stageX : 0), n = h.top + ('number' == typeof a._stageY ? a._stageY : 0), o = m - k, p = n - l, q = i + o, r = j + p, s = 'number' == typeof a.movementX ? a.movementX : 0, t = 'number' == typeof a.movementY ? a.movementY : 0;
        delete a._stageX, delete a._stageY, A(a, {
          srcElement: c,
          fromElement: d,
          toElement: e,
          screenX: q,
          screenY: r,
          pageX: m,
          pageY: n,
          clientX: o,
          clientY: p,
          x: o,
          y: p,
          movementX: s,
          movementY: t,
          offsetX: 0,
          offsetY: 0,
          layerX: 0,
          layerY: 0
        });
      }
      return a;
    }, rb = function (a) {
      var b = a && 'string' == typeof a.type && a.type || '';
      return !/^(?:(?:before)?copy|destroy)$/.test(b);
    }, sb = function (a, b, c, d) {
      d ? i(function () {
        a.apply(b, c);
      }, 0) : a.apply(b, c);
    }, tb = function (a) {
      if ('object' == typeof a && a && a.type) {
        var b = rb(a), c = P['*'] || [], d = P[a.type] || [], e = c.concat(d);
        if (e && e.length) {
          var g, h, i, j, k, l = this;
          for (g = 0, h = e.length; h > g; g++)
            i = e[g], j = l, 'string' == typeof i && 'function' == typeof f[i] && (i = f[i]), 'object' == typeof i && i && 'function' == typeof i.handleEvent && (j = i, i = i.handleEvent), 'function' == typeof i && (k = A({}, a), sb(i, j, [k], b));
        }
        return this;
      }
    }, ub = function (a) {
      var b = null;
      return (M === !1 || a && 'error' === a.type && a.name && -1 !== V.indexOf(a.name)) && (b = !1), b;
    }, vb = function (a) {
      var b = a.target || d || null, f = 'swf' === a._source;
      switch (delete a._source, a.type) {
      case 'error':
        var g = 'flash-sandboxed' === a.name || ub(a);
        'boolean' == typeof g && (N.sandboxed = g), -1 !== W.indexOf(a.name) ? A(N, {
          disabled: 'flash-disabled' === a.name,
          outdated: 'flash-outdated' === a.name,
          unavailable: 'flash-unavailable' === a.name,
          degraded: 'flash-degraded' === a.name,
          deactivated: 'flash-deactivated' === a.name,
          overdue: 'flash-overdue' === a.name,
          ready: !1
        }) : 'version-mismatch' === a.name && (c = a.swfVersion, A(N, {
          disabled: !1,
          outdated: !1,
          unavailable: !1,
          degraded: !1,
          deactivated: !1,
          overdue: !1,
          ready: !1
        })), Pb();
        break;
      case 'ready':
        c = a.swfVersion;
        var h = N.deactivated === !0;
        A(N, {
          disabled: !1,
          outdated: !1,
          sandboxed: !1,
          unavailable: !1,
          degraded: !1,
          deactivated: !1,
          overdue: h,
          ready: !h
        }), Pb();
        break;
      case 'beforecopy':
        e = b;
        break;
      case 'copy':
        var i, j, k = a.relatedTarget;
        !Q['text/html'] && !Q['text/plain'] && k && (j = k.value || k.outerHTML || k.innerHTML) && (i = k.value || k.textContent || k.innerText) ? (a.clipboardData.clearData(), a.clipboardData.setData('text/plain', i), j !== i && a.clipboardData.setData('text/html', j)) : !Q['text/plain'] && a.target && (i = a.target.getAttribute('data-clipboard-text')) && (a.clipboardData.clearData(), a.clipboardData.setData('text/plain', i));
        break;
      case 'aftercopy':
        wb(a), Vb.clearData(), b && b !== Jb() && b.focus && b.focus();
        break;
      case '_mouseover':
        Vb.focus(b), Z.bubbleEvents === !0 && f && (b && b !== a.relatedTarget && !F(a.relatedTarget, b) && xb(A({}, a, {
          type: 'mouseenter',
          bubbles: !1,
          cancelable: !1
        })), xb(A({}, a, { type: 'mouseover' })));
        break;
      case '_mouseout':
        Vb.blur(), Z.bubbleEvents === !0 && f && (b && b !== a.relatedTarget && !F(a.relatedTarget, b) && xb(A({}, a, {
          type: 'mouseleave',
          bubbles: !1,
          cancelable: !1
        })), xb(A({}, a, { type: 'mouseout' })));
        break;
      case '_mousedown':
        Kb(b, Z.activeClass), Z.bubbleEvents === !0 && f && xb(A({}, a, { type: a.type.slice(1) }));
        break;
      case '_mouseup':
        Lb(b, Z.activeClass), Z.bubbleEvents === !0 && f && xb(A({}, a, { type: a.type.slice(1) }));
        break;
      case '_click':
        e = null, Z.bubbleEvents === !0 && f && xb(A({}, a, { type: a.type.slice(1) }));
        break;
      case '_mousemove':
        Z.bubbleEvents === !0 && f && xb(A({}, a, { type: a.type.slice(1) }));
      }
      return /^_(?:click|mouse(?:over|out|down|up|move))$/.test(a.type) ? !0 : void 0;
    }, wb = function (a) {
      if (a.errors && a.errors.length > 0) {
        var b = B(a);
        A(b, {
          type: 'error',
          name: 'clipboard-error'
        }), delete b.success, i(function () {
          Vb.emit(b);
        }, 0);
      }
    }, xb = function (a) {
      if (a && 'string' == typeof a.type && a) {
        var b, c = a.target || null, d = c && c.ownerDocument || g, e = {
            view: d.defaultView || f,
            canBubble: !0,
            cancelable: !0,
            detail: 'click' === a.type ? 1 : 0,
            button: 'number' == typeof a.which ? a.which - 1 : 'number' == typeof a.button ? a.button : d.createEvent ? 0 : 1
          }, h = A(e, a);
        c && d.createEvent && c.dispatchEvent && (h = [
          h.type,
          h.canBubble,
          h.cancelable,
          h.view,
          h.detail,
          h.screenX,
          h.screenY,
          h.clientX,
          h.clientY,
          h.ctrlKey,
          h.altKey,
          h.shiftKey,
          h.metaKey,
          h.button,
          h.relatedTarget
        ], b = d.createEvent('MouseEvents'), b.initMouseEvent && (b.initMouseEvent.apply(b, h), b._source = 'js', c.dispatchEvent(b)));
      }
    }, yb = function () {
      var a = Z.flashLoadTimeout;
      if ('number' == typeof a && a >= 0) {
        var b = Math.min(1000, a / 10), c = Z.swfObjectId + '_fallbackContent';
        T = k(function () {
          var a = g.getElementById(c);
          Ob(a) && (Pb(), N.deactivated = null, Vb.emit({
            type: 'error',
            name: 'swf-not-found'
          }));
        }, b);
      }
    }, zb = function () {
      var a = g.createElement('div');
      return a.id = Z.containerId, a.className = Z.containerClass, a.style.position = 'absolute', a.style.left = '0px', a.style.top = '-9999px', a.style.width = '1px', a.style.height = '1px', a.style.zIndex = '' + Sb(Z.zIndex), a;
    }, Ab = function (a) {
      for (var b = a && a.parentNode; b && 'OBJECT' === b.nodeName && b.parentNode;)
        b = b.parentNode;
      return b || null;
    }, Bb = function () {
      var a, b = N.bridge, c = Ab(b);
      if (!b) {
        var d = Ib(f.location.host, Z), e = 'never' === d ? 'none' : 'all', h = Gb(A({ jsVersion: Vb.version }, Z)), i = Z.swfPath + Fb(Z.swfPath, Z);
        c = zb();
        var j = g.createElement('div');
        c.appendChild(j), g.body.appendChild(c);
        var k = g.createElement('div'), l = 'activex' === N.pluginType;
        k.innerHTML = '<object id="' + Z.swfObjectId + '" name="' + Z.swfObjectId + '" width="100%" height="100%" ' + (l ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : 'type="application/x-shockwave-flash" data="' + i + '"') + '>' + (l ? '<param name="movie" value="' + i + '"/>' : '') + '<param name="allowScriptAccess" value="' + d + '"/><param name="allowNetworking" value="' + e + '"/><param name="menu" value="false"/><param name="wmode" value="transparent"/><param name="flashvars" value="' + h + '"/><div id="' + Z.swfObjectId + '_fallbackContent">&nbsp;</div></object>', b = k.firstChild, k = null, y(b).ZeroClipboard = Vb, c.replaceChild(b, j), yb();
      }
      return b || (b = g[Z.swfObjectId], b && (a = b.length) && (b = b[a - 1]), !b && c && (b = c.firstChild)), N.bridge = b || null, b;
    }, Cb = function () {
      var a = N.bridge;
      if (a) {
        var d = Ab(a);
        d && ('activex' === N.pluginType && 'readyState' in a ? (a.style.display = 'none', function e() {
          if (4 === a.readyState) {
            for (var b in a)
              'function' == typeof a[b] && (a[b] = null);
            a.parentNode && a.parentNode.removeChild(a), d.parentNode && d.parentNode.removeChild(d);
          } else
            i(e, 10);
        }()) : (a.parentNode && a.parentNode.removeChild(a), d.parentNode && d.parentNode.removeChild(d))), Pb(), N.ready = null, N.bridge = null, N.deactivated = null, c = b;
      }
    }, Db = function (a) {
      var b = {}, c = {};
      if ('object' == typeof a && a) {
        for (var d in a)
          if (d && w.call(a, d) && 'string' == typeof a[d] && a[d])
            switch (d.toLowerCase()) {
            case 'text/plain':
            case 'text':
            case 'air:text':
            case 'flash:text':
              b.text = a[d], c.text = d;
              break;
            case 'text/html':
            case 'html':
            case 'air:html':
            case 'flash:html':
              b.html = a[d], c.html = d;
              break;
            case 'application/rtf':
            case 'text/rtf':
            case 'rtf':
            case 'richtext':
            case 'air:rtf':
            case 'flash:rtf':
              b.rtf = a[d], c.rtf = d;
            }
        return {
          data: b,
          formatMap: c
        };
      }
    }, Eb = function (a, b) {
      if ('object' != typeof a || !a || 'object' != typeof b || !b)
        return a;
      var c = {};
      for (var d in a)
        if (w.call(a, d))
          if ('errors' === d) {
            c[d] = a[d] ? a[d].slice() : [];
            for (var e = 0, f = c[d].length; f > e; e++)
              c[d][e].format = b[c[d][e].format];
          } else if ('success' !== d && 'data' !== d)
            c[d] = a[d];
          else {
            c[d] = {};
            var g = a[d];
            for (var h in g)
              h && w.call(g, h) && w.call(b, h) && (c[d][b[h]] = g[h]);
          }
      return c;
    }, Fb = function (a, b) {
      var c = null == b || b && b.cacheBust === !0;
      return c ? (-1 === a.indexOf('?') ? '?' : '&') + 'noCache=' + t() : '';
    }, Gb = function (a) {
      var b, c, d, e, g = '', h = [];
      if (a.trustedDomains && ('string' == typeof a.trustedDomains ? e = [a.trustedDomains] : 'object' == typeof a.trustedDomains && 'length' in a.trustedDomains && (e = a.trustedDomains)), e && e.length)
        for (b = 0, c = e.length; c > b; b++)
          if (w.call(e, b) && e[b] && 'string' == typeof e[b]) {
            if (d = Hb(e[b]), !d)
              continue;
            if ('*' === d) {
              h.length = 0, h.push(d);
              break;
            }
            h.push.apply(h, [
              d,
              '//' + d,
              f.location.protocol + '//' + d
            ]);
          }
      return h.length && (g += 'trustedOrigins=' + n(h.join(','))), a.forceEnhancedClipboard === !0 && (g += (g ? '&' : '') + 'forceEnhancedClipboard=true'), 'string' == typeof a.swfObjectId && a.swfObjectId && (g += (g ? '&' : '') + 'swfObjectId=' + n(a.swfObjectId)), 'string' == typeof a.jsVersion && a.jsVersion && (g += (g ? '&' : '') + 'jsVersion=' + n(a.jsVersion)), g;
    }, Hb = function (a) {
      if (null == a || '' === a)
        return null;
      if (a = a.replace(/^\s+|\s+$/g, ''), '' === a)
        return null;
      var b = a.indexOf('//');
      a = -1 === b ? a : a.slice(b + 2);
      var c = a.indexOf('/');
      return a = -1 === c ? a : -1 === b || 0 === c ? null : a.slice(0, c), a && '.swf' === a.slice(-4).toLowerCase() ? null : a || null;
    }, Ib = function () {
      var a = function (a) {
        var b, c, d, e = [];
        if ('string' == typeof a && (a = [a]), 'object' != typeof a || !a || 'number' != typeof a.length)
          return e;
        for (b = 0, c = a.length; c > b; b++)
          if (w.call(a, b) && (d = Hb(a[b]))) {
            if ('*' === d) {
              e.length = 0, e.push('*');
              break;
            }
            -1 === e.indexOf(d) && e.push(d);
          }
        return e;
      };
      return function (b, c) {
        var d = Hb(c.swfPath);
        null === d && (d = b);
        var e = a(c.trustedDomains), f = e.length;
        if (f > 0) {
          if (1 === f && '*' === e[0])
            return 'always';
          if (-1 !== e.indexOf(b))
            return 1 === f && b === d ? 'sameDomain' : 'always';
        }
        return 'never';
      };
    }(), Jb = function () {
      try {
        return g.activeElement;
      } catch (a) {
        return null;
      }
    }, Kb = function (a, b) {
      var c, d, e, f = [];
      if ('string' == typeof b && b && (f = b.split(/\s+/)), a && 1 === a.nodeType && f.length > 0)
        if (a.classList)
          for (c = 0, d = f.length; d > c; c++)
            a.classList.add(f[c]);
        else if (a.hasOwnProperty('className')) {
          for (e = ' ' + a.className + ' ', c = 0, d = f.length; d > c; c++)
            -1 === e.indexOf(' ' + f[c] + ' ') && (e += f[c] + ' ');
          a.className = e.replace(/^\s+|\s+$/g, '');
        }
      return a;
    }, Lb = function (a, b) {
      var c, d, e, f = [];
      if ('string' == typeof b && b && (f = b.split(/\s+/)), a && 1 === a.nodeType && f.length > 0)
        if (a.classList && a.classList.length > 0)
          for (c = 0, d = f.length; d > c; c++)
            a.classList.remove(f[c]);
        else if (a.className) {
          for (e = (' ' + a.className + ' ').replace(/[\r\n\t]/g, ' '), c = 0, d = f.length; d > c; c++)
            e = e.replace(' ' + f[c] + ' ', ' ');
          a.className = e.replace(/^\s+|\s+$/g, '');
        }
      return a;
    }, Mb = function (a, b) {
      var c = m(a, null).getPropertyValue(b);
      return 'cursor' !== b || c && 'auto' !== c || 'A' !== a.nodeName ? c : 'pointer';
    }, Nb = function (a) {
      var b = {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        };
      if (a.getBoundingClientRect) {
        var c = a.getBoundingClientRect(), d = f.pageXOffset, e = f.pageYOffset, h = g.documentElement.clientLeft || 0, i = g.documentElement.clientTop || 0, j = 0, k = 0;
        if ('relative' === Mb(g.body, 'position')) {
          var l = g.body.getBoundingClientRect(), m = g.documentElement.getBoundingClientRect();
          j = l.left - m.left || 0, k = l.top - m.top || 0;
        }
        b.left = c.left + d - h - j, b.top = c.top + e - i - k, b.width = 'width' in c ? c.width : c.right - c.left, b.height = 'height' in c ? c.height : c.bottom - c.top;
      }
      return b;
    }, Ob = function (a) {
      if (!a)
        return !1;
      var b = m(a, null), c = r(b.height) > 0, d = r(b.width) > 0, e = r(b.top) >= 0, f = r(b.left) >= 0, g = c && d && e && f, h = g ? null : Nb(a), i = 'none' !== b.display && 'collapse' !== b.visibility && (g || !!h && (c || h.height > 0) && (d || h.width > 0) && (e || h.top >= 0) && (f || h.left >= 0));
      return i;
    }, Pb = function () {
      j(S), S = 0, l(T), T = 0;
    }, Qb = function () {
      var a;
      if (d && (a = Ab(N.bridge))) {
        var b = Nb(d);
        A(a.style, {
          width: b.width + 'px',
          height: b.height + 'px',
          top: b.top + 'px',
          left: b.left + 'px',
          zIndex: '' + Sb(Z.zIndex)
        });
      }
    }, Rb = function (a) {
      N.ready === !0 && (N.bridge && 'function' == typeof N.bridge.setHandCursor ? N.bridge.setHandCursor(a) : N.ready = !1);
    }, Sb = function (a) {
      if (/^(?:auto|inherit)$/.test(a))
        return a;
      var b;
      return 'number' != typeof a || s(a) ? 'string' == typeof a && (b = Sb(q(a, 10))) : b = a, 'number' == typeof b ? b : 'auto';
    }, Tb = function (b) {
      var c, d, e, f = N.sandboxed, g = null;
      if (b = b === !0, M === !1)
        g = !1;
      else {
        try {
          d = a.frameElement || null;
        } catch (h) {
          e = {
            name: h.name,
            message: h.message
          };
        }
        if (d && 1 === d.nodeType && 'IFRAME' === d.nodeName)
          try {
            g = d.hasAttribute('sandbox');
          } catch (h) {
            g = null;
          }
        else {
          try {
            c = document.domain || null;
          } catch (h) {
            c = null;
          }
          (null === c || e && 'SecurityError' === e.name && /(^|[\s\(\[@])sandbox(es|ed|ing|[\s\.,!\)\]@]|$)/.test(e.message.toLowerCase())) && (g = !0);
        }
      }
      return N.sandboxed = g, f === g || b || Ub(o), g;
    }, Ub = function (a) {
      function b(a) {
        var b = a.match(/[\d]+/g);
        return b.length = 3, b.join('.');
      }
      function c(a) {
        return !!a && (a = a.toLowerCase()) && (/^(pepflashplayer\.dll|libpepflashplayer\.so|pepperflashplayer\.plugin)$/.test(a) || 'chrome.plugin' === a.slice(-13));
      }
      function d(a) {
        a && (i = !0, a.version && (l = b(a.version)), !l && a.description && (l = b(a.description)), a.filename && (k = c(a.filename)));
      }
      var e, f, g, i = !1, j = !1, k = !1, l = '';
      if (h.plugins && h.plugins.length)
        e = h.plugins['Shockwave Flash'], d(e), h.plugins['Shockwave Flash 2.0'] && (i = !0, l = '2.0.0.11');
      else if (h.mimeTypes && h.mimeTypes.length)
        g = h.mimeTypes['application/x-shockwave-flash'], e = g && g.enabledPlugin, d(e);
      else if ('undefined' != typeof a) {
        j = !0;
        try {
          f = new a('ShockwaveFlash.ShockwaveFlash.7'), i = !0, l = b(f.GetVariable('$version'));
        } catch (m) {
          try {
            f = new a('ShockwaveFlash.ShockwaveFlash.6'), i = !0, l = '6.0.21';
          } catch (n) {
            try {
              f = new a('ShockwaveFlash.ShockwaveFlash'), i = !0, l = b(f.GetVariable('$version'));
            } catch (o) {
              j = !1;
            }
          }
        }
      }
      N.disabled = i !== !0, N.outdated = l && r(l) < r(O), N.version = l || '0.0.0', N.pluginType = k ? 'pepper' : j ? 'activex' : i ? 'netscape' : 'unknown';
    };
  Ub(o), Tb(!0);
  var Vb = function () {
    return this instanceof Vb ? void ('function' == typeof Vb._createClient && Vb._createClient.apply(this, z(arguments))) : new Vb();
  };
  v(Vb, 'version', {
    value: '2.2.0',
    writable: !1,
    configurable: !0,
    enumerable: !0
  }), Vb.config = function () {
    return $.apply(this, z(arguments));
  }, Vb.state = function () {
    return _.apply(this, z(arguments));
  }, Vb.isFlashUnusable = function () {
    return ab.apply(this, z(arguments));
  }, Vb.on = function () {
    return bb.apply(this, z(arguments));
  }, Vb.off = function () {
    return cb.apply(this, z(arguments));
  }, Vb.handlers = function () {
    return db.apply(this, z(arguments));
  }, Vb.emit = function () {
    return eb.apply(this, z(arguments));
  }, Vb.create = function () {
    return fb.apply(this, z(arguments));
  }, Vb.destroy = function () {
    return gb.apply(this, z(arguments));
  }, Vb.setData = function () {
    return hb.apply(this, z(arguments));
  }, Vb.clearData = function () {
    return ib.apply(this, z(arguments));
  }, Vb.getData = function () {
    return jb.apply(this, z(arguments));
  }, Vb.focus = Vb.activate = function () {
    return kb.apply(this, z(arguments));
  }, Vb.blur = Vb.deactivate = function () {
    return lb.apply(this, z(arguments));
  }, Vb.activeElement = function () {
    return mb.apply(this, z(arguments));
  };
  var Wb = 0, Xb = {}, Yb = 0, Zb = {}, $b = {};
  A(Z, { autoActivate: !0 });
  var _b = function (a) {
      var b = this;
      b.id = '' + Wb++, Xb[b.id] = {
        instance: b,
        elements: [],
        handlers: {}
      }, a && b.clip(a), Vb.on('*', function (a) {
        return b.emit(a);
      }), Vb.on('destroy', function () {
        b.destroy();
      }), Vb.create();
    }, ac = function (a, d) {
      var e, f, g, h = {}, i = Xb[this.id], j = i && i.handlers;
      if (!i)
        throw new Error('Attempted to add new listener(s) to a destroyed ZeroClipboard client instance');
      if ('string' == typeof a && a)
        g = a.toLowerCase().split(/\s+/);
      else if ('object' == typeof a && a && 'undefined' == typeof d)
        for (e in a)
          w.call(a, e) && 'string' == typeof e && e && 'function' == typeof a[e] && this.on(e, a[e]);
      if (g && g.length) {
        for (e = 0, f = g.length; f > e; e++)
          a = g[e].replace(/^on/, ''), h[a] = !0, j[a] || (j[a] = []), j[a].push(d);
        if (h.ready && N.ready && this.emit({
            type: 'ready',
            client: this
          }), h.error) {
          for (e = 0, f = W.length; f > e; e++)
            if (N[W[e].replace(/^flash-/, '')]) {
              this.emit({
                type: 'error',
                name: W[e],
                client: this
              });
              break;
            }
          c !== b && Vb.version !== c && this.emit({
            type: 'error',
            name: 'version-mismatch',
            jsVersion: Vb.version,
            swfVersion: c
          });
        }
      }
      return this;
    }, bc = function (a, b) {
      var c, d, e, f, g, h = Xb[this.id], i = h && h.handlers;
      if (!i)
        return this;
      if (0 === arguments.length)
        f = u(i);
      else if ('string' == typeof a && a)
        f = a.split(/\s+/);
      else if ('object' == typeof a && a && 'undefined' == typeof b)
        for (c in a)
          w.call(a, c) && 'string' == typeof c && c && 'function' == typeof a[c] && this.off(c, a[c]);
      if (f && f.length)
        for (c = 0, d = f.length; d > c; c++)
          if (a = f[c].toLowerCase().replace(/^on/, ''), g = i[a], g && g.length)
            if (b)
              for (e = g.indexOf(b); -1 !== e;)
                g.splice(e, 1), e = g.indexOf(b, e);
            else
              g.length = 0;
      return this;
    }, cc = function (a) {
      var b = null, c = Xb[this.id] && Xb[this.id].handlers;
      return c && (b = 'string' == typeof a && a ? c[a] ? c[a].slice(0) : [] : B(c)), b;
    }, dc = function (a) {
      if (ic.call(this, a)) {
        'object' == typeof a && a && 'string' == typeof a.type && a.type && (a = A({}, a));
        var b = A({}, ob(a), { client: this });
        jc.call(this, b);
      }
      return this;
    }, ec = function (a) {
      if (!Xb[this.id])
        throw new Error('Attempted to clip element(s) to a destroyed ZeroClipboard client instance');
      a = kc(a);
      for (var b = 0; b < a.length; b++)
        if (w.call(a, b) && a[b] && 1 === a[b].nodeType) {
          a[b].zcClippingId ? -1 === Zb[a[b].zcClippingId].indexOf(this.id) && Zb[a[b].zcClippingId].push(this.id) : (a[b].zcClippingId = 'zcClippingId_' + Yb++, Zb[a[b].zcClippingId] = [this.id], Z.autoActivate === !0 && lc(a[b]));
          var c = Xb[this.id] && Xb[this.id].elements;
          -1 === c.indexOf(a[b]) && c.push(a[b]);
        }
      return this;
    }, fc = function (a) {
      var b = Xb[this.id];
      if (!b)
        return this;
      var c, d = b.elements;
      a = 'undefined' == typeof a ? d.slice(0) : kc(a);
      for (var e = a.length; e--;)
        if (w.call(a, e) && a[e] && 1 === a[e].nodeType) {
          for (c = 0; -1 !== (c = d.indexOf(a[e], c));)
            d.splice(c, 1);
          var f = Zb[a[e].zcClippingId];
          if (f) {
            for (c = 0; -1 !== (c = f.indexOf(this.id, c));)
              f.splice(c, 1);
            0 === f.length && (Z.autoActivate === !0 && mc(a[e]), delete a[e].zcClippingId);
          }
        }
      return this;
    }, gc = function () {
      var a = Xb[this.id];
      return a && a.elements ? a.elements.slice(0) : [];
    }, hc = function () {
      Xb[this.id] && (this.unclip(), this.off(), delete Xb[this.id]);
    }, ic = function (a) {
      if (!a || !a.type)
        return !1;
      if (a.client && a.client !== this)
        return !1;
      var b = Xb[this.id], c = b && b.elements, d = !!c && c.length > 0, e = !a.target || d && -1 !== c.indexOf(a.target), f = a.relatedTarget && d && -1 !== c.indexOf(a.relatedTarget), g = a.client && a.client === this;
      return b && (e || f || g) ? !0 : !1;
    }, jc = function (a) {
      var b = Xb[this.id];
      if ('object' == typeof a && a && a.type && b) {
        var c = rb(a), d = b && b.handlers['*'] || [], e = b && b.handlers[a.type] || [], g = d.concat(e);
        if (g && g.length) {
          var h, i, j, k, l, m = this;
          for (h = 0, i = g.length; i > h; h++)
            j = g[h], k = m, 'string' == typeof j && 'function' == typeof f[j] && (j = f[j]), 'object' == typeof j && j && 'function' == typeof j.handleEvent && (k = j, j = j.handleEvent), 'function' == typeof j && (l = A({}, a), sb(j, k, [l], c));
        }
      }
    }, kc = function (a) {
      return 'string' == typeof a && (a = []), 'number' != typeof a.length ? [a] : a;
    }, lc = function (a) {
      if (a && 1 === a.nodeType) {
        var b = function (a) {
            (a || (a = f.event)) && ('js' !== a._source && (a.stopImmediatePropagation(), a.preventDefault()), delete a._source);
          }, c = function (c) {
            (c || (c = f.event)) && (b(c), Vb.focus(a));
          };
        a.addEventListener('mouseover', c, !1), a.addEventListener('mouseout', b, !1), a.addEventListener('mouseenter', b, !1), a.addEventListener('mouseleave', b, !1), a.addEventListener('mousemove', b, !1), $b[a.zcClippingId] = {
          mouseover: c,
          mouseout: b,
          mouseenter: b,
          mouseleave: b,
          mousemove: b
        };
      }
    }, mc = function (a) {
      if (a && 1 === a.nodeType) {
        var b = $b[a.zcClippingId];
        if ('object' == typeof b && b) {
          for (var c, d, e = [
                'move',
                'leave',
                'enter',
                'out',
                'over'
              ], f = 0, g = e.length; g > f; f++)
            c = 'mouse' + e[f], d = b[c], 'function' == typeof d && a.removeEventListener(c, d, !1);
          delete $b[a.zcClippingId];
        }
      }
    };
  Vb._createClient = function () {
    _b.apply(this, z(arguments));
  }, Vb.prototype.on = function () {
    return ac.apply(this, z(arguments));
  }, Vb.prototype.off = function () {
    return bc.apply(this, z(arguments));
  }, Vb.prototype.handlers = function () {
    return cc.apply(this, z(arguments));
  }, Vb.prototype.emit = function () {
    return dc.apply(this, z(arguments));
  }, Vb.prototype.clip = function () {
    return ec.apply(this, z(arguments));
  }, Vb.prototype.unclip = function () {
    return fc.apply(this, z(arguments));
  }, Vb.prototype.elements = function () {
    return gc.apply(this, z(arguments));
  }, Vb.prototype.destroy = function () {
    return hc.apply(this, z(arguments));
  }, Vb.prototype.setText = function (a) {
    if (!Xb[this.id])
      throw new Error('Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance');
    return Vb.setData('text/plain', a), this;
  }, Vb.prototype.setHtml = function (a) {
    if (!Xb[this.id])
      throw new Error('Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance');
    return Vb.setData('text/html', a), this;
  }, Vb.prototype.setRichText = function (a) {
    if (!Xb[this.id])
      throw new Error('Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance');
    return Vb.setData('application/rtf', a), this;
  }, Vb.prototype.setData = function () {
    if (!Xb[this.id])
      throw new Error('Attempted to set pending clipboard data from a destroyed ZeroClipboard client instance');
    return Vb.setData.apply(this, z(arguments)), this;
  }, Vb.prototype.clearData = function () {
    if (!Xb[this.id])
      throw new Error('Attempted to clear pending clipboard data from a destroyed ZeroClipboard client instance');
    return Vb.clearData.apply(this, z(arguments)), this;
  }, Vb.prototype.getData = function () {
    if (!Xb[this.id])
      throw new Error('Attempted to get pending clipboard data from a destroyed ZeroClipboard client instance');
    return Vb.getData.apply(this, z(arguments));
  }, 'function' == typeof define && define.amd ? define(function () {
    return Vb;
  }) : 'object' == typeof module && module && 'object' == typeof module.exports && module.exports ? module.exports = Vb : a.ZeroClipboard = Vb;
}(function () {
  return this || window;
}());
//# sourceMappingURL=ZeroClipboard.min.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (Q, W, t) {
  'use strict';
  function R(b) {
    return function () {
      var a = arguments[0], c;
      c = '[' + (b ? b + ':' : '') + a + '] http://errors.angularjs.org/1.3.15/' + (b ? b + '/' : '') + a;
      for (a = 1; a < arguments.length; a++) {
        c = c + (1 == a ? '?' : '&') + 'p' + (a - 1) + '=';
        var d = encodeURIComponent, e;
        e = arguments[a];
        e = 'function' == typeof e ? e.toString().replace(/ \{[\s\S]*$/, '') : 'undefined' == typeof e ? 'undefined' : 'string' != typeof e ? JSON.stringify(e) : e;
        c += d(e);
      }
      return Error(c);
    };
  }
  function Sa(b) {
    if (null == b || Ta(b))
      return !1;
    var a = b.length;
    return b.nodeType === qa && a ? !0 : C(b) || H(b) || 0 === a || 'number' === typeof a && 0 < a && a - 1 in b;
  }
  function r(b, a, c) {
    var d, e;
    if (b)
      if (G(b))
        for (d in b)
          'prototype' == d || 'length' == d || 'name' == d || b.hasOwnProperty && !b.hasOwnProperty(d) || a.call(c, b[d], d, b);
      else if (H(b) || Sa(b)) {
        var f = 'object' !== typeof b;
        d = 0;
        for (e = b.length; d < e; d++)
          (f || d in b) && a.call(c, b[d], d, b);
      } else if (b.forEach && b.forEach !== r)
        b.forEach(a, c, b);
      else
        for (d in b)
          b.hasOwnProperty(d) && a.call(c, b[d], d, b);
    return b;
  }
  function Ed(b, a, c) {
    for (var d = Object.keys(b).sort(), e = 0; e < d.length; e++)
      a.call(c, b[d[e]], d[e]);
    return d;
  }
  function mc(b) {
    return function (a, c) {
      b(c, a);
    };
  }
  function Fd() {
    return ++ob;
  }
  function nc(b, a) {
    a ? b.$$hashKey = a : delete b.$$hashKey;
  }
  function w(b) {
    for (var a = b.$$hashKey, c = 1, d = arguments.length; c < d; c++) {
      var e = arguments[c];
      if (e)
        for (var f = Object.keys(e), g = 0, h = f.length; g < h; g++) {
          var l = f[g];
          b[l] = e[l];
        }
    }
    nc(b, a);
    return b;
  }
  function aa(b) {
    return parseInt(b, 10);
  }
  function Ob(b, a) {
    return w(Object.create(b), a);
  }
  function E() {
  }
  function ra(b) {
    return b;
  }
  function ea(b) {
    return function () {
      return b;
    };
  }
  function x(b) {
    return 'undefined' === typeof b;
  }
  function y(b) {
    return 'undefined' !== typeof b;
  }
  function J(b) {
    return null !== b && 'object' === typeof b;
  }
  function C(b) {
    return 'string' === typeof b;
  }
  function Y(b) {
    return 'number' === typeof b;
  }
  function ga(b) {
    return '[object Date]' === Ca.call(b);
  }
  function G(b) {
    return 'function' === typeof b;
  }
  function Ua(b) {
    return '[object RegExp]' === Ca.call(b);
  }
  function Ta(b) {
    return b && b.window === b;
  }
  function Va(b) {
    return b && b.$evalAsync && b.$watch;
  }
  function Wa(b) {
    return 'boolean' === typeof b;
  }
  function oc(b) {
    return !(!b || !(b.nodeName || b.prop && b.attr && b.find));
  }
  function Gd(b) {
    var a = {};
    b = b.split(',');
    var c;
    for (c = 0; c < b.length; c++)
      a[b[c]] = !0;
    return a;
  }
  function va(b) {
    return z(b.nodeName || b[0] && b[0].nodeName);
  }
  function Xa(b, a) {
    var c = b.indexOf(a);
    0 <= c && b.splice(c, 1);
    return a;
  }
  function Da(b, a, c, d) {
    if (Ta(b) || Va(b))
      throw Ja('cpws');
    if (a) {
      if (b === a)
        throw Ja('cpi');
      c = c || [];
      d = d || [];
      if (J(b)) {
        var e = c.indexOf(b);
        if (-1 !== e)
          return d[e];
        c.push(b);
        d.push(a);
      }
      if (H(b))
        for (var f = a.length = 0; f < b.length; f++)
          e = Da(b[f], null, c, d), J(b[f]) && (c.push(b[f]), d.push(e)), a.push(e);
      else {
        var g = a.$$hashKey;
        H(a) ? a.length = 0 : r(a, function (b, c) {
          delete a[c];
        });
        for (f in b)
          b.hasOwnProperty(f) && (e = Da(b[f], null, c, d), J(b[f]) && (c.push(b[f]), d.push(e)), a[f] = e);
        nc(a, g);
      }
    } else if (a = b)
      H(b) ? a = Da(b, [], c, d) : ga(b) ? a = new Date(b.getTime()) : Ua(b) ? (a = new RegExp(b.source, b.toString().match(/[^\/]*$/)[0]), a.lastIndex = b.lastIndex) : J(b) && (e = Object.create(Object.getPrototypeOf(b)), a = Da(b, e, c, d));
    return a;
  }
  function sa(b, a) {
    if (H(b)) {
      a = a || [];
      for (var c = 0, d = b.length; c < d; c++)
        a[c] = b[c];
    } else if (J(b))
      for (c in a = a || {}, b)
        if ('$' !== c.charAt(0) || '$' !== c.charAt(1))
          a[c] = b[c];
    return a || b;
  }
  function ha(b, a) {
    if (b === a)
      return !0;
    if (null === b || null === a)
      return !1;
    if (b !== b && a !== a)
      return !0;
    var c = typeof b, d;
    if (c == typeof a && 'object' == c)
      if (H(b)) {
        if (!H(a))
          return !1;
        if ((c = b.length) == a.length) {
          for (d = 0; d < c; d++)
            if (!ha(b[d], a[d]))
              return !1;
          return !0;
        }
      } else {
        if (ga(b))
          return ga(a) ? ha(b.getTime(), a.getTime()) : !1;
        if (Ua(b))
          return Ua(a) ? b.toString() == a.toString() : !1;
        if (Va(b) || Va(a) || Ta(b) || Ta(a) || H(a) || ga(a) || Ua(a))
          return !1;
        c = {};
        for (d in b)
          if ('$' !== d.charAt(0) && !G(b[d])) {
            if (!ha(b[d], a[d]))
              return !1;
            c[d] = !0;
          }
        for (d in a)
          if (!c.hasOwnProperty(d) && '$' !== d.charAt(0) && a[d] !== t && !G(a[d]))
            return !1;
        return !0;
      }
    return !1;
  }
  function Ya(b, a, c) {
    return b.concat(Za.call(a, c));
  }
  function pc(b, a) {
    var c = 2 < arguments.length ? Za.call(arguments, 2) : [];
    return !G(a) || a instanceof RegExp ? a : c.length ? function () {
      return arguments.length ? a.apply(b, Ya(c, arguments, 0)) : a.apply(b, c);
    } : function () {
      return arguments.length ? a.apply(b, arguments) : a.call(b);
    };
  }
  function Hd(b, a) {
    var c = a;
    'string' === typeof b && '$' === b.charAt(0) && '$' === b.charAt(1) ? c = t : Ta(a) ? c = '$WINDOW' : a && W === a ? c = '$DOCUMENT' : Va(a) && (c = '$SCOPE');
    return c;
  }
  function $a(b, a) {
    if ('undefined' === typeof b)
      return t;
    Y(a) || (a = a ? 2 : null);
    return JSON.stringify(b, Hd, a);
  }
  function qc(b) {
    return C(b) ? JSON.parse(b) : b;
  }
  function wa(b) {
    b = A(b).clone();
    try {
      b.empty();
    } catch (a) {
    }
    var c = A('<div>').append(b).html();
    try {
      return b[0].nodeType === pb ? z(c) : c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function (a, b) {
        return '<' + z(b);
      });
    } catch (d) {
      return z(c);
    }
  }
  function rc(b) {
    try {
      return decodeURIComponent(b);
    } catch (a) {
    }
  }
  function sc(b) {
    var a = {}, c, d;
    r((b || '').split('&'), function (b) {
      b && (c = b.replace(/\+/g, '%20').split('='), d = rc(c[0]), y(d) && (b = y(c[1]) ? rc(c[1]) : !0, tc.call(a, d) ? H(a[d]) ? a[d].push(b) : a[d] = [
        a[d],
        b
      ] : a[d] = b));
    });
    return a;
  }
  function Pb(b) {
    var a = [];
    r(b, function (b, d) {
      H(b) ? r(b, function (b) {
        a.push(Ea(d, !0) + (!0 === b ? '' : '=' + Ea(b, !0)));
      }) : a.push(Ea(d, !0) + (!0 === b ? '' : '=' + Ea(b, !0)));
    });
    return a.length ? a.join('&') : '';
  }
  function qb(b) {
    return Ea(b, !0).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
  }
  function Ea(b, a) {
    return encodeURIComponent(b).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%3B/gi, ';').replace(/%20/g, a ? '%20' : '+');
  }
  function Id(b, a) {
    var c, d, e = rb.length;
    b = A(b);
    for (d = 0; d < e; ++d)
      if (c = rb[d] + a, C(c = b.attr(c)))
        return c;
    return null;
  }
  function Jd(b, a) {
    var c, d, e = {};
    r(rb, function (a) {
      a += 'app';
      !c && b.hasAttribute && b.hasAttribute(a) && (c = b, d = b.getAttribute(a));
    });
    r(rb, function (a) {
      a += 'app';
      var e;
      !c && (e = b.querySelector('[' + a.replace(':', '\\:') + ']')) && (c = e, d = e.getAttribute(a));
    });
    c && (e.strictDi = null !== Id(c, 'strict-di'), a(c, d ? [d] : [], e));
  }
  function uc(b, a, c) {
    J(c) || (c = {});
    c = w({ strictDi: !1 }, c);
    var d = function () {
        b = A(b);
        if (b.injector()) {
          var d = b[0] === W ? 'document' : wa(b);
          throw Ja('btstrpd', d.replace(/</, '&lt;').replace(/>/, '&gt;'));
        }
        a = a || [];
        a.unshift([
          '$provide',
          function (a) {
            a.value('$rootElement', b);
          }
        ]);
        c.debugInfoEnabled && a.push([
          '$compileProvider',
          function (a) {
            a.debugInfoEnabled(!0);
          }
        ]);
        a.unshift('ng');
        d = ab(a, c.strictDi);
        d.invoke([
          '$rootScope',
          '$rootElement',
          '$compile',
          '$injector',
          function (a, b, c, d) {
            a.$apply(function () {
              b.data('$injector', d);
              c(b)(a);
            });
          }
        ]);
        return d;
      }, e = /^NG_ENABLE_DEBUG_INFO!/, f = /^NG_DEFER_BOOTSTRAP!/;
    Q && e.test(Q.name) && (c.debugInfoEnabled = !0, Q.name = Q.name.replace(e, ''));
    if (Q && !f.test(Q.name))
      return d();
    Q.name = Q.name.replace(f, '');
    ca.resumeBootstrap = function (b) {
      r(b, function (b) {
        a.push(b);
      });
      return d();
    };
    G(ca.resumeDeferredBootstrap) && ca.resumeDeferredBootstrap();
  }
  function Kd() {
    Q.name = 'NG_ENABLE_DEBUG_INFO!' + Q.name;
    Q.location.reload();
  }
  function Ld(b) {
    b = ca.element(b).injector();
    if (!b)
      throw Ja('test');
    return b.get('$$testability');
  }
  function vc(b, a) {
    a = a || '_';
    return b.replace(Md, function (b, d) {
      return (d ? a : '') + b.toLowerCase();
    });
  }
  function Nd() {
    var b;
    wc || ((ta = Q.jQuery) && ta.fn.on ? (A = ta, w(ta.fn, {
      scope: Ka.scope,
      isolateScope: Ka.isolateScope,
      controller: Ka.controller,
      injector: Ka.injector,
      inheritedData: Ka.inheritedData
    }), b = ta.cleanData, ta.cleanData = function (a) {
      var c;
      if (Qb)
        Qb = !1;
      else
        for (var d = 0, e; null != (e = a[d]); d++)
          (c = ta._data(e, 'events')) && c.$destroy && ta(e).triggerHandler('$destroy');
      b(a);
    }) : A = T, ca.element = A, wc = !0);
  }
  function Rb(b, a, c) {
    if (!b)
      throw Ja('areq', a || '?', c || 'required');
    return b;
  }
  function sb(b, a, c) {
    c && H(b) && (b = b[b.length - 1]);
    Rb(G(b), a, 'not a function, got ' + (b && 'object' === typeof b ? b.constructor.name || 'Object' : typeof b));
    return b;
  }
  function La(b, a) {
    if ('hasOwnProperty' === b)
      throw Ja('badname', a);
  }
  function xc(b, a, c) {
    if (!a)
      return b;
    a = a.split('.');
    for (var d, e = b, f = a.length, g = 0; g < f; g++)
      d = a[g], b && (b = (e = b)[d]);
    return !c && G(b) ? pc(e, b) : b;
  }
  function tb(b) {
    var a = b[0];
    b = b[b.length - 1];
    var c = [a];
    do {
      a = a.nextSibling;
      if (!a)
        break;
      c.push(a);
    } while (a !== b);
    return A(c);
  }
  function ia() {
    return Object.create(null);
  }
  function Od(b) {
    function a(a, b, c) {
      return a[b] || (a[b] = c());
    }
    var c = R('$injector'), d = R('ng');
    b = a(b, 'angular', Object);
    b.$$minErr = b.$$minErr || R;
    return a(b, 'module', function () {
      var b = {};
      return function (f, g, h) {
        if ('hasOwnProperty' === f)
          throw d('badname', 'module');
        g && b.hasOwnProperty(f) && (b[f] = null);
        return a(b, f, function () {
          function a(c, d, e, f) {
            f || (f = b);
            return function () {
              f[e || 'push']([
                c,
                d,
                arguments
              ]);
              return u;
            };
          }
          if (!g)
            throw c('nomod', f);
          var b = [], d = [], e = [], q = a('$injector', 'invoke', 'push', d), u = {
              _invokeQueue: b,
              _configBlocks: d,
              _runBlocks: e,
              requires: g,
              name: f,
              provider: a('$provide', 'provider'),
              factory: a('$provide', 'factory'),
              service: a('$provide', 'service'),
              value: a('$provide', 'value'),
              constant: a('$provide', 'constant', 'unshift'),
              animation: a('$animateProvider', 'register'),
              filter: a('$filterProvider', 'register'),
              controller: a('$controllerProvider', 'register'),
              directive: a('$compileProvider', 'directive'),
              config: q,
              run: function (a) {
                e.push(a);
                return this;
              }
            };
          h && q(h);
          return u;
        });
      };
    });
  }
  function Pd(b) {
    w(b, {
      bootstrap: uc,
      copy: Da,
      extend: w,
      equals: ha,
      element: A,
      forEach: r,
      injector: ab,
      noop: E,
      bind: pc,
      toJson: $a,
      fromJson: qc,
      identity: ra,
      isUndefined: x,
      isDefined: y,
      isString: C,
      isFunction: G,
      isObject: J,
      isNumber: Y,
      isElement: oc,
      isArray: H,
      version: Qd,
      isDate: ga,
      lowercase: z,
      uppercase: ub,
      callbacks: { counter: 0 },
      getTestability: Ld,
      $$minErr: R,
      $$csp: bb,
      reloadWithDebugInfo: Kd
    });
    cb = Od(Q);
    try {
      cb('ngLocale');
    } catch (a) {
      cb('ngLocale', []).provider('$locale', Rd);
    }
    cb('ng', ['ngLocale'], [
      '$provide',
      function (a) {
        a.provider({ $$sanitizeUri: Sd });
        a.provider('$compile', yc).directive({
          a: Td,
          input: zc,
          textarea: zc,
          form: Ud,
          script: Vd,
          select: Wd,
          style: Xd,
          option: Yd,
          ngBind: Zd,
          ngBindHtml: $d,
          ngBindTemplate: ae,
          ngClass: be,
          ngClassEven: ce,
          ngClassOdd: de,
          ngCloak: ee,
          ngController: fe,
          ngForm: ge,
          ngHide: he,
          ngIf: ie,
          ngInclude: je,
          ngInit: ke,
          ngNonBindable: le,
          ngPluralize: me,
          ngRepeat: ne,
          ngShow: oe,
          ngStyle: pe,
          ngSwitch: qe,
          ngSwitchWhen: re,
          ngSwitchDefault: se,
          ngOptions: te,
          ngTransclude: ue,
          ngModel: ve,
          ngList: we,
          ngChange: xe,
          pattern: Ac,
          ngPattern: Ac,
          required: Bc,
          ngRequired: Bc,
          minlength: Cc,
          ngMinlength: Cc,
          maxlength: Dc,
          ngMaxlength: Dc,
          ngValue: ye,
          ngModelOptions: ze
        }).directive({ ngInclude: Ae }).directive(vb).directive(Ec);
        a.provider({
          $anchorScroll: Be,
          $animate: Ce,
          $browser: De,
          $cacheFactory: Ee,
          $controller: Fe,
          $document: Ge,
          $exceptionHandler: He,
          $filter: Fc,
          $interpolate: Ie,
          $interval: Je,
          $http: Ke,
          $httpBackend: Le,
          $location: Me,
          $log: Ne,
          $parse: Oe,
          $rootScope: Pe,
          $q: Qe,
          $$q: Re,
          $sce: Se,
          $sceDelegate: Te,
          $sniffer: Ue,
          $templateCache: Ve,
          $templateRequest: We,
          $$testability: Xe,
          $timeout: Ye,
          $window: Ze,
          $$rAF: $e,
          $$asyncCallback: af,
          $$jqLite: bf
        });
      }
    ]);
  }
  function db(b) {
    return b.replace(cf, function (a, b, d, e) {
      return e ? d.toUpperCase() : d;
    }).replace(df, 'Moz$1');
  }
  function Gc(b) {
    b = b.nodeType;
    return b === qa || !b || 9 === b;
  }
  function Hc(b, a) {
    var c, d, e = a.createDocumentFragment(), f = [];
    if (Sb.test(b)) {
      c = c || e.appendChild(a.createElement('div'));
      d = (ef.exec(b) || [
        '',
        ''
      ])[1].toLowerCase();
      d = ja[d] || ja._default;
      c.innerHTML = d[1] + b.replace(ff, '<$1></$2>') + d[2];
      for (d = d[0]; d--;)
        c = c.lastChild;
      f = Ya(f, c.childNodes);
      c = e.firstChild;
      c.textContent = '';
    } else
      f.push(a.createTextNode(b));
    e.textContent = '';
    e.innerHTML = '';
    r(f, function (a) {
      e.appendChild(a);
    });
    return e;
  }
  function T(b) {
    if (b instanceof T)
      return b;
    var a;
    C(b) && (b = N(b), a = !0);
    if (!(this instanceof T)) {
      if (a && '<' != b.charAt(0))
        throw Tb('nosel');
      return new T(b);
    }
    if (a) {
      a = W;
      var c;
      b = (c = gf.exec(b)) ? [a.createElement(c[1])] : (c = Hc(b, a)) ? c.childNodes : [];
    }
    Ic(this, b);
  }
  function Ub(b) {
    return b.cloneNode(!0);
  }
  function wb(b, a) {
    a || xb(b);
    if (b.querySelectorAll)
      for (var c = b.querySelectorAll('*'), d = 0, e = c.length; d < e; d++)
        xb(c[d]);
  }
  function Jc(b, a, c, d) {
    if (y(d))
      throw Tb('offargs');
    var e = (d = yb(b)) && d.events, f = d && d.handle;
    if (f)
      if (a)
        r(a.split(' '), function (a) {
          if (y(c)) {
            var d = e[a];
            Xa(d || [], c);
            if (d && 0 < d.length)
              return;
          }
          b.removeEventListener(a, f, !1);
          delete e[a];
        });
      else
        for (a in e)
          '$destroy' !== a && b.removeEventListener(a, f, !1), delete e[a];
  }
  function xb(b, a) {
    var c = b.ng339, d = c && zb[c];
    d && (a ? delete d.data[a] : (d.handle && (d.events.$destroy && d.handle({}, '$destroy'), Jc(b)), delete zb[c], b.ng339 = t));
  }
  function yb(b, a) {
    var c = b.ng339, c = c && zb[c];
    a && !c && (b.ng339 = c = ++hf, c = zb[c] = {
      events: {},
      data: {},
      handle: t
    });
    return c;
  }
  function Vb(b, a, c) {
    if (Gc(b)) {
      var d = y(c), e = !d && a && !J(a), f = !a;
      b = (b = yb(b, !e)) && b.data;
      if (d)
        b[a] = c;
      else {
        if (f)
          return b;
        if (e)
          return b && b[a];
        w(b, a);
      }
    }
  }
  function Ab(b, a) {
    return b.getAttribute ? -1 < (' ' + (b.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + a + ' ') : !1;
  }
  function Bb(b, a) {
    a && b.setAttribute && r(a.split(' '), function (a) {
      b.setAttribute('class', N((' ' + (b.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').replace(' ' + N(a) + ' ', ' ')));
    });
  }
  function Cb(b, a) {
    if (a && b.setAttribute) {
      var c = (' ' + (b.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ');
      r(a.split(' '), function (a) {
        a = N(a);
        -1 === c.indexOf(' ' + a + ' ') && (c += a + ' ');
      });
      b.setAttribute('class', N(c));
    }
  }
  function Ic(b, a) {
    if (a)
      if (a.nodeType)
        b[b.length++] = a;
      else {
        var c = a.length;
        if ('number' === typeof c && a.window !== a) {
          if (c)
            for (var d = 0; d < c; d++)
              b[b.length++] = a[d];
        } else
          b[b.length++] = a;
      }
  }
  function Kc(b, a) {
    return Db(b, '$' + (a || 'ngController') + 'Controller');
  }
  function Db(b, a, c) {
    9 == b.nodeType && (b = b.documentElement);
    for (a = H(a) ? a : [a]; b;) {
      for (var d = 0, e = a.length; d < e; d++)
        if ((c = A.data(b, a[d])) !== t)
          return c;
      b = b.parentNode || 11 === b.nodeType && b.host;
    }
  }
  function Lc(b) {
    for (wb(b, !0); b.firstChild;)
      b.removeChild(b.firstChild);
  }
  function Mc(b, a) {
    a || wb(b);
    var c = b.parentNode;
    c && c.removeChild(b);
  }
  function jf(b, a) {
    a = a || Q;
    if ('complete' === a.document.readyState)
      a.setTimeout(b);
    else
      A(a).on('load', b);
  }
  function Nc(b, a) {
    var c = Eb[a.toLowerCase()];
    return c && Oc[va(b)] && c;
  }
  function kf(b, a) {
    var c = b.nodeName;
    return ('INPUT' === c || 'TEXTAREA' === c) && Pc[a];
  }
  function lf(b, a) {
    var c = function (c, e) {
      c.isDefaultPrevented = function () {
        return c.defaultPrevented;
      };
      var f = a[e || c.type], g = f ? f.length : 0;
      if (g) {
        if (x(c.immediatePropagationStopped)) {
          var h = c.stopImmediatePropagation;
          c.stopImmediatePropagation = function () {
            c.immediatePropagationStopped = !0;
            c.stopPropagation && c.stopPropagation();
            h && h.call(c);
          };
        }
        c.isImmediatePropagationStopped = function () {
          return !0 === c.immediatePropagationStopped;
        };
        1 < g && (f = sa(f));
        for (var l = 0; l < g; l++)
          c.isImmediatePropagationStopped() || f[l].call(b, c);
      }
    };
    c.elem = b;
    return c;
  }
  function bf() {
    this.$get = function () {
      return w(T, {
        hasClass: function (b, a) {
          b.attr && (b = b[0]);
          return Ab(b, a);
        },
        addClass: function (b, a) {
          b.attr && (b = b[0]);
          return Cb(b, a);
        },
        removeClass: function (b, a) {
          b.attr && (b = b[0]);
          return Bb(b, a);
        }
      });
    };
  }
  function Ma(b, a) {
    var c = b && b.$$hashKey;
    if (c)
      return 'function' === typeof c && (c = b.$$hashKey()), c;
    c = typeof b;
    return c = 'function' == c || 'object' == c && null !== b ? b.$$hashKey = c + ':' + (a || Fd)() : c + ':' + b;
  }
  function eb(b, a) {
    if (a) {
      var c = 0;
      this.nextUid = function () {
        return ++c;
      };
    }
    r(b, this.put, this);
  }
  function mf(b) {
    return (b = b.toString().replace(Qc, '').match(Rc)) ? 'function(' + (b[1] || '').replace(/[\s\r\n]+/, ' ') + ')' : 'fn';
  }
  function ab(b, a) {
    function c(a) {
      return function (b, c) {
        if (J(b))
          r(b, mc(a));
        else
          return a(b, c);
      };
    }
    function d(a, b) {
      La(a, 'service');
      if (G(b) || H(b))
        b = q.instantiate(b);
      if (!b.$get)
        throw Fa('pget', a);
      return p[a + 'Provider'] = b;
    }
    function e(a, b) {
      return function () {
        var c = s.invoke(b, this);
        if (x(c))
          throw Fa('undef', a);
        return c;
      };
    }
    function f(a, b, c) {
      return d(a, { $get: !1 !== c ? e(a, b) : b });
    }
    function g(a) {
      var b = [], c;
      r(a, function (a) {
        function d(a) {
          var b, c;
          b = 0;
          for (c = a.length; b < c; b++) {
            var e = a[b], f = q.get(e[0]);
            f[e[1]].apply(f, e[2]);
          }
        }
        if (!n.get(a)) {
          n.put(a, !0);
          try {
            C(a) ? (c = cb(a), b = b.concat(g(c.requires)).concat(c._runBlocks), d(c._invokeQueue), d(c._configBlocks)) : G(a) ? b.push(q.invoke(a)) : H(a) ? b.push(q.invoke(a)) : sb(a, 'module');
          } catch (e) {
            throw H(a) && (a = a[a.length - 1]), e.message && e.stack && -1 == e.stack.indexOf(e.message) && (e = e.message + '\n' + e.stack), Fa('modulerr', a, e.stack || e.message || e);
          }
        }
      });
      return b;
    }
    function h(b, c) {
      function d(a, e) {
        if (b.hasOwnProperty(a)) {
          if (b[a] === l)
            throw Fa('cdep', a + ' <- ' + k.join(' <- '));
          return b[a];
        }
        try {
          return k.unshift(a), b[a] = l, b[a] = c(a, e);
        } catch (f) {
          throw b[a] === l && delete b[a], f;
        } finally {
          k.shift();
        }
      }
      function e(b, c, f, g) {
        'string' === typeof f && (g = f, f = null);
        var k = [], h = ab.$$annotate(b, a, g), l, q, p;
        q = 0;
        for (l = h.length; q < l; q++) {
          p = h[q];
          if ('string' !== typeof p)
            throw Fa('itkn', p);
          k.push(f && f.hasOwnProperty(p) ? f[p] : d(p, g));
        }
        H(b) && (b = b[l]);
        return b.apply(c, k);
      }
      return {
        invoke: e,
        instantiate: function (a, b, c) {
          var d = Object.create((H(a) ? a[a.length - 1] : a).prototype || null);
          a = e(a, d, b, c);
          return J(a) || G(a) ? a : d;
        },
        get: d,
        annotate: ab.$$annotate,
        has: function (a) {
          return p.hasOwnProperty(a + 'Provider') || b.hasOwnProperty(a);
        }
      };
    }
    a = !0 === a;
    var l = {}, k = [], n = new eb([], !0), p = {
        $provide: {
          provider: c(d),
          factory: c(f),
          service: c(function (a, b) {
            return f(a, [
              '$injector',
              function (a) {
                return a.instantiate(b);
              }
            ]);
          }),
          value: c(function (a, b) {
            return f(a, ea(b), !1);
          }),
          constant: c(function (a, b) {
            La(a, 'constant');
            p[a] = b;
            u[a] = b;
          }),
          decorator: function (a, b) {
            var c = q.get(a + 'Provider'), d = c.$get;
            c.$get = function () {
              var a = s.invoke(d, c);
              return s.invoke(b, null, { $delegate: a });
            };
          }
        }
      }, q = p.$injector = h(p, function (a, b) {
        ca.isString(b) && k.push(b);
        throw Fa('unpr', k.join(' <- '));
      }), u = {}, s = u.$injector = h(u, function (a, b) {
        var c = q.get(a + 'Provider', b);
        return s.invoke(c.$get, c, t, a);
      });
    r(g(b), function (a) {
      s.invoke(a || E);
    });
    return s;
  }
  function Be() {
    var b = !0;
    this.disableAutoScrolling = function () {
      b = !1;
    };
    this.$get = [
      '$window',
      '$location',
      '$rootScope',
      function (a, c, d) {
        function e(a) {
          var b = null;
          Array.prototype.some.call(a, function (a) {
            if ('a' === va(a))
              return b = a, !0;
          });
          return b;
        }
        function f(b) {
          if (b) {
            b.scrollIntoView();
            var c;
            c = g.yOffset;
            G(c) ? c = c() : oc(c) ? (c = c[0], c = 'fixed' !== a.getComputedStyle(c).position ? 0 : c.getBoundingClientRect().bottom) : Y(c) || (c = 0);
            c && (b = b.getBoundingClientRect().top, a.scrollBy(0, b - c));
          } else
            a.scrollTo(0, 0);
        }
        function g() {
          var a = c.hash(), b;
          a ? (b = h.getElementById(a)) ? f(b) : (b = e(h.getElementsByName(a))) ? f(b) : 'top' === a && f(null) : f(null);
        }
        var h = a.document;
        b && d.$watch(function () {
          return c.hash();
        }, function (a, b) {
          a === b && '' === a || jf(function () {
            d.$evalAsync(g);
          });
        });
        return g;
      }
    ];
  }
  function af() {
    this.$get = [
      '$$rAF',
      '$timeout',
      function (b, a) {
        return b.supported ? function (a) {
          return b(a);
        } : function (b) {
          return a(b, 0, !1);
        };
      }
    ];
  }
  function nf(b, a, c, d) {
    function e(a) {
      try {
        a.apply(null, Za.call(arguments, 1));
      } finally {
        if (m--, 0 === m)
          for (; F.length;)
            try {
              F.pop()();
            } catch (b) {
              c.error(b);
            }
      }
    }
    function f(a, b) {
      (function da() {
        r(Z, function (a) {
          a();
        });
        L = b(da, a);
      }());
    }
    function g() {
      h();
      l();
    }
    function h() {
      a: {
        try {
          B = u.state;
          break a;
        } catch (a) {
        }
        B = void 0;
      }
      B = x(B) ? null : B;
      ha(B, O) && (B = O);
      O = B;
    }
    function l() {
      if (D !== n.url() || I !== B)
        D = n.url(), I = B, r(X, function (a) {
          a(n.url(), B);
        });
    }
    function k(a) {
      try {
        return decodeURIComponent(a);
      } catch (b) {
        return a;
      }
    }
    var n = this, p = a[0], q = b.location, u = b.history, s = b.setTimeout, M = b.clearTimeout, v = {};
    n.isMock = !1;
    var m = 0, F = [];
    n.$$completeOutstandingRequest = e;
    n.$$incOutstandingRequestCount = function () {
      m++;
    };
    n.notifyWhenNoOutstandingRequests = function (a) {
      r(Z, function (a) {
        a();
      });
      0 === m ? a() : F.push(a);
    };
    var Z = [], L;
    n.addPollFn = function (a) {
      x(L) && f(100, s);
      Z.push(a);
      return a;
    };
    var B, I, D = q.href, S = a.find('base'), P = null;
    h();
    I = B;
    n.url = function (a, c, e) {
      x(e) && (e = null);
      q !== b.location && (q = b.location);
      u !== b.history && (u = b.history);
      if (a) {
        var f = I === e;
        if (D === a && (!d.history || f))
          return n;
        var g = D && Ga(D) === Ga(a);
        D = a;
        I = e;
        !d.history || g && f ? (g || (P = a), c ? q.replace(a) : g ? (c = q, e = a.indexOf('#'), a = -1 === e ? '' : a.substr(e + 1), c.hash = a) : q.href = a) : (u[c ? 'replaceState' : 'pushState'](e, '', a), h(), I = B);
        return n;
      }
      return P || q.href.replace(/%27/g, '\'');
    };
    n.state = function () {
      return B;
    };
    var X = [], ba = !1, O = null;
    n.onUrlChange = function (a) {
      if (!ba) {
        if (d.history)
          A(b).on('popstate', g);
        A(b).on('hashchange', g);
        ba = !0;
      }
      X.push(a);
      return a;
    };
    n.$$checkUrlChange = l;
    n.baseHref = function () {
      var a = S.attr('href');
      return a ? a.replace(/^(https?\:)?\/\/[^\/]*/, '') : '';
    };
    var fa = {}, y = '', ka = n.baseHref();
    n.cookies = function (a, b) {
      var d, e, f, g;
      if (a)
        b === t ? p.cookie = encodeURIComponent(a) + '=;path=' + ka + ';expires=Thu, 01 Jan 1970 00:00:00 GMT' : C(b) && (d = (p.cookie = encodeURIComponent(a) + '=' + encodeURIComponent(b) + ';path=' + ka).length + 1, 4096 < d && c.warn('Cookie \'' + a + '\' possibly not set or overflowed because it was too large (' + d + ' > 4096 bytes)!'));
      else {
        if (p.cookie !== y)
          for (y = p.cookie, d = y.split('; '), fa = {}, f = 0; f < d.length; f++)
            e = d[f], g = e.indexOf('='), 0 < g && (a = k(e.substring(0, g)), fa[a] === t && (fa[a] = k(e.substring(g + 1))));
        return fa;
      }
    };
    n.defer = function (a, b) {
      var c;
      m++;
      c = s(function () {
        delete v[c];
        e(a);
      }, b || 0);
      v[c] = !0;
      return c;
    };
    n.defer.cancel = function (a) {
      return v[a] ? (delete v[a], M(a), e(E), !0) : !1;
    };
  }
  function De() {
    this.$get = [
      '$window',
      '$log',
      '$sniffer',
      '$document',
      function (b, a, c, d) {
        return new nf(b, d, a, c);
      }
    ];
  }
  function Ee() {
    this.$get = function () {
      function b(b, d) {
        function e(a) {
          a != p && (q ? q == a && (q = a.n) : q = a, f(a.n, a.p), f(a, p), p = a, p.n = null);
        }
        function f(a, b) {
          a != b && (a && (a.p = b), b && (b.n = a));
        }
        if (b in a)
          throw R('$cacheFactory')('iid', b);
        var g = 0, h = w({}, d, { id: b }), l = {}, k = d && d.capacity || Number.MAX_VALUE, n = {}, p = null, q = null;
        return a[b] = {
          put: function (a, b) {
            if (k < Number.MAX_VALUE) {
              var c = n[a] || (n[a] = { key: a });
              e(c);
            }
            if (!x(b))
              return a in l || g++, l[a] = b, g > k && this.remove(q.key), b;
          },
          get: function (a) {
            if (k < Number.MAX_VALUE) {
              var b = n[a];
              if (!b)
                return;
              e(b);
            }
            return l[a];
          },
          remove: function (a) {
            if (k < Number.MAX_VALUE) {
              var b = n[a];
              if (!b)
                return;
              b == p && (p = b.p);
              b == q && (q = b.n);
              f(b.n, b.p);
              delete n[a];
            }
            delete l[a];
            g--;
          },
          removeAll: function () {
            l = {};
            g = 0;
            n = {};
            p = q = null;
          },
          destroy: function () {
            n = h = l = null;
            delete a[b];
          },
          info: function () {
            return w({}, h, { size: g });
          }
        };
      }
      var a = {};
      b.info = function () {
        var b = {};
        r(a, function (a, e) {
          b[e] = a.info();
        });
        return b;
      };
      b.get = function (b) {
        return a[b];
      };
      return b;
    };
  }
  function Ve() {
    this.$get = [
      '$cacheFactory',
      function (b) {
        return b('templates');
      }
    ];
  }
  function yc(b, a) {
    function c(a, b) {
      var c = /^\s*([@&]|=(\*?))(\??)\s*(\w*)\s*$/, d = {};
      r(a, function (a, e) {
        var f = a.match(c);
        if (!f)
          throw la('iscp', b, e, a);
        d[e] = {
          mode: f[1][0],
          collection: '*' === f[2],
          optional: '?' === f[3],
          attrName: f[4] || e
        };
      });
      return d;
    }
    var d = {}, e = /^\s*directive\:\s*([\w\-]+)\s+(.*)$/, f = /(([\w\-]+)(?:\:([^;]+))?;?)/, g = Gd('ngSrc,ngSrcset,src,srcset'), h = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/, l = /^(on[a-z]+|formaction)$/;
    this.directive = function p(a, e) {
      La(a, 'directive');
      C(a) ? (Rb(e, 'directiveFactory'), d.hasOwnProperty(a) || (d[a] = [], b.factory(a + 'Directive', [
        '$injector',
        '$exceptionHandler',
        function (b, e) {
          var f = [];
          r(d[a], function (d, g) {
            try {
              var h = b.invoke(d);
              G(h) ? h = { compile: ea(h) } : !h.compile && h.link && (h.compile = ea(h.link));
              h.priority = h.priority || 0;
              h.index = g;
              h.name = h.name || a;
              h.require = h.require || h.controller && h.name;
              h.restrict = h.restrict || 'EA';
              J(h.scope) && (h.$$isolateBindings = c(h.scope, h.name));
              f.push(h);
            } catch (k) {
              e(k);
            }
          });
          return f;
        }
      ])), d[a].push(e)) : r(a, mc(p));
      return this;
    };
    this.aHrefSanitizationWhitelist = function (b) {
      return y(b) ? (a.aHrefSanitizationWhitelist(b), this) : a.aHrefSanitizationWhitelist();
    };
    this.imgSrcSanitizationWhitelist = function (b) {
      return y(b) ? (a.imgSrcSanitizationWhitelist(b), this) : a.imgSrcSanitizationWhitelist();
    };
    var k = !0;
    this.debugInfoEnabled = function (a) {
      return y(a) ? (k = a, this) : k;
    };
    this.$get = [
      '$injector',
      '$interpolate',
      '$exceptionHandler',
      '$templateRequest',
      '$parse',
      '$controller',
      '$rootScope',
      '$document',
      '$sce',
      '$animate',
      '$$sanitizeUri',
      function (a, b, c, s, M, v, m, F, Z, L, B) {
        function I(a, b) {
          try {
            a.addClass(b);
          } catch (c) {
          }
        }
        function D(a, b, c, d, e) {
          a instanceof A || (a = A(a));
          r(a, function (b, c) {
            b.nodeType == pb && b.nodeValue.match(/\S+/) && (a[c] = A(b).wrap('<span></span>').parent()[0]);
          });
          var f = S(a, b, a, c, d, e);
          D.$$addScopeClass(a);
          var g = null;
          return function (b, c, d) {
            Rb(b, 'scope');
            d = d || {};
            var e = d.parentBoundTranscludeFn, h = d.transcludeControllers;
            d = d.futureParentElement;
            e && e.$$boundTransclude && (e = e.$$boundTransclude);
            g || (g = (d = d && d[0]) ? 'foreignobject' !== va(d) && d.toString().match(/SVG/) ? 'svg' : 'html' : 'html');
            d = 'html' !== g ? A(Xb(g, A('<div>').append(a).html())) : c ? Ka.clone.call(a) : a;
            if (h)
              for (var k in h)
                d.data('$' + k + 'Controller', h[k].instance);
            D.$$addScopeInfo(d, b);
            c && c(d, b);
            f && f(b, d, d, e);
            return d;
          };
        }
        function S(a, b, c, d, e, f) {
          function g(a, c, d, e) {
            var f, k, l, q, p, s, M;
            if (m)
              for (M = Array(c.length), q = 0; q < h.length; q += 3)
                f = h[q], M[f] = c[f];
            else
              M = c;
            q = 0;
            for (p = h.length; q < p;)
              k = M[h[q++]], c = h[q++], f = h[q++], c ? (c.scope ? (l = a.$new(), D.$$addScopeInfo(A(k), l)) : l = a, s = c.transcludeOnThisElement ? P(a, c.transclude, e, c.elementTranscludeOnThisElement) : !c.templateOnThisElement && e ? e : !e && b ? P(a, b) : null, c(f, l, k, d, s)) : f && f(a, k.childNodes, t, e);
          }
          for (var h = [], k, l, q, p, m, s = 0; s < a.length; s++) {
            k = new Yb();
            l = X(a[s], [], k, 0 === s ? d : t, e);
            (f = l.length ? fa(l, a[s], k, b, c, null, [], [], f) : null) && f.scope && D.$$addScopeClass(k.$$element);
            k = f && f.terminal || !(q = a[s].childNodes) || !q.length ? null : S(q, f ? (f.transcludeOnThisElement || !f.templateOnThisElement) && f.transclude : b);
            if (f || k)
              h.push(s, f, k), p = !0, m = m || f;
            f = null;
          }
          return p ? g : null;
        }
        function P(a, b, c, d) {
          return function (d, e, f, g, h) {
            d || (d = a.$new(!1, h), d.$$transcluded = !0);
            return b(d, e, {
              parentBoundTranscludeFn: c,
              transcludeControllers: f,
              futureParentElement: g
            });
          };
        }
        function X(a, b, c, d, g) {
          var h = c.$attr, k;
          switch (a.nodeType) {
          case qa:
            ka(b, xa(va(a)), 'E', d, g);
            for (var l, q, p, m = a.attributes, s = 0, M = m && m.length; s < M; s++) {
              var u = !1, L = !1;
              l = m[s];
              k = l.name;
              q = N(l.value);
              l = xa(k);
              if (p = U.test(l))
                k = k.replace(Sc, '').substr(8).replace(/_(.)/g, function (a, b) {
                  return b.toUpperCase();
                });
              var B = l.replace(/(Start|End)$/, '');
              x(B) && l === B + 'Start' && (u = k, L = k.substr(0, k.length - 5) + 'end', k = k.substr(0, k.length - 6));
              l = xa(k.toLowerCase());
              h[l] = k;
              if (p || !c.hasOwnProperty(l))
                c[l] = q, Nc(a, l) && (c[l] = !0);
              Oa(a, b, q, l, p);
              ka(b, l, 'A', d, g, u, L);
            }
            a = a.className;
            J(a) && (a = a.animVal);
            if (C(a) && '' !== a)
              for (; k = f.exec(a);)
                l = xa(k[2]), ka(b, l, 'C', d, g) && (c[l] = N(k[3])), a = a.substr(k.index + k[0].length);
            break;
          case pb:
            za(b, a.nodeValue);
            break;
          case 8:
            try {
              if (k = e.exec(a.nodeValue))
                l = xa(k[1]), ka(b, l, 'M', d, g) && (c[l] = N(k[2]));
            } catch (v) {
            }
          }
          b.sort(da);
          return b;
        }
        function ba(a, b, c) {
          var d = [], e = 0;
          if (b && a.hasAttribute && a.hasAttribute(b)) {
            do {
              if (!a)
                throw la('uterdir', b, c);
              a.nodeType == qa && (a.hasAttribute(b) && e++, a.hasAttribute(c) && e--);
              d.push(a);
              a = a.nextSibling;
            } while (0 < e);
          } else
            d.push(a);
          return A(d);
        }
        function O(a, b, c) {
          return function (d, e, f, g, h) {
            e = ba(e[0], b, c);
            return a(d, e, f, g, h);
          };
        }
        function fa(a, d, e, f, g, k, l, p, m) {
          function s(a, b, c, d) {
            if (a) {
              c && (a = O(a, c, d));
              a.require = K.require;
              a.directiveName = da;
              if (P === K || K.$$isolateScope)
                a = Y(a, { isolateScope: !0 });
              l.push(a);
            }
            if (b) {
              c && (b = O(b, c, d));
              b.require = K.require;
              b.directiveName = da;
              if (P === K || K.$$isolateScope)
                b = Y(b, { isolateScope: !0 });
              p.push(b);
            }
          }
          function L(a, b, c, d) {
            var e, f = 'data', g = !1, k = c, l;
            if (C(b)) {
              l = b.match(h);
              b = b.substring(l[0].length);
              l[3] && (l[1] ? l[3] = null : l[1] = l[3]);
              '^' === l[1] ? f = 'inheritedData' : '^^' === l[1] && (f = 'inheritedData', k = c.parent());
              '?' === l[2] && (g = !0);
              e = null;
              d && 'data' === f && (e = d[b]) && (e = e.instance);
              e = e || k[f]('$' + b + 'Controller');
              if (!e && !g)
                throw la('ctreq', b, a);
              return e || null;
            }
            H(b) && (e = [], r(b, function (b) {
              e.push(L(a, b, c, d));
            }));
            return e;
          }
          function B(a, c, f, g, h) {
            function k(a, b, c) {
              var d;
              Va(a) || (c = b, b = a, a = t);
              E && (d = F);
              c || (c = E ? X.parent() : X);
              return h(a, b, d, c, Wb);
            }
            var m, s, u, I, F, gb, X, O;
            d === f ? (O = e, X = e.$$element) : (X = A(f), O = new Yb(X, e));
            P && (I = c.$new(!0));
            h && (gb = k, gb.$$boundTransclude = h);
            S && (Z = {}, F = {}, r(S, function (a) {
              var b = {
                  $scope: a === P || a.$$isolateScope ? I : c,
                  $element: X,
                  $attrs: O,
                  $transclude: gb
                };
              u = a.controller;
              '@' == u && (u = O[a.name]);
              b = v(u, b, !0, a.controllerAs);
              F[a.name] = b;
              E || X.data('$' + a.name + 'Controller', b.instance);
              Z[a.name] = b;
            }));
            if (P) {
              D.$$addScopeInfo(X, I, !0, !(ma && (ma === P || ma === P.$$originalDirective)));
              D.$$addScopeClass(X, !0);
              g = Z && Z[P.name];
              var ba = I;
              g && g.identifier && !0 === P.bindToController && (ba = g.instance);
              r(I.$$isolateBindings = P.$$isolateBindings, function (a, d) {
                var e = a.attrName, f = a.optional, g, h, k, l;
                switch (a.mode) {
                case '@':
                  O.$observe(e, function (a) {
                    ba[d] = a;
                  });
                  O.$$observers[e].$$scope = c;
                  O[e] && (ba[d] = b(O[e])(c));
                  break;
                case '=':
                  if (f && !O[e])
                    break;
                  h = M(O[e]);
                  l = h.literal ? ha : function (a, b) {
                    return a === b || a !== a && b !== b;
                  };
                  k = h.assign || function () {
                    g = ba[d] = h(c);
                    throw la('nonassign', O[e], P.name);
                  };
                  g = ba[d] = h(c);
                  f = function (a) {
                    l(a, ba[d]) || (l(a, g) ? k(c, a = ba[d]) : ba[d] = a);
                    return g = a;
                  };
                  f.$stateful = !0;
                  f = a.collection ? c.$watchCollection(O[e], f) : c.$watch(M(O[e], f), null, h.literal);
                  I.$on('$destroy', f);
                  break;
                case '&':
                  h = M(O[e]), ba[d] = function (a) {
                    return h(c, a);
                  };
                }
              });
            }
            Z && (r(Z, function (a) {
              a();
            }), Z = null);
            g = 0;
            for (m = l.length; g < m; g++)
              s = l[g], $(s, s.isolateScope ? I : c, X, O, s.require && L(s.directiveName, s.require, X, F), gb);
            var Wb = c;
            P && (P.template || null === P.templateUrl) && (Wb = I);
            a && a(Wb, f.childNodes, t, h);
            for (g = p.length - 1; 0 <= g; g--)
              s = p[g], $(s, s.isolateScope ? I : c, X, O, s.require && L(s.directiveName, s.require, X, F), gb);
          }
          m = m || {};
          for (var I = -Number.MAX_VALUE, F, S = m.controllerDirectives, Z, P = m.newIsolateScopeDirective, ma = m.templateDirective, fa = m.nonTlbTranscludeDirective, ka = !1, x = !1, E = m.hasElementTranscludeDirective, w = e.$$element = A(d), K, da, V, fb = f, za, z = 0, Q = a.length; z < Q; z++) {
            K = a[z];
            var Oa = K.$$start, U = K.$$end;
            Oa && (w = ba(d, Oa, U));
            V = t;
            if (I > K.priority)
              break;
            if (V = K.scope)
              K.templateUrl || (J(V) ? (Na('new/isolated scope', P || F, K, w), P = K) : Na('new/isolated scope', P, K, w)), F = F || K;
            da = K.name;
            !K.templateUrl && K.controller && (V = K.controller, S = S || {}, Na('\'' + da + '\' controller', S[da], K, w), S[da] = K);
            if (V = K.transclude)
              ka = !0, K.$$tlb || (Na('transclusion', fa, K, w), fa = K), 'element' == V ? (E = !0, I = K.priority, V = w, w = e.$$element = A(W.createComment(' ' + da + ': ' + e[da] + ' ')), d = w[0], T(g, Za.call(V, 0), d), fb = D(V, f, I, k && k.name, { nonTlbTranscludeDirective: fa })) : (V = A(Ub(d)).contents(), w.empty(), fb = D(V, f));
            if (K.template)
              if (x = !0, Na('template', ma, K, w), ma = K, V = G(K.template) ? K.template(w, e) : K.template, V = Tc(V), K.replace) {
                k = K;
                V = Sb.test(V) ? Uc(Xb(K.templateNamespace, N(V))) : [];
                d = V[0];
                if (1 != V.length || d.nodeType !== qa)
                  throw la('tplrt', da, '');
                T(g, w, d);
                Q = { $attr: {} };
                V = X(d, [], Q);
                var aa = a.splice(z + 1, a.length - (z + 1));
                P && y(V);
                a = a.concat(V).concat(aa);
                R(e, Q);
                Q = a.length;
              } else
                w.html(V);
            if (K.templateUrl)
              x = !0, Na('template', ma, K, w), ma = K, K.replace && (k = K), B = of(a.splice(z, a.length - z), w, e, g, ka && fb, l, p, {
                controllerDirectives: S,
                newIsolateScopeDirective: P,
                templateDirective: ma,
                nonTlbTranscludeDirective: fa
              }), Q = a.length;
            else if (K.compile)
              try {
                za = K.compile(w, e, fb), G(za) ? s(null, za, Oa, U) : za && s(za.pre, za.post, Oa, U);
              } catch (pf) {
                c(pf, wa(w));
              }
            K.terminal && (B.terminal = !0, I = Math.max(I, K.priority));
          }
          B.scope = F && !0 === F.scope;
          B.transcludeOnThisElement = ka;
          B.elementTranscludeOnThisElement = E;
          B.templateOnThisElement = x;
          B.transclude = fb;
          m.hasElementTranscludeDirective = E;
          return B;
        }
        function y(a) {
          for (var b = 0, c = a.length; b < c; b++)
            a[b] = Ob(a[b], { $$isolateScope: !0 });
        }
        function ka(b, e, f, g, h, k, l) {
          if (e === h)
            return null;
          h = null;
          if (d.hasOwnProperty(e)) {
            var q;
            e = a.get(e + 'Directive');
            for (var m = 0, s = e.length; m < s; m++)
              try {
                q = e[m], (g === t || g > q.priority) && -1 != q.restrict.indexOf(f) && (k && (q = Ob(q, {
                  $$start: k,
                  $$end: l
                })), b.push(q), h = q);
              } catch (M) {
                c(M);
              }
          }
          return h;
        }
        function x(b) {
          if (d.hasOwnProperty(b))
            for (var c = a.get(b + 'Directive'), e = 0, f = c.length; e < f; e++)
              if (b = c[e], b.multiElement)
                return !0;
          return !1;
        }
        function R(a, b) {
          var c = b.$attr, d = a.$attr, e = a.$$element;
          r(a, function (d, e) {
            '$' != e.charAt(0) && (b[e] && b[e] !== d && (d += ('style' === e ? ';' : ' ') + b[e]), a.$set(e, d, !0, c[e]));
          });
          r(b, function (b, f) {
            'class' == f ? (I(e, b), a['class'] = (a['class'] ? a['class'] + ' ' : '') + b) : 'style' == f ? (e.attr('style', e.attr('style') + ';' + b), a.style = (a.style ? a.style + ';' : '') + b) : '$' == f.charAt(0) || a.hasOwnProperty(f) || (a[f] = b, d[f] = c[f]);
          });
        }
        function of(a, b, c, d, e, f, g, h) {
          var k = [], l, q, p = b[0], m = a.shift(), M = Ob(m, {
              templateUrl: null,
              transclude: null,
              replace: null,
              $$originalDirective: m
            }), u = G(m.templateUrl) ? m.templateUrl(b, c) : m.templateUrl, L = m.templateNamespace;
          b.empty();
          s(Z.getTrustedResourceUrl(u)).then(function (s) {
            var B, v;
            s = Tc(s);
            if (m.replace) {
              s = Sb.test(s) ? Uc(Xb(L, N(s))) : [];
              B = s[0];
              if (1 != s.length || B.nodeType !== qa)
                throw la('tplrt', m.name, u);
              s = { $attr: {} };
              T(d, b, B);
              var D = X(B, [], s);
              J(m.scope) && y(D);
              a = D.concat(a);
              R(c, s);
            } else
              B = p, b.html(s);
            a.unshift(M);
            l = fa(a, B, c, e, b, m, f, g, h);
            r(d, function (a, c) {
              a == B && (d[c] = b[0]);
            });
            for (q = S(b[0].childNodes, e); k.length;) {
              s = k.shift();
              v = k.shift();
              var F = k.shift(), O = k.shift(), D = b[0];
              if (!s.$$destroyed) {
                if (v !== p) {
                  var Z = v.className;
                  h.hasElementTranscludeDirective && m.replace || (D = Ub(B));
                  T(F, A(v), D);
                  I(A(D), Z);
                }
                v = l.transcludeOnThisElement ? P(s, l.transclude, O) : O;
                l(q, s, D, d, v);
              }
            }
            k = null;
          });
          return function (a, b, c, d, e) {
            a = e;
            b.$$destroyed || (k ? k.push(b, c, d, a) : (l.transcludeOnThisElement && (a = P(b, l.transclude, e)), l(q, b, c, d, a)));
          };
        }
        function da(a, b) {
          var c = b.priority - a.priority;
          return 0 !== c ? c : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index;
        }
        function Na(a, b, c, d) {
          if (b)
            throw la('multidir', b.name, c.name, a, wa(d));
        }
        function za(a, c) {
          var d = b(c, !0);
          d && a.push({
            priority: 0,
            compile: function (a) {
              a = a.parent();
              var b = !!a.length;
              b && D.$$addBindingClass(a);
              return function (a, c) {
                var e = c.parent();
                b || D.$$addBindingClass(e);
                D.$$addBindingInfo(e, d.expressions);
                a.$watch(d, function (a) {
                  c[0].nodeValue = a;
                });
              };
            }
          });
        }
        function Xb(a, b) {
          a = z(a || 'html');
          switch (a) {
          case 'svg':
          case 'math':
            var c = W.createElement('div');
            c.innerHTML = '<' + a + '>' + b + '</' + a + '>';
            return c.childNodes[0].childNodes;
          default:
            return b;
          }
        }
        function Q(a, b) {
          if ('srcdoc' == b)
            return Z.HTML;
          var c = va(a);
          if ('xlinkHref' == b || 'form' == c && 'action' == b || 'img' != c && ('src' == b || 'ngSrc' == b))
            return Z.RESOURCE_URL;
        }
        function Oa(a, c, d, e, f) {
          var h = Q(a, e);
          f = g[e] || f;
          var k = b(d, !0, h, f);
          if (k) {
            if ('multiple' === e && 'select' === va(a))
              throw la('selmulti', wa(a));
            c.push({
              priority: 100,
              compile: function () {
                return {
                  pre: function (a, c, g) {
                    c = g.$$observers || (g.$$observers = {});
                    if (l.test(e))
                      throw la('nodomevents');
                    var m = g[e];
                    m !== d && (k = m && b(m, !0, h, f), d = m);
                    k && (g[e] = k(a), (c[e] || (c[e] = [])).$$inter = !0, (g.$$observers && g.$$observers[e].$$scope || a).$watch(k, function (a, b) {
                      'class' === e && a != b ? g.$updateClass(a, b) : g.$set(e, a);
                    }));
                  }
                };
              }
            });
          }
        }
        function T(a, b, c) {
          var d = b[0], e = b.length, f = d.parentNode, g, h;
          if (a)
            for (g = 0, h = a.length; g < h; g++)
              if (a[g] == d) {
                a[g++] = c;
                h = g + e - 1;
                for (var k = a.length; g < k; g++, h++)
                  h < k ? a[g] = a[h] : delete a[g];
                a.length -= e - 1;
                a.context === d && (a.context = c);
                break;
              }
          f && f.replaceChild(c, d);
          a = W.createDocumentFragment();
          a.appendChild(d);
          A(c).data(A(d).data());
          ta ? (Qb = !0, ta.cleanData([d])) : delete A.cache[d[A.expando]];
          d = 1;
          for (e = b.length; d < e; d++)
            f = b[d], A(f).remove(), a.appendChild(f), delete b[d];
          b[0] = c;
          b.length = 1;
        }
        function Y(a, b) {
          return w(function () {
            return a.apply(null, arguments);
          }, a, b);
        }
        function $(a, b, d, e, f, g) {
          try {
            a(b, d, e, f, g);
          } catch (h) {
            c(h, wa(d));
          }
        }
        var Yb = function (a, b) {
          if (b) {
            var c = Object.keys(b), d, e, f;
            d = 0;
            for (e = c.length; d < e; d++)
              f = c[d], this[f] = b[f];
          } else
            this.$attr = {};
          this.$$element = a;
        };
        Yb.prototype = {
          $normalize: xa,
          $addClass: function (a) {
            a && 0 < a.length && L.addClass(this.$$element, a);
          },
          $removeClass: function (a) {
            a && 0 < a.length && L.removeClass(this.$$element, a);
          },
          $updateClass: function (a, b) {
            var c = Vc(a, b);
            c && c.length && L.addClass(this.$$element, c);
            (c = Vc(b, a)) && c.length && L.removeClass(this.$$element, c);
          },
          $set: function (a, b, d, e) {
            var f = this.$$element[0], g = Nc(f, a), h = kf(f, a), f = a;
            g ? (this.$$element.prop(a, b), e = g) : h && (this[h] = b, f = h);
            this[a] = b;
            e ? this.$attr[a] = e : (e = this.$attr[a]) || (this.$attr[a] = e = vc(a, '-'));
            g = va(this.$$element);
            if ('a' === g && 'href' === a || 'img' === g && 'src' === a)
              this[a] = b = B(b, 'src' === a);
            else if ('img' === g && 'srcset' === a) {
              for (var g = '', h = N(b), k = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/, k = /\s/.test(h) ? k : /(,)/, h = h.split(k), k = Math.floor(h.length / 2), l = 0; l < k; l++)
                var q = 2 * l, g = g + B(N(h[q]), !0), g = g + (' ' + N(h[q + 1]));
              h = N(h[2 * l]).split(/\s/);
              g += B(N(h[0]), !0);
              2 === h.length && (g += ' ' + N(h[1]));
              this[a] = b = g;
            }
            !1 !== d && (null === b || b === t ? this.$$element.removeAttr(e) : this.$$element.attr(e, b));
            (a = this.$$observers) && r(a[f], function (a) {
              try {
                a(b);
              } catch (d) {
                c(d);
              }
            });
          },
          $observe: function (a, b) {
            var c = this, d = c.$$observers || (c.$$observers = ia()), e = d[a] || (d[a] = []);
            e.push(b);
            m.$evalAsync(function () {
              !e.$$inter && c.hasOwnProperty(a) && b(c[a]);
            });
            return function () {
              Xa(e, b);
            };
          }
        };
        var V = b.startSymbol(), ma = b.endSymbol(), Tc = '{{' == V || '}}' == ma ? ra : function (a) {
            return a.replace(/\{\{/g, V).replace(/}}/g, ma);
          }, U = /^ngAttr[A-Z]/;
        D.$$addBindingInfo = k ? function (a, b) {
          var c = a.data('$binding') || [];
          H(b) ? c = c.concat(b) : c.push(b);
          a.data('$binding', c);
        } : E;
        D.$$addBindingClass = k ? function (a) {
          I(a, 'ng-binding');
        } : E;
        D.$$addScopeInfo = k ? function (a, b, c, d) {
          a.data(c ? d ? '$isolateScopeNoTemplate' : '$isolateScope' : '$scope', b);
        } : E;
        D.$$addScopeClass = k ? function (a, b) {
          I(a, b ? 'ng-isolate-scope' : 'ng-scope');
        } : E;
        return D;
      }
    ];
  }
  function xa(b) {
    return db(b.replace(Sc, ''));
  }
  function Vc(b, a) {
    var c = '', d = b.split(/\s+/), e = a.split(/\s+/), f = 0;
    a:
      for (; f < d.length; f++) {
        for (var g = d[f], h = 0; h < e.length; h++)
          if (g == e[h])
            continue a;
        c += (0 < c.length ? ' ' : '') + g;
      }
    return c;
  }
  function Uc(b) {
    b = A(b);
    var a = b.length;
    if (1 >= a)
      return b;
    for (; a--;)
      8 === b[a].nodeType && qf.call(b, a, 1);
    return b;
  }
  function Fe() {
    var b = {}, a = !1, c = /^(\S+)(\s+as\s+(\w+))?$/;
    this.register = function (a, c) {
      La(a, 'controller');
      J(a) ? w(b, a) : b[a] = c;
    };
    this.allowGlobals = function () {
      a = !0;
    };
    this.$get = [
      '$injector',
      '$window',
      function (d, e) {
        function f(a, b, c, d) {
          if (!a || !J(a.$scope))
            throw R('$controller')('noscp', d, b);
          a.$scope[b] = c;
        }
        return function (g, h, l, k) {
          var n, p, q;
          l = !0 === l;
          k && C(k) && (q = k);
          if (C(g)) {
            k = g.match(c);
            if (!k)
              throw rf('ctrlfmt', g);
            p = k[1];
            q = q || k[3];
            g = b.hasOwnProperty(p) ? b[p] : xc(h.$scope, p, !0) || (a ? xc(e, p, !0) : t);
            sb(g, p, !0);
          }
          if (l)
            return l = (H(g) ? g[g.length - 1] : g).prototype, n = Object.create(l || null), q && f(h, q, n, p || g.name), w(function () {
              d.invoke(g, n, h, p);
              return n;
            }, {
              instance: n,
              identifier: q
            });
          n = d.instantiate(g, h, p);
          q && f(h, q, n, p || g.name);
          return n;
        };
      }
    ];
  }
  function Ge() {
    this.$get = [
      '$window',
      function (b) {
        return A(b.document);
      }
    ];
  }
  function He() {
    this.$get = [
      '$log',
      function (b) {
        return function (a, c) {
          b.error.apply(b, arguments);
        };
      }
    ];
  }
  function Zb(b, a) {
    if (C(b)) {
      var c = b.replace(sf, '').trim();
      if (c) {
        var d = a('Content-Type');
        (d = d && 0 === d.indexOf(Wc)) || (d = (d = c.match(tf)) && uf[d[0]].test(c));
        d && (b = qc(c));
      }
    }
    return b;
  }
  function Xc(b) {
    var a = ia(), c, d, e;
    if (!b)
      return a;
    r(b.split('\n'), function (b) {
      e = b.indexOf(':');
      c = z(N(b.substr(0, e)));
      d = N(b.substr(e + 1));
      c && (a[c] = a[c] ? a[c] + ', ' + d : d);
    });
    return a;
  }
  function Yc(b) {
    var a = J(b) ? b : t;
    return function (c) {
      a || (a = Xc(b));
      return c ? (c = a[z(c)], void 0 === c && (c = null), c) : a;
    };
  }
  function Zc(b, a, c, d) {
    if (G(d))
      return d(b, a, c);
    r(d, function (d) {
      b = d(b, a, c);
    });
    return b;
  }
  function Ke() {
    var b = this.defaults = {
        transformResponse: [Zb],
        transformRequest: [function (a) {
            return J(a) && '[object File]' !== Ca.call(a) && '[object Blob]' !== Ca.call(a) && '[object FormData]' !== Ca.call(a) ? $a(a) : a;
          }],
        headers: {
          common: { Accept: 'application/json, text/plain, */*' },
          post: sa($b),
          put: sa($b),
          patch: sa($b)
        },
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN'
      }, a = !1;
    this.useApplyAsync = function (b) {
      return y(b) ? (a = !!b, this) : a;
    };
    var c = this.interceptors = [];
    this.$get = [
      '$httpBackend',
      '$browser',
      '$cacheFactory',
      '$rootScope',
      '$q',
      '$injector',
      function (d, e, f, g, h, l) {
        function k(a) {
          function c(a) {
            var b = w({}, a);
            b.data = a.data ? Zc(a.data, a.headers, a.status, e.transformResponse) : a.data;
            a = a.status;
            return 200 <= a && 300 > a ? b : h.reject(b);
          }
          function d(a) {
            var b, c = {};
            r(a, function (a, d) {
              G(a) ? (b = a(), null != b && (c[d] = b)) : c[d] = a;
            });
            return c;
          }
          if (!ca.isObject(a))
            throw R('$http')('badreq', a);
          var e = w({
              method: 'get',
              transformRequest: b.transformRequest,
              transformResponse: b.transformResponse
            }, a);
          e.headers = function (a) {
            var c = b.headers, e = w({}, a.headers), f, g, c = w({}, c.common, c[z(a.method)]);
            a:
              for (f in c) {
                a = z(f);
                for (g in e)
                  if (z(g) === a)
                    continue a;
                e[f] = c[f];
              }
            return d(e);
          }(a);
          e.method = ub(e.method);
          var f = [
              function (a) {
                var d = a.headers, e = Zc(a.data, Yc(d), t, a.transformRequest);
                x(e) && r(d, function (a, b) {
                  'content-type' === z(b) && delete d[b];
                });
                x(a.withCredentials) && !x(b.withCredentials) && (a.withCredentials = b.withCredentials);
                return n(a, e).then(c, c);
              },
              t
            ], g = h.when(e);
          for (r(u, function (a) {
              (a.request || a.requestError) && f.unshift(a.request, a.requestError);
              (a.response || a.responseError) && f.push(a.response, a.responseError);
            }); f.length;) {
            a = f.shift();
            var k = f.shift(), g = g.then(a, k);
          }
          g.success = function (a) {
            g.then(function (b) {
              a(b.data, b.status, b.headers, e);
            });
            return g;
          };
          g.error = function (a) {
            g.then(null, function (b) {
              a(b.data, b.status, b.headers, e);
            });
            return g;
          };
          return g;
        }
        function n(c, f) {
          function l(b, c, d, e) {
            function f() {
              m(c, b, d, e);
            }
            I && (200 <= b && 300 > b ? I.put(P, [
              b,
              c,
              Xc(d),
              e
            ]) : I.remove(P));
            a ? g.$applyAsync(f) : (f(), g.$$phase || g.$apply());
          }
          function m(a, b, d, e) {
            b = Math.max(b, 0);
            (200 <= b && 300 > b ? L.resolve : L.reject)({
              data: a,
              status: b,
              headers: Yc(d),
              config: c,
              statusText: e
            });
          }
          function n(a) {
            m(a.data, a.status, sa(a.headers()), a.statusText);
          }
          function u() {
            var a = k.pendingRequests.indexOf(c);
            -1 !== a && k.pendingRequests.splice(a, 1);
          }
          var L = h.defer(), B = L.promise, I, D, S = c.headers, P = p(c.url, c.params);
          k.pendingRequests.push(c);
          B.then(u, u);
          !c.cache && !b.cache || !1 === c.cache || 'GET' !== c.method && 'JSONP' !== c.method || (I = J(c.cache) ? c.cache : J(b.cache) ? b.cache : q);
          I && (D = I.get(P), y(D) ? D && G(D.then) ? D.then(n, n) : H(D) ? m(D[1], D[0], sa(D[2]), D[3]) : m(D, 200, {}, 'OK') : I.put(P, B));
          x(D) && ((D = $c(c.url) ? e.cookies()[c.xsrfCookieName || b.xsrfCookieName] : t) && (S[c.xsrfHeaderName || b.xsrfHeaderName] = D), d(c.method, P, f, l, S, c.timeout, c.withCredentials, c.responseType));
          return B;
        }
        function p(a, b) {
          if (!b)
            return a;
          var c = [];
          Ed(b, function (a, b) {
            null === a || x(a) || (H(a) || (a = [a]), r(a, function (a) {
              J(a) && (a = ga(a) ? a.toISOString() : $a(a));
              c.push(Ea(b) + '=' + Ea(a));
            }));
          });
          0 < c.length && (a += (-1 == a.indexOf('?') ? '?' : '&') + c.join('&'));
          return a;
        }
        var q = f('$http'), u = [];
        r(c, function (a) {
          u.unshift(C(a) ? l.get(a) : l.invoke(a));
        });
        k.pendingRequests = [];
        (function (a) {
          r(arguments, function (a) {
            k[a] = function (b, c) {
              return k(w(c || {}, {
                method: a,
                url: b
              }));
            };
          });
        }('get', 'delete', 'head', 'jsonp'));
        (function (a) {
          r(arguments, function (a) {
            k[a] = function (b, c, d) {
              return k(w(d || {}, {
                method: a,
                url: b,
                data: c
              }));
            };
          });
        }('post', 'put', 'patch'));
        k.defaults = b;
        return k;
      }
    ];
  }
  function vf() {
    return new Q.XMLHttpRequest();
  }
  function Le() {
    this.$get = [
      '$browser',
      '$window',
      '$document',
      function (b, a, c) {
        return wf(b, vf, b.defer, a.angular.callbacks, c[0]);
      }
    ];
  }
  function wf(b, a, c, d, e) {
    function f(a, b, c) {
      var f = e.createElement('script'), n = null;
      f.type = 'text/javascript';
      f.src = a;
      f.async = !0;
      n = function (a) {
        f.removeEventListener('load', n, !1);
        f.removeEventListener('error', n, !1);
        e.body.removeChild(f);
        f = null;
        var g = -1, u = 'unknown';
        a && ('load' !== a.type || d[b].called || (a = { type: 'error' }), u = a.type, g = 'error' === a.type ? 404 : 200);
        c && c(g, u);
      };
      f.addEventListener('load', n, !1);
      f.addEventListener('error', n, !1);
      e.body.appendChild(f);
      return n;
    }
    return function (e, h, l, k, n, p, q, u) {
      function s() {
        m && m();
        F && F.abort();
      }
      function M(a, d, e, f, g) {
        L !== t && c.cancel(L);
        m = F = null;
        a(d, e, f, g);
        b.$$completeOutstandingRequest(E);
      }
      b.$$incOutstandingRequestCount();
      h = h || b.url();
      if ('jsonp' == z(e)) {
        var v = '_' + (d.counter++).toString(36);
        d[v] = function (a) {
          d[v].data = a;
          d[v].called = !0;
        };
        var m = f(h.replace('JSON_CALLBACK', 'angular.callbacks.' + v), v, function (a, b) {
            M(k, a, d[v].data, '', b);
            d[v] = E;
          });
      } else {
        var F = a();
        F.open(e, h, !0);
        r(n, function (a, b) {
          y(a) && F.setRequestHeader(b, a);
        });
        F.onload = function () {
          var a = F.statusText || '', b = 'response' in F ? F.response : F.responseText, c = 1223 === F.status ? 204 : F.status;
          0 === c && (c = b ? 200 : 'file' == Aa(h).protocol ? 404 : 0);
          M(k, c, b, F.getAllResponseHeaders(), a);
        };
        e = function () {
          M(k, -1, null, null, '');
        };
        F.onerror = e;
        F.onabort = e;
        q && (F.withCredentials = !0);
        if (u)
          try {
            F.responseType = u;
          } catch (Z) {
            if ('json' !== u)
              throw Z;
          }
        F.send(l || null);
      }
      if (0 < p)
        var L = c(s, p);
      else
        p && G(p.then) && p.then(s);
    };
  }
  function Ie() {
    var b = '{{', a = '}}';
    this.startSymbol = function (a) {
      return a ? (b = a, this) : b;
    };
    this.endSymbol = function (b) {
      return b ? (a = b, this) : a;
    };
    this.$get = [
      '$parse',
      '$exceptionHandler',
      '$sce',
      function (c, d, e) {
        function f(a) {
          return '\\\\\\' + a;
        }
        function g(f, g, u, s) {
          function M(c) {
            return c.replace(k, b).replace(n, a);
          }
          function v(a) {
            try {
              var b = a;
              a = u ? e.getTrusted(u, b) : e.valueOf(b);
              var c;
              if (s && !y(a))
                c = a;
              else if (null == a)
                c = '';
              else {
                switch (typeof a) {
                case 'string':
                  break;
                case 'number':
                  a = '' + a;
                  break;
                default:
                  a = $a(a);
                }
                c = a;
              }
              return c;
            } catch (g) {
              c = ac('interr', f, g.toString()), d(c);
            }
          }
          s = !!s;
          for (var m, F, r = 0, L = [], B = [], I = f.length, D = [], S = []; r < I;)
            if (-1 != (m = f.indexOf(b, r)) && -1 != (F = f.indexOf(a, m + h)))
              r !== m && D.push(M(f.substring(r, m))), r = f.substring(m + h, F), L.push(r), B.push(c(r, v)), r = F + l, S.push(D.length), D.push('');
            else {
              r !== I && D.push(M(f.substring(r)));
              break;
            }
          if (u && 1 < D.length)
            throw ac('noconcat', f);
          if (!g || L.length) {
            var P = function (a) {
              for (var b = 0, c = L.length; b < c; b++) {
                if (s && x(a[b]))
                  return;
                D[S[b]] = a[b];
              }
              return D.join('');
            };
            return w(function (a) {
              var b = 0, c = L.length, e = Array(c);
              try {
                for (; b < c; b++)
                  e[b] = B[b](a);
                return P(e);
              } catch (g) {
                a = ac('interr', f, g.toString()), d(a);
              }
            }, {
              exp: f,
              expressions: L,
              $$watchDelegate: function (a, b, c) {
                var d;
                return a.$watchGroup(B, function (c, e) {
                  var f = P(c);
                  G(b) && b.call(this, f, c !== e ? d : f, a);
                  d = f;
                }, c);
              }
            });
          }
        }
        var h = b.length, l = a.length, k = new RegExp(b.replace(/./g, f), 'g'), n = new RegExp(a.replace(/./g, f), 'g');
        g.startSymbol = function () {
          return b;
        };
        g.endSymbol = function () {
          return a;
        };
        return g;
      }
    ];
  }
  function Je() {
    this.$get = [
      '$rootScope',
      '$window',
      '$q',
      '$$q',
      function (b, a, c, d) {
        function e(e, h, l, k) {
          var n = a.setInterval, p = a.clearInterval, q = 0, u = y(k) && !k, s = (u ? d : c).defer(), M = s.promise;
          l = y(l) ? l : 0;
          M.then(null, null, e);
          M.$$intervalId = n(function () {
            s.notify(q++);
            0 < l && q >= l && (s.resolve(q), p(M.$$intervalId), delete f[M.$$intervalId]);
            u || b.$apply();
          }, h);
          f[M.$$intervalId] = s;
          return M;
        }
        var f = {};
        e.cancel = function (b) {
          return b && b.$$intervalId in f ? (f[b.$$intervalId].reject('canceled'), a.clearInterval(b.$$intervalId), delete f[b.$$intervalId], !0) : !1;
        };
        return e;
      }
    ];
  }
  function Rd() {
    this.$get = function () {
      return {
        id: 'en-us',
        NUMBER_FORMATS: {
          DECIMAL_SEP: '.',
          GROUP_SEP: ',',
          PATTERNS: [
            {
              minInt: 1,
              minFrac: 0,
              maxFrac: 3,
              posPre: '',
              posSuf: '',
              negPre: '-',
              negSuf: '',
              gSize: 3,
              lgSize: 3
            },
            {
              minInt: 1,
              minFrac: 2,
              maxFrac: 2,
              posPre: '\xa4',
              posSuf: '',
              negPre: '(\xa4',
              negSuf: ')',
              gSize: 3,
              lgSize: 3
            }
          ],
          CURRENCY_SYM: '$'
        },
        DATETIME_FORMATS: {
          MONTH: 'January February March April May June July August September October November December'.split(' '),
          SHORTMONTH: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
          DAY: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
          SHORTDAY: 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
          AMPMS: [
            'AM',
            'PM'
          ],
          medium: 'MMM d, y h:mm:ss a',
          'short': 'M/d/yy h:mm a',
          fullDate: 'EEEE, MMMM d, y',
          longDate: 'MMMM d, y',
          mediumDate: 'MMM d, y',
          shortDate: 'M/d/yy',
          mediumTime: 'h:mm:ss a',
          shortTime: 'h:mm a',
          ERANAMES: [
            'Before Christ',
            'Anno Domini'
          ],
          ERAS: [
            'BC',
            'AD'
          ]
        },
        pluralCat: function (b) {
          return 1 === b ? 'one' : 'other';
        }
      };
    };
  }
  function bc(b) {
    b = b.split('/');
    for (var a = b.length; a--;)
      b[a] = qb(b[a]);
    return b.join('/');
  }
  function ad(b, a) {
    var c = Aa(b);
    a.$$protocol = c.protocol;
    a.$$host = c.hostname;
    a.$$port = aa(c.port) || xf[c.protocol] || null;
  }
  function bd(b, a) {
    var c = '/' !== b.charAt(0);
    c && (b = '/' + b);
    var d = Aa(b);
    a.$$path = decodeURIComponent(c && '/' === d.pathname.charAt(0) ? d.pathname.substring(1) : d.pathname);
    a.$$search = sc(d.search);
    a.$$hash = decodeURIComponent(d.hash);
    a.$$path && '/' != a.$$path.charAt(0) && (a.$$path = '/' + a.$$path);
  }
  function ya(b, a) {
    if (0 === a.indexOf(b))
      return a.substr(b.length);
  }
  function Ga(b) {
    var a = b.indexOf('#');
    return -1 == a ? b : b.substr(0, a);
  }
  function Fb(b) {
    return b.replace(/(#.+)|#$/, '$1');
  }
  function cc(b) {
    return b.substr(0, Ga(b).lastIndexOf('/') + 1);
  }
  function dc(b, a) {
    this.$$html5 = !0;
    a = a || '';
    var c = cc(b);
    ad(b, this);
    this.$$parse = function (a) {
      var b = ya(c, a);
      if (!C(b))
        throw Gb('ipthprfx', a, c);
      bd(b, this);
      this.$$path || (this.$$path = '/');
      this.$$compose();
    };
    this.$$compose = function () {
      var a = Pb(this.$$search), b = this.$$hash ? '#' + qb(this.$$hash) : '';
      this.$$url = bc(this.$$path) + (a ? '?' + a : '') + b;
      this.$$absUrl = c + this.$$url.substr(1);
    };
    this.$$parseLinkUrl = function (d, e) {
      if (e && '#' === e[0])
        return this.hash(e.slice(1)), !0;
      var f, g;
      (f = ya(b, d)) !== t ? (g = f, g = (f = ya(a, f)) !== t ? c + (ya('/', f) || f) : b + g) : (f = ya(c, d)) !== t ? g = c + f : c == d + '/' && (g = c);
      g && this.$$parse(g);
      return !!g;
    };
  }
  function ec(b, a) {
    var c = cc(b);
    ad(b, this);
    this.$$parse = function (d) {
      d = ya(b, d) || ya(c, d);
      var e;
      '#' === d.charAt(0) ? (e = ya(a, d), x(e) && (e = d)) : e = this.$$html5 ? d : '';
      bd(e, this);
      d = this.$$path;
      var f = /^\/[A-Z]:(\/.*)/;
      0 === e.indexOf(b) && (e = e.replace(b, ''));
      f.exec(e) || (d = (e = f.exec(d)) ? e[1] : d);
      this.$$path = d;
      this.$$compose();
    };
    this.$$compose = function () {
      var c = Pb(this.$$search), e = this.$$hash ? '#' + qb(this.$$hash) : '';
      this.$$url = bc(this.$$path) + (c ? '?' + c : '') + e;
      this.$$absUrl = b + (this.$$url ? a + this.$$url : '');
    };
    this.$$parseLinkUrl = function (a, c) {
      return Ga(b) == Ga(a) ? (this.$$parse(a), !0) : !1;
    };
  }
  function cd(b, a) {
    this.$$html5 = !0;
    ec.apply(this, arguments);
    var c = cc(b);
    this.$$parseLinkUrl = function (d, e) {
      if (e && '#' === e[0])
        return this.hash(e.slice(1)), !0;
      var f, g;
      b == Ga(d) ? f = d : (g = ya(c, d)) ? f = b + a + g : c === d + '/' && (f = c);
      f && this.$$parse(f);
      return !!f;
    };
    this.$$compose = function () {
      var c = Pb(this.$$search), e = this.$$hash ? '#' + qb(this.$$hash) : '';
      this.$$url = bc(this.$$path) + (c ? '?' + c : '') + e;
      this.$$absUrl = b + a + this.$$url;
    };
  }
  function Hb(b) {
    return function () {
      return this[b];
    };
  }
  function dd(b, a) {
    return function (c) {
      if (x(c))
        return this[b];
      this[b] = a(c);
      this.$$compose();
      return this;
    };
  }
  function Me() {
    var b = '', a = {
        enabled: !1,
        requireBase: !0,
        rewriteLinks: !0
      };
    this.hashPrefix = function (a) {
      return y(a) ? (b = a, this) : b;
    };
    this.html5Mode = function (b) {
      return Wa(b) ? (a.enabled = b, this) : J(b) ? (Wa(b.enabled) && (a.enabled = b.enabled), Wa(b.requireBase) && (a.requireBase = b.requireBase), Wa(b.rewriteLinks) && (a.rewriteLinks = b.rewriteLinks), this) : a;
    };
    this.$get = [
      '$rootScope',
      '$browser',
      '$sniffer',
      '$rootElement',
      '$window',
      function (c, d, e, f, g) {
        function h(a, b, c) {
          var e = k.url(), f = k.$$state;
          try {
            d.url(a, b, c), k.$$state = d.state();
          } catch (g) {
            throw k.url(e), k.$$state = f, g;
          }
        }
        function l(a, b) {
          c.$broadcast('$locationChangeSuccess', k.absUrl(), a, k.$$state, b);
        }
        var k, n;
        n = d.baseHref();
        var p = d.url(), q;
        if (a.enabled) {
          if (!n && a.requireBase)
            throw Gb('nobase');
          q = p.substring(0, p.indexOf('/', p.indexOf('//') + 2)) + (n || '/');
          n = e.history ? dc : cd;
        } else
          q = Ga(p), n = ec;
        k = new n(q, '#' + b);
        k.$$parseLinkUrl(p, p);
        k.$$state = d.state();
        var u = /^\s*(javascript|mailto):/i;
        f.on('click', function (b) {
          if (a.rewriteLinks && !b.ctrlKey && !b.metaKey && !b.shiftKey && 2 != b.which && 2 != b.button) {
            for (var e = A(b.target); 'a' !== va(e[0]);)
              if (e[0] === f[0] || !(e = e.parent())[0])
                return;
            var h = e.prop('href'), l = e.attr('href') || e.attr('xlink:href');
            J(h) && '[object SVGAnimatedString]' === h.toString() && (h = Aa(h.animVal).href);
            u.test(h) || !h || e.attr('target') || b.isDefaultPrevented() || !k.$$parseLinkUrl(h, l) || (b.preventDefault(), k.absUrl() != d.url() && (c.$apply(), g.angular['ff-684208-preventDefault'] = !0));
          }
        });
        Fb(k.absUrl()) != Fb(p) && d.url(k.absUrl(), !0);
        var s = !0;
        d.onUrlChange(function (a, b) {
          c.$evalAsync(function () {
            var d = k.absUrl(), e = k.$$state, f;
            k.$$parse(a);
            k.$$state = b;
            f = c.$broadcast('$locationChangeStart', a, d, b, e).defaultPrevented;
            k.absUrl() === a && (f ? (k.$$parse(d), k.$$state = e, h(d, !1, e)) : (s = !1, l(d, e)));
          });
          c.$$phase || c.$digest();
        });
        c.$watch(function () {
          var a = Fb(d.url()), b = Fb(k.absUrl()), f = d.state(), g = k.$$replace, q = a !== b || k.$$html5 && e.history && f !== k.$$state;
          if (s || q)
            s = !1, c.$evalAsync(function () {
              var b = k.absUrl(), d = c.$broadcast('$locationChangeStart', b, a, k.$$state, f).defaultPrevented;
              k.absUrl() === b && (d ? (k.$$parse(a), k.$$state = f) : (q && h(b, g, f === k.$$state ? null : k.$$state), l(a, f)));
            });
          k.$$replace = !1;
        });
        return k;
      }
    ];
  }
  function Ne() {
    var b = !0, a = this;
    this.debugEnabled = function (a) {
      return y(a) ? (b = a, this) : b;
    };
    this.$get = [
      '$window',
      function (c) {
        function d(a) {
          a instanceof Error && (a.stack ? a = a.message && -1 === a.stack.indexOf(a.message) ? 'Error: ' + a.message + '\n' + a.stack : a.stack : a.sourceURL && (a = a.message + '\n' + a.sourceURL + ':' + a.line));
          return a;
        }
        function e(a) {
          var b = c.console || {}, e = b[a] || b.log || E;
          a = !1;
          try {
            a = !!e.apply;
          } catch (l) {
          }
          return a ? function () {
            var a = [];
            r(arguments, function (b) {
              a.push(d(b));
            });
            return e.apply(b, a);
          } : function (a, b) {
            e(a, null == b ? '' : b);
          };
        }
        return {
          log: e('log'),
          info: e('info'),
          warn: e('warn'),
          error: e('error'),
          debug: function () {
            var c = e('debug');
            return function () {
              b && c.apply(a, arguments);
            };
          }()
        };
      }
    ];
  }
  function ua(b, a) {
    if ('__defineGetter__' === b || '__defineSetter__' === b || '__lookupGetter__' === b || '__lookupSetter__' === b || '__proto__' === b)
      throw na('isecfld', a);
    return b;
  }
  function oa(b, a) {
    if (b) {
      if (b.constructor === b)
        throw na('isecfn', a);
      if (b.window === b)
        throw na('isecwindow', a);
      if (b.children && (b.nodeName || b.prop && b.attr && b.find))
        throw na('isecdom', a);
      if (b === Object)
        throw na('isecobj', a);
    }
    return b;
  }
  function fc(b) {
    return b.constant;
  }
  function hb(b, a, c, d, e) {
    oa(b, e);
    oa(a, e);
    c = c.split('.');
    for (var f, g = 0; 1 < c.length; g++) {
      f = ua(c.shift(), e);
      var h = 0 === g && a && a[f] || b[f];
      h || (h = {}, b[f] = h);
      b = oa(h, e);
    }
    f = ua(c.shift(), e);
    oa(b[f], e);
    return b[f] = d;
  }
  function Pa(b) {
    return 'constructor' == b;
  }
  function ed(b, a, c, d, e, f, g) {
    ua(b, f);
    ua(a, f);
    ua(c, f);
    ua(d, f);
    ua(e, f);
    var h = function (a) {
        return oa(a, f);
      }, l = g || Pa(b) ? h : ra, k = g || Pa(a) ? h : ra, n = g || Pa(c) ? h : ra, p = g || Pa(d) ? h : ra, q = g || Pa(e) ? h : ra;
    return function (f, g) {
      var h = g && g.hasOwnProperty(b) ? g : f;
      if (null == h)
        return h;
      h = l(h[b]);
      if (!a)
        return h;
      if (null == h)
        return t;
      h = k(h[a]);
      if (!c)
        return h;
      if (null == h)
        return t;
      h = n(h[c]);
      if (!d)
        return h;
      if (null == h)
        return t;
      h = p(h[d]);
      return e ? null == h ? t : h = q(h[e]) : h;
    };
  }
  function yf(b, a) {
    return function (c, d) {
      return b(c, d, oa, a);
    };
  }
  function zf(b, a, c) {
    var d = a.expensiveChecks, e = d ? Af : Bf, f = e[b];
    if (f)
      return f;
    var g = b.split('.'), h = g.length;
    if (a.csp)
      f = 6 > h ? ed(g[0], g[1], g[2], g[3], g[4], c, d) : function (a, b) {
        var e = 0, f;
        do
          f = ed(g[e++], g[e++], g[e++], g[e++], g[e++], c, d)(a, b), b = t, a = f;
        while (e < h);
        return f;
      };
    else {
      var l = '';
      d && (l += 's = eso(s, fe);\nl = eso(l, fe);\n');
      var k = d;
      r(g, function (a, b) {
        ua(a, c);
        var e = (b ? 's' : '((l&&l.hasOwnProperty("' + a + '"))?l:s)') + '.' + a;
        if (d || Pa(a))
          e = 'eso(' + e + ', fe)', k = !0;
        l += 'if(s == null) return undefined;\ns=' + e + ';\n';
      });
      l += 'return s;';
      a = new Function('s', 'l', 'eso', 'fe', l);
      a.toString = ea(l);
      k && (a = yf(a, c));
      f = a;
    }
    f.sharedGetter = !0;
    f.assign = function (a, c, d) {
      return hb(a, d, b, c, b);
    };
    return e[b] = f;
  }
  function gc(b) {
    return G(b.valueOf) ? b.valueOf() : Cf.call(b);
  }
  function Oe() {
    var b = ia(), a = ia();
    this.$get = [
      '$filter',
      '$sniffer',
      function (c, d) {
        function e(a) {
          var b = a;
          a.sharedGetter && (b = function (b, c) {
            return a(b, c);
          }, b.literal = a.literal, b.constant = a.constant, b.assign = a.assign);
          return b;
        }
        function f(a, b) {
          for (var c = 0, d = a.length; c < d; c++) {
            var e = a[c];
            e.constant || (e.inputs ? f(e.inputs, b) : -1 === b.indexOf(e) && b.push(e));
          }
          return b;
        }
        function g(a, b) {
          return null == a || null == b ? a === b : 'object' === typeof a && (a = gc(a), 'object' === typeof a) ? !1 : a === b || a !== a && b !== b;
        }
        function h(a, b, c, d) {
          var e = d.$$inputs || (d.$$inputs = f(d.inputs, [])), h;
          if (1 === e.length) {
            var k = g, e = e[0];
            return a.$watch(function (a) {
              var b = e(a);
              g(b, k) || (h = d(a), k = b && gc(b));
              return h;
            }, b, c);
          }
          for (var l = [], q = 0, p = e.length; q < p; q++)
            l[q] = g;
          return a.$watch(function (a) {
            for (var b = !1, c = 0, f = e.length; c < f; c++) {
              var k = e[c](a);
              if (b || (b = !g(k, l[c])))
                l[c] = k && gc(k);
            }
            b && (h = d(a));
            return h;
          }, b, c);
        }
        function l(a, b, c, d) {
          var e, f;
          return e = a.$watch(function (a) {
            return d(a);
          }, function (a, c, d) {
            f = a;
            G(b) && b.apply(this, arguments);
            y(a) && d.$$postDigest(function () {
              y(f) && e();
            });
          }, c);
        }
        function k(a, b, c, d) {
          function e(a) {
            var b = !0;
            r(a, function (a) {
              y(a) || (b = !1);
            });
            return b;
          }
          var f, g;
          return f = a.$watch(function (a) {
            return d(a);
          }, function (a, c, d) {
            g = a;
            G(b) && b.call(this, a, c, d);
            e(a) && d.$$postDigest(function () {
              e(g) && f();
            });
          }, c);
        }
        function n(a, b, c, d) {
          var e;
          return e = a.$watch(function (a) {
            return d(a);
          }, function (a, c, d) {
            G(b) && b.apply(this, arguments);
            e();
          }, c);
        }
        function p(a, b) {
          if (!b)
            return a;
          var c = a.$$watchDelegate, c = c !== k && c !== l ? function (c, d) {
              var e = a(c, d);
              return b(e, c, d);
            } : function (c, d) {
              var e = a(c, d), f = b(e, c, d);
              return y(e) ? f : e;
            };
          a.$$watchDelegate && a.$$watchDelegate !== h ? c.$$watchDelegate = a.$$watchDelegate : b.$stateful || (c.$$watchDelegate = h, c.inputs = [a]);
          return c;
        }
        var q = {
            csp: d.csp,
            expensiveChecks: !1
          }, u = {
            csp: d.csp,
            expensiveChecks: !0
          };
        return function (d, f, g) {
          var m, r, t;
          switch (typeof d) {
          case 'string':
            t = d = d.trim();
            var L = g ? a : b;
            m = L[t];
            m || (':' === d.charAt(0) && ':' === d.charAt(1) && (r = !0, d = d.substring(2)), g = g ? u : q, m = new hc(g), m = new ib(m, c, g).parse(d), m.constant ? m.$$watchDelegate = n : r ? (m = e(m), m.$$watchDelegate = m.literal ? k : l) : m.inputs && (m.$$watchDelegate = h), L[t] = m);
            return p(m, f);
          case 'function':
            return p(d, f);
          default:
            return p(E, f);
          }
        };
      }
    ];
  }
  function Qe() {
    this.$get = [
      '$rootScope',
      '$exceptionHandler',
      function (b, a) {
        return fd(function (a) {
          b.$evalAsync(a);
        }, a);
      }
    ];
  }
  function Re() {
    this.$get = [
      '$browser',
      '$exceptionHandler',
      function (b, a) {
        return fd(function (a) {
          b.defer(a);
        }, a);
      }
    ];
  }
  function fd(b, a) {
    function c(a, b, c) {
      function d(b) {
        return function (c) {
          e || (e = !0, b.call(a, c));
        };
      }
      var e = !1;
      return [
        d(b),
        d(c)
      ];
    }
    function d() {
      this.$$state = { status: 0 };
    }
    function e(a, b) {
      return function (c) {
        b.call(a, c);
      };
    }
    function f(c) {
      !c.processScheduled && c.pending && (c.processScheduled = !0, b(function () {
        var b, d, e;
        e = c.pending;
        c.processScheduled = !1;
        c.pending = t;
        for (var f = 0, g = e.length; f < g; ++f) {
          d = e[f][0];
          b = e[f][c.status];
          try {
            G(b) ? d.resolve(b(c.value)) : 1 === c.status ? d.resolve(c.value) : d.reject(c.value);
          } catch (h) {
            d.reject(h), a(h);
          }
        }
      }));
    }
    function g() {
      this.promise = new d();
      this.resolve = e(this, this.resolve);
      this.reject = e(this, this.reject);
      this.notify = e(this, this.notify);
    }
    var h = R('$q', TypeError);
    d.prototype = {
      then: function (a, b, c) {
        var d = new g();
        this.$$state.pending = this.$$state.pending || [];
        this.$$state.pending.push([
          d,
          a,
          b,
          c
        ]);
        0 < this.$$state.status && f(this.$$state);
        return d.promise;
      },
      'catch': function (a) {
        return this.then(null, a);
      },
      'finally': function (a, b) {
        return this.then(function (b) {
          return k(b, !0, a);
        }, function (b) {
          return k(b, !1, a);
        }, b);
      }
    };
    g.prototype = {
      resolve: function (a) {
        this.promise.$$state.status || (a === this.promise ? this.$$reject(h('qcycle', a)) : this.$$resolve(a));
      },
      $$resolve: function (b) {
        var d, e;
        e = c(this, this.$$resolve, this.$$reject);
        try {
          if (J(b) || G(b))
            d = b && b.then;
          G(d) ? (this.promise.$$state.status = -1, d.call(b, e[0], e[1], this.notify)) : (this.promise.$$state.value = b, this.promise.$$state.status = 1, f(this.promise.$$state));
        } catch (g) {
          e[1](g), a(g);
        }
      },
      reject: function (a) {
        this.promise.$$state.status || this.$$reject(a);
      },
      $$reject: function (a) {
        this.promise.$$state.value = a;
        this.promise.$$state.status = 2;
        f(this.promise.$$state);
      },
      notify: function (c) {
        var d = this.promise.$$state.pending;
        0 >= this.promise.$$state.status && d && d.length && b(function () {
          for (var b, e, f = 0, g = d.length; f < g; f++) {
            e = d[f][0];
            b = d[f][3];
            try {
              e.notify(G(b) ? b(c) : c);
            } catch (h) {
              a(h);
            }
          }
        });
      }
    };
    var l = function (a, b) {
        var c = new g();
        b ? c.resolve(a) : c.reject(a);
        return c.promise;
      }, k = function (a, b, c) {
        var d = null;
        try {
          G(c) && (d = c());
        } catch (e) {
          return l(e, !1);
        }
        return d && G(d.then) ? d.then(function () {
          return l(a, b);
        }, function (a) {
          return l(a, !1);
        }) : l(a, b);
      }, n = function (a, b, c, d) {
        var e = new g();
        e.resolve(a);
        return e.promise.then(b, c, d);
      }, p = function u(a) {
        if (!G(a))
          throw h('norslvr', a);
        if (!(this instanceof u))
          return new u(a);
        var b = new g();
        a(function (a) {
          b.resolve(a);
        }, function (a) {
          b.reject(a);
        });
        return b.promise;
      };
    p.defer = function () {
      return new g();
    };
    p.reject = function (a) {
      var b = new g();
      b.reject(a);
      return b.promise;
    };
    p.when = n;
    p.all = function (a) {
      var b = new g(), c = 0, d = H(a) ? [] : {};
      r(a, function (a, e) {
        c++;
        n(a).then(function (a) {
          d.hasOwnProperty(e) || (d[e] = a, --c || b.resolve(d));
        }, function (a) {
          d.hasOwnProperty(e) || b.reject(a);
        });
      });
      0 === c && b.resolve(d);
      return b.promise;
    };
    return p;
  }
  function $e() {
    this.$get = [
      '$window',
      '$timeout',
      function (b, a) {
        var c = b.requestAnimationFrame || b.webkitRequestAnimationFrame, d = b.cancelAnimationFrame || b.webkitCancelAnimationFrame || b.webkitCancelRequestAnimationFrame, e = !!c, f = e ? function (a) {
            var b = c(a);
            return function () {
              d(b);
            };
          } : function (b) {
            var c = a(b, 16.66, !1);
            return function () {
              a.cancel(c);
            };
          };
        f.supported = e;
        return f;
      }
    ];
  }
  function Pe() {
    function b(a) {
      function b() {
        this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount = 0;
        this.$id = ++ob;
        this.$$ChildScope = null;
      }
      b.prototype = a;
      return b;
    }
    var a = 10, c = R('$rootScope'), d = null, e = null;
    this.digestTtl = function (b) {
      arguments.length && (a = b);
      return a;
    };
    this.$get = [
      '$injector',
      '$exceptionHandler',
      '$parse',
      '$browser',
      function (f, g, h, l) {
        function k(a) {
          a.currentScope.$$destroyed = !0;
        }
        function n() {
          this.$id = ++ob;
          this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
          this.$root = this;
          this.$$destroyed = !1;
          this.$$listeners = {};
          this.$$listenerCount = {};
          this.$$isolateBindings = null;
        }
        function p(a) {
          if (v.$$phase)
            throw c('inprog', v.$$phase);
          v.$$phase = a;
        }
        function q(a, b, c) {
          do
            a.$$listenerCount[c] -= b, 0 === a.$$listenerCount[c] && delete a.$$listenerCount[c];
          while (a = a.$parent);
        }
        function u() {
        }
        function s() {
          for (; t.length;)
            try {
              t.shift()();
            } catch (a) {
              g(a);
            }
          e = null;
        }
        function M() {
          null === e && (e = l.defer(function () {
            v.$apply(s);
          }));
        }
        n.prototype = {
          constructor: n,
          $new: function (a, c) {
            var d;
            c = c || this;
            a ? (d = new n(), d.$root = this.$root) : (this.$$ChildScope || (this.$$ChildScope = b(this)), d = new this.$$ChildScope());
            d.$parent = c;
            d.$$prevSibling = c.$$childTail;
            c.$$childHead ? (c.$$childTail.$$nextSibling = d, c.$$childTail = d) : c.$$childHead = c.$$childTail = d;
            (a || c != this) && d.$on('$destroy', k);
            return d;
          },
          $watch: function (a, b, c) {
            var e = h(a);
            if (e.$$watchDelegate)
              return e.$$watchDelegate(this, b, c, e);
            var f = this.$$watchers, g = {
                fn: b,
                last: u,
                get: e,
                exp: a,
                eq: !!c
              };
            d = null;
            G(b) || (g.fn = E);
            f || (f = this.$$watchers = []);
            f.unshift(g);
            return function () {
              Xa(f, g);
              d = null;
            };
          },
          $watchGroup: function (a, b) {
            function c() {
              h = !1;
              k ? (k = !1, b(e, e, g)) : b(e, d, g);
            }
            var d = Array(a.length), e = Array(a.length), f = [], g = this, h = !1, k = !0;
            if (!a.length) {
              var l = !0;
              g.$evalAsync(function () {
                l && b(e, e, g);
              });
              return function () {
                l = !1;
              };
            }
            if (1 === a.length)
              return this.$watch(a[0], function (a, c, f) {
                e[0] = a;
                d[0] = c;
                b(e, a === c ? e : d, f);
              });
            r(a, function (a, b) {
              var k = g.$watch(a, function (a, f) {
                  e[b] = a;
                  d[b] = f;
                  h || (h = !0, g.$evalAsync(c));
                });
              f.push(k);
            });
            return function () {
              for (; f.length;)
                f.shift()();
            };
          },
          $watchCollection: function (a, b) {
            function c(a) {
              e = a;
              var b, d, g, h;
              if (!x(e)) {
                if (J(e))
                  if (Sa(e))
                    for (f !== p && (f = p, u = f.length = 0, l++), a = e.length, u !== a && (l++, f.length = u = a), b = 0; b < a; b++)
                      h = f[b], g = e[b], d = h !== h && g !== g, d || h === g || (l++, f[b] = g);
                  else {
                    f !== n && (f = n = {}, u = 0, l++);
                    a = 0;
                    for (b in e)
                      e.hasOwnProperty(b) && (a++, g = e[b], h = f[b], b in f ? (d = h !== h && g !== g, d || h === g || (l++, f[b] = g)) : (u++, f[b] = g, l++));
                    if (u > a)
                      for (b in l++, f)
                        e.hasOwnProperty(b) || (u--, delete f[b]);
                  }
                else
                  f !== e && (f = e, l++);
                return l;
              }
            }
            c.$stateful = !0;
            var d = this, e, f, g, k = 1 < b.length, l = 0, q = h(a, c), p = [], n = {}, m = !0, u = 0;
            return this.$watch(q, function () {
              m ? (m = !1, b(e, e, d)) : b(e, g, d);
              if (k)
                if (J(e))
                  if (Sa(e)) {
                    g = Array(e.length);
                    for (var a = 0; a < e.length; a++)
                      g[a] = e[a];
                  } else
                    for (a in g = {}, e)
                      tc.call(e, a) && (g[a] = e[a]);
                else
                  g = e;
            });
          },
          $digest: function () {
            var b, f, h, k, q, n, r = a, t, O = [], M, y;
            p('$digest');
            l.$$checkUrlChange();
            this === v && null !== e && (l.defer.cancel(e), s());
            d = null;
            do {
              n = !1;
              for (t = this; m.length;) {
                try {
                  y = m.shift(), y.scope.$eval(y.expression, y.locals);
                } catch (w) {
                  g(w);
                }
                d = null;
              }
              a:
                do {
                  if (k = t.$$watchers)
                    for (q = k.length; q--;)
                      try {
                        if (b = k[q])
                          if ((f = b.get(t)) !== (h = b.last) && !(b.eq ? ha(f, h) : 'number' === typeof f && 'number' === typeof h && isNaN(f) && isNaN(h)))
                            n = !0, d = b, b.last = b.eq ? Da(f, null) : f, b.fn(f, h === u ? f : h, t), 5 > r && (M = 4 - r, O[M] || (O[M] = []), O[M].push({
                              msg: G(b.exp) ? 'fn: ' + (b.exp.name || b.exp.toString()) : b.exp,
                              newVal: f,
                              oldVal: h
                            }));
                          else if (b === d) {
                            n = !1;
                            break a;
                          }
                      } catch (A) {
                        g(A);
                      }
                  if (!(k = t.$$childHead || t !== this && t.$$nextSibling))
                    for (; t !== this && !(k = t.$$nextSibling);)
                      t = t.$parent;
                } while (t = k);
              if ((n || m.length) && !r--)
                throw v.$$phase = null, c('infdig', a, O);
            } while (n || m.length);
            for (v.$$phase = null; F.length;)
              try {
                F.shift()();
              } catch (x) {
                g(x);
              }
          },
          $destroy: function () {
            if (!this.$$destroyed) {
              var a = this.$parent;
              this.$broadcast('$destroy');
              this.$$destroyed = !0;
              if (this !== v) {
                for (var b in this.$$listenerCount)
                  q(this, this.$$listenerCount[b], b);
                a.$$childHead == this && (a.$$childHead = this.$$nextSibling);
                a.$$childTail == this && (a.$$childTail = this.$$prevSibling);
                this.$$prevSibling && (this.$$prevSibling.$$nextSibling = this.$$nextSibling);
                this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling);
                this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = E;
                this.$on = this.$watch = this.$watchGroup = function () {
                  return E;
                };
                this.$$listeners = {};
                this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = this.$root = this.$$watchers = null;
              }
            }
          },
          $eval: function (a, b) {
            return h(a)(this, b);
          },
          $evalAsync: function (a, b) {
            v.$$phase || m.length || l.defer(function () {
              m.length && v.$digest();
            });
            m.push({
              scope: this,
              expression: a,
              locals: b
            });
          },
          $$postDigest: function (a) {
            F.push(a);
          },
          $apply: function (a) {
            try {
              return p('$apply'), this.$eval(a);
            } catch (b) {
              g(b);
            } finally {
              v.$$phase = null;
              try {
                v.$digest();
              } catch (c) {
                throw g(c), c;
              }
            }
          },
          $applyAsync: function (a) {
            function b() {
              c.$eval(a);
            }
            var c = this;
            a && t.push(b);
            M();
          },
          $on: function (a, b) {
            var c = this.$$listeners[a];
            c || (this.$$listeners[a] = c = []);
            c.push(b);
            var d = this;
            do
              d.$$listenerCount[a] || (d.$$listenerCount[a] = 0), d.$$listenerCount[a]++;
            while (d = d.$parent);
            var e = this;
            return function () {
              var d = c.indexOf(b);
              -1 !== d && (c[d] = null, q(e, 1, a));
            };
          },
          $emit: function (a, b) {
            var c = [], d, e = this, f = !1, h = {
                name: a,
                targetScope: e,
                stopPropagation: function () {
                  f = !0;
                },
                preventDefault: function () {
                  h.defaultPrevented = !0;
                },
                defaultPrevented: !1
              }, k = Ya([h], arguments, 1), l, q;
            do {
              d = e.$$listeners[a] || c;
              h.currentScope = e;
              l = 0;
              for (q = d.length; l < q; l++)
                if (d[l])
                  try {
                    d[l].apply(null, k);
                  } catch (p) {
                    g(p);
                  }
                else
                  d.splice(l, 1), l--, q--;
              if (f)
                return h.currentScope = null, h;
              e = e.$parent;
            } while (e);
            h.currentScope = null;
            return h;
          },
          $broadcast: function (a, b) {
            var c = this, d = this, e = {
                name: a,
                targetScope: this,
                preventDefault: function () {
                  e.defaultPrevented = !0;
                },
                defaultPrevented: !1
              };
            if (!this.$$listenerCount[a])
              return e;
            for (var f = Ya([e], arguments, 1), h, l; c = d;) {
              e.currentScope = c;
              d = c.$$listeners[a] || [];
              h = 0;
              for (l = d.length; h < l; h++)
                if (d[h])
                  try {
                    d[h].apply(null, f);
                  } catch (k) {
                    g(k);
                  }
                else
                  d.splice(h, 1), h--, l--;
              if (!(d = c.$$listenerCount[a] && c.$$childHead || c !== this && c.$$nextSibling))
                for (; c !== this && !(d = c.$$nextSibling);)
                  c = c.$parent;
            }
            e.currentScope = null;
            return e;
          }
        };
        var v = new n(), m = v.$$asyncQueue = [], F = v.$$postDigestQueue = [], t = v.$$applyAsyncQueue = [];
        return v;
      }
    ];
  }
  function Sd() {
    var b = /^\s*(https?|ftp|mailto|tel|file):/, a = /^\s*((https?|ftp|file|blob):|data:image\/)/;
    this.aHrefSanitizationWhitelist = function (a) {
      return y(a) ? (b = a, this) : b;
    };
    this.imgSrcSanitizationWhitelist = function (b) {
      return y(b) ? (a = b, this) : a;
    };
    this.$get = function () {
      return function (c, d) {
        var e = d ? a : b, f;
        f = Aa(c).href;
        return '' === f || f.match(e) ? c : 'unsafe:' + f;
      };
    };
  }
  function Df(b) {
    if ('self' === b)
      return b;
    if (C(b)) {
      if (-1 < b.indexOf('***'))
        throw Ba('iwcard', b);
      b = gd(b).replace('\\*\\*', '.*').replace('\\*', '[^:/.?&;]*');
      return new RegExp('^' + b + '$');
    }
    if (Ua(b))
      return new RegExp('^' + b.source + '$');
    throw Ba('imatcher');
  }
  function hd(b) {
    var a = [];
    y(b) && r(b, function (b) {
      a.push(Df(b));
    });
    return a;
  }
  function Te() {
    this.SCE_CONTEXTS = pa;
    var b = ['self'], a = [];
    this.resourceUrlWhitelist = function (a) {
      arguments.length && (b = hd(a));
      return b;
    };
    this.resourceUrlBlacklist = function (b) {
      arguments.length && (a = hd(b));
      return a;
    };
    this.$get = [
      '$injector',
      function (c) {
        function d(a, b) {
          return 'self' === a ? $c(b) : !!a.exec(b.href);
        }
        function e(a) {
          var b = function (a) {
            this.$$unwrapTrustedValue = function () {
              return a;
            };
          };
          a && (b.prototype = new a());
          b.prototype.valueOf = function () {
            return this.$$unwrapTrustedValue();
          };
          b.prototype.toString = function () {
            return this.$$unwrapTrustedValue().toString();
          };
          return b;
        }
        var f = function (a) {
          throw Ba('unsafe');
        };
        c.has('$sanitize') && (f = c.get('$sanitize'));
        var g = e(), h = {};
        h[pa.HTML] = e(g);
        h[pa.CSS] = e(g);
        h[pa.URL] = e(g);
        h[pa.JS] = e(g);
        h[pa.RESOURCE_URL] = e(h[pa.URL]);
        return {
          trustAs: function (a, b) {
            var c = h.hasOwnProperty(a) ? h[a] : null;
            if (!c)
              throw Ba('icontext', a, b);
            if (null === b || b === t || '' === b)
              return b;
            if ('string' !== typeof b)
              throw Ba('itype', a);
            return new c(b);
          },
          getTrusted: function (c, e) {
            if (null === e || e === t || '' === e)
              return e;
            var g = h.hasOwnProperty(c) ? h[c] : null;
            if (g && e instanceof g)
              return e.$$unwrapTrustedValue();
            if (c === pa.RESOURCE_URL) {
              var g = Aa(e.toString()), p, q, u = !1;
              p = 0;
              for (q = b.length; p < q; p++)
                if (d(b[p], g)) {
                  u = !0;
                  break;
                }
              if (u)
                for (p = 0, q = a.length; p < q; p++)
                  if (d(a[p], g)) {
                    u = !1;
                    break;
                  }
              if (u)
                return e;
              throw Ba('insecurl', e.toString());
            }
            if (c === pa.HTML)
              return f(e);
            throw Ba('unsafe');
          },
          valueOf: function (a) {
            return a instanceof g ? a.$$unwrapTrustedValue() : a;
          }
        };
      }
    ];
  }
  function Se() {
    var b = !0;
    this.enabled = function (a) {
      arguments.length && (b = !!a);
      return b;
    };
    this.$get = [
      '$parse',
      '$sceDelegate',
      function (a, c) {
        if (b && 8 > Qa)
          throw Ba('iequirks');
        var d = sa(pa);
        d.isEnabled = function () {
          return b;
        };
        d.trustAs = c.trustAs;
        d.getTrusted = c.getTrusted;
        d.valueOf = c.valueOf;
        b || (d.trustAs = d.getTrusted = function (a, b) {
          return b;
        }, d.valueOf = ra);
        d.parseAs = function (b, c) {
          var e = a(c);
          return e.literal && e.constant ? e : a(c, function (a) {
            return d.getTrusted(b, a);
          });
        };
        var e = d.parseAs, f = d.getTrusted, g = d.trustAs;
        r(pa, function (a, b) {
          var c = z(b);
          d[db('parse_as_' + c)] = function (b) {
            return e(a, b);
          };
          d[db('get_trusted_' + c)] = function (b) {
            return f(a, b);
          };
          d[db('trust_as_' + c)] = function (b) {
            return g(a, b);
          };
        });
        return d;
      }
    ];
  }
  function Ue() {
    this.$get = [
      '$window',
      '$document',
      function (b, a) {
        var c = {}, d = aa((/android (\d+)/.exec(z((b.navigator || {}).userAgent)) || [])[1]), e = /Boxee/i.test((b.navigator || {}).userAgent), f = a[0] || {}, g, h = /^(Moz|webkit|ms)(?=[A-Z])/, l = f.body && f.body.style, k = !1, n = !1;
        if (l) {
          for (var p in l)
            if (k = h.exec(p)) {
              g = k[0];
              g = g.substr(0, 1).toUpperCase() + g.substr(1);
              break;
            }
          g || (g = 'WebkitOpacity' in l && 'webkit');
          k = !!('transition' in l || g + 'Transition' in l);
          n = !!('animation' in l || g + 'Animation' in l);
          !d || k && n || (k = C(f.body.style.webkitTransition), n = C(f.body.style.webkitAnimation));
        }
        return {
          history: !(!b.history || !b.history.pushState || 4 > d || e),
          hasEvent: function (a) {
            if ('input' === a && 11 >= Qa)
              return !1;
            if (x(c[a])) {
              var b = f.createElement('div');
              c[a] = 'on' + a in b;
            }
            return c[a];
          },
          csp: bb(),
          vendorPrefix: g,
          transitions: k,
          animations: n,
          android: d
        };
      }
    ];
  }
  function We() {
    this.$get = [
      '$templateCache',
      '$http',
      '$q',
      function (b, a, c) {
        function d(e, f) {
          d.totalPendingRequests++;
          var g = a.defaults && a.defaults.transformResponse;
          H(g) ? g = g.filter(function (a) {
            return a !== Zb;
          }) : g === Zb && (g = null);
          return a.get(e, {
            cache: b,
            transformResponse: g
          })['finally'](function () {
            d.totalPendingRequests--;
          }).then(function (a) {
            return a.data;
          }, function (a) {
            if (!f)
              throw la('tpload', e);
            return c.reject(a);
          });
        }
        d.totalPendingRequests = 0;
        return d;
      }
    ];
  }
  function Xe() {
    this.$get = [
      '$rootScope',
      '$browser',
      '$location',
      function (b, a, c) {
        return {
          findBindings: function (a, b, c) {
            a = a.getElementsByClassName('ng-binding');
            var g = [];
            r(a, function (a) {
              var d = ca.element(a).data('$binding');
              d && r(d, function (d) {
                c ? new RegExp('(^|\\s)' + gd(b) + '(\\s|\\||$)').test(d) && g.push(a) : -1 != d.indexOf(b) && g.push(a);
              });
            });
            return g;
          },
          findModels: function (a, b, c) {
            for (var g = [
                  'ng-',
                  'data-ng-',
                  'ng\\:'
                ], h = 0; h < g.length; ++h) {
              var l = a.querySelectorAll('[' + g[h] + 'model' + (c ? '=' : '*=') + '"' + b + '"]');
              if (l.length)
                return l;
            }
          },
          getLocation: function () {
            return c.url();
          },
          setLocation: function (a) {
            a !== c.url() && (c.url(a), b.$digest());
          },
          whenStable: function (b) {
            a.notifyWhenNoOutstandingRequests(b);
          }
        };
      }
    ];
  }
  function Ye() {
    this.$get = [
      '$rootScope',
      '$browser',
      '$q',
      '$$q',
      '$exceptionHandler',
      function (b, a, c, d, e) {
        function f(f, l, k) {
          var n = y(k) && !k, p = (n ? d : c).defer(), q = p.promise;
          l = a.defer(function () {
            try {
              p.resolve(f());
            } catch (a) {
              p.reject(a), e(a);
            } finally {
              delete g[q.$$timeoutId];
            }
            n || b.$apply();
          }, l);
          q.$$timeoutId = l;
          g[l] = p;
          return q;
        }
        var g = {};
        f.cancel = function (b) {
          return b && b.$$timeoutId in g ? (g[b.$$timeoutId].reject('canceled'), delete g[b.$$timeoutId], a.defer.cancel(b.$$timeoutId)) : !1;
        };
        return f;
      }
    ];
  }
  function Aa(b) {
    Qa && ($.setAttribute('href', b), b = $.href);
    $.setAttribute('href', b);
    return {
      href: $.href,
      protocol: $.protocol ? $.protocol.replace(/:$/, '') : '',
      host: $.host,
      search: $.search ? $.search.replace(/^\?/, '') : '',
      hash: $.hash ? $.hash.replace(/^#/, '') : '',
      hostname: $.hostname,
      port: $.port,
      pathname: '/' === $.pathname.charAt(0) ? $.pathname : '/' + $.pathname
    };
  }
  function $c(b) {
    b = C(b) ? Aa(b) : b;
    return b.protocol === id.protocol && b.host === id.host;
  }
  function Ze() {
    this.$get = ea(Q);
  }
  function Fc(b) {
    function a(c, d) {
      if (J(c)) {
        var e = {};
        r(c, function (b, c) {
          e[c] = a(c, b);
        });
        return e;
      }
      return b.factory(c + 'Filter', d);
    }
    this.register = a;
    this.$get = [
      '$injector',
      function (a) {
        return function (b) {
          return a.get(b + 'Filter');
        };
      }
    ];
    a('currency', jd);
    a('date', kd);
    a('filter', Ef);
    a('json', Ff);
    a('limitTo', Gf);
    a('lowercase', Hf);
    a('number', ld);
    a('orderBy', md);
    a('uppercase', If);
  }
  function Ef() {
    return function (b, a, c) {
      if (!H(b))
        return b;
      var d;
      switch (typeof a) {
      case 'function':
        break;
      case 'boolean':
      case 'number':
      case 'string':
        d = !0;
      case 'object':
        a = Jf(a, c, d);
        break;
      default:
        return b;
      }
      return b.filter(a);
    };
  }
  function Jf(b, a, c) {
    var d = J(b) && '$' in b;
    !0 === a ? a = ha : G(a) || (a = function (a, b) {
      if (J(a) || J(b))
        return !1;
      a = z('' + a);
      b = z('' + b);
      return -1 !== a.indexOf(b);
    });
    return function (e) {
      return d && !J(e) ? Ha(e, b.$, a, !1) : Ha(e, b, a, c);
    };
  }
  function Ha(b, a, c, d, e) {
    var f = null !== b ? typeof b : 'null', g = null !== a ? typeof a : 'null';
    if ('string' === g && '!' === a.charAt(0))
      return !Ha(b, a.substring(1), c, d);
    if (H(b))
      return b.some(function (b) {
        return Ha(b, a, c, d);
      });
    switch (f) {
    case 'object':
      var h;
      if (d) {
        for (h in b)
          if ('$' !== h.charAt(0) && Ha(b[h], a, c, !0))
            return !0;
        return e ? !1 : Ha(b, a, c, !1);
      }
      if ('object' === g) {
        for (h in a)
          if (e = a[h], !G(e) && !x(e) && (f = '$' === h, !Ha(f ? b : b[h], e, c, f, f)))
            return !1;
        return !0;
      }
      return c(b, a);
    case 'function':
      return !1;
    default:
      return c(b, a);
    }
  }
  function jd(b) {
    var a = b.NUMBER_FORMATS;
    return function (b, d, e) {
      x(d) && (d = a.CURRENCY_SYM);
      x(e) && (e = a.PATTERNS[1].maxFrac);
      return null == b ? b : nd(b, a.PATTERNS[1], a.GROUP_SEP, a.DECIMAL_SEP, e).replace(/\u00A4/g, d);
    };
  }
  function ld(b) {
    var a = b.NUMBER_FORMATS;
    return function (b, d) {
      return null == b ? b : nd(b, a.PATTERNS[0], a.GROUP_SEP, a.DECIMAL_SEP, d);
    };
  }
  function nd(b, a, c, d, e) {
    if (!isFinite(b) || J(b))
      return '';
    var f = 0 > b;
    b = Math.abs(b);
    var g = b + '', h = '', l = [], k = !1;
    if (-1 !== g.indexOf('e')) {
      var n = g.match(/([\d\.]+)e(-?)(\d+)/);
      n && '-' == n[2] && n[3] > e + 1 ? b = 0 : (h = g, k = !0);
    }
    if (k)
      0 < e && 1 > b && (h = b.toFixed(e), b = parseFloat(h));
    else {
      g = (g.split(od)[1] || '').length;
      x(e) && (e = Math.min(Math.max(a.minFrac, g), a.maxFrac));
      b = +(Math.round(+(b.toString() + 'e' + e)).toString() + 'e' + -e);
      var g = ('' + b).split(od), k = g[0], g = g[1] || '', p = 0, q = a.lgSize, u = a.gSize;
      if (k.length >= q + u)
        for (p = k.length - q, n = 0; n < p; n++)
          0 === (p - n) % u && 0 !== n && (h += c), h += k.charAt(n);
      for (n = p; n < k.length; n++)
        0 === (k.length - n) % q && 0 !== n && (h += c), h += k.charAt(n);
      for (; g.length < e;)
        g += '0';
      e && '0' !== e && (h += d + g.substr(0, e));
    }
    0 === b && (f = !1);
    l.push(f ? a.negPre : a.posPre, h, f ? a.negSuf : a.posSuf);
    return l.join('');
  }
  function Ib(b, a, c) {
    var d = '';
    0 > b && (d = '-', b = -b);
    for (b = '' + b; b.length < a;)
      b = '0' + b;
    c && (b = b.substr(b.length - a));
    return d + b;
  }
  function U(b, a, c, d) {
    c = c || 0;
    return function (e) {
      e = e['get' + b]();
      if (0 < c || e > -c)
        e += c;
      0 === e && -12 == c && (e = 12);
      return Ib(e, a, d);
    };
  }
  function Jb(b, a) {
    return function (c, d) {
      var e = c['get' + b](), f = ub(a ? 'SHORT' + b : b);
      return d[f][e];
    };
  }
  function pd(b) {
    var a = new Date(b, 0, 1).getDay();
    return new Date(b, 0, (4 >= a ? 5 : 12) - a);
  }
  function qd(b) {
    return function (a) {
      var c = pd(a.getFullYear());
      a = +new Date(a.getFullYear(), a.getMonth(), a.getDate() + (4 - a.getDay())) - +c;
      a = 1 + Math.round(a / 604800000);
      return Ib(a, b);
    };
  }
  function ic(b, a) {
    return 0 >= b.getFullYear() ? a.ERAS[0] : a.ERAS[1];
  }
  function kd(b) {
    function a(a) {
      var b;
      if (b = a.match(c)) {
        a = new Date(0);
        var f = 0, g = 0, h = b[8] ? a.setUTCFullYear : a.setFullYear, l = b[8] ? a.setUTCHours : a.setHours;
        b[9] && (f = aa(b[9] + b[10]), g = aa(b[9] + b[11]));
        h.call(a, aa(b[1]), aa(b[2]) - 1, aa(b[3]));
        f = aa(b[4] || 0) - f;
        g = aa(b[5] || 0) - g;
        h = aa(b[6] || 0);
        b = Math.round(1000 * parseFloat('0.' + (b[7] || 0)));
        l.call(a, f, g, h, b);
      }
      return a;
    }
    var c = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
    return function (c, e, f) {
      var g = '', h = [], l, k;
      e = e || 'mediumDate';
      e = b.DATETIME_FORMATS[e] || e;
      C(c) && (c = Kf.test(c) ? aa(c) : a(c));
      Y(c) && (c = new Date(c));
      if (!ga(c))
        return c;
      for (; e;)
        (k = Lf.exec(e)) ? (h = Ya(h, k, 1), e = h.pop()) : (h.push(e), e = null);
      f && 'UTC' === f && (c = new Date(c.getTime()), c.setMinutes(c.getMinutes() + c.getTimezoneOffset()));
      r(h, function (a) {
        l = Mf[a];
        g += l ? l(c, b.DATETIME_FORMATS) : a.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
      });
      return g;
    };
  }
  function Ff() {
    return function (b, a) {
      x(a) && (a = 2);
      return $a(b, a);
    };
  }
  function Gf() {
    return function (b, a) {
      Y(b) && (b = b.toString());
      return H(b) || C(b) ? (a = Infinity === Math.abs(Number(a)) ? Number(a) : aa(a)) ? 0 < a ? b.slice(0, a) : b.slice(a) : C(b) ? '' : [] : b;
    };
  }
  function md(b) {
    return function (a, c, d) {
      function e(a, b) {
        return b ? function (b, c) {
          return a(c, b);
        } : a;
      }
      function f(a) {
        switch (typeof a) {
        case 'number':
        case 'boolean':
        case 'string':
          return !0;
        default:
          return !1;
        }
      }
      function g(a) {
        return null === a ? 'null' : 'function' === typeof a.valueOf && (a = a.valueOf(), f(a)) || 'function' === typeof a.toString && (a = a.toString(), f(a)) ? a : '';
      }
      function h(a, b) {
        var c = typeof a, d = typeof b;
        c === d && 'object' === c && (a = g(a), b = g(b));
        return c === d ? ('string' === c && (a = a.toLowerCase(), b = b.toLowerCase()), a === b ? 0 : a < b ? -1 : 1) : c < d ? -1 : 1;
      }
      if (!Sa(a))
        return a;
      c = H(c) ? c : [c];
      0 === c.length && (c = ['+']);
      c = c.map(function (a) {
        var c = !1, d = a || ra;
        if (C(a)) {
          if ('+' == a.charAt(0) || '-' == a.charAt(0))
            c = '-' == a.charAt(0), a = a.substring(1);
          if ('' === a)
            return e(h, c);
          d = b(a);
          if (d.constant) {
            var f = d();
            return e(function (a, b) {
              return h(a[f], b[f]);
            }, c);
          }
        }
        return e(function (a, b) {
          return h(d(a), d(b));
        }, c);
      });
      return Za.call(a).sort(e(function (a, b) {
        for (var d = 0; d < c.length; d++) {
          var e = c[d](a, b);
          if (0 !== e)
            return e;
        }
        return 0;
      }, d));
    };
  }
  function Ia(b) {
    G(b) && (b = { link: b });
    b.restrict = b.restrict || 'AC';
    return ea(b);
  }
  function rd(b, a, c, d, e) {
    var f = this, g = [], h = f.$$parentForm = b.parent().controller('form') || Kb;
    f.$error = {};
    f.$$success = {};
    f.$pending = t;
    f.$name = e(a.name || a.ngForm || '')(c);
    f.$dirty = !1;
    f.$pristine = !0;
    f.$valid = !0;
    f.$invalid = !1;
    f.$submitted = !1;
    h.$addControl(f);
    f.$rollbackViewValue = function () {
      r(g, function (a) {
        a.$rollbackViewValue();
      });
    };
    f.$commitViewValue = function () {
      r(g, function (a) {
        a.$commitViewValue();
      });
    };
    f.$addControl = function (a) {
      La(a.$name, 'input');
      g.push(a);
      a.$name && (f[a.$name] = a);
    };
    f.$$renameControl = function (a, b) {
      var c = a.$name;
      f[c] === a && delete f[c];
      f[b] = a;
      a.$name = b;
    };
    f.$removeControl = function (a) {
      a.$name && f[a.$name] === a && delete f[a.$name];
      r(f.$pending, function (b, c) {
        f.$setValidity(c, null, a);
      });
      r(f.$error, function (b, c) {
        f.$setValidity(c, null, a);
      });
      r(f.$$success, function (b, c) {
        f.$setValidity(c, null, a);
      });
      Xa(g, a);
    };
    sd({
      ctrl: this,
      $element: b,
      set: function (a, b, c) {
        var d = a[b];
        d ? -1 === d.indexOf(c) && d.push(c) : a[b] = [c];
      },
      unset: function (a, b, c) {
        var d = a[b];
        d && (Xa(d, c), 0 === d.length && delete a[b]);
      },
      parentForm: h,
      $animate: d
    });
    f.$setDirty = function () {
      d.removeClass(b, Ra);
      d.addClass(b, Lb);
      f.$dirty = !0;
      f.$pristine = !1;
      h.$setDirty();
    };
    f.$setPristine = function () {
      d.setClass(b, Ra, Lb + ' ng-submitted');
      f.$dirty = !1;
      f.$pristine = !0;
      f.$submitted = !1;
      r(g, function (a) {
        a.$setPristine();
      });
    };
    f.$setUntouched = function () {
      r(g, function (a) {
        a.$setUntouched();
      });
    };
    f.$setSubmitted = function () {
      d.addClass(b, 'ng-submitted');
      f.$submitted = !0;
      h.$setSubmitted();
    };
  }
  function jc(b) {
    b.$formatters.push(function (a) {
      return b.$isEmpty(a) ? a : a.toString();
    });
  }
  function jb(b, a, c, d, e, f) {
    var g = z(a[0].type);
    if (!e.android) {
      var h = !1;
      a.on('compositionstart', function (a) {
        h = !0;
      });
      a.on('compositionend', function () {
        h = !1;
        l();
      });
    }
    var l = function (b) {
      k && (f.defer.cancel(k), k = null);
      if (!h) {
        var e = a.val();
        b = b && b.type;
        'password' === g || c.ngTrim && 'false' === c.ngTrim || (e = N(e));
        (d.$viewValue !== e || '' === e && d.$$hasNativeValidators) && d.$setViewValue(e, b);
      }
    };
    if (e.hasEvent('input'))
      a.on('input', l);
    else {
      var k, n = function (a, b, c) {
          k || (k = f.defer(function () {
            k = null;
            b && b.value === c || l(a);
          }));
        };
      a.on('keydown', function (a) {
        var b = a.keyCode;
        91 === b || 15 < b && 19 > b || 37 <= b && 40 >= b || n(a, this, this.value);
      });
      if (e.hasEvent('paste'))
        a.on('paste cut', n);
    }
    a.on('change', l);
    d.$render = function () {
      a.val(d.$isEmpty(d.$viewValue) ? '' : d.$viewValue);
    };
  }
  function Mb(b, a) {
    return function (c, d) {
      var e, f;
      if (ga(c))
        return c;
      if (C(c)) {
        '"' == c.charAt(0) && '"' == c.charAt(c.length - 1) && (c = c.substring(1, c.length - 1));
        if (Nf.test(c))
          return new Date(c);
        b.lastIndex = 0;
        if (e = b.exec(c))
          return e.shift(), f = d ? {
            yyyy: d.getFullYear(),
            MM: d.getMonth() + 1,
            dd: d.getDate(),
            HH: d.getHours(),
            mm: d.getMinutes(),
            ss: d.getSeconds(),
            sss: d.getMilliseconds() / 1000
          } : {
            yyyy: 1970,
            MM: 1,
            dd: 1,
            HH: 0,
            mm: 0,
            ss: 0,
            sss: 0
          }, r(e, function (b, c) {
            c < a.length && (f[a[c]] = +b);
          }), new Date(f.yyyy, f.MM - 1, f.dd, f.HH, f.mm, f.ss || 0, 1000 * f.sss || 0);
      }
      return NaN;
    };
  }
  function kb(b, a, c, d) {
    return function (e, f, g, h, l, k, n) {
      function p(a) {
        return a && !(a.getTime && a.getTime() !== a.getTime());
      }
      function q(a) {
        return y(a) ? ga(a) ? a : c(a) : t;
      }
      td(e, f, g, h);
      jb(e, f, g, h, l, k);
      var u = h && h.$options && h.$options.timezone, s;
      h.$$parserName = b;
      h.$parsers.push(function (b) {
        return h.$isEmpty(b) ? null : a.test(b) ? (b = c(b, s), 'UTC' === u && b.setMinutes(b.getMinutes() - b.getTimezoneOffset()), b) : t;
      });
      h.$formatters.push(function (a) {
        if (a && !ga(a))
          throw Nb('datefmt', a);
        if (p(a)) {
          if ((s = a) && 'UTC' === u) {
            var b = 60000 * s.getTimezoneOffset();
            s = new Date(s.getTime() + b);
          }
          return n('date')(a, d, u);
        }
        s = null;
        return '';
      });
      if (y(g.min) || g.ngMin) {
        var r;
        h.$validators.min = function (a) {
          return !p(a) || x(r) || c(a) >= r;
        };
        g.$observe('min', function (a) {
          r = q(a);
          h.$validate();
        });
      }
      if (y(g.max) || g.ngMax) {
        var v;
        h.$validators.max = function (a) {
          return !p(a) || x(v) || c(a) <= v;
        };
        g.$observe('max', function (a) {
          v = q(a);
          h.$validate();
        });
      }
    };
  }
  function td(b, a, c, d) {
    (d.$$hasNativeValidators = J(a[0].validity)) && d.$parsers.push(function (b) {
      var c = a.prop('validity') || {};
      return c.badInput && !c.typeMismatch ? t : b;
    });
  }
  function ud(b, a, c, d, e) {
    if (y(d)) {
      b = b(d);
      if (!b.constant)
        throw R('ngModel')('constexpr', c, d);
      return b(a);
    }
    return e;
  }
  function kc(b, a) {
    b = 'ngClass' + b;
    return [
      '$animate',
      function (c) {
        function d(a, b) {
          var c = [], d = 0;
          a:
            for (; d < a.length; d++) {
              for (var e = a[d], n = 0; n < b.length; n++)
                if (e == b[n])
                  continue a;
              c.push(e);
            }
          return c;
        }
        function e(a) {
          if (!H(a)) {
            if (C(a))
              return a.split(' ');
            if (J(a)) {
              var b = [];
              r(a, function (a, c) {
                a && (b = b.concat(c.split(' ')));
              });
              return b;
            }
          }
          return a;
        }
        return {
          restrict: 'AC',
          link: function (f, g, h) {
            function l(a, b) {
              var c = g.data('$classCounts') || {}, d = [];
              r(a, function (a) {
                if (0 < b || c[a])
                  c[a] = (c[a] || 0) + b, c[a] === +(0 < b) && d.push(a);
              });
              g.data('$classCounts', c);
              return d.join(' ');
            }
            function k(b) {
              if (!0 === a || f.$index % 2 === a) {
                var k = e(b || []);
                if (!n) {
                  var u = l(k, 1);
                  h.$addClass(u);
                } else if (!ha(b, n)) {
                  var s = e(n), u = d(k, s), k = d(s, k), u = l(u, 1), k = l(k, -1);
                  u && u.length && c.addClass(g, u);
                  k && k.length && c.removeClass(g, k);
                }
              }
              n = sa(b);
            }
            var n;
            f.$watch(h[b], k, !0);
            h.$observe('class', function (a) {
              k(f.$eval(h[b]));
            });
            'ngClass' !== b && f.$watch('$index', function (c, d) {
              var g = c & 1;
              if (g !== (d & 1)) {
                var k = e(f.$eval(h[b]));
                g === a ? (g = l(k, 1), h.$addClass(g)) : (g = l(k, -1), h.$removeClass(g));
              }
            });
          }
        };
      }
    ];
  }
  function sd(b) {
    function a(a, b) {
      b && !f[a] ? (k.addClass(e, a), f[a] = !0) : !b && f[a] && (k.removeClass(e, a), f[a] = !1);
    }
    function c(b, c) {
      b = b ? '-' + vc(b, '-') : '';
      a(lb + b, !0 === c);
      a(vd + b, !1 === c);
    }
    var d = b.ctrl, e = b.$element, f = {}, g = b.set, h = b.unset, l = b.parentForm, k = b.$animate;
    f[vd] = !(f[lb] = e.hasClass(lb));
    d.$setValidity = function (b, e, f) {
      e === t ? (d.$pending || (d.$pending = {}), g(d.$pending, b, f)) : (d.$pending && h(d.$pending, b, f), wd(d.$pending) && (d.$pending = t));
      Wa(e) ? e ? (h(d.$error, b, f), g(d.$$success, b, f)) : (g(d.$error, b, f), h(d.$$success, b, f)) : (h(d.$error, b, f), h(d.$$success, b, f));
      d.$pending ? (a(xd, !0), d.$valid = d.$invalid = t, c('', null)) : (a(xd, !1), d.$valid = wd(d.$error), d.$invalid = !d.$valid, c('', d.$valid));
      e = d.$pending && d.$pending[b] ? t : d.$error[b] ? !1 : d.$$success[b] ? !0 : null;
      c(b, e);
      l.$setValidity(b, e, d);
    };
  }
  function wd(b) {
    if (b)
      for (var a in b)
        return !1;
    return !0;
  }
  var Of = /^\/(.+)\/([a-z]*)$/, z = function (b) {
      return C(b) ? b.toLowerCase() : b;
    }, tc = Object.prototype.hasOwnProperty, ub = function (b) {
      return C(b) ? b.toUpperCase() : b;
    }, Qa, A, ta, Za = [].slice, qf = [].splice, Pf = [].push, Ca = Object.prototype.toString, Ja = R('ng'), ca = Q.angular || (Q.angular = {}), cb, ob = 0;
  Qa = W.documentMode;
  E.$inject = [];
  ra.$inject = [];
  var H = Array.isArray, N = function (b) {
      return C(b) ? b.trim() : b;
    }, gd = function (b) {
      return b.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
    }, bb = function () {
      if (y(bb.isActive_))
        return bb.isActive_;
      var b = !(!W.querySelector('[ng-csp]') && !W.querySelector('[data-ng-csp]'));
      if (!b)
        try {
          new Function('');
        } catch (a) {
          b = !0;
        }
      return bb.isActive_ = b;
    }, rb = [
      'ng-',
      'data-ng-',
      'ng:',
      'x-ng-'
    ], Md = /[A-Z]/g, wc = !1, Qb, qa = 1, pb = 3, Qd = {
      full: '1.3.15',
      major: 1,
      minor: 3,
      dot: 15,
      codeName: 'locality-filtration'
    };
  T.expando = 'ng339';
  var zb = T.cache = {}, hf = 1;
  T._data = function (b) {
    return this.cache[b[this.expando]] || {};
  };
  var cf = /([\:\-\_]+(.))/g, df = /^moz([A-Z])/, Qf = {
      mouseleave: 'mouseout',
      mouseenter: 'mouseover'
    }, Tb = R('jqLite'), gf = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, Sb = /<|&#?\w+;/, ef = /<([\w:]+)/, ff = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, ja = {
      option: [
        1,
        '<select multiple="multiple">',
        '</select>'
      ],
      thead: [
        1,
        '<table>',
        '</table>'
      ],
      col: [
        2,
        '<table><colgroup>',
        '</colgroup></table>'
      ],
      tr: [
        2,
        '<table><tbody>',
        '</tbody></table>'
      ],
      td: [
        3,
        '<table><tbody><tr>',
        '</tr></tbody></table>'
      ],
      _default: [
        0,
        '',
        ''
      ]
    };
  ja.optgroup = ja.option;
  ja.tbody = ja.tfoot = ja.colgroup = ja.caption = ja.thead;
  ja.th = ja.td;
  var Ka = T.prototype = {
      ready: function (b) {
        function a() {
          c || (c = !0, b());
        }
        var c = !1;
        'complete' === W.readyState ? setTimeout(a) : (this.on('DOMContentLoaded', a), T(Q).on('load', a));
      },
      toString: function () {
        var b = [];
        r(this, function (a) {
          b.push('' + a);
        });
        return '[' + b.join(', ') + ']';
      },
      eq: function (b) {
        return 0 <= b ? A(this[b]) : A(this[this.length + b]);
      },
      length: 0,
      push: Pf,
      sort: [].sort,
      splice: [].splice
    }, Eb = {};
  r('multiple selected checked disabled readOnly required open'.split(' '), function (b) {
    Eb[z(b)] = b;
  });
  var Oc = {};
  r('input select option textarea button form details'.split(' '), function (b) {
    Oc[b] = !0;
  });
  var Pc = {
      ngMinlength: 'minlength',
      ngMaxlength: 'maxlength',
      ngMin: 'min',
      ngMax: 'max',
      ngPattern: 'pattern'
    };
  r({
    data: Vb,
    removeData: xb
  }, function (b, a) {
    T[a] = b;
  });
  r({
    data: Vb,
    inheritedData: Db,
    scope: function (b) {
      return A.data(b, '$scope') || Db(b.parentNode || b, [
        '$isolateScope',
        '$scope'
      ]);
    },
    isolateScope: function (b) {
      return A.data(b, '$isolateScope') || A.data(b, '$isolateScopeNoTemplate');
    },
    controller: Kc,
    injector: function (b) {
      return Db(b, '$injector');
    },
    removeAttr: function (b, a) {
      b.removeAttribute(a);
    },
    hasClass: Ab,
    css: function (b, a, c) {
      a = db(a);
      if (y(c))
        b.style[a] = c;
      else
        return b.style[a];
    },
    attr: function (b, a, c) {
      var d = z(a);
      if (Eb[d])
        if (y(c))
          c ? (b[a] = !0, b.setAttribute(a, d)) : (b[a] = !1, b.removeAttribute(d));
        else
          return b[a] || (b.attributes.getNamedItem(a) || E).specified ? d : t;
      else if (y(c))
        b.setAttribute(a, c);
      else if (b.getAttribute)
        return b = b.getAttribute(a, 2), null === b ? t : b;
    },
    prop: function (b, a, c) {
      if (y(c))
        b[a] = c;
      else
        return b[a];
    },
    text: function () {
      function b(a, b) {
        if (x(b)) {
          var d = a.nodeType;
          return d === qa || d === pb ? a.textContent : '';
        }
        a.textContent = b;
      }
      b.$dv = '';
      return b;
    }(),
    val: function (b, a) {
      if (x(a)) {
        if (b.multiple && 'select' === va(b)) {
          var c = [];
          r(b.options, function (a) {
            a.selected && c.push(a.value || a.text);
          });
          return 0 === c.length ? null : c;
        }
        return b.value;
      }
      b.value = a;
    },
    html: function (b, a) {
      if (x(a))
        return b.innerHTML;
      wb(b, !0);
      b.innerHTML = a;
    },
    empty: Lc
  }, function (b, a) {
    T.prototype[a] = function (a, d) {
      var e, f, g = this.length;
      if (b !== Lc && (2 == b.length && b !== Ab && b !== Kc ? a : d) === t) {
        if (J(a)) {
          for (e = 0; e < g; e++)
            if (b === Vb)
              b(this[e], a);
            else
              for (f in a)
                b(this[e], f, a[f]);
          return this;
        }
        e = b.$dv;
        g = e === t ? Math.min(g, 1) : g;
        for (f = 0; f < g; f++) {
          var h = b(this[f], a, d);
          e = e ? e + h : h;
        }
        return e;
      }
      for (e = 0; e < g; e++)
        b(this[e], a, d);
      return this;
    };
  });
  r({
    removeData: xb,
    on: function a(c, d, e, f) {
      if (y(f))
        throw Tb('onargs');
      if (Gc(c)) {
        var g = yb(c, !0);
        f = g.events;
        var h = g.handle;
        h || (h = g.handle = lf(c, f));
        for (var g = 0 <= d.indexOf(' ') ? d.split(' ') : [d], l = g.length; l--;) {
          d = g[l];
          var k = f[d];
          k || (f[d] = [], 'mouseenter' === d || 'mouseleave' === d ? a(c, Qf[d], function (a) {
            var c = a.relatedTarget;
            c && (c === this || this.contains(c)) || h(a, d);
          }) : '$destroy' !== d && c.addEventListener(d, h, !1), k = f[d]);
          k.push(e);
        }
      }
    },
    off: Jc,
    one: function (a, c, d) {
      a = A(a);
      a.on(c, function f() {
        a.off(c, d);
        a.off(c, f);
      });
      a.on(c, d);
    },
    replaceWith: function (a, c) {
      var d, e = a.parentNode;
      wb(a);
      r(new T(c), function (c) {
        d ? e.insertBefore(c, d.nextSibling) : e.replaceChild(c, a);
        d = c;
      });
    },
    children: function (a) {
      var c = [];
      r(a.childNodes, function (a) {
        a.nodeType === qa && c.push(a);
      });
      return c;
    },
    contents: function (a) {
      return a.contentDocument || a.childNodes || [];
    },
    append: function (a, c) {
      var d = a.nodeType;
      if (d === qa || 11 === d) {
        c = new T(c);
        for (var d = 0, e = c.length; d < e; d++)
          a.appendChild(c[d]);
      }
    },
    prepend: function (a, c) {
      if (a.nodeType === qa) {
        var d = a.firstChild;
        r(new T(c), function (c) {
          a.insertBefore(c, d);
        });
      }
    },
    wrap: function (a, c) {
      c = A(c).eq(0).clone()[0];
      var d = a.parentNode;
      d && d.replaceChild(c, a);
      c.appendChild(a);
    },
    remove: Mc,
    detach: function (a) {
      Mc(a, !0);
    },
    after: function (a, c) {
      var d = a, e = a.parentNode;
      c = new T(c);
      for (var f = 0, g = c.length; f < g; f++) {
        var h = c[f];
        e.insertBefore(h, d.nextSibling);
        d = h;
      }
    },
    addClass: Cb,
    removeClass: Bb,
    toggleClass: function (a, c, d) {
      c && r(c.split(' '), function (c) {
        var f = d;
        x(f) && (f = !Ab(a, c));
        (f ? Cb : Bb)(a, c);
      });
    },
    parent: function (a) {
      return (a = a.parentNode) && 11 !== a.nodeType ? a : null;
    },
    next: function (a) {
      return a.nextElementSibling;
    },
    find: function (a, c) {
      return a.getElementsByTagName ? a.getElementsByTagName(c) : [];
    },
    clone: Ub,
    triggerHandler: function (a, c, d) {
      var e, f, g = c.type || c, h = yb(a);
      if (h = (h = h && h.events) && h[g])
        e = {
          preventDefault: function () {
            this.defaultPrevented = !0;
          },
          isDefaultPrevented: function () {
            return !0 === this.defaultPrevented;
          },
          stopImmediatePropagation: function () {
            this.immediatePropagationStopped = !0;
          },
          isImmediatePropagationStopped: function () {
            return !0 === this.immediatePropagationStopped;
          },
          stopPropagation: E,
          type: g,
          target: a
        }, c.type && (e = w(e, c)), c = sa(h), f = d ? [e].concat(d) : [e], r(c, function (c) {
          e.isImmediatePropagationStopped() || c.apply(a, f);
        });
    }
  }, function (a, c) {
    T.prototype[c] = function (c, e, f) {
      for (var g, h = 0, l = this.length; h < l; h++)
        x(g) ? (g = a(this[h], c, e, f), y(g) && (g = A(g))) : Ic(g, a(this[h], c, e, f));
      return y(g) ? g : this;
    };
    T.prototype.bind = T.prototype.on;
    T.prototype.unbind = T.prototype.off;
  });
  eb.prototype = {
    put: function (a, c) {
      this[Ma(a, this.nextUid)] = c;
    },
    get: function (a) {
      return this[Ma(a, this.nextUid)];
    },
    remove: function (a) {
      var c = this[a = Ma(a, this.nextUid)];
      delete this[a];
      return c;
    }
  };
  var Rc = /^function\s*[^\(]*\(\s*([^\)]*)\)/m, Rf = /,/, Sf = /^\s*(_?)(\S+?)\1\s*$/, Qc = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, Fa = R('$injector');
  ab.$$annotate = function (a, c, d) {
    var e;
    if ('function' === typeof a) {
      if (!(e = a.$inject)) {
        e = [];
        if (a.length) {
          if (c)
            throw C(d) && d || (d = a.name || mf(a)), Fa('strictdi', d);
          c = a.toString().replace(Qc, '');
          c = c.match(Rc);
          r(c[1].split(Rf), function (a) {
            a.replace(Sf, function (a, c, d) {
              e.push(d);
            });
          });
        }
        a.$inject = e;
      }
    } else
      H(a) ? (c = a.length - 1, sb(a[c], 'fn'), e = a.slice(0, c)) : sb(a, 'fn', !0);
    return e;
  };
  var Tf = R('$animate'), Ce = [
      '$provide',
      function (a) {
        this.$$selectors = {};
        this.register = function (c, d) {
          var e = c + '-animation';
          if (c && '.' != c.charAt(0))
            throw Tf('notcsel', c);
          this.$$selectors[c.substr(1)] = e;
          a.factory(e, d);
        };
        this.classNameFilter = function (a) {
          1 === arguments.length && (this.$$classNameFilter = a instanceof RegExp ? a : null);
          return this.$$classNameFilter;
        };
        this.$get = [
          '$$q',
          '$$asyncCallback',
          '$rootScope',
          function (a, d, e) {
            function f(d) {
              var f, g = a.defer();
              g.promise.$$cancelFn = function () {
                f && f();
              };
              e.$$postDigest(function () {
                f = d(function () {
                  g.resolve();
                });
              });
              return g.promise;
            }
            function g(a, c) {
              var d = [], e = [], f = ia();
              r((a.attr('class') || '').split(/\s+/), function (a) {
                f[a] = !0;
              });
              r(c, function (a, c) {
                var g = f[c];
                !1 === a && g ? e.push(c) : !0 !== a || g || d.push(c);
              });
              return 0 < d.length + e.length && [
                d.length ? d : null,
                e.length ? e : null
              ];
            }
            function h(a, c, d) {
              for (var e = 0, f = c.length; e < f; ++e)
                a[c[e]] = d;
            }
            function l() {
              n || (n = a.defer(), d(function () {
                n.resolve();
                n = null;
              }));
              return n.promise;
            }
            function k(a, c) {
              if (ca.isObject(c)) {
                var d = w(c.from || {}, c.to || {});
                a.css(d);
              }
            }
            var n;
            return {
              animate: function (a, c, d) {
                k(a, {
                  from: c,
                  to: d
                });
                return l();
              },
              enter: function (a, c, d, e) {
                k(a, e);
                d ? d.after(a) : c.prepend(a);
                return l();
              },
              leave: function (a, c) {
                k(a, c);
                a.remove();
                return l();
              },
              move: function (a, c, d, e) {
                return this.enter(a, c, d, e);
              },
              addClass: function (a, c, d) {
                return this.setClass(a, c, [], d);
              },
              $$addClassImmediately: function (a, c, d) {
                a = A(a);
                c = C(c) ? c : H(c) ? c.join(' ') : '';
                r(a, function (a) {
                  Cb(a, c);
                });
                k(a, d);
                return l();
              },
              removeClass: function (a, c, d) {
                return this.setClass(a, [], c, d);
              },
              $$removeClassImmediately: function (a, c, d) {
                a = A(a);
                c = C(c) ? c : H(c) ? c.join(' ') : '';
                r(a, function (a) {
                  Bb(a, c);
                });
                k(a, d);
                return l();
              },
              setClass: function (a, c, d, e) {
                var k = this, l = !1;
                a = A(a);
                var m = a.data('$$animateClasses');
                m ? e && m.options && (m.options = ca.extend(m.options || {}, e)) : (m = {
                  classes: {},
                  options: e
                }, l = !0);
                e = m.classes;
                c = H(c) ? c : c.split(' ');
                d = H(d) ? d : d.split(' ');
                h(e, c, !0);
                h(e, d, !1);
                l && (m.promise = f(function (c) {
                  var d = a.data('$$animateClasses');
                  a.removeData('$$animateClasses');
                  if (d) {
                    var e = g(a, d.classes);
                    e && k.$$setClassImmediately(a, e[0], e[1], d.options);
                  }
                  c();
                }), a.data('$$animateClasses', m));
                return m.promise;
              },
              $$setClassImmediately: function (a, c, d, e) {
                c && this.$$addClassImmediately(a, c);
                d && this.$$removeClassImmediately(a, d);
                k(a, e);
                return l();
              },
              enabled: E,
              cancel: E
            };
          }
        ];
      }
    ], la = R('$compile');
  yc.$inject = [
    '$provide',
    '$$sanitizeUriProvider'
  ];
  var Sc = /^((?:x|data)[\:\-_])/i, rf = R('$controller'), Wc = 'application/json', $b = { 'Content-Type': Wc + ';charset=utf-8' }, tf = /^\[|^\{(?!\{)/, uf = {
      '[': /]$/,
      '{': /}$/
    }, sf = /^\)\]\}',?\n/, ac = R('$interpolate'), Uf = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/, xf = {
      http: 80,
      https: 443,
      ftp: 21
    }, Gb = R('$location'), Vf = {
      $$html5: !1,
      $$replace: !1,
      absUrl: Hb('$$absUrl'),
      url: function (a) {
        if (x(a))
          return this.$$url;
        var c = Uf.exec(a);
        (c[1] || '' === a) && this.path(decodeURIComponent(c[1]));
        (c[2] || c[1] || '' === a) && this.search(c[3] || '');
        this.hash(c[5] || '');
        return this;
      },
      protocol: Hb('$$protocol'),
      host: Hb('$$host'),
      port: Hb('$$port'),
      path: dd('$$path', function (a) {
        a = null !== a ? a.toString() : '';
        return '/' == a.charAt(0) ? a : '/' + a;
      }),
      search: function (a, c) {
        switch (arguments.length) {
        case 0:
          return this.$$search;
        case 1:
          if (C(a) || Y(a))
            a = a.toString(), this.$$search = sc(a);
          else if (J(a))
            a = Da(a, {}), r(a, function (c, e) {
              null == c && delete a[e];
            }), this.$$search = a;
          else
            throw Gb('isrcharg');
          break;
        default:
          x(c) || null === c ? delete this.$$search[a] : this.$$search[a] = c;
        }
        this.$$compose();
        return this;
      },
      hash: dd('$$hash', function (a) {
        return null !== a ? a.toString() : '';
      }),
      replace: function () {
        this.$$replace = !0;
        return this;
      }
    };
  r([
    cd,
    ec,
    dc
  ], function (a) {
    a.prototype = Object.create(Vf);
    a.prototype.state = function (c) {
      if (!arguments.length)
        return this.$$state;
      if (a !== dc || !this.$$html5)
        throw Gb('nostate');
      this.$$state = x(c) ? null : c;
      return this;
    };
  });
  var na = R('$parse'), Wf = Function.prototype.call, Xf = Function.prototype.apply, Yf = Function.prototype.bind, mb = ia();
  r({
    'null': function () {
      return null;
    },
    'true': function () {
      return !0;
    },
    'false': function () {
      return !1;
    },
    undefined: function () {
    }
  }, function (a, c) {
    a.constant = a.literal = a.sharedGetter = !0;
    mb[c] = a;
  });
  mb['this'] = function (a) {
    return a;
  };
  mb['this'].sharedGetter = !0;
  var nb = w(ia(), {
      '+': function (a, c, d, e) {
        d = d(a, c);
        e = e(a, c);
        return y(d) ? y(e) ? d + e : d : y(e) ? e : t;
      },
      '-': function (a, c, d, e) {
        d = d(a, c);
        e = e(a, c);
        return (y(d) ? d : 0) - (y(e) ? e : 0);
      },
      '*': function (a, c, d, e) {
        return d(a, c) * e(a, c);
      },
      '/': function (a, c, d, e) {
        return d(a, c) / e(a, c);
      },
      '%': function (a, c, d, e) {
        return d(a, c) % e(a, c);
      },
      '===': function (a, c, d, e) {
        return d(a, c) === e(a, c);
      },
      '!==': function (a, c, d, e) {
        return d(a, c) !== e(a, c);
      },
      '==': function (a, c, d, e) {
        return d(a, c) == e(a, c);
      },
      '!=': function (a, c, d, e) {
        return d(a, c) != e(a, c);
      },
      '<': function (a, c, d, e) {
        return d(a, c) < e(a, c);
      },
      '>': function (a, c, d, e) {
        return d(a, c) > e(a, c);
      },
      '<=': function (a, c, d, e) {
        return d(a, c) <= e(a, c);
      },
      '>=': function (a, c, d, e) {
        return d(a, c) >= e(a, c);
      },
      '&&': function (a, c, d, e) {
        return d(a, c) && e(a, c);
      },
      '||': function (a, c, d, e) {
        return d(a, c) || e(a, c);
      },
      '!': function (a, c, d) {
        return !d(a, c);
      },
      '=': !0,
      '|': !0
    }), Zf = {
      n: '\n',
      f: '\f',
      r: '\r',
      t: '\t',
      v: '\x0B',
      '\'': '\'',
      '"': '"'
    }, hc = function (a) {
      this.options = a;
    };
  hc.prototype = {
    constructor: hc,
    lex: function (a) {
      this.text = a;
      this.index = 0;
      for (this.tokens = []; this.index < this.text.length;)
        if (a = this.text.charAt(this.index), '"' === a || '\'' === a)
          this.readString(a);
        else if (this.isNumber(a) || '.' === a && this.isNumber(this.peek()))
          this.readNumber();
        else if (this.isIdent(a))
          this.readIdent();
        else if (this.is(a, '(){}[].,;:?'))
          this.tokens.push({
            index: this.index,
            text: a
          }), this.index++;
        else if (this.isWhitespace(a))
          this.index++;
        else {
          var c = a + this.peek(), d = c + this.peek(2), e = nb[c], f = nb[d];
          nb[a] || e || f ? (a = f ? d : e ? c : a, this.tokens.push({
            index: this.index,
            text: a,
            operator: !0
          }), this.index += a.length) : this.throwError('Unexpected next character ', this.index, this.index + 1);
        }
      return this.tokens;
    },
    is: function (a, c) {
      return -1 !== c.indexOf(a);
    },
    peek: function (a) {
      a = a || 1;
      return this.index + a < this.text.length ? this.text.charAt(this.index + a) : !1;
    },
    isNumber: function (a) {
      return '0' <= a && '9' >= a && 'string' === typeof a;
    },
    isWhitespace: function (a) {
      return ' ' === a || '\r' === a || '\t' === a || '\n' === a || '\x0B' === a || '\xa0' === a;
    },
    isIdent: function (a) {
      return 'a' <= a && 'z' >= a || 'A' <= a && 'Z' >= a || '_' === a || '$' === a;
    },
    isExpOperator: function (a) {
      return '-' === a || '+' === a || this.isNumber(a);
    },
    throwError: function (a, c, d) {
      d = d || this.index;
      c = y(c) ? 's ' + c + '-' + this.index + ' [' + this.text.substring(c, d) + ']' : ' ' + d;
      throw na('lexerr', a, c, this.text);
    },
    readNumber: function () {
      for (var a = '', c = this.index; this.index < this.text.length;) {
        var d = z(this.text.charAt(this.index));
        if ('.' == d || this.isNumber(d))
          a += d;
        else {
          var e = this.peek();
          if ('e' == d && this.isExpOperator(e))
            a += d;
          else if (this.isExpOperator(d) && e && this.isNumber(e) && 'e' == a.charAt(a.length - 1))
            a += d;
          else if (!this.isExpOperator(d) || e && this.isNumber(e) || 'e' != a.charAt(a.length - 1))
            break;
          else
            this.throwError('Invalid exponent');
        }
        this.index++;
      }
      this.tokens.push({
        index: c,
        text: a,
        constant: !0,
        value: Number(a)
      });
    },
    readIdent: function () {
      for (var a = this.index; this.index < this.text.length;) {
        var c = this.text.charAt(this.index);
        if (!this.isIdent(c) && !this.isNumber(c))
          break;
        this.index++;
      }
      this.tokens.push({
        index: a,
        text: this.text.slice(a, this.index),
        identifier: !0
      });
    },
    readString: function (a) {
      var c = this.index;
      this.index++;
      for (var d = '', e = a, f = !1; this.index < this.text.length;) {
        var g = this.text.charAt(this.index), e = e + g;
        if (f)
          'u' === g ? (f = this.text.substring(this.index + 1, this.index + 5), f.match(/[\da-f]{4}/i) || this.throwError('Invalid unicode escape [\\u' + f + ']'), this.index += 4, d += String.fromCharCode(parseInt(f, 16))) : d += Zf[g] || g, f = !1;
        else if ('\\' === g)
          f = !0;
        else {
          if (g === a) {
            this.index++;
            this.tokens.push({
              index: c,
              text: e,
              constant: !0,
              value: d
            });
            return;
          }
          d += g;
        }
        this.index++;
      }
      this.throwError('Unterminated quote', c);
    }
  };
  var ib = function (a, c, d) {
    this.lexer = a;
    this.$filter = c;
    this.options = d;
  };
  ib.ZERO = w(function () {
    return 0;
  }, {
    sharedGetter: !0,
    constant: !0
  });
  ib.prototype = {
    constructor: ib,
    parse: function (a) {
      this.text = a;
      this.tokens = this.lexer.lex(a);
      a = this.statements();
      0 !== this.tokens.length && this.throwError('is an unexpected token', this.tokens[0]);
      a.literal = !!a.literal;
      a.constant = !!a.constant;
      return a;
    },
    primary: function () {
      var a;
      this.expect('(') ? (a = this.filterChain(), this.consume(')')) : this.expect('[') ? a = this.arrayDeclaration() : this.expect('{') ? a = this.object() : this.peek().identifier && this.peek().text in mb ? a = mb[this.consume().text] : this.peek().identifier ? a = this.identifier() : this.peek().constant ? a = this.constant() : this.throwError('not a primary expression', this.peek());
      for (var c, d; c = this.expect('(', '[', '.');)
        '(' === c.text ? (a = this.functionCall(a, d), d = null) : '[' === c.text ? (d = a, a = this.objectIndex(a)) : '.' === c.text ? (d = a, a = this.fieldAccess(a)) : this.throwError('IMPOSSIBLE');
      return a;
    },
    throwError: function (a, c) {
      throw na('syntax', c.text, a, c.index + 1, this.text, this.text.substring(c.index));
    },
    peekToken: function () {
      if (0 === this.tokens.length)
        throw na('ueoe', this.text);
      return this.tokens[0];
    },
    peek: function (a, c, d, e) {
      return this.peekAhead(0, a, c, d, e);
    },
    peekAhead: function (a, c, d, e, f) {
      if (this.tokens.length > a) {
        a = this.tokens[a];
        var g = a.text;
        if (g === c || g === d || g === e || g === f || !(c || d || e || f))
          return a;
      }
      return !1;
    },
    expect: function (a, c, d, e) {
      return (a = this.peek(a, c, d, e)) ? (this.tokens.shift(), a) : !1;
    },
    consume: function (a) {
      if (0 === this.tokens.length)
        throw na('ueoe', this.text);
      var c = this.expect(a);
      c || this.throwError('is unexpected, expecting [' + a + ']', this.peek());
      return c;
    },
    unaryFn: function (a, c) {
      var d = nb[a];
      return w(function (a, f) {
        return d(a, f, c);
      }, {
        constant: c.constant,
        inputs: [c]
      });
    },
    binaryFn: function (a, c, d, e) {
      var f = nb[c];
      return w(function (c, e) {
        return f(c, e, a, d);
      }, {
        constant: a.constant && d.constant,
        inputs: !e && [
          a,
          d
        ]
      });
    },
    identifier: function () {
      for (var a = this.consume().text; this.peek('.') && this.peekAhead(1).identifier && !this.peekAhead(2, '(');)
        a += this.consume().text + this.consume().text;
      return zf(a, this.options, this.text);
    },
    constant: function () {
      var a = this.consume().value;
      return w(function () {
        return a;
      }, {
        constant: !0,
        literal: !0
      });
    },
    statements: function () {
      for (var a = [];;)
        if (0 < this.tokens.length && !this.peek('}', ')', ';', ']') && a.push(this.filterChain()), !this.expect(';'))
          return 1 === a.length ? a[0] : function (c, d) {
            for (var e, f = 0, g = a.length; f < g; f++)
              e = a[f](c, d);
            return e;
          };
    },
    filterChain: function () {
      for (var a = this.expression(); this.expect('|');)
        a = this.filter(a);
      return a;
    },
    filter: function (a) {
      var c = this.$filter(this.consume().text), d, e;
      if (this.peek(':'))
        for (d = [], e = []; this.expect(':');)
          d.push(this.expression());
      var f = [a].concat(d || []);
      return w(function (f, h) {
        var l = a(f, h);
        if (e) {
          e[0] = l;
          for (l = d.length; l--;)
            e[l + 1] = d[l](f, h);
          return c.apply(t, e);
        }
        return c(l);
      }, {
        constant: !c.$stateful && f.every(fc),
        inputs: !c.$stateful && f
      });
    },
    expression: function () {
      return this.assignment();
    },
    assignment: function () {
      var a = this.ternary(), c, d;
      return (d = this.expect('=')) ? (a.assign || this.throwError('implies assignment but [' + this.text.substring(0, d.index) + '] can not be assigned to', d), c = this.ternary(), w(function (d, f) {
        return a.assign(d, c(d, f), f);
      }, {
        inputs: [
          a,
          c
        ]
      })) : a;
    },
    ternary: function () {
      var a = this.logicalOR(), c;
      if (this.expect('?') && (c = this.assignment(), this.consume(':'))) {
        var d = this.assignment();
        return w(function (e, f) {
          return a(e, f) ? c(e, f) : d(e, f);
        }, { constant: a.constant && c.constant && d.constant });
      }
      return a;
    },
    logicalOR: function () {
      for (var a = this.logicalAND(), c; c = this.expect('||');)
        a = this.binaryFn(a, c.text, this.logicalAND(), !0);
      return a;
    },
    logicalAND: function () {
      for (var a = this.equality(), c; c = this.expect('&&');)
        a = this.binaryFn(a, c.text, this.equality(), !0);
      return a;
    },
    equality: function () {
      for (var a = this.relational(), c; c = this.expect('==', '!=', '===', '!==');)
        a = this.binaryFn(a, c.text, this.relational());
      return a;
    },
    relational: function () {
      for (var a = this.additive(), c; c = this.expect('<', '>', '<=', '>=');)
        a = this.binaryFn(a, c.text, this.additive());
      return a;
    },
    additive: function () {
      for (var a = this.multiplicative(), c; c = this.expect('+', '-');)
        a = this.binaryFn(a, c.text, this.multiplicative());
      return a;
    },
    multiplicative: function () {
      for (var a = this.unary(), c; c = this.expect('*', '/', '%');)
        a = this.binaryFn(a, c.text, this.unary());
      return a;
    },
    unary: function () {
      var a;
      return this.expect('+') ? this.primary() : (a = this.expect('-')) ? this.binaryFn(ib.ZERO, a.text, this.unary()) : (a = this.expect('!')) ? this.unaryFn(a.text, this.unary()) : this.primary();
    },
    fieldAccess: function (a) {
      var c = this.identifier();
      return w(function (d, e, f) {
        d = f || a(d, e);
        return null == d ? t : c(d);
      }, {
        assign: function (d, e, f) {
          var g = a(d, f);
          g || a.assign(d, g = {}, f);
          return c.assign(g, e);
        }
      });
    },
    objectIndex: function (a) {
      var c = this.text, d = this.expression();
      this.consume(']');
      return w(function (e, f) {
        var g = a(e, f), h = d(e, f);
        ua(h, c);
        return g ? oa(g[h], c) : t;
      }, {
        assign: function (e, f, g) {
          var h = ua(d(e, g), c), l = oa(a(e, g), c);
          l || a.assign(e, l = {}, g);
          return l[h] = f;
        }
      });
    },
    functionCall: function (a, c) {
      var d = [];
      if (')' !== this.peekToken().text) {
        do
          d.push(this.expression());
        while (this.expect(','));
      }
      this.consume(')');
      var e = this.text, f = d.length ? [] : null;
      return function (g, h) {
        var l = c ? c(g, h) : y(c) ? t : g, k = a(g, h, l) || E;
        if (f)
          for (var n = d.length; n--;)
            f[n] = oa(d[n](g, h), e);
        oa(l, e);
        if (k) {
          if (k.constructor === k)
            throw na('isecfn', e);
          if (k === Wf || k === Xf || k === Yf)
            throw na('isecff', e);
        }
        l = k.apply ? k.apply(l, f) : k(f[0], f[1], f[2], f[3], f[4]);
        f && (f.length = 0);
        return oa(l, e);
      };
    },
    arrayDeclaration: function () {
      var a = [];
      if (']' !== this.peekToken().text) {
        do {
          if (this.peek(']'))
            break;
          a.push(this.expression());
        } while (this.expect(','));
      }
      this.consume(']');
      return w(function (c, d) {
        for (var e = [], f = 0, g = a.length; f < g; f++)
          e.push(a[f](c, d));
        return e;
      }, {
        literal: !0,
        constant: a.every(fc),
        inputs: a
      });
    },
    object: function () {
      var a = [], c = [];
      if ('}' !== this.peekToken().text) {
        do {
          if (this.peek('}'))
            break;
          var d = this.consume();
          d.constant ? a.push(d.value) : d.identifier ? a.push(d.text) : this.throwError('invalid key', d);
          this.consume(':');
          c.push(this.expression());
        } while (this.expect(','));
      }
      this.consume('}');
      return w(function (d, f) {
        for (var g = {}, h = 0, l = c.length; h < l; h++)
          g[a[h]] = c[h](d, f);
        return g;
      }, {
        literal: !0,
        constant: c.every(fc),
        inputs: c
      });
    }
  };
  var Bf = ia(), Af = ia(), Cf = Object.prototype.valueOf, Ba = R('$sce'), pa = {
      HTML: 'html',
      CSS: 'css',
      URL: 'url',
      RESOURCE_URL: 'resourceUrl',
      JS: 'js'
    }, la = R('$compile'), $ = W.createElement('a'), id = Aa(Q.location.href);
  Fc.$inject = ['$provide'];
  jd.$inject = ['$locale'];
  ld.$inject = ['$locale'];
  var od = '.', Mf = {
      yyyy: U('FullYear', 4),
      yy: U('FullYear', 2, 0, !0),
      y: U('FullYear', 1),
      MMMM: Jb('Month'),
      MMM: Jb('Month', !0),
      MM: U('Month', 2, 1),
      M: U('Month', 1, 1),
      dd: U('Date', 2),
      d: U('Date', 1),
      HH: U('Hours', 2),
      H: U('Hours', 1),
      hh: U('Hours', 2, -12),
      h: U('Hours', 1, -12),
      mm: U('Minutes', 2),
      m: U('Minutes', 1),
      ss: U('Seconds', 2),
      s: U('Seconds', 1),
      sss: U('Milliseconds', 3),
      EEEE: Jb('Day'),
      EEE: Jb('Day', !0),
      a: function (a, c) {
        return 12 > a.getHours() ? c.AMPMS[0] : c.AMPMS[1];
      },
      Z: function (a) {
        a = -1 * a.getTimezoneOffset();
        return a = (0 <= a ? '+' : '') + (Ib(Math[0 < a ? 'floor' : 'ceil'](a / 60), 2) + Ib(Math.abs(a % 60), 2));
      },
      ww: qd(2),
      w: qd(1),
      G: ic,
      GG: ic,
      GGG: ic,
      GGGG: function (a, c) {
        return 0 >= a.getFullYear() ? c.ERANAMES[0] : c.ERANAMES[1];
      }
    }, Lf = /((?:[^yMdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/, Kf = /^\-?\d+$/;
  kd.$inject = ['$locale'];
  var Hf = ea(z), If = ea(ub);
  md.$inject = ['$parse'];
  var Td = ea({
      restrict: 'E',
      compile: function (a, c) {
        if (!c.href && !c.xlinkHref && !c.name)
          return function (a, c) {
            if ('a' === c[0].nodeName.toLowerCase()) {
              var f = '[object SVGAnimatedString]' === Ca.call(c.prop('href')) ? 'xlink:href' : 'href';
              c.on('click', function (a) {
                c.attr(f) || a.preventDefault();
              });
            }
          };
      }
    }), vb = {};
  r(Eb, function (a, c) {
    if ('multiple' != a) {
      var d = xa('ng-' + c);
      vb[d] = function () {
        return {
          restrict: 'A',
          priority: 100,
          link: function (a, f, g) {
            a.$watch(g[d], function (a) {
              g.$set(c, !!a);
            });
          }
        };
      };
    }
  });
  r(Pc, function (a, c) {
    vb[c] = function () {
      return {
        priority: 100,
        link: function (a, e, f) {
          if ('ngPattern' === c && '/' == f.ngPattern.charAt(0) && (e = f.ngPattern.match(Of))) {
            f.$set('ngPattern', new RegExp(e[1], e[2]));
            return;
          }
          a.$watch(f[c], function (a) {
            f.$set(c, a);
          });
        }
      };
    };
  });
  r([
    'src',
    'srcset',
    'href'
  ], function (a) {
    var c = xa('ng-' + a);
    vb[c] = function () {
      return {
        priority: 99,
        link: function (d, e, f) {
          var g = a, h = a;
          'href' === a && '[object SVGAnimatedString]' === Ca.call(e.prop('href')) && (h = 'xlinkHref', f.$attr[h] = 'xlink:href', g = null);
          f.$observe(c, function (c) {
            c ? (f.$set(h, c), Qa && g && e.prop(g, f[h])) : 'href' === a && f.$set(h, null);
          });
        }
      };
    };
  });
  var Kb = {
      $addControl: E,
      $$renameControl: function (a, c) {
        a.$name = c;
      },
      $removeControl: E,
      $setValidity: E,
      $setDirty: E,
      $setPristine: E,
      $setSubmitted: E
    };
  rd.$inject = [
    '$element',
    '$attrs',
    '$scope',
    '$animate',
    '$interpolate'
  ];
  var yd = function (a) {
      return [
        '$timeout',
        function (c) {
          return {
            name: 'form',
            restrict: a ? 'EAC' : 'E',
            controller: rd,
            compile: function (d, e) {
              d.addClass(Ra).addClass(lb);
              var f = e.name ? 'name' : a && e.ngForm ? 'ngForm' : !1;
              return {
                pre: function (a, d, e, k) {
                  if (!('action' in e)) {
                    var n = function (c) {
                      a.$apply(function () {
                        k.$commitViewValue();
                        k.$setSubmitted();
                      });
                      c.preventDefault();
                    };
                    d[0].addEventListener('submit', n, !1);
                    d.on('$destroy', function () {
                      c(function () {
                        d[0].removeEventListener('submit', n, !1);
                      }, 0, !1);
                    });
                  }
                  var p = k.$$parentForm;
                  f && (hb(a, null, k.$name, k, k.$name), e.$observe(f, function (c) {
                    k.$name !== c && (hb(a, null, k.$name, t, k.$name), p.$$renameControl(k, c), hb(a, null, k.$name, k, k.$name));
                  }));
                  d.on('$destroy', function () {
                    p.$removeControl(k);
                    f && hb(a, null, e[f], t, k.$name);
                    w(k, Kb);
                  });
                }
              };
            }
          };
        }
      ];
    }, Ud = yd(), ge = yd(!0), Nf = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/, $f = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, ag = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i, bg = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/, zd = /^(\d{4})-(\d{2})-(\d{2})$/, Ad = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/, lc = /^(\d{4})-W(\d\d)$/, Bd = /^(\d{4})-(\d\d)$/, Cd = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/, Dd = {
      text: function (a, c, d, e, f, g) {
        jb(a, c, d, e, f, g);
        jc(e);
      },
      date: kb('date', zd, Mb(zd, [
        'yyyy',
        'MM',
        'dd'
      ]), 'yyyy-MM-dd'),
      'datetime-local': kb('datetimelocal', Ad, Mb(Ad, 'yyyy MM dd HH mm ss sss'.split(' ')), 'yyyy-MM-ddTHH:mm:ss.sss'),
      time: kb('time', Cd, Mb(Cd, [
        'HH',
        'mm',
        'ss',
        'sss'
      ]), 'HH:mm:ss.sss'),
      week: kb('week', lc, function (a, c) {
        if (ga(a))
          return a;
        if (C(a)) {
          lc.lastIndex = 0;
          var d = lc.exec(a);
          if (d) {
            var e = +d[1], f = +d[2], g = d = 0, h = 0, l = 0, k = pd(e), f = 7 * (f - 1);
            c && (d = c.getHours(), g = c.getMinutes(), h = c.getSeconds(), l = c.getMilliseconds());
            return new Date(e, 0, k.getDate() + f, d, g, h, l);
          }
        }
        return NaN;
      }, 'yyyy-Www'),
      month: kb('month', Bd, Mb(Bd, [
        'yyyy',
        'MM'
      ]), 'yyyy-MM'),
      number: function (a, c, d, e, f, g) {
        td(a, c, d, e);
        jb(a, c, d, e, f, g);
        e.$$parserName = 'number';
        e.$parsers.push(function (a) {
          return e.$isEmpty(a) ? null : bg.test(a) ? parseFloat(a) : t;
        });
        e.$formatters.push(function (a) {
          if (!e.$isEmpty(a)) {
            if (!Y(a))
              throw Nb('numfmt', a);
            a = a.toString();
          }
          return a;
        });
        if (y(d.min) || d.ngMin) {
          var h;
          e.$validators.min = function (a) {
            return e.$isEmpty(a) || x(h) || a >= h;
          };
          d.$observe('min', function (a) {
            y(a) && !Y(a) && (a = parseFloat(a, 10));
            h = Y(a) && !isNaN(a) ? a : t;
            e.$validate();
          });
        }
        if (y(d.max) || d.ngMax) {
          var l;
          e.$validators.max = function (a) {
            return e.$isEmpty(a) || x(l) || a <= l;
          };
          d.$observe('max', function (a) {
            y(a) && !Y(a) && (a = parseFloat(a, 10));
            l = Y(a) && !isNaN(a) ? a : t;
            e.$validate();
          });
        }
      },
      url: function (a, c, d, e, f, g) {
        jb(a, c, d, e, f, g);
        jc(e);
        e.$$parserName = 'url';
        e.$validators.url = function (a, c) {
          var d = a || c;
          return e.$isEmpty(d) || $f.test(d);
        };
      },
      email: function (a, c, d, e, f, g) {
        jb(a, c, d, e, f, g);
        jc(e);
        e.$$parserName = 'email';
        e.$validators.email = function (a, c) {
          var d = a || c;
          return e.$isEmpty(d) || ag.test(d);
        };
      },
      radio: function (a, c, d, e) {
        x(d.name) && c.attr('name', ++ob);
        c.on('click', function (a) {
          c[0].checked && e.$setViewValue(d.value, a && a.type);
        });
        e.$render = function () {
          c[0].checked = d.value == e.$viewValue;
        };
        d.$observe('value', e.$render);
      },
      checkbox: function (a, c, d, e, f, g, h, l) {
        var k = ud(l, a, 'ngTrueValue', d.ngTrueValue, !0), n = ud(l, a, 'ngFalseValue', d.ngFalseValue, !1);
        c.on('click', function (a) {
          e.$setViewValue(c[0].checked, a && a.type);
        });
        e.$render = function () {
          c[0].checked = e.$viewValue;
        };
        e.$isEmpty = function (a) {
          return !1 === a;
        };
        e.$formatters.push(function (a) {
          return ha(a, k);
        });
        e.$parsers.push(function (a) {
          return a ? k : n;
        });
      },
      hidden: E,
      button: E,
      submit: E,
      reset: E,
      file: E
    }, zc = [
      '$browser',
      '$sniffer',
      '$filter',
      '$parse',
      function (a, c, d, e) {
        return {
          restrict: 'E',
          require: ['?ngModel'],
          link: {
            pre: function (f, g, h, l) {
              l[0] && (Dd[z(h.type)] || Dd.text)(f, g, h, l[0], c, a, d, e);
            }
          }
        };
      }
    ], cg = /^(true|false|\d+)$/, ye = function () {
      return {
        restrict: 'A',
        priority: 100,
        compile: function (a, c) {
          return cg.test(c.ngValue) ? function (a, c, f) {
            f.$set('value', a.$eval(f.ngValue));
          } : function (a, c, f) {
            a.$watch(f.ngValue, function (a) {
              f.$set('value', a);
            });
          };
        }
      };
    }, Zd = [
      '$compile',
      function (a) {
        return {
          restrict: 'AC',
          compile: function (c) {
            a.$$addBindingClass(c);
            return function (c, e, f) {
              a.$$addBindingInfo(e, f.ngBind);
              e = e[0];
              c.$watch(f.ngBind, function (a) {
                e.textContent = a === t ? '' : a;
              });
            };
          }
        };
      }
    ], ae = [
      '$interpolate',
      '$compile',
      function (a, c) {
        return {
          compile: function (d) {
            c.$$addBindingClass(d);
            return function (d, f, g) {
              d = a(f.attr(g.$attr.ngBindTemplate));
              c.$$addBindingInfo(f, d.expressions);
              f = f[0];
              g.$observe('ngBindTemplate', function (a) {
                f.textContent = a === t ? '' : a;
              });
            };
          }
        };
      }
    ], $d = [
      '$sce',
      '$parse',
      '$compile',
      function (a, c, d) {
        return {
          restrict: 'A',
          compile: function (e, f) {
            var g = c(f.ngBindHtml), h = c(f.ngBindHtml, function (a) {
                return (a || '').toString();
              });
            d.$$addBindingClass(e);
            return function (c, e, f) {
              d.$$addBindingInfo(e, f.ngBindHtml);
              c.$watch(h, function () {
                e.html(a.getTrustedHtml(g(c)) || '');
              });
            };
          }
        };
      }
    ], xe = ea({
      restrict: 'A',
      require: 'ngModel',
      link: function (a, c, d, e) {
        e.$viewChangeListeners.push(function () {
          a.$eval(d.ngChange);
        });
      }
    }), be = kc('', !0), de = kc('Odd', 0), ce = kc('Even', 1), ee = Ia({
      compile: function (a, c) {
        c.$set('ngCloak', t);
        a.removeClass('ng-cloak');
      }
    }), fe = [function () {
        return {
          restrict: 'A',
          scope: !0,
          controller: '@',
          priority: 500
        };
      }], Ec = {}, dg = {
      blur: !0,
      focus: !0
    };
  r('click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '), function (a) {
    var c = xa('ng-' + a);
    Ec[c] = [
      '$parse',
      '$rootScope',
      function (d, e) {
        return {
          restrict: 'A',
          compile: function (f, g) {
            var h = d(g[c], null, !0);
            return function (c, d) {
              d.on(a, function (d) {
                var f = function () {
                  h(c, { $event: d });
                };
                dg[a] && e.$$phase ? c.$evalAsync(f) : c.$apply(f);
              });
            };
          }
        };
      }
    ];
  });
  var ie = [
      '$animate',
      function (a) {
        return {
          multiElement: !0,
          transclude: 'element',
          priority: 600,
          terminal: !0,
          restrict: 'A',
          $$tlb: !0,
          link: function (c, d, e, f, g) {
            var h, l, k;
            c.$watch(e.ngIf, function (c) {
              c ? l || g(function (c, f) {
                l = f;
                c[c.length++] = W.createComment(' end ngIf: ' + e.ngIf + ' ');
                h = { clone: c };
                a.enter(c, d.parent(), d);
              }) : (k && (k.remove(), k = null), l && (l.$destroy(), l = null), h && (k = tb(h.clone), a.leave(k).then(function () {
                k = null;
              }), h = null));
            });
          }
        };
      }
    ], je = [
      '$templateRequest',
      '$anchorScroll',
      '$animate',
      '$sce',
      function (a, c, d, e) {
        return {
          restrict: 'ECA',
          priority: 400,
          terminal: !0,
          transclude: 'element',
          controller: ca.noop,
          compile: function (f, g) {
            var h = g.ngInclude || g.src, l = g.onload || '', k = g.autoscroll;
            return function (f, g, q, r, s) {
              var t = 0, v, m, F, w = function () {
                  m && (m.remove(), m = null);
                  v && (v.$destroy(), v = null);
                  F && (d.leave(F).then(function () {
                    m = null;
                  }), m = F, F = null);
                };
              f.$watch(e.parseAsResourceUrl(h), function (e) {
                var h = function () {
                    !y(k) || k && !f.$eval(k) || c();
                  }, m = ++t;
                e ? (a(e, !0).then(function (a) {
                  if (m === t) {
                    var c = f.$new();
                    r.template = a;
                    a = s(c, function (a) {
                      w();
                      d.enter(a, null, g).then(h);
                    });
                    v = c;
                    F = a;
                    v.$emit('$includeContentLoaded', e);
                    f.$eval(l);
                  }
                }, function () {
                  m === t && (w(), f.$emit('$includeContentError', e));
                }), f.$emit('$includeContentRequested', e)) : (w(), r.template = null);
              });
            };
          }
        };
      }
    ], Ae = [
      '$compile',
      function (a) {
        return {
          restrict: 'ECA',
          priority: -400,
          require: 'ngInclude',
          link: function (c, d, e, f) {
            /SVG/.test(d[0].toString()) ? (d.empty(), a(Hc(f.template, W).childNodes)(c, function (a) {
              d.append(a);
            }, { futureParentElement: d })) : (d.html(f.template), a(d.contents())(c));
          }
        };
      }
    ], ke = Ia({
      priority: 450,
      compile: function () {
        return {
          pre: function (a, c, d) {
            a.$eval(d.ngInit);
          }
        };
      }
    }), we = function () {
      return {
        restrict: 'A',
        priority: 100,
        require: 'ngModel',
        link: function (a, c, d, e) {
          var f = c.attr(d.$attr.ngList) || ', ', g = 'false' !== d.ngTrim, h = g ? N(f) : f;
          e.$parsers.push(function (a) {
            if (!x(a)) {
              var c = [];
              a && r(a.split(h), function (a) {
                a && c.push(g ? N(a) : a);
              });
              return c;
            }
          });
          e.$formatters.push(function (a) {
            return H(a) ? a.join(f) : t;
          });
          e.$isEmpty = function (a) {
            return !a || !a.length;
          };
        }
      };
    }, lb = 'ng-valid', vd = 'ng-invalid', Ra = 'ng-pristine', Lb = 'ng-dirty', xd = 'ng-pending', Nb = new R('ngModel'), eg = [
      '$scope',
      '$exceptionHandler',
      '$attrs',
      '$element',
      '$parse',
      '$animate',
      '$timeout',
      '$rootScope',
      '$q',
      '$interpolate',
      function (a, c, d, e, f, g, h, l, k, n) {
        this.$modelValue = this.$viewValue = Number.NaN;
        this.$$rawModelValue = t;
        this.$validators = {};
        this.$asyncValidators = {};
        this.$parsers = [];
        this.$formatters = [];
        this.$viewChangeListeners = [];
        this.$untouched = !0;
        this.$touched = !1;
        this.$pristine = !0;
        this.$dirty = !1;
        this.$valid = !0;
        this.$invalid = !1;
        this.$error = {};
        this.$$success = {};
        this.$pending = t;
        this.$name = n(d.name || '', !1)(a);
        var p = f(d.ngModel), q = p.assign, u = p, s = q, M = null, v, m = this;
        this.$$setOptions = function (a) {
          if ((m.$options = a) && a.getterSetter) {
            var c = f(d.ngModel + '()'), g = f(d.ngModel + '($$$p)');
            u = function (a) {
              var d = p(a);
              G(d) && (d = c(a));
              return d;
            };
            s = function (a, c) {
              G(p(a)) ? g(a, { $$$p: m.$modelValue }) : q(a, m.$modelValue);
            };
          } else if (!p.assign)
            throw Nb('nonassign', d.ngModel, wa(e));
        };
        this.$render = E;
        this.$isEmpty = function (a) {
          return x(a) || '' === a || null === a || a !== a;
        };
        var F = e.inheritedData('$formController') || Kb, w = 0;
        sd({
          ctrl: this,
          $element: e,
          set: function (a, c) {
            a[c] = !0;
          },
          unset: function (a, c) {
            delete a[c];
          },
          parentForm: F,
          $animate: g
        });
        this.$setPristine = function () {
          m.$dirty = !1;
          m.$pristine = !0;
          g.removeClass(e, Lb);
          g.addClass(e, Ra);
        };
        this.$setDirty = function () {
          m.$dirty = !0;
          m.$pristine = !1;
          g.removeClass(e, Ra);
          g.addClass(e, Lb);
          F.$setDirty();
        };
        this.$setUntouched = function () {
          m.$touched = !1;
          m.$untouched = !0;
          g.setClass(e, 'ng-untouched', 'ng-touched');
        };
        this.$setTouched = function () {
          m.$touched = !0;
          m.$untouched = !1;
          g.setClass(e, 'ng-touched', 'ng-untouched');
        };
        this.$rollbackViewValue = function () {
          h.cancel(M);
          m.$viewValue = m.$$lastCommittedViewValue;
          m.$render();
        };
        this.$validate = function () {
          if (!Y(m.$modelValue) || !isNaN(m.$modelValue)) {
            var a = m.$$rawModelValue, c = m.$valid, d = m.$modelValue, e = m.$options && m.$options.allowInvalid;
            m.$$runValidators(a, m.$$lastCommittedViewValue, function (f) {
              e || c === f || (m.$modelValue = f ? a : t, m.$modelValue !== d && m.$$writeModelToScope());
            });
          }
        };
        this.$$runValidators = function (a, c, d) {
          function e() {
            var d = !0;
            r(m.$validators, function (e, f) {
              var h = e(a, c);
              d = d && h;
              g(f, h);
            });
            return d ? !0 : (r(m.$asyncValidators, function (a, c) {
              g(c, null);
            }), !1);
          }
          function f() {
            var d = [], e = !0;
            r(m.$asyncValidators, function (f, h) {
              var k = f(a, c);
              if (!k || !G(k.then))
                throw Nb('$asyncValidators', k);
              g(h, t);
              d.push(k.then(function () {
                g(h, !0);
              }, function (a) {
                e = !1;
                g(h, !1);
              }));
            });
            d.length ? k.all(d).then(function () {
              h(e);
            }, E) : h(!0);
          }
          function g(a, c) {
            l === w && m.$setValidity(a, c);
          }
          function h(a) {
            l === w && d(a);
          }
          w++;
          var l = w;
          (function () {
            var a = m.$$parserName || 'parse';
            if (v === t)
              g(a, null);
            else
              return v || (r(m.$validators, function (a, c) {
                g(c, null);
              }), r(m.$asyncValidators, function (a, c) {
                g(c, null);
              })), g(a, v), v;
            return !0;
          }() ? e() ? f() : h(!1) : h(!1));
        };
        this.$commitViewValue = function () {
          var a = m.$viewValue;
          h.cancel(M);
          if (m.$$lastCommittedViewValue !== a || '' === a && m.$$hasNativeValidators)
            m.$$lastCommittedViewValue = a, m.$pristine && this.$setDirty(), this.$$parseAndValidate();
        };
        this.$$parseAndValidate = function () {
          var c = m.$$lastCommittedViewValue;
          if (v = x(c) ? t : !0)
            for (var d = 0; d < m.$parsers.length; d++)
              if (c = m.$parsers[d](c), x(c)) {
                v = !1;
                break;
              }
          Y(m.$modelValue) && isNaN(m.$modelValue) && (m.$modelValue = u(a));
          var e = m.$modelValue, f = m.$options && m.$options.allowInvalid;
          m.$$rawModelValue = c;
          f && (m.$modelValue = c, m.$modelValue !== e && m.$$writeModelToScope());
          m.$$runValidators(c, m.$$lastCommittedViewValue, function (a) {
            f || (m.$modelValue = a ? c : t, m.$modelValue !== e && m.$$writeModelToScope());
          });
        };
        this.$$writeModelToScope = function () {
          s(a, m.$modelValue);
          r(m.$viewChangeListeners, function (a) {
            try {
              a();
            } catch (d) {
              c(d);
            }
          });
        };
        this.$setViewValue = function (a, c) {
          m.$viewValue = a;
          m.$options && !m.$options.updateOnDefault || m.$$debounceViewValueCommit(c);
        };
        this.$$debounceViewValueCommit = function (c) {
          var d = 0, e = m.$options;
          e && y(e.debounce) && (e = e.debounce, Y(e) ? d = e : Y(e[c]) ? d = e[c] : Y(e['default']) && (d = e['default']));
          h.cancel(M);
          d ? M = h(function () {
            m.$commitViewValue();
          }, d) : l.$$phase ? m.$commitViewValue() : a.$apply(function () {
            m.$commitViewValue();
          });
        };
        a.$watch(function () {
          var c = u(a);
          if (c !== m.$modelValue) {
            m.$modelValue = m.$$rawModelValue = c;
            v = t;
            for (var d = m.$formatters, e = d.length, f = c; e--;)
              f = d[e](f);
            m.$viewValue !== f && (m.$viewValue = m.$$lastCommittedViewValue = f, m.$render(), m.$$runValidators(c, f, E));
          }
          return c;
        });
      }
    ], ve = [
      '$rootScope',
      function (a) {
        return {
          restrict: 'A',
          require: [
            'ngModel',
            '^?form',
            '^?ngModelOptions'
          ],
          controller: eg,
          priority: 1,
          compile: function (c) {
            c.addClass(Ra).addClass('ng-untouched').addClass(lb);
            return {
              pre: function (a, c, f, g) {
                var h = g[0], l = g[1] || Kb;
                h.$$setOptions(g[2] && g[2].$options);
                l.$addControl(h);
                f.$observe('name', function (a) {
                  h.$name !== a && l.$$renameControl(h, a);
                });
                a.$on('$destroy', function () {
                  l.$removeControl(h);
                });
              },
              post: function (c, e, f, g) {
                var h = g[0];
                if (h.$options && h.$options.updateOn)
                  e.on(h.$options.updateOn, function (a) {
                    h.$$debounceViewValueCommit(a && a.type);
                  });
                e.on('blur', function (e) {
                  h.$touched || (a.$$phase ? c.$evalAsync(h.$setTouched) : c.$apply(h.$setTouched));
                });
              }
            };
          }
        };
      }
    ], fg = /(\s+|^)default(\s+|$)/, ze = function () {
      return {
        restrict: 'A',
        controller: [
          '$scope',
          '$attrs',
          function (a, c) {
            var d = this;
            this.$options = a.$eval(c.ngModelOptions);
            this.$options.updateOn !== t ? (this.$options.updateOnDefault = !1, this.$options.updateOn = N(this.$options.updateOn.replace(fg, function () {
              d.$options.updateOnDefault = !0;
              return ' ';
            }))) : this.$options.updateOnDefault = !0;
          }
        ]
      };
    }, le = Ia({
      terminal: !0,
      priority: 1000
    }), me = [
      '$locale',
      '$interpolate',
      function (a, c) {
        var d = /{}/g, e = /^when(Minus)?(.+)$/;
        return {
          restrict: 'EA',
          link: function (f, g, h) {
            function l(a) {
              g.text(a || '');
            }
            var k = h.count, n = h.$attr.when && g.attr(h.$attr.when), p = h.offset || 0, q = f.$eval(n) || {}, u = {}, n = c.startSymbol(), s = c.endSymbol(), t = n + k + '-' + p + s, v = ca.noop, m;
            r(h, function (a, c) {
              var d = e.exec(c);
              d && (d = (d[1] ? '-' : '') + z(d[2]), q[d] = g.attr(h.$attr[c]));
            });
            r(q, function (a, e) {
              u[e] = c(a.replace(d, t));
            });
            f.$watch(k, function (c) {
              c = parseFloat(c);
              var d = isNaN(c);
              d || c in q || (c = a.pluralCat(c - p));
              c === m || d && isNaN(m) || (v(), v = f.$watch(u[c], l), m = c);
            });
          }
        };
      }
    ], ne = [
      '$parse',
      '$animate',
      function (a, c) {
        var d = R('ngRepeat'), e = function (a, c, d, e, k, n, p) {
            a[d] = e;
            k && (a[k] = n);
            a.$index = c;
            a.$first = 0 === c;
            a.$last = c === p - 1;
            a.$middle = !(a.$first || a.$last);
            a.$odd = !(a.$even = 0 === (c & 1));
          };
        return {
          restrict: 'A',
          multiElement: !0,
          transclude: 'element',
          priority: 1000,
          terminal: !0,
          $$tlb: !0,
          compile: function (f, g) {
            var h = g.ngRepeat, l = W.createComment(' end ngRepeat: ' + h + ' '), k = h.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
            if (!k)
              throw d('iexp', h);
            var n = k[1], p = k[2], q = k[3], u = k[4], k = n.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);
            if (!k)
              throw d('iidexp', n);
            var s = k[3] || k[1], y = k[2];
            if (q && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(q) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(q)))
              throw d('badident', q);
            var v, m, w, x, E = { $id: Ma };
            u ? v = a(u) : (w = function (a, c) {
              return Ma(c);
            }, x = function (a) {
              return a;
            });
            return function (a, f, g, k, n) {
              v && (m = function (c, d, e) {
                y && (E[y] = c);
                E[s] = d;
                E.$index = e;
                return v(a, E);
              });
              var u = ia();
              a.$watchCollection(p, function (g) {
                var k, p, v = f[0], D, E = ia(), G, H, L, S, J, C, z;
                q && (a[q] = g);
                if (Sa(g))
                  J = g, p = m || w;
                else {
                  p = m || x;
                  J = [];
                  for (z in g)
                    g.hasOwnProperty(z) && '$' != z.charAt(0) && J.push(z);
                  J.sort();
                }
                G = J.length;
                z = Array(G);
                for (k = 0; k < G; k++)
                  if (H = g === J ? k : J[k], L = g[H], S = p(H, L, k), u[S])
                    C = u[S], delete u[S], E[S] = C, z[k] = C;
                  else {
                    if (E[S])
                      throw r(z, function (a) {
                        a && a.scope && (u[a.id] = a);
                      }), d('dupes', h, S, L);
                    z[k] = {
                      id: S,
                      scope: t,
                      clone: t
                    };
                    E[S] = !0;
                  }
                for (D in u) {
                  C = u[D];
                  S = tb(C.clone);
                  c.leave(S);
                  if (S[0].parentNode)
                    for (k = 0, p = S.length; k < p; k++)
                      S[k].$$NG_REMOVED = !0;
                  C.scope.$destroy();
                }
                for (k = 0; k < G; k++)
                  if (H = g === J ? k : J[k], L = g[H], C = z[k], C.scope) {
                    D = v;
                    do
                      D = D.nextSibling;
                    while (D && D.$$NG_REMOVED);
                    C.clone[0] != D && c.move(tb(C.clone), null, A(v));
                    v = C.clone[C.clone.length - 1];
                    e(C.scope, k, s, L, y, H, G);
                  } else
                    n(function (a, d) {
                      C.scope = d;
                      var f = l.cloneNode(!1);
                      a[a.length++] = f;
                      c.enter(a, null, A(v));
                      v = f;
                      C.clone = a;
                      E[C.id] = C;
                      e(C.scope, k, s, L, y, H, G);
                    });
                u = E;
              });
            };
          }
        };
      }
    ], oe = [
      '$animate',
      function (a) {
        return {
          restrict: 'A',
          multiElement: !0,
          link: function (c, d, e) {
            c.$watch(e.ngShow, function (c) {
              a[c ? 'removeClass' : 'addClass'](d, 'ng-hide', { tempClasses: 'ng-hide-animate' });
            });
          }
        };
      }
    ], he = [
      '$animate',
      function (a) {
        return {
          restrict: 'A',
          multiElement: !0,
          link: function (c, d, e) {
            c.$watch(e.ngHide, function (c) {
              a[c ? 'addClass' : 'removeClass'](d, 'ng-hide', { tempClasses: 'ng-hide-animate' });
            });
          }
        };
      }
    ], pe = Ia(function (a, c, d) {
      a.$watchCollection(d.ngStyle, function (a, d) {
        d && a !== d && r(d, function (a, d) {
          c.css(d, '');
        });
        a && c.css(a);
      });
    }), qe = [
      '$animate',
      function (a) {
        return {
          restrict: 'EA',
          require: 'ngSwitch',
          controller: [
            '$scope',
            function () {
              this.cases = {};
            }
          ],
          link: function (c, d, e, f) {
            var g = [], h = [], l = [], k = [], n = function (a, c) {
                return function () {
                  a.splice(c, 1);
                };
              };
            c.$watch(e.ngSwitch || e.on, function (c) {
              var d, e;
              d = 0;
              for (e = l.length; d < e; ++d)
                a.cancel(l[d]);
              d = l.length = 0;
              for (e = k.length; d < e; ++d) {
                var s = tb(h[d].clone);
                k[d].$destroy();
                (l[d] = a.leave(s)).then(n(l, d));
              }
              h.length = 0;
              k.length = 0;
              (g = f.cases['!' + c] || f.cases['?']) && r(g, function (c) {
                c.transclude(function (d, e) {
                  k.push(e);
                  var f = c.element;
                  d[d.length++] = W.createComment(' end ngSwitchWhen: ');
                  h.push({ clone: d });
                  a.enter(d, f.parent(), f);
                });
              });
            });
          }
        };
      }
    ], re = Ia({
      transclude: 'element',
      priority: 1200,
      require: '^ngSwitch',
      multiElement: !0,
      link: function (a, c, d, e, f) {
        e.cases['!' + d.ngSwitchWhen] = e.cases['!' + d.ngSwitchWhen] || [];
        e.cases['!' + d.ngSwitchWhen].push({
          transclude: f,
          element: c
        });
      }
    }), se = Ia({
      transclude: 'element',
      priority: 1200,
      require: '^ngSwitch',
      multiElement: !0,
      link: function (a, c, d, e, f) {
        e.cases['?'] = e.cases['?'] || [];
        e.cases['?'].push({
          transclude: f,
          element: c
        });
      }
    }), ue = Ia({
      restrict: 'EAC',
      link: function (a, c, d, e, f) {
        if (!f)
          throw R('ngTransclude')('orphan', wa(c));
        f(function (a) {
          c.empty();
          c.append(a);
        });
      }
    }), Vd = [
      '$templateCache',
      function (a) {
        return {
          restrict: 'E',
          terminal: !0,
          compile: function (c, d) {
            'text/ng-template' == d.type && a.put(d.id, c[0].text);
          }
        };
      }
    ], gg = R('ngOptions'), te = ea({
      restrict: 'A',
      terminal: !0
    }), Wd = [
      '$compile',
      '$parse',
      function (a, c) {
        var d = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/, e = { $setViewValue: E };
        return {
          restrict: 'E',
          require: [
            'select',
            '?ngModel'
          ],
          controller: [
            '$element',
            '$scope',
            '$attrs',
            function (a, c, d) {
              var l = this, k = {}, n = e, p;
              l.databound = d.ngModel;
              l.init = function (a, c, d) {
                n = a;
                p = d;
              };
              l.addOption = function (c, d) {
                La(c, '"option value"');
                k[c] = !0;
                n.$viewValue == c && (a.val(c), p.parent() && p.remove());
                d && d[0].hasAttribute('selected') && (d[0].selected = !0);
              };
              l.removeOption = function (a) {
                this.hasOption(a) && (delete k[a], n.$viewValue === a && this.renderUnknownOption(a));
              };
              l.renderUnknownOption = function (c) {
                c = '? ' + Ma(c) + ' ?';
                p.val(c);
                a.prepend(p);
                a.val(c);
                p.prop('selected', !0);
              };
              l.hasOption = function (a) {
                return k.hasOwnProperty(a);
              };
              c.$on('$destroy', function () {
                l.renderUnknownOption = E;
              });
            }
          ],
          link: function (e, g, h, l) {
            function k(a, c, d, e) {
              d.$render = function () {
                var a = d.$viewValue;
                e.hasOption(a) ? (C.parent() && C.remove(), c.val(a), '' === a && v.prop('selected', !0)) : x(a) && v ? c.val('') : e.renderUnknownOption(a);
              };
              c.on('change', function () {
                a.$apply(function () {
                  C.parent() && C.remove();
                  d.$setViewValue(c.val());
                });
              });
            }
            function n(a, c, d) {
              var e;
              d.$render = function () {
                var a = new eb(d.$viewValue);
                r(c.find('option'), function (c) {
                  c.selected = y(a.get(c.value));
                });
              };
              a.$watch(function () {
                ha(e, d.$viewValue) || (e = sa(d.$viewValue), d.$render());
              });
              c.on('change', function () {
                a.$apply(function () {
                  var a = [];
                  r(c.find('option'), function (c) {
                    c.selected && a.push(c.value);
                  });
                  d.$setViewValue(a);
                });
              });
            }
            function p(e, f, g) {
              function h(a, c, d) {
                T[x] = d;
                G && (T[G] = c);
                return a(e, T);
              }
              function k(a) {
                var c;
                if (u)
                  if (I && H(a)) {
                    c = new eb([]);
                    for (var d = 0; d < a.length; d++)
                      c.put(h(I, null, a[d]), !0);
                  } else
                    c = new eb(a);
                else
                  I && (a = h(I, null, a));
                return function (d, e) {
                  var f;
                  f = I ? I : B ? B : z;
                  return u ? y(c.remove(h(f, d, e))) : a === h(f, d, e);
                };
              }
              function l() {
                m || (e.$$postDigest(p), m = !0);
              }
              function n(a, c, d) {
                a[c] = a[c] || 0;
                a[c] += d ? 1 : -1;
              }
              function p() {
                m = !1;
                var a = { '': [] }, c = [''], d, l, s, t, v;
                s = g.$viewValue;
                t = L(e) || [];
                var B = G ? Object.keys(t).sort() : t, x, A, H, z, O = {};
                v = k(s);
                var N = !1, U, W;
                Q = {};
                for (z = 0; H = B.length, z < H; z++) {
                  x = z;
                  if (G && (x = B[z], '$' === x.charAt(0)))
                    continue;
                  A = t[x];
                  d = h(J, x, A) || '';
                  (l = a[d]) || (l = a[d] = [], c.push(d));
                  d = v(x, A);
                  N = N || d;
                  A = h(C, x, A);
                  A = y(A) ? A : '';
                  W = I ? I(e, T) : G ? B[z] : z;
                  I && (Q[W] = x);
                  l.push({
                    id: W,
                    label: A,
                    selected: d
                  });
                }
                u || (w || null === s ? a[''].unshift({
                  id: '',
                  label: '',
                  selected: !N
                }) : N || a[''].unshift({
                  id: '?',
                  label: '',
                  selected: !0
                }));
                x = 0;
                for (B = c.length; x < B; x++) {
                  d = c[x];
                  l = a[d];
                  R.length <= x ? (s = {
                    element: E.clone().attr('label', d),
                    label: l.label
                  }, t = [s], R.push(t), f.append(s.element)) : (t = R[x], s = t[0], s.label != d && s.element.attr('label', s.label = d));
                  N = null;
                  z = 0;
                  for (H = l.length; z < H; z++)
                    d = l[z], (v = t[z + 1]) ? (N = v.element, v.label !== d.label && (n(O, v.label, !1), n(O, d.label, !0), N.text(v.label = d.label), N.prop('label', v.label)), v.id !== d.id && N.val(v.id = d.id), N[0].selected !== d.selected && (N.prop('selected', v.selected = d.selected), Qa && N.prop('selected', v.selected))) : ('' === d.id && w ? U = w : (U = F.clone()).val(d.id).prop('selected', d.selected).attr('selected', d.selected).prop('label', d.label).text(d.label), t.push(v = {
                      element: U,
                      label: d.label,
                      id: d.id,
                      selected: d.selected
                    }), n(O, d.label, !0), N ? N.after(U) : s.element.append(U), N = U);
                  for (z++; t.length > z;)
                    d = t.pop(), n(O, d.label, !1), d.element.remove();
                }
                for (; R.length > x;) {
                  l = R.pop();
                  for (z = 1; z < l.length; ++z)
                    n(O, l[z].label, !1);
                  l[0].element.remove();
                }
                r(O, function (a, c) {
                  0 < a ? q.addOption(c) : 0 > a && q.removeOption(c);
                });
              }
              var v;
              if (!(v = s.match(d)))
                throw gg('iexp', s, wa(f));
              var C = c(v[2] || v[1]), x = v[4] || v[6], A = / as /.test(v[0]) && v[1], B = A ? c(A) : null, G = v[5], J = c(v[3] || ''), z = c(v[2] ? v[1] : x), L = c(v[7]), I = v[8] ? c(v[8]) : null, Q = {}, R = [[{
                      element: f,
                      label: ''
                    }]], T = {};
              w && (a(w)(e), w.removeClass('ng-scope'), w.remove());
              f.empty();
              f.on('change', function () {
                e.$apply(function () {
                  var a = L(e) || [], c;
                  if (u)
                    c = [], r(f.val(), function (d) {
                      d = I ? Q[d] : d;
                      c.push('?' === d ? t : '' === d ? null : h(B ? B : z, d, a[d]));
                    });
                  else {
                    var d = I ? Q[f.val()] : f.val();
                    c = '?' === d ? t : '' === d ? null : h(B ? B : z, d, a[d]);
                  }
                  g.$setViewValue(c);
                  p();
                });
              });
              g.$render = p;
              e.$watchCollection(L, l);
              e.$watchCollection(function () {
                var a = L(e), c;
                if (a && H(a)) {
                  c = Array(a.length);
                  for (var d = 0, f = a.length; d < f; d++)
                    c[d] = h(C, d, a[d]);
                } else if (a)
                  for (d in c = {}, a)
                    a.hasOwnProperty(d) && (c[d] = h(C, d, a[d]));
                return c;
              }, l);
              u && e.$watchCollection(function () {
                return g.$modelValue;
              }, l);
            }
            if (l[1]) {
              var q = l[0];
              l = l[1];
              var u = h.multiple, s = h.ngOptions, w = !1, v, m = !1, F = A(W.createElement('option')), E = A(W.createElement('optgroup')), C = F.clone();
              h = 0;
              for (var B = g.children(), G = B.length; h < G; h++)
                if ('' === B[h].value) {
                  v = w = B.eq(h);
                  break;
                }
              q.init(l, w, C);
              u && (l.$isEmpty = function (a) {
                return !a || 0 === a.length;
              });
              s ? p(e, g, l) : u ? n(e, g, l) : k(e, g, l, q);
            }
          }
        };
      }
    ], Yd = [
      '$interpolate',
      function (a) {
        var c = {
            addOption: E,
            removeOption: E
          };
        return {
          restrict: 'E',
          priority: 100,
          compile: function (d, e) {
            if (x(e.value)) {
              var f = a(d.text(), !0);
              f || e.$set('value', d.text());
            }
            return function (a, d, e) {
              var k = d.parent(), n = k.data('$selectController') || k.parent().data('$selectController');
              n && n.databound || (n = c);
              f ? a.$watch(f, function (a, c) {
                e.$set('value', a);
                c !== a && n.removeOption(c);
                n.addOption(a, d);
              }) : n.addOption(e.value, d);
              d.on('$destroy', function () {
                n.removeOption(e.value);
              });
            };
          }
        };
      }
    ], Xd = ea({
      restrict: 'E',
      terminal: !1
    }), Bc = function () {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function (a, c, d, e) {
          e && (d.required = !0, e.$validators.required = function (a, c) {
            return !d.required || !e.$isEmpty(c);
          }, d.$observe('required', function () {
            e.$validate();
          }));
        }
      };
    }, Ac = function () {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function (a, c, d, e) {
          if (e) {
            var f, g = d.ngPattern || d.pattern;
            d.$observe('pattern', function (a) {
              C(a) && 0 < a.length && (a = new RegExp('^' + a + '$'));
              if (a && !a.test)
                throw R('ngPattern')('noregexp', g, a, wa(c));
              f = a || t;
              e.$validate();
            });
            e.$validators.pattern = function (a) {
              return e.$isEmpty(a) || x(f) || f.test(a);
            };
          }
        }
      };
    }, Dc = function () {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function (a, c, d, e) {
          if (e) {
            var f = -1;
            d.$observe('maxlength', function (a) {
              a = aa(a);
              f = isNaN(a) ? -1 : a;
              e.$validate();
            });
            e.$validators.maxlength = function (a, c) {
              return 0 > f || e.$isEmpty(c) || c.length <= f;
            };
          }
        }
      };
    }, Cc = function () {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function (a, c, d, e) {
          if (e) {
            var f = 0;
            d.$observe('minlength', function (a) {
              f = aa(a) || 0;
              e.$validate();
            });
            e.$validators.minlength = function (a, c) {
              return e.$isEmpty(c) || c.length >= f;
            };
          }
        }
      };
    };
  Q.angular.bootstrap ? console.log('WARNING: Tried to load angular more than once.') : (Nd(), Pd(ca), A(W).ready(function () {
    Jd(W, uc);
  }));
}(window, document));
!window.angular.$$csp() && window.angular.element(document).find('head').prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}</style>');
//# sourceMappingURL=angular.min.js.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (N, f, W) {
  'use strict';
  f.module('ngAnimate', ['ng']).directive('ngAnimateChildren', function () {
    return function (X, C, g) {
      g = g.ngAnimateChildren;
      f.isString(g) && 0 === g.length ? C.data('$$ngAnimateChildren', !0) : X.$watch(g, function (f) {
        C.data('$$ngAnimateChildren', !!f);
      });
    };
  }).factory('$$animateReflow', [
    '$$rAF',
    '$document',
    function (f, C) {
      return function (g) {
        return f(function () {
          g();
        });
      };
    }
  ]).config([
    '$provide',
    '$animateProvider',
    function (X, C) {
      function g(f) {
        for (var n = 0; n < f.length; n++) {
          var g = f[n];
          if (1 == g.nodeType)
            return g;
        }
      }
      function ba(f, n) {
        return g(f) == g(n);
      }
      var t = f.noop, n = f.forEach, da = C.$$selectors, aa = f.isArray, ea = f.isString, ga = f.isObject, r = { running: !0 }, u;
      X.decorator('$animate', [
        '$delegate',
        '$$q',
        '$injector',
        '$sniffer',
        '$rootElement',
        '$$asyncCallback',
        '$rootScope',
        '$document',
        '$templateRequest',
        '$$jqLite',
        function (O, N, M, Y, y, H, P, W, Z, Q) {
          function R(a, c) {
            var b = a.data('$$ngAnimateState') || {};
            c && (b.running = !0, b.structural = !0, a.data('$$ngAnimateState', b));
            return b.disabled || b.running && b.structural;
          }
          function D(a) {
            var c, b = N.defer();
            b.promise.$$cancelFn = function () {
              c && c();
            };
            P.$$postDigest(function () {
              c = a(function () {
                b.resolve();
              });
            });
            return b.promise;
          }
          function I(a) {
            if (ga(a))
              return a.tempClasses && ea(a.tempClasses) && (a.tempClasses = a.tempClasses.split(/\s+/)), a;
          }
          function S(a, c, b) {
            b = b || {};
            var d = {};
            n(b, function (e, a) {
              n(a.split(' '), function (a) {
                d[a] = e;
              });
            });
            var h = Object.create(null);
            n((a.attr('class') || '').split(/\s+/), function (e) {
              h[e] = !0;
            });
            var f = [], l = [];
            n(c && c.classes || [], function (e, a) {
              var b = h[a], c = d[a] || {};
              !1 === e ? (b || 'addClass' == c.event) && l.push(a) : !0 === e && (b && 'removeClass' != c.event || f.push(a));
            });
            return 0 < f.length + l.length && [
              f.join(' '),
              l.join(' ')
            ];
          }
          function T(a) {
            if (a) {
              var c = [], b = {};
              a = a.substr(1).split('.');
              (Y.transitions || Y.animations) && c.push(M.get(da['']));
              for (var d = 0; d < a.length; d++) {
                var f = a[d], k = da[f];
                k && !b[f] && (c.push(M.get(k)), b[f] = !0);
              }
              return c;
            }
          }
          function U(a, c, b, d) {
            function h(e, a) {
              var b = e[a], c = e['before' + a.charAt(0).toUpperCase() + a.substr(1)];
              if (b || c)
                return 'leave' == a && (c = b, b = null), u.push({
                  event: a,
                  fn: b
                }), J.push({
                  event: a,
                  fn: c
                }), !0;
            }
            function k(c, l, w) {
              var E = [];
              n(c, function (a) {
                a.fn && E.push(a);
              });
              var m = 0;
              n(E, function (c, f) {
                var p = function () {
                  a: {
                    if (l) {
                      (l[f] || t)();
                      if (++m < E.length)
                        break a;
                      l = null;
                    }
                    w();
                  }
                };
                switch (c.event) {
                case 'setClass':
                  l.push(c.fn(a, e, A, p, d));
                  break;
                case 'animate':
                  l.push(c.fn(a, b, d.from, d.to, p));
                  break;
                case 'addClass':
                  l.push(c.fn(a, e || b, p, d));
                  break;
                case 'removeClass':
                  l.push(c.fn(a, A || b, p, d));
                  break;
                default:
                  l.push(c.fn(a, p, d));
                }
              });
              l && 0 === l.length && w();
            }
            var l = a[0];
            if (l) {
              d && (d.to = d.to || {}, d.from = d.from || {});
              var e, A;
              aa(b) && (e = b[0], A = b[1], e ? A ? b = e + ' ' + A : (b = e, c = 'addClass') : (b = A, c = 'removeClass'));
              var w = 'setClass' == c, E = w || 'addClass' == c || 'removeClass' == c || 'animate' == c, p = a.attr('class') + ' ' + b;
              if (x(p)) {
                var ca = t, m = [], J = [], g = t, s = [], u = [], p = (' ' + p).replace(/\s+/g, '.');
                n(T(p), function (a) {
                  !h(a, c) && w && (h(a, 'addClass'), h(a, 'removeClass'));
                });
                return {
                  node: l,
                  event: c,
                  className: b,
                  isClassBased: E,
                  isSetClassOperation: w,
                  applyStyles: function () {
                    d && a.css(f.extend(d.from || {}, d.to || {}));
                  },
                  before: function (a) {
                    ca = a;
                    k(J, m, function () {
                      ca = t;
                      a();
                    });
                  },
                  after: function (a) {
                    g = a;
                    k(u, s, function () {
                      g = t;
                      a();
                    });
                  },
                  cancel: function () {
                    m && (n(m, function (a) {
                      (a || t)(!0);
                    }), ca(!0));
                    s && (n(s, function (a) {
                      (a || t)(!0);
                    }), g(!0));
                  }
                };
              }
            }
          }
          function G(a, c, b, d, h, k, l, e) {
            function A(e) {
              var l = '$animate:' + e;
              J && J[l] && 0 < J[l].length && H(function () {
                b.triggerHandler(l, {
                  event: a,
                  className: c
                });
              });
            }
            function w() {
              A('before');
            }
            function E() {
              A('after');
            }
            function p() {
              p.hasBeenRun || (p.hasBeenRun = !0, k());
            }
            function g() {
              if (!g.hasBeenRun) {
                m && m.applyStyles();
                g.hasBeenRun = !0;
                l && l.tempClasses && n(l.tempClasses, function (a) {
                  u.removeClass(b, a);
                });
                var w = b.data('$$ngAnimateState');
                w && (m && m.isClassBased ? B(b, c) : (H(function () {
                  var e = b.data('$$ngAnimateState') || {};
                  fa == e.index && B(b, c, a);
                }), b.data('$$ngAnimateState', w)));
                A('close');
                e();
              }
            }
            var m = U(b, a, c, l);
            if (!m)
              return p(), w(), E(), g(), t;
            a = m.event;
            c = m.className;
            var J = f.element._data(m.node), J = J && J.events;
            d || (d = h ? h.parent() : b.parent());
            if (z(b, d))
              return p(), w(), E(), g(), t;
            d = b.data('$$ngAnimateState') || {};
            var L = d.active || {}, s = d.totalActive || 0, q = d.last;
            h = !1;
            if (0 < s) {
              s = [];
              if (m.isClassBased)
                'setClass' == q.event ? (s.push(q), B(b, c)) : L[c] && (v = L[c], v.event == a ? h = !0 : (s.push(v), B(b, c)));
              else if ('leave' == a && L['ng-leave'])
                h = !0;
              else {
                for (var v in L)
                  s.push(L[v]);
                d = {};
                B(b, !0);
              }
              0 < s.length && n(s, function (a) {
                a.cancel();
              });
            }
            !m.isClassBased || m.isSetClassOperation || 'animate' == a || h || (h = 'addClass' == a == b.hasClass(c));
            if (h)
              return p(), w(), E(), A('close'), e(), t;
            L = d.active || {};
            s = d.totalActive || 0;
            if ('leave' == a)
              b.one('$destroy', function (a) {
                a = f.element(this);
                var e = a.data('$$ngAnimateState');
                e && (e = e.active['ng-leave']) && (e.cancel(), B(a, 'ng-leave'));
              });
            u.addClass(b, 'ng-animate');
            l && l.tempClasses && n(l.tempClasses, function (a) {
              u.addClass(b, a);
            });
            var fa = K++;
            s++;
            L[c] = m;
            b.data('$$ngAnimateState', {
              last: m,
              active: L,
              index: fa,
              totalActive: s
            });
            w();
            m.before(function (e) {
              var l = b.data('$$ngAnimateState');
              e = e || !l || !l.active[c] || m.isClassBased && l.active[c].event != a;
              p();
              !0 === e ? g() : (E(), m.after(g));
            });
            return m.cancel;
          }
          function q(a) {
            if (a = g(a))
              a = f.isFunction(a.getElementsByClassName) ? a.getElementsByClassName('ng-animate') : a.querySelectorAll('.ng-animate'), n(a, function (a) {
                a = f.element(a);
                (a = a.data('$$ngAnimateState')) && a.active && n(a.active, function (a) {
                  a.cancel();
                });
              });
          }
          function B(a, c) {
            if (ba(a, y))
              r.disabled || (r.running = !1, r.structural = !1);
            else if (c) {
              var b = a.data('$$ngAnimateState') || {}, d = !0 === c;
              !d && b.active && b.active[c] && (b.totalActive--, delete b.active[c]);
              if (d || !b.totalActive)
                u.removeClass(a, 'ng-animate'), a.removeData('$$ngAnimateState');
            }
          }
          function z(a, c) {
            if (r.disabled)
              return !0;
            if (ba(a, y))
              return r.running;
            var b, d, g;
            do {
              if (0 === c.length)
                break;
              var k = ba(c, y), l = k ? r : c.data('$$ngAnimateState') || {};
              if (l.disabled)
                return !0;
              k && (g = !0);
              !1 !== b && (k = c.data('$$ngAnimateChildren'), f.isDefined(k) && (b = k));
              d = d || l.running || l.last && !l.last.isClassBased;
            } while (c = c.parent());
            return !g || !b && d;
          }
          u = Q;
          y.data('$$ngAnimateState', r);
          var $ = P.$watch(function () {
              return Z.totalPendingRequests;
            }, function (a, c) {
              0 === a && ($(), P.$$postDigest(function () {
                P.$$postDigest(function () {
                  r.running = !1;
                });
              }));
            }), K = 0, V = C.classNameFilter(), x = V ? function (a) {
              return V.test(a);
            } : function () {
              return !0;
            };
          return {
            animate: function (a, c, b, d, h) {
              d = d || 'ng-inline-animate';
              h = I(h) || {};
              h.from = b ? c : null;
              h.to = b ? b : c;
              return D(function (b) {
                return G('animate', d, f.element(g(a)), null, null, t, h, b);
              });
            },
            enter: function (a, c, b, d) {
              d = I(d);
              a = f.element(a);
              c = c && f.element(c);
              b = b && f.element(b);
              R(a, !0);
              O.enter(a, c, b);
              return D(function (h) {
                return G('enter', 'ng-enter', f.element(g(a)), c, b, t, d, h);
              });
            },
            leave: function (a, c) {
              c = I(c);
              a = f.element(a);
              q(a);
              R(a, !0);
              return D(function (b) {
                return G('leave', 'ng-leave', f.element(g(a)), null, null, function () {
                  O.leave(a);
                }, c, b);
              });
            },
            move: function (a, c, b, d) {
              d = I(d);
              a = f.element(a);
              c = c && f.element(c);
              b = b && f.element(b);
              q(a);
              R(a, !0);
              O.move(a, c, b);
              return D(function (h) {
                return G('move', 'ng-move', f.element(g(a)), c, b, t, d, h);
              });
            },
            addClass: function (a, c, b) {
              return this.setClass(a, c, [], b);
            },
            removeClass: function (a, c, b) {
              return this.setClass(a, [], c, b);
            },
            setClass: function (a, c, b, d) {
              d = I(d);
              a = f.element(a);
              a = f.element(g(a));
              if (R(a))
                return O.$$setClassImmediately(a, c, b, d);
              var h, k = a.data('$$animateClasses'), l = !!k;
              k || (k = { classes: {} });
              h = k.classes;
              c = aa(c) ? c : c.split(' ');
              n(c, function (a) {
                a && a.length && (h[a] = !0);
              });
              b = aa(b) ? b : b.split(' ');
              n(b, function (a) {
                a && a.length && (h[a] = !1);
              });
              if (l)
                return d && k.options && (k.options = f.extend(k.options || {}, d)), k.promise;
              a.data('$$animateClasses', k = {
                classes: h,
                options: d
              });
              return k.promise = D(function (e) {
                var l = a.parent(), b = g(a), c = b.parentNode;
                if (!c || c.$$NG_REMOVED || b.$$NG_REMOVED)
                  e();
                else {
                  b = a.data('$$animateClasses');
                  a.removeData('$$animateClasses');
                  var c = a.data('$$ngAnimateState') || {}, d = S(a, b, c.active);
                  return d ? G('setClass', d, a, l, null, function () {
                    d[0] && O.$$addClassImmediately(a, d[0]);
                    d[1] && O.$$removeClassImmediately(a, d[1]);
                  }, b.options, e) : e();
                }
              });
            },
            cancel: function (a) {
              a.$$cancelFn();
            },
            enabled: function (a, c) {
              switch (arguments.length) {
              case 2:
                if (a)
                  B(c);
                else {
                  var b = c.data('$$ngAnimateState') || {};
                  b.disabled = !0;
                  c.data('$$ngAnimateState', b);
                }
                break;
              case 1:
                r.disabled = !a;
                break;
              default:
                a = !r.disabled;
              }
              return !!a;
            }
          };
        }
      ]);
      C.register('', [
        '$window',
        '$sniffer',
        '$timeout',
        '$$animateReflow',
        function (r, C, M, Y) {
          function y() {
            b || (b = Y(function () {
              c = [];
              b = null;
              x = {};
            }));
          }
          function H(a, e) {
            b && b();
            c.push(e);
            b = Y(function () {
              n(c, function (a) {
                a();
              });
              c = [];
              b = null;
              x = {};
            });
          }
          function P(a, e) {
            var b = g(a);
            a = f.element(b);
            k.push(a);
            b = Date.now() + e;
            b <= h || (M.cancel(d), h = b, d = M(function () {
              X(k);
              k = [];
            }, e, !1));
          }
          function X(a) {
            n(a, function (a) {
              (a = a.data('$$ngAnimateCSS3Data')) && n(a.closeAnimationFns, function (a) {
                a();
              });
            });
          }
          function Z(a, e) {
            var b = e ? x[e] : null;
            if (!b) {
              var c = 0, d = 0, f = 0, g = 0;
              n(a, function (a) {
                if (1 == a.nodeType) {
                  a = r.getComputedStyle(a) || {};
                  c = Math.max(Q(a[z + 'Duration']), c);
                  d = Math.max(Q(a[z + 'Delay']), d);
                  g = Math.max(Q(a[K + 'Delay']), g);
                  var e = Q(a[K + 'Duration']);
                  0 < e && (e *= parseInt(a[K + 'IterationCount'], 10) || 1);
                  f = Math.max(e, f);
                }
              });
              b = {
                total: 0,
                transitionDelay: d,
                transitionDuration: c,
                animationDelay: g,
                animationDuration: f
              };
              e && (x[e] = b);
            }
            return b;
          }
          function Q(a) {
            var e = 0;
            a = ea(a) ? a.split(/\s*,\s*/) : [];
            n(a, function (a) {
              e = Math.max(parseFloat(a) || 0, e);
            });
            return e;
          }
          function R(b, e, c, d) {
            b = 0 <= [
              'ng-enter',
              'ng-leave',
              'ng-move'
            ].indexOf(c);
            var f, p = e.parent(), h = p.data('$$ngAnimateKey');
            h || (p.data('$$ngAnimateKey', ++a), h = a);
            f = h + '-' + g(e).getAttribute('class');
            var p = f + ' ' + c, h = x[p] ? ++x[p].total : 0, m = {};
            if (0 < h) {
              var n = c + '-stagger', m = f + ' ' + n;
              (f = !x[m]) && u.addClass(e, n);
              m = Z(e, m);
              f && u.removeClass(e, n);
            }
            u.addClass(e, c);
            var n = e.data('$$ngAnimateCSS3Data') || {}, k = Z(e, p);
            f = k.transitionDuration;
            k = k.animationDuration;
            if (b && 0 === f && 0 === k)
              return u.removeClass(e, c), !1;
            c = d || b && 0 < f;
            b = 0 < k && 0 < m.animationDelay && 0 === m.animationDuration;
            e.data('$$ngAnimateCSS3Data', {
              stagger: m,
              cacheKey: p,
              running: n.running || 0,
              itemIndex: h,
              blockTransition: c,
              closeAnimationFns: n.closeAnimationFns || []
            });
            p = g(e);
            c && (I(p, !0), d && e.css(d));
            b && (p.style[K + 'PlayState'] = 'paused');
            return !0;
          }
          function D(a, e, b, c, d) {
            function f() {
              e.off(D, h);
              u.removeClass(e, k);
              u.removeClass(e, t);
              z && M.cancel(z);
              G(e, b);
              var a = g(e), c;
              for (c in s)
                a.style.removeProperty(s[c]);
            }
            function h(a) {
              a.stopPropagation();
              var b = a.originalEvent || a;
              a = b.$manualTimeStamp || b.timeStamp || Date.now();
              b = parseFloat(b.elapsedTime.toFixed(3));
              Math.max(a - H, 0) >= C && b >= x && c();
            }
            var m = g(e);
            a = e.data('$$ngAnimateCSS3Data');
            if (-1 != m.getAttribute('class').indexOf(b) && a) {
              var k = '', t = '';
              n(b.split(' '), function (a, b) {
                var e = (0 < b ? ' ' : '') + a;
                k += e + '-active';
                t += e + '-pending';
              });
              var s = [], q = a.itemIndex, v = a.stagger, r = 0;
              if (0 < q) {
                r = 0;
                0 < v.transitionDelay && 0 === v.transitionDuration && (r = v.transitionDelay * q);
                var y = 0;
                0 < v.animationDelay && 0 === v.animationDuration && (y = v.animationDelay * q, s.push(B + 'animation-play-state'));
                r = Math.round(100 * Math.max(r, y)) / 100;
              }
              r || (u.addClass(e, k), a.blockTransition && I(m, !1));
              var F = Z(e, a.cacheKey + ' ' + k), x = Math.max(F.transitionDuration, F.animationDuration);
              if (0 === x)
                u.removeClass(e, k), G(e, b), c();
              else {
                !r && d && 0 < Object.keys(d).length && (F.transitionDuration || (e.css('transition', F.animationDuration + 's linear all'), s.push('transition')), e.css(d));
                var q = Math.max(F.transitionDelay, F.animationDelay), C = 1000 * q;
                0 < s.length && (v = m.getAttribute('style') || '', ';' !== v.charAt(v.length - 1) && (v += ';'), m.setAttribute('style', v + ' '));
                var H = Date.now(), D = V + ' ' + $, q = 1000 * (r + 1.5 * (q + x)), z;
                0 < r && (u.addClass(e, t), z = M(function () {
                  z = null;
                  0 < F.transitionDuration && I(m, !1);
                  0 < F.animationDuration && (m.style[K + 'PlayState'] = '');
                  u.addClass(e, k);
                  u.removeClass(e, t);
                  d && (0 === F.transitionDuration && e.css('transition', F.animationDuration + 's linear all'), e.css(d), s.push('transition'));
                }, 1000 * r, !1));
                e.on(D, h);
                a.closeAnimationFns.push(function () {
                  f();
                  c();
                });
                a.running++;
                P(e, q);
                return f;
              }
            } else
              c();
          }
          function I(a, b) {
            a.style[z + 'Property'] = b ? 'none' : '';
          }
          function S(a, b, c, d) {
            if (R(a, b, c, d))
              return function (a) {
                a && G(b, c);
              };
          }
          function T(a, b, c, d, f) {
            if (b.data('$$ngAnimateCSS3Data'))
              return D(a, b, c, d, f);
            G(b, c);
            d();
          }
          function U(a, b, c, d, f) {
            var g = S(a, b, c, f.from);
            if (g) {
              var h = g;
              H(b, function () {
                h = T(a, b, c, d, f.to);
              });
              return function (a) {
                (h || t)(a);
              };
            }
            y();
            d();
          }
          function G(a, b) {
            u.removeClass(a, b);
            var c = a.data('$$ngAnimateCSS3Data');
            c && (c.running && c.running--, c.running && 0 !== c.running || a.removeData('$$ngAnimateCSS3Data'));
          }
          function q(a, b) {
            var c = '';
            a = aa(a) ? a : a.split(/\s+/);
            n(a, function (a, d) {
              a && 0 < a.length && (c += (0 < d ? ' ' : '') + a + b);
            });
            return c;
          }
          var B = '', z, $, K, V;
          N.ontransitionend === W && N.onwebkittransitionend !== W ? (B = '-webkit-', z = 'WebkitTransition', $ = 'webkitTransitionEnd transitionend') : (z = 'transition', $ = 'transitionend');
          N.onanimationend === W && N.onwebkitanimationend !== W ? (B = '-webkit-', K = 'WebkitAnimation', V = 'webkitAnimationEnd animationend') : (K = 'animation', V = 'animationend');
          var x = {}, a = 0, c = [], b, d = null, h = 0, k = [];
          return {
            animate: function (a, b, c, d, f, g) {
              g = g || {};
              g.from = c;
              g.to = d;
              return U('animate', a, b, f, g);
            },
            enter: function (a, b, c) {
              c = c || {};
              return U('enter', a, 'ng-enter', b, c);
            },
            leave: function (a, b, c) {
              c = c || {};
              return U('leave', a, 'ng-leave', b, c);
            },
            move: function (a, b, c) {
              c = c || {};
              return U('move', a, 'ng-move', b, c);
            },
            beforeSetClass: function (a, b, c, d, f) {
              f = f || {};
              b = q(c, '-remove') + ' ' + q(b, '-add');
              if (f = S('setClass', a, b, f.from))
                return H(a, d), f;
              y();
              d();
            },
            beforeAddClass: function (a, b, c, d) {
              d = d || {};
              if (b = S('addClass', a, q(b, '-add'), d.from))
                return H(a, c), b;
              y();
              c();
            },
            beforeRemoveClass: function (a, b, c, d) {
              d = d || {};
              if (b = S('removeClass', a, q(b, '-remove'), d.from))
                return H(a, c), b;
              y();
              c();
            },
            setClass: function (a, b, c, d, f) {
              f = f || {};
              c = q(c, '-remove');
              b = q(b, '-add');
              return T('setClass', a, c + ' ' + b, d, f.to);
            },
            addClass: function (a, b, c, d) {
              d = d || {};
              return T('addClass', a, q(b, '-add'), c, d.to);
            },
            removeClass: function (a, b, c, d) {
              d = d || {};
              return T('removeClass', a, q(b, '-remove'), c, d.to);
            }
          };
        }
      ]);
    }
  ]);
}(window, window.angular));
//# sourceMappingURL=angular-animate.min.js.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (p, f, n) {
  'use strict';
  f.module('ngCookies', ['ng']).factory('$cookies', [
    '$rootScope',
    '$browser',
    function (e, b) {
      var c = {}, g = {}, h, k = !1, l = f.copy, m = f.isUndefined;
      b.addPollFn(function () {
        var a = b.cookies();
        h != a && (h = a, l(a, g), l(a, c), k && e.$apply());
      })();
      k = !0;
      e.$watch(function () {
        var a, d, e;
        for (a in g)
          m(c[a]) && b.cookies(a, n);
        for (a in c)
          d = c[a], f.isString(d) || (d = '' + d, c[a] = d), d !== g[a] && (b.cookies(a, d), e = !0);
        if (e)
          for (a in d = b.cookies(), c)
            c[a] !== d[a] && (m(d[a]) ? delete c[a] : c[a] = d[a]);
      });
      return c;
    }
  ]).factory('$cookieStore', [
    '$cookies',
    function (e) {
      return {
        get: function (b) {
          return (b = e[b]) ? f.fromJson(b) : b;
        },
        put: function (b, c) {
          e[b] = f.toJson(c);
        },
        remove: function (b) {
          delete e[b];
        }
      };
    }
  ]);
}(window, window.angular));
//# sourceMappingURL=angular-cookies.min.js.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (I, d, B) {
  'use strict';
  function D(f, q) {
    q = q || {};
    d.forEach(q, function (d, h) {
      delete q[h];
    });
    for (var h in f)
      !f.hasOwnProperty(h) || '$' === h.charAt(0) && '$' === h.charAt(1) || (q[h] = f[h]);
    return q;
  }
  var w = d.$$minErr('$resource'), C = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
  d.module('ngResource', ['ng']).provider('$resource', function () {
    var f = this;
    this.defaults = {
      stripTrailingSlashes: !0,
      actions: {
        get: { method: 'GET' },
        save: { method: 'POST' },
        query: {
          method: 'GET',
          isArray: !0
        },
        remove: { method: 'DELETE' },
        'delete': { method: 'DELETE' }
      }
    };
    this.$get = [
      '$http',
      '$q',
      function (q, h) {
        function t(d, g) {
          this.template = d;
          this.defaults = s({}, f.defaults, g);
          this.urlParams = {};
        }
        function v(x, g, l, m) {
          function c(b, k) {
            var c = {};
            k = s({}, g, k);
            r(k, function (a, k) {
              u(a) && (a = a());
              var d;
              if (a && a.charAt && '@' == a.charAt(0)) {
                d = b;
                var e = a.substr(1);
                if (null == e || '' === e || 'hasOwnProperty' === e || !C.test('.' + e))
                  throw w('badmember', e);
                for (var e = e.split('.'), n = 0, g = e.length; n < g && d !== B; n++) {
                  var h = e[n];
                  d = null !== d ? d[h] : B;
                }
              } else
                d = a;
              c[k] = d;
            });
            return c;
          }
          function F(b) {
            return b.resource;
          }
          function e(b) {
            D(b || {}, this);
          }
          var G = new t(x, m);
          l = s({}, f.defaults.actions, l);
          e.prototype.toJSON = function () {
            var b = s({}, this);
            delete b.$promise;
            delete b.$resolved;
            return b;
          };
          r(l, function (b, k) {
            var g = /^(POST|PUT|PATCH)$/i.test(b.method);
            e[k] = function (a, y, m, x) {
              var n = {}, f, l, z;
              switch (arguments.length) {
              case 4:
                z = x, l = m;
              case 3:
              case 2:
                if (u(y)) {
                  if (u(a)) {
                    l = a;
                    z = y;
                    break;
                  }
                  l = y;
                  z = m;
                } else {
                  n = a;
                  f = y;
                  l = m;
                  break;
                }
              case 1:
                u(a) ? l = a : g ? f = a : n = a;
                break;
              case 0:
                break;
              default:
                throw w('badargs', arguments.length);
              }
              var t = this instanceof e, p = t ? f : b.isArray ? [] : new e(f), A = {}, v = b.interceptor && b.interceptor.response || F, C = b.interceptor && b.interceptor.responseError || B;
              r(b, function (b, a) {
                'params' != a && 'isArray' != a && 'interceptor' != a && (A[a] = H(b));
              });
              g && (A.data = f);
              G.setUrlParams(A, s({}, c(f, b.params || {}), n), b.url);
              n = q(A).then(function (a) {
                var c = a.data, g = p.$promise;
                if (c) {
                  if (d.isArray(c) !== !!b.isArray)
                    throw w('badcfg', k, b.isArray ? 'array' : 'object', d.isArray(c) ? 'array' : 'object');
                  b.isArray ? (p.length = 0, r(c, function (a) {
                    'object' === typeof a ? p.push(new e(a)) : p.push(a);
                  })) : (D(c, p), p.$promise = g);
                }
                p.$resolved = !0;
                a.resource = p;
                return a;
              }, function (a) {
                p.$resolved = !0;
                (z || E)(a);
                return h.reject(a);
              });
              n = n.then(function (a) {
                var b = v(a);
                (l || E)(b, a.headers);
                return b;
              }, C);
              return t ? n : (p.$promise = n, p.$resolved = !1, p);
            };
            e.prototype['$' + k] = function (a, b, c) {
              u(a) && (c = b, b = a, a = {});
              a = e[k].call(this, a, this, b, c);
              return a.$promise || a;
            };
          });
          e.bind = function (b) {
            return v(x, s({}, g, b), l);
          };
          return e;
        }
        var E = d.noop, r = d.forEach, s = d.extend, H = d.copy, u = d.isFunction;
        t.prototype = {
          setUrlParams: function (f, g, l) {
            var m = this, c = l || m.template, h, e, q = m.urlParams = {};
            r(c.split(/\W/), function (b) {
              if ('hasOwnProperty' === b)
                throw w('badname');
              !/^\d+$/.test(b) && b && new RegExp('(^|[^\\\\]):' + b + '(\\W|$)').test(c) && (q[b] = !0);
            });
            c = c.replace(/\\:/g, ':');
            g = g || {};
            r(m.urlParams, function (b, k) {
              h = g.hasOwnProperty(k) ? g[k] : m.defaults[k];
              d.isDefined(h) && null !== h ? (e = encodeURIComponent(h).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '%20').replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+'), c = c.replace(new RegExp(':' + k + '(\\W|$)', 'g'), function (b, a) {
                return e + a;
              })) : c = c.replace(new RegExp('(/?):' + k + '(\\W|$)', 'g'), function (b, a, c) {
                return '/' == c.charAt(0) ? c : a + c;
              });
            });
            m.defaults.stripTrailingSlashes && (c = c.replace(/\/+$/, '') || '/');
            c = c.replace(/\/\.(?=\w+($|\?))/, '.');
            f.url = c.replace(/\/\\\./, '/.');
            r(g, function (b, c) {
              m.urlParams[c] || (f.params = f.params || {}, f.params[c] = b);
            });
          }
        };
        return v;
      }
    ];
  });
}(window, window.angular));
//# sourceMappingURL=angular-resource.min.js.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (n, h, p) {
  'use strict';
  function E(a) {
    var e = [];
    r(e, h.noop).chars(a);
    return e.join('');
  }
  function g(a) {
    var e = {};
    a = a.split(',');
    var d;
    for (d = 0; d < a.length; d++)
      e[a[d]] = !0;
    return e;
  }
  function F(a, e) {
    function d(a, b, d, l) {
      b = h.lowercase(b);
      if (s[b])
        for (; f.last() && t[f.last()];)
          c('', f.last());
      u[b] && f.last() == b && c('', b);
      (l = v[b] || !!l) || f.push(b);
      var m = {};
      d.replace(G, function (a, b, e, c, d) {
        m[b] = q(e || c || d || '');
      });
      e.start && e.start(b, m, l);
    }
    function c(a, b) {
      var c = 0, d;
      if (b = h.lowercase(b))
        for (c = f.length - 1; 0 <= c && f[c] != b; c--);
      if (0 <= c) {
        for (d = f.length - 1; d >= c; d--)
          e.end && e.end(f[d]);
        f.length = c;
      }
    }
    'string' !== typeof a && (a = null === a || 'undefined' === typeof a ? '' : '' + a);
    var b, k, f = [], m = a, l;
    for (f.last = function () {
        return f[f.length - 1];
      }; a;) {
      l = '';
      k = !0;
      if (f.last() && w[f.last()])
        a = a.replace(new RegExp('([\\W\\w]*)<\\s*\\/\\s*' + f.last() + '[^>]*>', 'i'), function (a, b) {
          b = b.replace(H, '$1').replace(I, '$1');
          e.chars && e.chars(q(b));
          return '';
        }), c('', f.last());
      else {
        if (0 === a.indexOf('<!--'))
          b = a.indexOf('--', 4), 0 <= b && a.lastIndexOf('-->', b) === b && (e.comment && e.comment(a.substring(4, b)), a = a.substring(b + 3), k = !1);
        else if (x.test(a)) {
          if (b = a.match(x))
            a = a.replace(b[0], ''), k = !1;
        } else if (J.test(a)) {
          if (b = a.match(y))
            a = a.substring(b[0].length), b[0].replace(y, c), k = !1;
        } else
          K.test(a) && ((b = a.match(z)) ? (b[4] && (a = a.substring(b[0].length), b[0].replace(z, d)), k = !1) : (l += '<', a = a.substring(1)));
        k && (b = a.indexOf('<'), l += 0 > b ? a : a.substring(0, b), a = 0 > b ? '' : a.substring(b), e.chars && e.chars(q(l)));
      }
      if (a == m)
        throw L('badparse', a);
      m = a;
    }
    c();
  }
  function q(a) {
    if (!a)
      return '';
    A.innerHTML = a.replace(/</g, '&lt;');
    return A.textContent;
  }
  function B(a) {
    return a.replace(/&/g, '&amp;').replace(M, function (a) {
      var d = a.charCodeAt(0);
      a = a.charCodeAt(1);
      return '&#' + (1024 * (d - 55296) + (a - 56320) + 65536) + ';';
    }).replace(N, function (a) {
      return '&#' + a.charCodeAt(0) + ';';
    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function r(a, e) {
    var d = !1, c = h.bind(a, a.push);
    return {
      start: function (a, k, f) {
        a = h.lowercase(a);
        !d && w[a] && (d = a);
        d || !0 !== C[a] || (c('<'), c(a), h.forEach(k, function (d, f) {
          var k = h.lowercase(f), g = 'img' === a && 'src' === k || 'background' === k;
          !0 !== O[k] || !0 === D[k] && !e(d, g) || (c(' '), c(f), c('="'), c(B(d)), c('"'));
        }), c(f ? '/>' : '>'));
      },
      end: function (a) {
        a = h.lowercase(a);
        d || !0 !== C[a] || (c('</'), c(a), c('>'));
        a == d && (d = !1);
      },
      chars: function (a) {
        d || c(B(a));
      }
    };
  }
  var L = h.$$minErr('$sanitize'), z = /^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/, y = /^<\/\s*([\w:-]+)[^>]*>/, G = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, K = /^</, J = /^<\//, H = /\x3c!--(.*?)--\x3e/g, x = /<!DOCTYPE([^>]*?)>/i, I = /<!\[CDATA\[(.*?)]]\x3e/g, M = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, N = /([^\#-~| |!])/g, v = g('area,br,col,hr,img,wbr');
  n = g('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
  p = g('rp,rt');
  var u = h.extend({}, p, n), s = h.extend({}, n, g('address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul')), t = h.extend({}, p, g('a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var'));
  n = g('animate,animateColor,animateMotion,animateTransform,circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,set,stop,svg,switch,text,title,tspan,use');
  var w = g('script,style'), C = h.extend({}, v, s, t, u, n), D = g('background,cite,href,longdesc,src,usemap,xlink:href');
  n = g('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,target,title,type,valign,value,vspace,width');
  p = g('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,attributeName,attributeType,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan');
  var O = h.extend({}, D, p, n), A = document.createElement('pre');
  h.module('ngSanitize', []).provider('$sanitize', function () {
    this.$get = [
      '$$sanitizeUri',
      function (a) {
        return function (e) {
          var d = [];
          F(e, r(d, function (c, b) {
            return !/^unsafe/.test(a(c, b));
          }));
          return d.join('');
        };
      }
    ];
  });
  h.module('ngSanitize').filter('linky', [
    '$sanitize',
    function (a) {
      var e = /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/, d = /^mailto:/;
      return function (c, b) {
        function k(a) {
          a && g.push(E(a));
        }
        function f(a, c) {
          g.push('<a ');
          h.isDefined(b) && g.push('target="', b, '" ');
          g.push('href="', a.replace(/"/g, '&quot;'), '">');
          k(c);
          g.push('</a>');
        }
        if (!c)
          return c;
        for (var m, l = c, g = [], n, p; m = l.match(e);)
          n = m[0], m[2] || m[4] || (n = (m[3] ? 'http://' : 'mailto:') + n), p = m.index, k(l.substr(0, p)), f(n, m[0].replace(d, '')), l = l.substring(p + m[0].length);
        k(l);
        return a(g.join(''));
      };
    }
  ]);
}(window, window.angular));
//# sourceMappingURL=angular-sanitize.min.js.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (y, u, z) {
  'use strict';
  function s(h, k, p) {
    n.directive(h, [
      '$parse',
      '$swipe',
      function (d, e) {
        return function (l, m, f) {
          function g(a) {
            if (!c)
              return !1;
            var b = Math.abs(a.y - c.y);
            a = (a.x - c.x) * k;
            return q && 75 > b && 0 < a && 30 < a && 0.3 > b / a;
          }
          var b = d(f[h]), c, q, a = ['touch'];
          u.isDefined(f.ngSwipeDisableMouse) || a.push('mouse');
          e.bind(m, {
            start: function (a, b) {
              c = a;
              q = !0;
            },
            cancel: function (a) {
              q = !1;
            },
            end: function (a, c) {
              g(a) && l.$apply(function () {
                m.triggerHandler(p);
                b(l, { $event: c });
              });
            }
          }, a);
        };
      }
    ]);
  }
  var n = u.module('ngTouch', []);
  n.factory('$swipe', [function () {
      function h(d) {
        var e = d.touches && d.touches.length ? d.touches : [d];
        d = d.changedTouches && d.changedTouches[0] || d.originalEvent && d.originalEvent.changedTouches && d.originalEvent.changedTouches[0] || e[0].originalEvent || e[0];
        return {
          x: d.clientX,
          y: d.clientY
        };
      }
      function k(d, e) {
        var l = [];
        u.forEach(d, function (d) {
          (d = p[d][e]) && l.push(d);
        });
        return l.join(' ');
      }
      var p = {
          mouse: {
            start: 'mousedown',
            move: 'mousemove',
            end: 'mouseup'
          },
          touch: {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend',
            cancel: 'touchcancel'
          }
        };
      return {
        bind: function (d, e, l) {
          var m, f, g, b, c = !1;
          l = l || [
            'mouse',
            'touch'
          ];
          d.on(k(l, 'start'), function (a) {
            g = h(a);
            c = !0;
            f = m = 0;
            b = g;
            e.start && e.start(g, a);
          });
          var q = k(l, 'cancel');
          if (q)
            d.on(q, function (a) {
              c = !1;
              e.cancel && e.cancel(a);
            });
          d.on(k(l, 'move'), function (a) {
            if (c && g) {
              var d = h(a);
              m += Math.abs(d.x - b.x);
              f += Math.abs(d.y - b.y);
              b = d;
              10 > m && 10 > f || (f > m ? (c = !1, e.cancel && e.cancel(a)) : (a.preventDefault(), e.move && e.move(d, a)));
            }
          });
          d.on(k(l, 'end'), function (a) {
            c && (c = !1, e.end && e.end(h(a), a));
          });
        }
      };
    }]);
  n.config([
    '$provide',
    function (h) {
      h.decorator('ngClickDirective', [
        '$delegate',
        function (k) {
          k.shift();
          return k;
        }
      ]);
    }
  ]);
  n.directive('ngClick', [
    '$parse',
    '$timeout',
    '$rootElement',
    function (h, k, p) {
      function d(b, c, d) {
        for (var a = 0; a < b.length; a += 2) {
          var e = b[a + 1], f = d;
          if (25 > Math.abs(b[a] - c) && 25 > Math.abs(e - f))
            return b.splice(a, a + 2), !0;
        }
        return !1;
      }
      function e(b) {
        if (!(2500 < Date.now() - m)) {
          var c = b.touches && b.touches.length ? b.touches : [b], e = c[0].clientX, c = c[0].clientY;
          1 > e && 1 > c || g && g[0] === e && g[1] === c || (g && (g = null), 'label' === b.target.tagName.toLowerCase() && (g = [
            e,
            c
          ]), d(f, e, c) || (b.stopPropagation(), b.preventDefault(), b.target && b.target.blur()));
        }
      }
      function l(b) {
        b = b.touches && b.touches.length ? b.touches : [b];
        var c = b[0].clientX, d = b[0].clientY;
        f.push(c, d);
        k(function () {
          for (var a = 0; a < f.length; a += 2)
            if (f[a] == c && f[a + 1] == d) {
              f.splice(a, a + 2);
              break;
            }
        }, 2500, !1);
      }
      var m, f, g;
      return function (b, c, g) {
        function a() {
          n = !1;
          c.removeClass('ng-click-active');
        }
        var k = h(g.ngClick), n = !1, r, s, v, w;
        c.on('touchstart', function (a) {
          n = !0;
          r = a.target ? a.target : a.srcElement;
          3 == r.nodeType && (r = r.parentNode);
          c.addClass('ng-click-active');
          s = Date.now();
          a = a.touches && a.touches.length ? a.touches : [a];
          a = a[0].originalEvent || a[0];
          v = a.clientX;
          w = a.clientY;
        });
        c.on('touchmove', function (c) {
          a();
        });
        c.on('touchcancel', function (c) {
          a();
        });
        c.on('touchend', function (b) {
          var k = Date.now() - s, h = b.changedTouches && b.changedTouches.length ? b.changedTouches : b.touches && b.touches.length ? b.touches : [b], t = h[0].originalEvent || h[0], h = t.clientX, t = t.clientY, x = Math.sqrt(Math.pow(h - v, 2) + Math.pow(t - w, 2));
          n && 750 > k && 12 > x && (f || (p[0].addEventListener('click', e, !0), p[0].addEventListener('touchstart', l, !0), f = []), m = Date.now(), d(f, h, t), r && r.blur(), u.isDefined(g.disabled) && !1 !== g.disabled || c.triggerHandler('click', [b]));
          a();
        });
        c.onclick = function (a) {
        };
        c.on('click', function (a, c) {
          b.$apply(function () {
            k(b, { $event: c || a });
          });
        });
        c.on('mousedown', function (a) {
          c.addClass('ng-click-active');
        });
        c.on('mousemove mouseup', function (a) {
          c.removeClass('ng-click-active');
        });
      };
    }
  ]);
  s('ngSwipeLeft', -1, 'swipeleft');
  s('ngSwipeRight', 1, 'swiperight');
}(window, window.angular));
//# sourceMappingURL=angular-touch.min.js.map
/*
 AngularJS v1.3.15
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function (q, d, C) {
  'use strict';
  function v(r, k, h) {
    return {
      restrict: 'ECA',
      terminal: !0,
      priority: 400,
      transclude: 'element',
      link: function (a, f, b, c, y) {
        function z() {
          l && (h.cancel(l), l = null);
          m && (m.$destroy(), m = null);
          n && (l = h.leave(n), l.then(function () {
            l = null;
          }), n = null);
        }
        function x() {
          var b = r.current && r.current.locals;
          if (d.isDefined(b && b.$template)) {
            var b = a.$new(), c = r.current;
            n = y(b, function (b) {
              h.enter(b, null, n || f).then(function () {
                !d.isDefined(t) || t && !a.$eval(t) || k();
              });
              z();
            });
            m = c.scope = b;
            m.$emit('$viewContentLoaded');
            m.$eval(w);
          } else
            z();
        }
        var m, n, l, t = b.autoscroll, w = b.onload || '';
        a.$on('$routeChangeSuccess', x);
        x();
      }
    };
  }
  function A(d, k, h) {
    return {
      restrict: 'ECA',
      priority: -400,
      link: function (a, f) {
        var b = h.current, c = b.locals;
        f.html(c.$template);
        var y = d(f.contents());
        b.controller && (c.$scope = a, c = k(b.controller, c), b.controllerAs && (a[b.controllerAs] = c), f.data('$ngControllerController', c), f.children().data('$ngControllerController', c));
        y(a);
      }
    };
  }
  q = d.module('ngRoute', ['ng']).provider('$route', function () {
    function r(a, f) {
      return d.extend(Object.create(a), f);
    }
    function k(a, d) {
      var b = d.caseInsensitiveMatch, c = {
          originalPath: a,
          regexp: a
        }, h = c.keys = [];
      a = a.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?\*])?/g, function (a, d, b, c) {
        a = '?' === c ? c : null;
        c = '*' === c ? c : null;
        h.push({
          name: b,
          optional: !!a
        });
        d = d || '';
        return '' + (a ? '' : d) + '(?:' + (a ? d : '') + (c && '(.+?)' || '([^/]+)') + (a || '') + ')' + (a || '');
      }).replace(/([\/$\*])/g, '\\$1');
      c.regexp = new RegExp('^' + a + '$', b ? 'i' : '');
      return c;
    }
    var h = {};
    this.when = function (a, f) {
      var b = d.copy(f);
      d.isUndefined(b.reloadOnSearch) && (b.reloadOnSearch = !0);
      d.isUndefined(b.caseInsensitiveMatch) && (b.caseInsensitiveMatch = this.caseInsensitiveMatch);
      h[a] = d.extend(b, a && k(a, b));
      if (a) {
        var c = '/' == a[a.length - 1] ? a.substr(0, a.length - 1) : a + '/';
        h[c] = d.extend({ redirectTo: a }, k(c, b));
      }
      return this;
    };
    this.caseInsensitiveMatch = !1;
    this.otherwise = function (a) {
      'string' === typeof a && (a = { redirectTo: a });
      this.when(null, a);
      return this;
    };
    this.$get = [
      '$rootScope',
      '$location',
      '$routeParams',
      '$q',
      '$injector',
      '$templateRequest',
      '$sce',
      function (a, f, b, c, k, q, x) {
        function m(b) {
          var e = s.current;
          (v = (p = l()) && e && p.$$route === e.$$route && d.equals(p.pathParams, e.pathParams) && !p.reloadOnSearch && !w) || !e && !p || a.$broadcast('$routeChangeStart', p, e).defaultPrevented && b && b.preventDefault();
        }
        function n() {
          var u = s.current, e = p;
          if (v)
            u.params = e.params, d.copy(u.params, b), a.$broadcast('$routeUpdate', u);
          else if (e || u)
            w = !1, (s.current = e) && e.redirectTo && (d.isString(e.redirectTo) ? f.path(t(e.redirectTo, e.params)).search(e.params).replace() : f.url(e.redirectTo(e.pathParams, f.path(), f.search())).replace()), c.when(e).then(function () {
              if (e) {
                var a = d.extend({}, e.resolve), b, g;
                d.forEach(a, function (b, e) {
                  a[e] = d.isString(b) ? k.get(b) : k.invoke(b, null, null, e);
                });
                d.isDefined(b = e.template) ? d.isFunction(b) && (b = b(e.params)) : d.isDefined(g = e.templateUrl) && (d.isFunction(g) && (g = g(e.params)), g = x.getTrustedResourceUrl(g), d.isDefined(g) && (e.loadedTemplateUrl = g, b = q(g)));
                d.isDefined(b) && (a.$template = b);
                return c.all(a);
              }
            }).then(function (c) {
              e == s.current && (e && (e.locals = c, d.copy(e.params, b)), a.$broadcast('$routeChangeSuccess', e, u));
            }, function (b) {
              e == s.current && a.$broadcast('$routeChangeError', e, u, b);
            });
        }
        function l() {
          var a, b;
          d.forEach(h, function (c, h) {
            var g;
            if (g = !b) {
              var k = f.path();
              g = c.keys;
              var m = {};
              if (c.regexp)
                if (k = c.regexp.exec(k)) {
                  for (var l = 1, n = k.length; l < n; ++l) {
                    var p = g[l - 1], q = k[l];
                    p && q && (m[p.name] = q);
                  }
                  g = m;
                } else
                  g = null;
              else
                g = null;
              g = a = g;
            }
            g && (b = r(c, {
              params: d.extend({}, f.search(), a),
              pathParams: a
            }), b.$$route = c);
          });
          return b || h[null] && r(h[null], {
            params: {},
            pathParams: {}
          });
        }
        function t(a, b) {
          var c = [];
          d.forEach((a || '').split(':'), function (a, d) {
            if (0 === d)
              c.push(a);
            else {
              var f = a.match(/(\w+)(?:[?*])?(.*)/), h = f[1];
              c.push(b[h]);
              c.push(f[2] || '');
              delete b[h];
            }
          });
          return c.join('');
        }
        var w = !1, p, v, s = {
            routes: h,
            reload: function () {
              w = !0;
              a.$evalAsync(function () {
                m();
                n();
              });
            },
            updateParams: function (a) {
              if (this.current && this.current.$$route)
                a = d.extend({}, this.current.params, a), f.path(t(this.current.$$route.originalPath, a)), f.search(a);
              else
                throw B('norout');
            }
          };
        a.$on('$locationChangeStart', m);
        a.$on('$locationChangeSuccess', n);
        return s;
      }
    ];
  });
  var B = d.$$minErr('ngRoute');
  q.provider('$routeParams', function () {
    this.$get = function () {
      return {};
    };
  });
  q.directive('ngView', v);
  q.directive('ngView', A);
  v.$inject = [
    '$route',
    '$anchorScroll',
    '$animate'
  ];
  A.$inject = [
    '$compile',
    '$controller',
    '$route'
  ];
}(window, window.angular));
//# sourceMappingURL=angular-route.min.js.map
/**
 * State-based routing for AngularJS
 * @version v0.2.13
 * @link http://angular-ui.github.com/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/* commonjs package manager support (eg componentjs) */
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'ui.router';
}
(function (window, angular, undefined) {
  /*jshint globalstrict:true*/
  /*global angular:false*/
  'use strict';
  var isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
  function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, { prototype: parent }))(), extra);
  }
  function merge(dst) {
    forEach(arguments, function (obj) {
      if (obj !== dst) {
        forEach(obj, function (value, key) {
          if (!dst.hasOwnProperty(key))
            dst[key] = value;
        });
      }
    });
    return dst;
  }
  /**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
  function ancestors(first, second) {
    var path = [];
    for (var n in first.path) {
      if (first.path[n] !== second.path[n])
        break;
      path.push(first.path[n]);
    }
    return path;
  }
  /**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
  function objectKeys(object) {
    if (Object.keys) {
      return Object.keys(object);
    }
    var result = [];
    angular.forEach(object, function (val, key) {
      result.push(key);
    });
    return result;
  }
  /**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
  function indexOf(array, value) {
    if (Array.prototype.indexOf) {
      return array.indexOf(value, Number(arguments[2]) || 0);
    }
    var len = array.length >>> 0, from = Number(arguments[2]) || 0;
    from = from < 0 ? Math.ceil(from) : Math.floor(from);
    if (from < 0)
      from += len;
    for (; from < len; from++) {
      if (from in array && array[from] === value)
        return from;
    }
    return -1;
  }
  /**
 * Merges a set of parameters with all parameters inherited between the common parents of the
 * current state and a given destination state.
 *
 * @param {Object} currentParams The value of the current state parameters ($stateParams).
 * @param {Object} newParams The set of parameters which will be composited with inherited params.
 * @param {Object} $current Internal definition of object representing the current state.
 * @param {Object} $to Internal definition of object representing state to transition to.
 */
  function inheritParams(currentParams, newParams, $current, $to) {
    var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];
    for (var i in parents) {
      if (!parents[i].params)
        continue;
      parentParams = objectKeys(parents[i].params);
      if (!parentParams.length)
        continue;
      for (var j in parentParams) {
        if (indexOf(inheritList, parentParams[j]) >= 0)
          continue;
        inheritList.push(parentParams[j]);
        inherited[parentParams[j]] = currentParams[parentParams[j]];
      }
    }
    return extend({}, inherited, newParams);
  }
  /**
 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
 *
 * @param {Object} a The first object.
 * @param {Object} b The second object.
 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
 *                     it defaults to the list of keys in `a`.
 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
 */
  function equalForKeys(a, b, keys) {
    if (!keys) {
      keys = [];
      for (var n in a)
        keys.push(n);  // Used instead of Object.keys() for IE8 compatibility
    }
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (a[k] != b[k])
        return false;  // Not '===', values aren't necessarily normalized
    }
    return true;
  }
  /**
 * Returns the subset of an object, based on a list of keys.
 *
 * @param {Array} keys
 * @param {Object} values
 * @return {Boolean} Returns a subset of `values`.
 */
  function filterByKeys(keys, values) {
    var filtered = {};
    forEach(keys, function (name) {
      filtered[name] = values[name];
    });
    return filtered;
  }
  // like _.indexBy
  // when you know that your index values will be unique, or you want last-one-in to win
  function indexBy(array, propName) {
    var result = {};
    forEach(array, function (item) {
      result[item[propName]] = item;
    });
    return result;
  }
  // extracted from underscore.js
  // Return a copy of the object only containing the whitelisted properties.
  function pick(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    forEach(keys, function (key) {
      if (key in obj)
        copy[key] = obj[key];
    });
    return copy;
  }
  // extracted from underscore.js
  // Return a copy of the object omitting the blacklisted properties.
  function omit(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    for (var key in obj) {
      if (indexOf(keys, key) == -1)
        copy[key] = obj[key];
    }
    return copy;
  }
  function pluck(collection, key) {
    var result = isArray(collection) ? [] : {};
    forEach(collection, function (val, i) {
      result[i] = isFunction(key) ? key(val) : val[key];
    });
    return result;
  }
  function filter(collection, callback) {
    var array = isArray(collection);
    var result = array ? [] : {};
    forEach(collection, function (val, i) {
      if (callback(val, i)) {
        result[array ? result.length : i] = val;
      }
    });
    return result;
  }
  function map(collection, callback) {
    var result = isArray(collection) ? [] : {};
    forEach(collection, function (val, i) {
      result[i] = callback(val, i);
    });
    return result;
  }
  /**
 * @ngdoc overview
 * @name ui.router.util
 *
 * @description
 * # ui.router.util sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 *
 */
  angular.module('ui.router.util', ['ng']);
  /**
 * @ngdoc overview
 * @name ui.router.router
 * 
 * @requires ui.router.util
 *
 * @description
 * # ui.router.router sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 */
  angular.module('ui.router.router', ['ui.router.util']);
  /**
 * @ngdoc overview
 * @name ui.router.state
 * 
 * @requires ui.router.router
 * @requires ui.router.util
 *
 * @description
 * # ui.router.state sub-module
 *
 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 * 
 */
  angular.module('ui.router.state', [
    'ui.router.router',
    'ui.router.util'
  ]);
  /**
 * @ngdoc overview
 * @name ui.router
 *
 * @requires ui.router.state
 *
 * @description
 * # ui.router
 * 
 * ## The main module for ui.router 
 * There are several sub-modules included with the ui.router module, however only this module is needed
 * as a dependency within your angular app. The other modules are for organization purposes. 
 *
 * The modules are:
 * * ui.router - the main "umbrella" module
 * * ui.router.router - 
 * 
 * *You'll need to include **only** this module as the dependency within your angular app.*
 * 
 * <pre>
 * <!doctype html>
 * <html ng-app="myApp">
 * <head>
 *   <script src="js/angular.js"></script>
 *   <!-- Include the ui-router script -->
 *   <script src="js/angular-ui-router.min.js"></script>
 *   <script>
 *     // ...and add 'ui.router' as a dependency
 *     var myApp = angular.module('myApp', ['ui.router']);
 *   </script>
 * </head>
 * <body>
 * </body>
 * </html>
 * </pre>
 */
  angular.module('ui.router', ['ui.router.state']);
  angular.module('ui.router.compat', ['ui.router']);
  /**
 * @ngdoc object
 * @name ui.router.util.$resolve
 *
 * @requires $q
 * @requires $injector
 *
 * @description
 * Manages resolution of (acyclic) graphs of promises.
 */
  $Resolve.$inject = [
    '$q',
    '$injector'
  ];
  function $Resolve($q, $injector) {
    var VISIT_IN_PROGRESS = 1, VISIT_DONE = 2, NOTHING = {}, NO_DEPENDENCIES = [], NO_LOCALS = NOTHING, NO_PARENT = extend($q.when(NOTHING), {
        $$promises: NOTHING,
        $$values: NOTHING
      });
    /**
   * @ngdoc function
   * @name ui.router.util.$resolve#study
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Studies a set of invocables that are likely to be used multiple times.
   * <pre>
   * $resolve.study(invocables)(locals, parent, self)
   * </pre>
   * is equivalent to
   * <pre>
   * $resolve.resolve(invocables, locals, parent, self)
   * </pre>
   * but the former is more efficient (in fact `resolve` just calls `study` 
   * internally).
   *
   * @param {object} invocables Invocable objects
   * @return {function} a function to pass in locals, parent and self
   */
    this.study = function (invocables) {
      if (!isObject(invocables))
        throw new Error('\'invocables\' must be an object');
      var invocableKeys = objectKeys(invocables || {});
      // Perform a topological sort of invocables to build an ordered plan
      var plan = [], cycle = [], visited = {};
      function visit(value, key) {
        if (visited[key] === VISIT_DONE)
          return;
        cycle.push(key);
        if (visited[key] === VISIT_IN_PROGRESS) {
          cycle.splice(0, indexOf(cycle, key));
          throw new Error('Cyclic dependency: ' + cycle.join(' -> '));
        }
        visited[key] = VISIT_IN_PROGRESS;
        if (isString(value)) {
          plan.push(key, [function () {
              return $injector.get(value);
            }], NO_DEPENDENCIES);
        } else {
          var params = $injector.annotate(value);
          forEach(params, function (param) {
            if (param !== key && invocables.hasOwnProperty(param))
              visit(invocables[param], param);
          });
          plan.push(key, value, params);
        }
        cycle.pop();
        visited[key] = VISIT_DONE;
      }
      forEach(invocables, visit);
      invocables = cycle = visited = null;
      // plan is all that's required
      function isResolve(value) {
        return isObject(value) && value.then && value.$$promises;
      }
      return function (locals, parent, self) {
        if (isResolve(locals) && self === undefined) {
          self = parent;
          parent = locals;
          locals = null;
        }
        if (!locals)
          locals = NO_LOCALS;
        else if (!isObject(locals)) {
          throw new Error('\'locals\' must be an object');
        }
        if (!parent)
          parent = NO_PARENT;
        else if (!isResolve(parent)) {
          throw new Error('\'parent\' must be a promise returned by $resolve.resolve()');
        }
        // To complete the overall resolution, we have to wait for the parent
        // promise and for the promise for each invokable in our plan.
        var resolution = $q.defer(), result = resolution.promise, promises = result.$$promises = {}, values = extend({}, locals), wait = 1 + plan.length / 3, merged = false;
        function done() {
          // Merge parent values we haven't got yet and publish our own $$values
          if (!--wait) {
            if (!merged)
              merge(values, parent.$$values);
            result.$$values = values;
            result.$$promises = result.$$promises || true;
            // keep for isResolve()
            delete result.$$inheritedValues;
            resolution.resolve(values);
          }
        }
        function fail(reason) {
          result.$$failure = reason;
          resolution.reject(reason);
        }
        // Short-circuit if parent has already failed
        if (isDefined(parent.$$failure)) {
          fail(parent.$$failure);
          return result;
        }
        if (parent.$$inheritedValues) {
          merge(values, omit(parent.$$inheritedValues, invocableKeys));
        }
        // Merge parent values if the parent has already resolved, or merge
        // parent promises and wait if the parent resolve is still in progress.
        extend(promises, parent.$$promises);
        if (parent.$$values) {
          merged = merge(values, omit(parent.$$values, invocableKeys));
          result.$$inheritedValues = omit(parent.$$values, invocableKeys);
          done();
        } else {
          if (parent.$$inheritedValues) {
            result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys);
          }
          parent.then(done, fail);
        }
        // Process each invocable in the plan, but ignore any where a local of the same name exists.
        for (var i = 0, ii = plan.length; i < ii; i += 3) {
          if (locals.hasOwnProperty(plan[i]))
            done();
          else
            invoke(plan[i], plan[i + 1], plan[i + 2]);
        }
        function invoke(key, invocable, params) {
          // Create a deferred for this invocation. Failures will propagate to the resolution as well.
          var invocation = $q.defer(), waitParams = 0;
          function onfailure(reason) {
            invocation.reject(reason);
            fail(reason);
          }
          // Wait for any parameter that we have a promise for (either from parent or from this
          // resolve; in that case study() will have made sure it's ordered before us in the plan).
          forEach(params, function (dep) {
            if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
              waitParams++;
              promises[dep].then(function (result) {
                values[dep] = result;
                if (!--waitParams)
                  proceed();
              }, onfailure);
            }
          });
          if (!waitParams)
            proceed();
          function proceed() {
            if (isDefined(result.$$failure))
              return;
            try {
              invocation.resolve($injector.invoke(invocable, self, values));
              invocation.promise.then(function (result) {
                values[key] = result;
                done();
              }, onfailure);
            } catch (e) {
              onfailure(e);
            }
          }
          // Publish promise synchronously; invocations further down in the plan may depend on it.
          promises[key] = invocation.promise;
        }
        return result;
      };
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$resolve#resolve
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Resolves a set of invocables. An invocable is a function to be invoked via 
   * `$injector.invoke()`, and can have an arbitrary number of dependencies. 
   * An invocable can either return a value directly,
   * or a `$q` promise. If a promise is returned it will be resolved and the 
   * resulting value will be used instead. Dependencies of invocables are resolved 
   * (in this order of precedence)
   *
   * - from the specified `locals`
   * - from another invocable that is part of this `$resolve` call
   * - from an invocable that is inherited from a `parent` call to `$resolve` 
   *   (or recursively
   * - from any ancestor `$resolve` of that parent).
   *
   * The return value of `$resolve` is a promise for an object that contains 
   * (in this order of precedence)
   *
   * - any `locals` (if specified)
   * - the resolved return values of all injectables
   * - any values inherited from a `parent` call to `$resolve` (if specified)
   *
   * The promise will resolve after the `parent` promise (if any) and all promises 
   * returned by injectables have been resolved. If any invocable 
   * (or `$injector.invoke`) throws an exception, or if a promise returned by an 
   * invocable is rejected, the `$resolve` promise is immediately rejected with the 
   * same error. A rejection of a `parent` promise (if specified) will likewise be 
   * propagated immediately. Once the `$resolve` promise has been rejected, no 
   * further invocables will be called.
   * 
   * Cyclic dependencies between invocables are not permitted and will caues `$resolve`
   * to throw an error. As a special case, an injectable can depend on a parameter 
   * with the same name as the injectable, which will be fulfilled from the `parent` 
   * injectable of the same name. This allows inherited values to be decorated. 
   * Note that in this case any other injectable in the same `$resolve` with the same
   * dependency would see the decorated value, not the inherited value.
   *
   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an 
   * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous) 
   * exception.
   *
   * Invocables are invoked eagerly as soon as all dependencies are available. 
   * This is true even for dependencies inherited from a `parent` call to `$resolve`.
   *
   * As a special case, an invocable can be a string, in which case it is taken to 
   * be a service name to be passed to `$injector.get()`. This is supported primarily 
   * for backwards-compatibility with the `resolve` property of `$routeProvider` 
   * routes.
   *
   * @param {object} invocables functions to invoke or 
   * `$injector` services to fetch.
   * @param {object} locals  values to make available to the injectables
   * @param {object} parent  a promise returned by another call to `$resolve`.
   * @param {object} self  the `this` for the invoked methods
   * @return {object} Promise for an object that contains the resolved return value
   * of all invocables, as well as any inherited and local values.
   */
    this.resolve = function (invocables, locals, parent, self) {
      return this.study(invocables)(locals, parent, self);
    };
  }
  angular.module('ui.router.util').service('$resolve', $Resolve);
  /**
 * @ngdoc object
 * @name ui.router.util.$templateFactory
 *
 * @requires $http
 * @requires $templateCache
 * @requires $injector
 *
 * @description
 * Service. Manages loading of templates.
 */
  $TemplateFactory.$inject = [
    '$http',
    '$templateCache',
    '$injector'
  ];
  function $TemplateFactory($http, $templateCache, $injector) {
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromConfig
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a configuration object. 
   *
   * @param {object} config Configuration object for which to load a template. 
   * The following properties are search in the specified order, and the first one 
   * that is defined is used to create the template:
   *
   * @param {string|object} config.template html string template or function to 
   * load via {@link ui.router.util.$templateFactory#fromString fromString}.
   * @param {string|object} config.templateUrl url to load or a function returning 
   * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
   * @param {Function} config.templateProvider function to invoke via 
   * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
   * @param {object} params  Parameters to pass to the template function.
   * @param {object} locals Locals to pass to `invoke` if the template is loaded 
   * via a `templateProvider`. Defaults to `{ params: params }`.
   *
   * @return {string|object}  The template html as a string, or a promise for 
   * that string,or `null` if no template is configured.
   */
    this.fromConfig = function (config, params, locals) {
      return isDefined(config.template) ? this.fromString(config.template, params) : isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) : isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) : null;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromString
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a string or a function returning a string.
   *
   * @param {string|object} template html template as a string or function that 
   * returns an html template as a string.
   * @param {object} params Parameters to pass to the template function.
   *
   * @return {string|object} The template html as a string, or a promise for that 
   * string.
   */
    this.fromString = function (template, params) {
      return isFunction(template) ? template(params) : template;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromUrl
   * @methodOf ui.router.util.$templateFactory
   * 
   * @description
   * Loads a template from the a URL via `$http` and `$templateCache`.
   *
   * @param {string|Function} url url of the template to load, or a function 
   * that returns a url.
   * @param {Object} params Parameters to pass to the url function.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
    this.fromUrl = function (url, params) {
      if (isFunction(url))
        url = url(params);
      if (url == null)
        return null;
      else
        return $http.get(url, {
          cache: $templateCache,
          headers: { Accept: 'text/html' }
        }).then(function (response) {
          return response.data;
        });
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromProvider
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template by invoking an injectable provider function.
   *
   * @param {Function} provider Function to invoke via `$injector.invoke`
   * @param {Object} params Parameters for the template.
   * @param {Object} locals Locals to pass to `invoke`. Defaults to 
   * `{ params: params }`.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
    this.fromProvider = function (provider, params, locals) {
      return $injector.invoke(provider, null, locals || { params: params });
    };
  }
  angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);
  var $$UMFP;
  // reference to $UrlMatcherFactoryProvider
  /**
 * @ngdoc object
 * @name ui.router.util.type:UrlMatcher
 *
 * @description
 * Matches URLs against patterns and extracts named parameters from the path or the search
 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
 * do not influence whether or not a URL is matched, but their values are passed through into
 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
 * 
 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
 * syntax, which optionally allows a regular expression for the parameter to be specified:
 *
 * * `':'` name - colon placeholder
 * * `'*'` name - catch-all placeholder
 * * `'{' name '}'` - curly placeholder
 * * `'{' name ':' regexp|type '}'` - curly placeholder with regexp or type name. Should the
 *   regexp itself contain curly braces, they must be in matched pairs or escaped with a backslash.
 *
 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
 * must be unique within the pattern (across both path and search parameters). For colon 
 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
 * number of characters other than '/'. For catch-all placeholders the path parameter matches
 * any number of characters.
 * 
 * Examples:
 * 
 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
 * * `'/user/{id:[^/]*}'` - Same as the previous example.
 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
 *   parameter consists of 1 to 8 hex digits.
 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
 *   path into the parameter 'path'.
 * * `'/files/*path'` - ditto.
 * * `'/calendar/{start:date}'` - Matches "/calendar/2014-11-12" (because the pattern defined
 *   in the built-in  `date` Type matches `2014-11-12`) and provides a Date object in $stateParams.start
 *
 * @param {string} pattern  The pattern to compile into a matcher.
 * @param {Object} config  A configuration object hash:
 * @param {Object=} parentMatcher Used to concatenate the pattern/config onto
 *   an existing UrlMatcher
 *
 * * `caseInsensitive` - `true` if URL matching should be case insensitive, otherwise `false`, the default value (for backward compatibility) is `false`.
 * * `strict` - `false` if matching against a URL with a trailing slash should be treated as equivalent to a URL without a trailing slash, the default value is `true`.
 *
 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
 *   non-null) will start with this prefix.
 *
 * @property {string} source  The pattern that was passed into the constructor
 *
 * @property {string} sourcePath  The path portion of the source property
 *
 * @property {string} sourceSearch  The search portion of the source property
 *
 * @property {string} regex  The constructed regex that will be used to match against the url when 
 *   it is time to determine which url will match.
 *
 * @returns {Object}  New `UrlMatcher` object
 */
  function UrlMatcher(pattern, config, parentMatcher) {
    config = extend({ params: {} }, isObject(config) ? config : {});
    // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
    //   '*' name
    //   ':' name
    //   '{' name '}'
    //   '{' name ':' regexp '}'
    // The regular expression is somewhat complicated due to the need to allow curly braces
    // inside the regular expression. The placeholder regexp breaks down as follows:
    //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
    //    \{([\w\[\]]+)(?:\:( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
    //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
    //    [^{}\\]+                       - anything other than curly braces or backslash
    //    \\.                            - a backslash escape
    //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
    var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, searchPlaceholder = /([:]?)([\w\[\]-]+)|\{([\w\[\]-]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, compiled = '^', last = 0, m, segments = this.segments = [], parentParams = parentMatcher ? parentMatcher.params : {}, params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(), paramNames = [];
    function addParameter(id, type, config, location) {
      paramNames.push(id);
      if (parentParams[id])
        return parentParams[id];
      if (!/^\w+(-+\w+)*(?:\[\])?$/.test(id))
        throw new Error('Invalid parameter name \'' + id + '\' in pattern \'' + pattern + '\'');
      if (params[id])
        throw new Error('Duplicate parameter name \'' + id + '\' in pattern \'' + pattern + '\'');
      params[id] = new $$UMFP.Param(id, type, config, location);
      return params[id];
    }
    function quoteRegExp(string, pattern, squash) {
      var surroundPattern = [
          '',
          ''
        ], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, '\\$&');
      if (!pattern)
        return result;
      switch (squash) {
      case false:
        surroundPattern = [
          '(',
          ')'
        ];
        break;
      case true:
        surroundPattern = [
          '?(',
          ')?'
        ];
        break;
      default:
        surroundPattern = [
          '(' + squash + '|',
          ')?'
        ];
        break;
      }
      return result + surroundPattern[0] + pattern + surroundPattern[1];
    }
    this.source = pattern;
    // Split into static segments separated by path parameter placeholders.
    // The number of segments is always 1 more than the number of parameters.
    function matchDetails(m, isSearch) {
      var id, regexp, segment, type, cfg, arrayMode;
      id = m[2] || m[3];
      // IE[78] returns '' for unmatched groups instead of null
      cfg = config.params[id];
      segment = pattern.substring(last, m.index);
      regexp = isSearch ? m[4] : m[4] || (m[1] == '*' ? '.*' : null);
      type = $$UMFP.type(regexp || 'string') || inherit($$UMFP.type('string'), { pattern: new RegExp(regexp) });
      return {
        id: id,
        regexp: regexp,
        segment: segment,
        type: type,
        cfg: cfg
      };
    }
    var p, param, segment;
    while (m = placeholder.exec(pattern)) {
      p = matchDetails(m, false);
      if (p.segment.indexOf('?') >= 0)
        break;
      // we're into the search part
      param = addParameter(p.id, p.type, p.cfg, 'path');
      compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash);
      segments.push(p.segment);
      last = placeholder.lastIndex;
    }
    segment = pattern.substring(last);
    // Find any search parameter names and remove them from the last segment
    var i = segment.indexOf('?');
    if (i >= 0) {
      var search = this.sourceSearch = segment.substring(i);
      segment = segment.substring(0, i);
      this.sourcePath = pattern.substring(0, last + i);
      if (search.length > 0) {
        last = 0;
        while (m = searchPlaceholder.exec(search)) {
          p = matchDetails(m, true);
          param = addParameter(p.id, p.type, p.cfg, 'search');
          last = placeholder.lastIndex;  // check if ?&
        }
      }
    } else {
      this.sourcePath = pattern;
      this.sourceSearch = '';
    }
    compiled += quoteRegExp(segment) + (config.strict === false ? '/?' : '') + '$';
    segments.push(segment);
    this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
    this.prefix = segments[0];
    this.$$paramNames = paramNames;
  }
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#concat
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns a new matcher for a pattern constructed by appending the path part and adding the
 * search parameters of the specified pattern to this pattern. The current pattern is not
 * modified. This can be understood as creating a pattern for URLs that are relative to (or
 * suffixes of) the current pattern.
 *
 * @example
 * The following two matchers are equivalent:
 * <pre>
 * new UrlMatcher('/user/{id}?q').concat('/details?date');
 * new UrlMatcher('/user/{id}/details?q&date');
 * </pre>
 *
 * @param {string} pattern  The pattern to append.
 * @param {Object} config  An object hash of the configuration for the matcher.
 * @returns {UrlMatcher}  A matcher for the concatenated pattern.
 */
  UrlMatcher.prototype.concat = function (pattern, config) {
    // Because order of search parameters is irrelevant, we can add our own search
    // parameters to the end of the new pattern. Parse the new pattern by itself
    // and then join the bits together, but it's much easier to do this on a string level.
    var defaultConfig = {
        caseInsensitive: $$UMFP.caseInsensitive(),
        strict: $$UMFP.strictMode(),
        squash: $$UMFP.defaultSquashPolicy()
      };
    return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
  };
  UrlMatcher.prototype.toString = function () {
    return this.source;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#exec
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Tests the specified path against this matcher, and returns an object containing the captured
 * parameter values, or null if the path does not match. The returned object contains the values
 * of any search parameters that are mentioned in the pattern, but their value may be null if
 * they are not present in `searchParams`. This means that search parameters are always treated
 * as optional.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', {
 *   x: '1', q: 'hello'
 * });
 * // returns { id: 'bob', q: 'hello', r: null }
 * </pre>
 *
 * @param {string} path  The URL path to match, e.g. `$location.path()`.
 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
 * @returns {Object}  The captured parameter values.
 */
  UrlMatcher.prototype.exec = function (path, searchParams) {
    var m = this.regexp.exec(path);
    if (!m)
      return null;
    searchParams = searchParams || {};
    var paramNames = this.parameters(), nTotal = paramNames.length, nPath = this.segments.length - 1, values = {}, i, j, cfg, paramName;
    if (nPath !== m.length - 1)
      throw new Error('Unbalanced capture group in route \'' + this.source + '\'');
    function decodePathArray(string) {
      function reverseString(str) {
        return str.split('').reverse().join('');
      }
      function unquoteDashes(str) {
        return str.replace(/\\-/, '-');
      }
      var split = reverseString(string).split(/-(?!\\)/);
      var allReversed = map(split, reverseString);
      return map(allReversed, unquoteDashes).reverse();
    }
    for (i = 0; i < nPath; i++) {
      paramName = paramNames[i];
      var param = this.params[paramName];
      var paramVal = m[i + 1];
      // if the param value matches a pre-replace pair, replace the value before decoding.
      for (j = 0; j < param.replace; j++) {
        if (param.replace[j].from === paramVal)
          paramVal = param.replace[j].to;
      }
      if (paramVal && param.array === true)
        paramVal = decodePathArray(paramVal);
      values[paramName] = param.value(paramVal);
    }
    for (; i < nTotal; i++) {
      paramName = paramNames[i];
      values[paramName] = this.params[paramName].value(searchParams[paramName]);
    }
    return values;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#parameters
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns the names of all path and search parameters of this pattern in an unspecified order.
 * 
 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
 *    pattern has no parameters, an empty array is returned.
 */
  UrlMatcher.prototype.parameters = function (param) {
    if (!isDefined(param))
      return this.$$paramNames;
    return this.params[param] || null;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#validate
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Checks an object hash of parameters to validate their correctness according to the parameter
 * types of this `UrlMatcher`.
 *
 * @param {Object} params The object hash of parameters to validate.
 * @returns {boolean} Returns `true` if `params` validates, otherwise `false`.
 */
  UrlMatcher.prototype.validates = function (params) {
    return this.params.$$validates(params);
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#format
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Creates a URL that matches this pattern by substituting the specified values
 * for the path and search parameters. Null values for path parameters are
 * treated as empty strings.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
 * // returns '/user/bob?q=yes'
 * </pre>
 *
 * @param {Object} values  the values to substitute for the parameters in this pattern.
 * @returns {string}  the formatted URL (path and optionally search part).
 */
  UrlMatcher.prototype.format = function (values) {
    values = values || {};
    var segments = this.segments, params = this.parameters(), paramset = this.params;
    if (!this.validates(values))
      return null;
    var i, search = false, nPath = segments.length - 1, nTotal = params.length, result = segments[0];
    function encodeDashes(str) {
      // Replace dashes with encoded "\-"
      return encodeURIComponent(str).replace(/-/g, function (c) {
        return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    for (i = 0; i < nTotal; i++) {
      var isPathParam = i < nPath;
      var name = params[i], param = paramset[name], value = param.value(values[name]);
      var isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
      var squash = isDefaultValue ? param.squash : false;
      var encoded = param.type.encode(value);
      if (isPathParam) {
        var nextSegment = segments[i + 1];
        if (squash === false) {
          if (encoded != null) {
            if (isArray(encoded)) {
              result += map(encoded, encodeDashes).join('-');
            } else {
              result += encodeURIComponent(encoded);
            }
          }
          result += nextSegment;
        } else if (squash === true) {
          var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
          result += nextSegment.match(capture)[1];
        } else if (isString(squash)) {
          result += squash + nextSegment;
        }
      } else {
        if (encoded == null || isDefaultValue && squash !== false)
          continue;
        if (!isArray(encoded))
          encoded = [encoded];
        encoded = map(encoded, encodeURIComponent).join('&' + name + '=');
        result += (search ? '&' : '?') + (name + '=' + encoded);
        search = true;
      }
    }
    return result;
  };
  /**
 * @ngdoc object
 * @name ui.router.util.type:Type
 *
 * @description
 * Implements an interface to define custom parameter types that can be decoded from and encoded to
 * string parameters matched in a URL. Used by {@link ui.router.util.type:UrlMatcher `UrlMatcher`}
 * objects when matching or formatting URLs, or comparing or validating parameter values.
 *
 * See {@link ui.router.util.$urlMatcherFactory#methods_type `$urlMatcherFactory#type()`} for more
 * information on registering custom types.
 *
 * @param {Object} config  A configuration object which contains the custom type definition.  The object's
 *        properties will override the default methods and/or pattern in `Type`'s public interface.
 * @example
 * <pre>
 * {
 *   decode: function(val) { return parseInt(val, 10); },
 *   encode: function(val) { return val && val.toString(); },
 *   equals: function(a, b) { return this.is(a) && a === b; },
 *   is: function(val) { return angular.isNumber(val) isFinite(val) && val % 1 === 0; },
 *   pattern: /\d+/
 * }
 * </pre>
 *
 * @property {RegExp} pattern The regular expression pattern used to match values of this type when
 *           coming from a substring of a URL.
 *
 * @returns {Object}  Returns a new `Type` object.
 */
  function Type(config) {
    extend(this, config);
  }
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#is
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Detects whether a value is of a particular type. Accepts a native (decoded) value
 * and determines whether it matches the current `Type` object.
 *
 * @param {*} val  The value to check.
 * @param {string} key  Optional. If the type check is happening in the context of a specific
 *        {@link ui.router.util.type:UrlMatcher `UrlMatcher`} object, this is the name of the
 *        parameter in which `val` is stored. Can be used for meta-programming of `Type` objects.
 * @returns {Boolean}  Returns `true` if the value matches the type, otherwise `false`.
 */
  Type.prototype.is = function (val, key) {
    return true;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#encode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Encodes a custom/native type value to a string that can be embedded in a URL. Note that the
 * return value does *not* need to be URL-safe (i.e. passed through `encodeURIComponent()`), it
 * only needs to be a representation of `val` that has been coerced to a string.
 *
 * @param {*} val  The value to encode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {string}  Returns a string representation of `val` that can be encoded in a URL.
 */
  Type.prototype.encode = function (val, key) {
    return val;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#decode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Converts a parameter value (from URL string or transition param) to a custom/native value.
 *
 * @param {string} val  The URL parameter value to decode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {*}  Returns a custom representation of the URL parameter value.
 */
  Type.prototype.decode = function (val, key) {
    return val;
  };
  /**
 * @ngdoc function
 * @name ui.router.util.type:Type#equals
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Determines whether two decoded values are equivalent.
 *
 * @param {*} a  A value to compare against.
 * @param {*} b  A value to compare against.
 * @returns {Boolean}  Returns `true` if the values are equivalent/equal, otherwise `false`.
 */
  Type.prototype.equals = function (a, b) {
    return a == b;
  };
  Type.prototype.$subPattern = function () {
    var sub = this.pattern.toString();
    return sub.substr(1, sub.length - 2);
  };
  Type.prototype.pattern = /.*/;
  Type.prototype.toString = function () {
    return '{Type:' + this.name + '}';
  };
  /*
 * Wraps an existing custom Type as an array of Type, depending on 'mode'.
 * e.g.:
 * - urlmatcher pattern "/path?{queryParam[]:int}"
 * - url: "/path?queryParam=1&queryParam=2
 * - $stateParams.queryParam will be [1, 2]
 * if `mode` is "auto", then
 * - url: "/path?queryParam=1 will create $stateParams.queryParam: 1
 * - url: "/path?queryParam=1&queryParam=2 will create $stateParams.queryParam: [1, 2]
 */
  Type.prototype.$asArray = function (mode, isSearch) {
    if (!mode)
      return this;
    if (mode === 'auto' && !isSearch)
      throw new Error('\'auto\' array mode is for query parameters only');
    return new ArrayType(this, mode);
    function ArrayType(type, mode) {
      function bindTo(type, callbackName) {
        return function () {
          return type[callbackName].apply(type, arguments);
        };
      }
      // Wrap non-array value as array
      function arrayWrap(val) {
        return isArray(val) ? val : isDefined(val) ? [val] : [];
      }
      // Unwrap array value for "auto" mode. Return undefined for empty array.
      function arrayUnwrap(val) {
        switch (val.length) {
        case 0:
          return undefined;
        case 1:
          return mode === 'auto' ? val[0] : val;
        default:
          return val;
        }
      }
      function falsey(val) {
        return !val;
      }
      // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
      function arrayHandler(callback, allTruthyMode) {
        return function handleArray(val) {
          val = arrayWrap(val);
          var result = map(val, callback);
          if (allTruthyMode === true)
            return filter(result, falsey).length === 0;
          return arrayUnwrap(result);
        };
      }
      // Wraps type (.equals) functions to operate on each value of an array
      function arrayEqualsHandler(callback) {
        return function handleArray(val1, val2) {
          var left = arrayWrap(val1), right = arrayWrap(val2);
          if (left.length !== right.length)
            return false;
          for (var i = 0; i < left.length; i++) {
            if (!callback(left[i], right[i]))
              return false;
          }
          return true;
        };
      }
      this.encode = arrayHandler(bindTo(type, 'encode'));
      this.decode = arrayHandler(bindTo(type, 'decode'));
      this.is = arrayHandler(bindTo(type, 'is'), true);
      this.equals = arrayEqualsHandler(bindTo(type, 'equals'));
      this.pattern = type.pattern;
      this.$arrayMode = mode;
    }
  };
  /**
 * @ngdoc object
 * @name ui.router.util.$urlMatcherFactory
 *
 * @description
 * Factory for {@link ui.router.util.type:UrlMatcher `UrlMatcher`} instances. The factory
 * is also available to providers under the name `$urlMatcherFactoryProvider`.
 */
  function $UrlMatcherFactory() {
    $$UMFP = this;
    var isCaseInsensitive = false, isStrictMode = true, defaultSquashPolicy = false;
    function valToString(val) {
      return val != null ? val.toString().replace(/\//g, '%2F') : val;
    }
    function valFromString(val) {
      return val != null ? val.toString().replace(/%2F/g, '/') : val;
    }
    //  TODO: in 1.0, make string .is() return false if value is undefined by default.
    //  function regexpMatches(val) { /*jshint validthis:true */ return isDefined(val) && this.pattern.test(val); }
    function regexpMatches(val) {
      /*jshint validthis:true */
      return this.pattern.test(val);
    }
    var $types = {}, enqueue = true, typeQueue = [], injector, defaultTypes = {
        string: {
          encode: valToString,
          decode: valFromString,
          is: regexpMatches,
          pattern: /[^/]*/
        },
        int: {
          encode: valToString,
          decode: function (val) {
            return parseInt(val, 10);
          },
          is: function (val) {
            return isDefined(val) && this.decode(val.toString()) === val;
          },
          pattern: /\d+/
        },
        bool: {
          encode: function (val) {
            return val ? 1 : 0;
          },
          decode: function (val) {
            return parseInt(val, 10) !== 0;
          },
          is: function (val) {
            return val === true || val === false;
          },
          pattern: /0|1/
        },
        date: {
          encode: function (val) {
            if (!this.is(val))
              return undefined;
            return [
              val.getFullYear(),
              ('0' + (val.getMonth() + 1)).slice(-2),
              ('0' + val.getDate()).slice(-2)
            ].join('-');
          },
          decode: function (val) {
            if (this.is(val))
              return val;
            var match = this.capture.exec(val);
            return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
          },
          is: function (val) {
            return val instanceof Date && !isNaN(val.valueOf());
          },
          equals: function (a, b) {
            return this.is(a) && this.is(b) && a.toISOString() === b.toISOString();
          },
          pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
          capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
        },
        json: {
          encode: angular.toJson,
          decode: angular.fromJson,
          is: angular.isObject,
          equals: angular.equals,
          pattern: /[^/]*/
        },
        any: {
          encode: angular.identity,
          decode: angular.identity,
          is: angular.identity,
          equals: angular.equals,
          pattern: /.*/
        }
      };
    function getDefaultConfig() {
      return {
        strict: isStrictMode,
        caseInsensitive: isCaseInsensitive
      };
    }
    function isInjectable(value) {
      return isFunction(value) || isArray(value) && isFunction(value[value.length - 1]);
    }
    /**
   * [Internal] Get the default value of a parameter, which may be an injectable function.
   */
    $UrlMatcherFactory.$$getDefaultValue = function (config) {
      if (!isInjectable(config.value))
        return config.value;
      if (!injector)
        throw new Error('Injectable functions cannot be called at configuration time');
      return injector.invoke(config.value);
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#caseInsensitive
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Defines whether URL matching should be case sensitive (the default behavior), or not.
   *
   * @param {boolean} value `false` to match URL in a case sensitive manner; otherwise `true`;
   * @returns {boolean} the current value of caseInsensitive
   */
    this.caseInsensitive = function (value) {
      if (isDefined(value))
        isCaseInsensitive = value;
      return isCaseInsensitive;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#strictMode
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Defines whether URLs should match trailing slashes, or not (the default behavior).
   *
   * @param {boolean=} value `false` to match trailing slashes in URLs, otherwise `true`.
   * @returns {boolean} the current value of strictMode
   */
    this.strictMode = function (value) {
      if (isDefined(value))
        isStrictMode = value;
      return isStrictMode;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#defaultSquashPolicy
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Sets the default behavior when generating or matching URLs with default parameter values.
   *
   * @param {string} value A string that defines the default parameter URL squashing behavior.
   *    `nosquash`: When generating an href with a default parameter value, do not squash the parameter value from the URL
   *    `slash`: When generating an href with a default parameter value, squash (remove) the parameter value, and, if the
   *             parameter is surrounded by slashes, squash (remove) one slash from the URL
   *    any other string, e.g. "~": When generating an href with a default parameter value, squash (remove)
   *             the parameter value from the URL and replace it with this string.
   */
    this.defaultSquashPolicy = function (value) {
      if (!isDefined(value))
        return defaultSquashPolicy;
      if (value !== true && value !== false && !isString(value))
        throw new Error('Invalid squash policy: ' + value + '. Valid policies: false, true, arbitrary-string');
      defaultSquashPolicy = value;
      return value;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#compile
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Creates a {@link ui.router.util.type:UrlMatcher `UrlMatcher`} for the specified pattern.
   *
   * @param {string} pattern  The URL pattern.
   * @param {Object} config  The config object hash.
   * @returns {UrlMatcher}  The UrlMatcher.
   */
    this.compile = function (pattern, config) {
      return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#isMatcher
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Returns true if the specified object is a `UrlMatcher`, or false otherwise.
   *
   * @param {Object} object  The object to perform the type check against.
   * @returns {Boolean}  Returns `true` if the object matches the `UrlMatcher` interface, by
   *          implementing all the same methods.
   */
    this.isMatcher = function (o) {
      if (!isObject(o))
        return false;
      var result = true;
      forEach(UrlMatcher.prototype, function (val, name) {
        if (isFunction(val)) {
          result = result && (isDefined(o[name]) && isFunction(o[name]));
        }
      });
      return result;
    };
    /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#type
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Registers a custom {@link ui.router.util.type:Type `Type`} object that can be used to
   * generate URLs with typed parameters.
   *
   * @param {string} name  The type name.
   * @param {Object|Function} definition   The type definition. See
   *        {@link ui.router.util.type:Type `Type`} for information on the values accepted.
   * @param {Object|Function} definitionFn (optional) A function that is injected before the app
   *        runtime starts.  The result of this function is merged into the existing `definition`.
   *        See {@link ui.router.util.type:Type `Type`} for information on the values accepted.
   *
   * @returns {Object}  Returns `$urlMatcherFactoryProvider`.
   *
   * @example
   * This is a simple example of a custom type that encodes and decodes items from an
   * array, using the array index as the URL-encoded value:
   *
   * <pre>
   * var list = ['John', 'Paul', 'George', 'Ringo'];
   *
   * $urlMatcherFactoryProvider.type('listItem', {
   *   encode: function(item) {
   *     // Represent the list item in the URL using its corresponding index
   *     return list.indexOf(item);
   *   },
   *   decode: function(item) {
   *     // Look up the list item by index
   *     return list[parseInt(item, 10)];
   *   },
   *   is: function(item) {
   *     // Ensure the item is valid by checking to see that it appears
   *     // in the list
   *     return list.indexOf(item) > -1;
   *   }
   * });
   *
   * $stateProvider.state('list', {
   *   url: "/list/{item:listItem}",
   *   controller: function($scope, $stateParams) {
   *     console.log($stateParams.item);
   *   }
   * });
   *
   * // ...
   *
   * // Changes URL to '/list/3', logs "Ringo" to the console
   * $state.go('list', { item: "Ringo" });
   * </pre>
   *
   * This is a more complex example of a type that relies on dependency injection to
   * interact with services, and uses the parameter name from the URL to infer how to
   * handle encoding and decoding parameter values:
   *
   * <pre>
   * // Defines a custom type that gets a value from a service,
   * // where each service gets different types of values from
   * // a backend API:
   * $urlMatcherFactoryProvider.type('dbObject', {}, function(Users, Posts) {
   *
   *   // Matches up services to URL parameter names
   *   var services = {
   *     user: Users,
   *     post: Posts
   *   };
   *
   *   return {
   *     encode: function(object) {
   *       // Represent the object in the URL using its unique ID
   *       return object.id;
   *     },
   *     decode: function(value, key) {
   *       // Look up the object by ID, using the parameter
   *       // name (key) to call the correct service
   *       return services[key].findById(value);
   *     },
   *     is: function(object, key) {
   *       // Check that object is a valid dbObject
   *       return angular.isObject(object) && object.id && services[key];
   *     }
   *     equals: function(a, b) {
   *       // Check the equality of decoded objects by comparing
   *       // their unique IDs
   *       return a.id === b.id;
   *     }
   *   };
   * });
   *
   * // In a config() block, you can then attach URLs with
   * // type-annotated parameters:
   * $stateProvider.state('users', {
   *   url: "/users",
   *   // ...
   * }).state('users.item', {
   *   url: "/{user:dbObject}",
   *   controller: function($scope, $stateParams) {
   *     // $stateParams.user will now be an object returned from
   *     // the Users service
   *   },
   *   // ...
   * });
   * </pre>
   */
    this.type = function (name, definition, definitionFn) {
      if (!isDefined(definition))
        return $types[name];
      if ($types.hasOwnProperty(name))
        throw new Error('A type named \'' + name + '\' has already been defined.');
      $types[name] = new Type(extend({ name: name }, definition));
      if (definitionFn) {
        typeQueue.push({
          name: name,
          def: definitionFn
        });
        if (!enqueue)
          flushTypeQueue();
      }
      return this;
    };
    // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
    function flushTypeQueue() {
      while (typeQueue.length) {
        var type = typeQueue.shift();
        if (type.pattern)
          throw new Error('You cannot override a type\'s .pattern at runtime.');
        angular.extend($types[type.name], injector.invoke(type.def));
      }
    }
    // Register default types. Store them in the prototype of $types.
    forEach(defaultTypes, function (type, name) {
      $types[name] = new Type(extend({ name: name }, type));
    });
    $types = inherit($types, {});
    /* No need to document $get, since it returns this */
    this.$get = [
      '$injector',
      function ($injector) {
        injector = $injector;
        enqueue = false;
        flushTypeQueue();
        forEach(defaultTypes, function (type, name) {
          if (!$types[name])
            $types[name] = new Type(type);
        });
        return this;
      }
    ];
    this.Param = function Param(id, type, config, location) {
      var self = this;
      config = unwrapShorthand(config);
      type = getType(config, type, location);
      var arrayMode = getArrayMode();
      type = arrayMode ? type.$asArray(arrayMode, location === 'search') : type;
      if (type.name === 'string' && !arrayMode && location === 'path' && config.value === undefined)
        config.value = '';
      // for 0.2.x; in 0.3.0+ do not automatically default to ""
      var isOptional = config.value !== undefined;
      var squash = getSquashPolicy(config, isOptional);
      var replace = getReplace(config, arrayMode, isOptional, squash);
      function unwrapShorthand(config) {
        var keys = isObject(config) ? objectKeys(config) : [];
        var isShorthand = indexOf(keys, 'value') === -1 && indexOf(keys, 'type') === -1 && indexOf(keys, 'squash') === -1 && indexOf(keys, 'array') === -1;
        if (isShorthand)
          config = { value: config };
        config.$$fn = isInjectable(config.value) ? config.value : function () {
          return config.value;
        };
        return config;
      }
      function getType(config, urlType, location) {
        if (config.type && urlType)
          throw new Error('Param \'' + id + '\' has two type configurations.');
        if (urlType)
          return urlType;
        if (!config.type)
          return location === 'config' ? $types.any : $types.string;
        return config.type instanceof Type ? config.type : new Type(config.type);
      }
      // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
      function getArrayMode() {
        var arrayDefaults = { array: location === 'search' ? 'auto' : false };
        var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
        return extend(arrayDefaults, arrayParamNomenclature, config).array;
      }
      /**
     * returns false, true, or the squash value to indicate the "default parameter url squash policy".
     */
      function getSquashPolicy(config, isOptional) {
        var squash = config.squash;
        if (!isOptional || squash === false)
          return false;
        if (!isDefined(squash) || squash == null)
          return defaultSquashPolicy;
        if (squash === true || isString(squash))
          return squash;
        throw new Error('Invalid squash policy: \'' + squash + '\'. Valid policies: false, true, or arbitrary string');
      }
      function getReplace(config, arrayMode, isOptional, squash) {
        var replace, configuredKeys, defaultPolicy = [
            {
              from: '',
              to: isOptional || arrayMode ? undefined : ''
            },
            {
              from: null,
              to: isOptional || arrayMode ? undefined : ''
            }
          ];
        replace = isArray(config.replace) ? config.replace : [];
        if (isString(squash))
          replace.push({
            from: squash,
            to: undefined
          });
        configuredKeys = map(replace, function (item) {
          return item.from;
        });
        return filter(defaultPolicy, function (item) {
          return indexOf(configuredKeys, item.from) === -1;
        }).concat(replace);
      }
      /**
     * [Internal] Get the default value of a parameter, which may be an injectable function.
     */
      function $$getDefaultValue() {
        if (!injector)
          throw new Error('Injectable functions cannot be called at configuration time');
        return injector.invoke(config.$$fn);
      }
      /**
     * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
     * default value, which may be the result of an injectable function.
     */
      function $value(value) {
        function hasReplaceVal(val) {
          return function (obj) {
            return obj.from === val;
          };
        }
        function $replace(value) {
          var replacement = map(filter(self.replace, hasReplaceVal(value)), function (obj) {
              return obj.to;
            });
          return replacement.length ? replacement[0] : value;
        }
        value = $replace(value);
        return isDefined(value) ? self.type.decode(value) : $$getDefaultValue();
      }
      function toString() {
        return '{Param:' + id + ' ' + type + ' squash: \'' + squash + '\' optional: ' + isOptional + '}';
      }
      extend(this, {
        id: id,
        type: type,
        location: location,
        array: arrayMode,
        squash: squash,
        replace: replace,
        isOptional: isOptional,
        value: $value,
        dynamic: undefined,
        config: config,
        toString: toString
      });
    };
    function ParamSet(params) {
      extend(this, params || {});
    }
    ParamSet.prototype = {
      $$new: function () {
        return inherit(this, extend(new ParamSet(), { $$parent: this }));
      },
      $$keys: function () {
        var keys = [], chain = [], parent = this, ignore = objectKeys(ParamSet.prototype);
        while (parent) {
          chain.push(parent);
          parent = parent.$$parent;
        }
        chain.reverse();
        forEach(chain, function (paramset) {
          forEach(objectKeys(paramset), function (key) {
            if (indexOf(keys, key) === -1 && indexOf(ignore, key) === -1)
              keys.push(key);
          });
        });
        return keys;
      },
      $$values: function (paramValues) {
        var values = {}, self = this;
        forEach(self.$$keys(), function (key) {
          values[key] = self[key].value(paramValues && paramValues[key]);
        });
        return values;
      },
      $$equals: function (paramValues1, paramValues2) {
        var equal = true, self = this;
        forEach(self.$$keys(), function (key) {
          var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
          if (!self[key].type.equals(left, right))
            equal = false;
        });
        return equal;
      },
      $$validates: function $$validate(paramValues) {
        var result = true, isOptional, val, param, self = this;
        forEach(this.$$keys(), function (key) {
          param = self[key];
          val = paramValues[key];
          isOptional = !val && param.isOptional;
          result = result && (isOptional || !!param.type.is(val));
        });
        return result;
      },
      $$parent: undefined
    };
    this.ParamSet = ParamSet;
  }
  // Register as a provider so it's available to other providers
  angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
  angular.module('ui.router.util').run([
    '$urlMatcherFactory',
    function ($urlMatcherFactory) {
    }
  ]);
  /**
 * @ngdoc object
 * @name ui.router.router.$urlRouterProvider
 *
 * @requires ui.router.util.$urlMatcherFactoryProvider
 * @requires $locationProvider
 *
 * @description
 * `$urlRouterProvider` has the responsibility of watching `$location`. 
 * When `$location` changes it runs through a list of rules one by one until a 
 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify 
 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
 *
 * There are several methods on `$urlRouterProvider` that make it useful to use directly
 * in your module config.
 */
  $UrlRouterProvider.$inject = [
    '$locationProvider',
    '$urlMatcherFactoryProvider'
  ];
  function $UrlRouterProvider($locationProvider, $urlMatcherFactory) {
    var rules = [], otherwise = null, interceptDeferred = false, listener;
    // Returns a string that is a prefix of all strings matching the RegExp
    function regExpPrefix(re) {
      var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
      return prefix != null ? prefix[1].replace(/\\(.)/g, '$1') : '';
    }
    // Interpolates matched values into a String.replace()-style pattern
    function interpolate(pattern, match) {
      return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
        return match[what === '$' ? 0 : Number(what)];
      });
    }
    /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#rule
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines rules that are used by `$urlRouterProvider` to find matches for
   * specific URLs.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // Here's an example of how you might allow case insensitive urls
   *   $urlRouterProvider.rule(function ($injector, $location) {
   *     var path = $location.path(),
   *         normalized = path.toLowerCase();
   *
   *     if (path !== normalized) {
   *       return normalized;
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {object} rule Handler function that takes `$injector` and `$location`
   * services as arguments. You can use them to return a valid path as a string.
   *
   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
   */
    this.rule = function (rule) {
      if (!isFunction(rule))
        throw new Error('\'rule\' must be a function');
      rules.push(rule);
      return this;
    };
    /**
   * @ngdoc object
   * @name ui.router.router.$urlRouterProvider#otherwise
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines a path that is used when an invalid route is requested.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // if the path doesn't match any of the urls you configured
   *   // otherwise will take care of routing the user to the
   *   // specified url
   *   $urlRouterProvider.otherwise('/index');
   *
   *   // Example of using function rule as param
   *   $urlRouterProvider.otherwise(function ($injector, $location) {
   *     return '/a/valid/url';
   *   });
   * });
   * </pre>
   *
   * @param {string|object} rule The url path you want to redirect to or a function 
   * rule that returns the url path. The function version is passed two params: 
   * `$injector` and `$location` services, and must return a url string.
   *
   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
   */
    this.otherwise = function (rule) {
      if (isString(rule)) {
        var redirect = rule;
        rule = function () {
          return redirect;
        };
      } else if (!isFunction(rule))
        throw new Error('\'rule\' must be a function');
      otherwise = rule;
      return this;
    };
    function handleIfMatch($injector, handler, match) {
      if (!match)
        return false;
      var result = $injector.invoke(handler, handler, { $match: match });
      return isDefined(result) ? result : true;
    }
    /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#when
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Registers a handler for a given url matching. if handle is a string, it is
   * treated as a redirect, and is interpolated according to the syntax of match
   * (i.e. like `String.replace()` for `RegExp`, or like a `UrlMatcher` pattern otherwise).
   *
   * If the handler is a function, it is injectable. It gets invoked if `$location`
   * matches. You have the option of inject the match object as `$match`.
   *
   * The handler can return
   *
   * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
   *   will continue trying to find another one that matches.
   * - **string** which is treated as a redirect and passed to `$location.url()`
   * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
   *     if ($state.$current.navigable !== state ||
   *         !equalForKeys($match, $stateParams) {
   *      $state.transitionTo(state, $match, false);
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {string|object} what The incoming path that you want to redirect.
   * @param {string|object} handler The path you want to redirect your user to.
   */
    this.when = function (what, handler) {
      var redirect, handlerIsString = isString(handler);
      if (isString(what))
        what = $urlMatcherFactory.compile(what);
      if (!handlerIsString && !isFunction(handler) && !isArray(handler))
        throw new Error('invalid \'handler\' in when()');
      var strategies = {
          matcher: function (what, handler) {
            if (handlerIsString) {
              redirect = $urlMatcherFactory.compile(handler);
              handler = [
                '$match',
                function ($match) {
                  return redirect.format($match);
                }
              ];
            }
            return extend(function ($injector, $location) {
              return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
            }, { prefix: isString(what.prefix) ? what.prefix : '' });
          },
          regex: function (what, handler) {
            if (what.global || what.sticky)
              throw new Error('when() RegExp must not be global or sticky');
            if (handlerIsString) {
              redirect = handler;
              handler = [
                '$match',
                function ($match) {
                  return interpolate(redirect, $match);
                }
              ];
            }
            return extend(function ($injector, $location) {
              return handleIfMatch($injector, handler, what.exec($location.path()));
            }, { prefix: regExpPrefix(what) });
          }
        };
      var check = {
          matcher: $urlMatcherFactory.isMatcher(what),
          regex: what instanceof RegExp
        };
      for (var n in check) {
        if (check[n])
          return this.rule(strategies[n](what, handler));
      }
      throw new Error('invalid \'what\' in when()');
    };
    /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#deferIntercept
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Disables (or enables) deferring location change interception.
   *
   * If you wish to customize the behavior of syncing the URL (for example, if you wish to
   * defer a transition but maintain the current URL), call this method at configuration time.
   * Then, at run time, call `$urlRouter.listen()` after you have configured your own
   * `$locationChangeSuccess` event handler.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *
   *   // Prevent $urlRouter from automatically intercepting URL changes;
   *   // this allows you to configure custom behavior in between
   *   // location changes and route synchronization:
   *   $urlRouterProvider.deferIntercept();
   *
   * }).run(function ($rootScope, $urlRouter, UserService) {
   *
   *   $rootScope.$on('$locationChangeSuccess', function(e) {
   *     // UserService is an example service for managing user state
   *     if (UserService.isLoggedIn()) return;
   *
   *     // Prevent $urlRouter's default handler from firing
   *     e.preventDefault();
   *
   *     UserService.handleLogin().then(function() {
   *       // Once the user has logged in, sync the current URL
   *       // to the router:
   *       $urlRouter.sync();
   *     });
   *   });
   *
   *   // Configures $urlRouter's listener *after* your custom listener
   *   $urlRouter.listen();
   * });
   * </pre>
   *
   * @param {boolean} defer Indicates whether to defer location change interception. Passing
            no parameter is equivalent to `true`.
   */
    this.deferIntercept = function (defer) {
      if (defer === undefined)
        defer = true;
      interceptDeferred = defer;
    };
    /**
   * @ngdoc object
   * @name ui.router.router.$urlRouter
   *
   * @requires $location
   * @requires $rootScope
   * @requires $injector
   * @requires $browser
   *
   * @description
   *
   */
    this.$get = $get;
    $get.$inject = [
      '$location',
      '$rootScope',
      '$injector',
      '$browser'
    ];
    function $get($location, $rootScope, $injector, $browser) {
      var baseHref = $browser.baseHref(), location = $location.url(), lastPushedUrl;
      function appendBasePath(url, isHtml5, absolute) {
        if (baseHref === '/')
          return url;
        if (isHtml5)
          return baseHref.slice(0, -1) + url;
        if (absolute)
          return baseHref.slice(1) + url;
        return url;
      }
      // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
      function update(evt) {
        if (evt && evt.defaultPrevented)
          return;
        var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
        lastPushedUrl = undefined;
        if (ignoreUpdate)
          return true;
        function check(rule) {
          var handled = rule($injector, $location);
          if (!handled)
            return false;
          if (isString(handled))
            $location.replace().url(handled);
          return true;
        }
        var n = rules.length, i;
        for (i = 0; i < n; i++) {
          if (check(rules[i]))
            return;
        }
        // always check otherwise last to allow dynamic updates to the set of rules
        if (otherwise)
          check(otherwise);
      }
      function listen() {
        listener = listener || $rootScope.$on('$locationChangeSuccess', update);
        return listener;
      }
      if (!interceptDeferred)
        listen();
      return {
        sync: function () {
          update();
        },
        listen: function () {
          return listen();
        },
        update: function (read) {
          if (read) {
            location = $location.url();
            return;
          }
          if ($location.url() === location)
            return;
          $location.url(location);
          $location.replace();
        },
        push: function (urlMatcher, params, options) {
          $location.url(urlMatcher.format(params || {}));
          lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;
          if (options && options.replace)
            $location.replace();
        },
        href: function (urlMatcher, params, options) {
          if (!urlMatcher.validates(params))
            return null;
          var isHtml5 = $locationProvider.html5Mode();
          if (angular.isObject(isHtml5)) {
            isHtml5 = isHtml5.enabled;
          }
          var url = urlMatcher.format(params);
          options = options || {};
          if (!isHtml5 && url !== null) {
            url = '#' + $locationProvider.hashPrefix() + url;
          }
          url = appendBasePath(url, isHtml5, options.absolute);
          if (!options.absolute || !url) {
            return url;
          }
          var slash = !isHtml5 && url ? '/' : '', port = $location.port();
          port = port === 80 || port === 443 ? '' : ':' + port;
          return [
            $location.protocol(),
            '://',
            $location.host(),
            port,
            slash,
            url
          ].join('');
        }
      };
    }
  }
  angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);
  /**
 * @ngdoc object
 * @name ui.router.state.$stateProvider
 *
 * @requires ui.router.router.$urlRouterProvider
 * @requires ui.router.util.$urlMatcherFactoryProvider
 *
 * @description
 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
 * on state.
 *
 * A state corresponds to a "place" in the application in terms of the overall UI and
 * navigation. A state describes (via the controller / template / view properties) what
 * the UI looks like and does at that place.
 *
 * States often have things in common, and the primary way of factoring out these
 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
 * nested states.
 *
 * The `$stateProvider` provides interfaces to declare these states for your app.
 */
  $StateProvider.$inject = [
    '$urlRouterProvider',
    '$urlMatcherFactoryProvider'
  ];
  function $StateProvider($urlRouterProvider, $urlMatcherFactory) {
    var root, states = {}, $state, queue = {}, abstractKey = 'abstract';
    // Builds state properties from definition passed to registerState()
    var stateBuilder = {
        parent: function (state) {
          if (isDefined(state.parent) && state.parent)
            return findState(state.parent);
          // regex matches any valid composite state name
          // would match "contact.list" but not "contacts"
          var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
          return compositeName ? findState(compositeName[1]) : root;
        },
        data: function (state) {
          if (state.parent && state.parent.data) {
            state.data = state.self.data = extend({}, state.parent.data, state.data);
          }
          return state.data;
        },
        url: function (state) {
          var url = state.url, config = { params: state.params || {} };
          if (isString(url)) {
            if (url.charAt(0) == '^')
              return $urlMatcherFactory.compile(url.substring(1), config);
            return (state.parent.navigable || root).url.concat(url, config);
          }
          if (!url || $urlMatcherFactory.isMatcher(url))
            return url;
          throw new Error('Invalid url \'' + url + '\' in state \'' + state + '\'');
        },
        navigable: function (state) {
          return state.url ? state : state.parent ? state.parent.navigable : null;
        },
        ownParams: function (state) {
          var params = state.url && state.url.params || new $$UMFP.ParamSet();
          forEach(state.params || {}, function (config, id) {
            if (!params[id])
              params[id] = new $$UMFP.Param(id, null, config, 'config');
          });
          return params;
        },
        params: function (state) {
          return state.parent && state.parent.params ? extend(state.parent.params.$$new(), state.ownParams) : new $$UMFP.ParamSet();
        },
        views: function (state) {
          var views = {};
          forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
            if (name.indexOf('@') < 0)
              name += '@' + state.parent.name;
            views[name] = view;
          });
          return views;
        },
        path: function (state) {
          return state.parent ? state.parent.path.concat(state) : [];  // exclude root from path
        },
        includes: function (state) {
          var includes = state.parent ? extend({}, state.parent.includes) : {};
          includes[state.name] = true;
          return includes;
        },
        $delegates: {}
      };
    function isRelative(stateName) {
      return stateName.indexOf('.') === 0 || stateName.indexOf('^') === 0;
    }
    function findState(stateOrName, base) {
      if (!stateOrName)
        return undefined;
      var isStr = isString(stateOrName), name = isStr ? stateOrName : stateOrName.name, path = isRelative(name);
      if (path) {
        if (!base)
          throw new Error('No reference point given for path \'' + name + '\'');
        base = findState(base);
        var rel = name.split('.'), i = 0, pathLength = rel.length, current = base;
        for (; i < pathLength; i++) {
          if (rel[i] === '' && i === 0) {
            current = base;
            continue;
          }
          if (rel[i] === '^') {
            if (!current.parent)
              throw new Error('Path \'' + name + '\' not valid for state \'' + base.name + '\'');
            current = current.parent;
            continue;
          }
          break;
        }
        rel = rel.slice(i).join('.');
        name = current.name + (current.name && rel ? '.' : '') + rel;
      }
      var state = states[name];
      if (state && (isStr || !isStr && (state === stateOrName || state.self === stateOrName))) {
        return state;
      }
      return undefined;
    }
    function queueState(parentName, state) {
      if (!queue[parentName]) {
        queue[parentName] = [];
      }
      queue[parentName].push(state);
    }
    function flushQueuedChildren(parentName) {
      var queued = queue[parentName] || [];
      while (queued.length) {
        registerState(queued.shift());
      }
    }
    function registerState(state) {
      // Wrap a new object around the state so we can store our private details easily.
      state = inherit(state, {
        self: state,
        resolve: state.resolve || {},
        toString: function () {
          return this.name;
        }
      });
      var name = state.name;
      if (!isString(name) || name.indexOf('@') >= 0)
        throw new Error('State must have a valid name');
      if (states.hasOwnProperty(name))
        throw new Error('State \'' + name + '\'\' is already defined');
      // Get parent name
      var parentName = name.indexOf('.') !== -1 ? name.substring(0, name.lastIndexOf('.')) : isString(state.parent) ? state.parent : isObject(state.parent) && isString(state.parent.name) ? state.parent.name : '';
      // If parent is not registered yet, add state to queue and register later
      if (parentName && !states[parentName]) {
        return queueState(parentName, state.self);
      }
      for (var key in stateBuilder) {
        if (isFunction(stateBuilder[key]))
          state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
      }
      states[name] = state;
      // Register the state in the global state list and with $urlRouter if necessary.
      if (!state[abstractKey] && state.url) {
        $urlRouterProvider.when(state.url, [
          '$match',
          '$stateParams',
          function ($match, $stateParams) {
            if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
              $state.transitionTo(state, $match, {
                inherit: true,
                location: false
              });
            }
          }
        ]);
      }
      // Register any queued children
      flushQueuedChildren(name);
      return state;
    }
    // Checks text to see if it looks like a glob.
    function isGlob(text) {
      return text.indexOf('*') > -1;
    }
    // Returns true if glob matches current $state name.
    function doesStateMatchGlob(glob) {
      var globSegments = glob.split('.'), segments = $state.$current.name.split('.');
      //match greedy starts
      if (globSegments[0] === '**') {
        segments = segments.slice(indexOf(segments, globSegments[1]));
        segments.unshift('**');
      }
      //match greedy ends
      if (globSegments[globSegments.length - 1] === '**') {
        segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
        segments.push('**');
      }
      if (globSegments.length != segments.length) {
        return false;
      }
      //match single stars
      for (var i = 0, l = globSegments.length; i < l; i++) {
        if (globSegments[i] === '*') {
          segments[i] = '*';
        }
      }
      return segments.join('') === globSegments.join('');
    }
    // Implicit root state that is always active
    root = registerState({
      name: '',
      url: '^',
      views: null,
      'abstract': true
    });
    root.navigable = null;
    /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#decorator
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Allows you to extend (carefully) or override (at your own peril) the 
   * `stateBuilder` object used internally by `$stateProvider`. This can be used 
   * to add custom functionality to ui-router, for example inferring templateUrl 
   * based on the state name.
   *
   * When passing only a name, it returns the current (original or decorated) builder
   * function that matches `name`.
   *
   * The builder functions that can be decorated are listed below. Though not all
   * necessarily have a good use case for decoration, that is up to you to decide.
   *
   * In addition, users can attach custom decorators, which will generate new 
   * properties within the state's internal definition. There is currently no clear 
   * use-case for this beyond accessing internal states (i.e. $state.$current), 
   * however, expect this to become increasingly relevant as we introduce additional 
   * meta-programming features.
   *
   * **Warning**: Decorators should not be interdependent because the order of 
   * execution of the builder functions in non-deterministic. Builder functions 
   * should only be dependent on the state definition object and super function.
   *
   *
   * Existing builder functions and current return values:
   *
   * - **parent** `{object}` - returns the parent state object.
   * - **data** `{object}` - returns state data, including any inherited data that is not
   *   overridden by own values (if any).
   * - **url** `{object}` - returns a {@link ui.router.util.type:UrlMatcher UrlMatcher}
   *   or `null`.
   * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is 
   *   navigable).
   * - **params** `{object}` - returns an array of state params that are ensured to 
   *   be a super-set of parent's params.
   * - **views** `{object}` - returns a views object where each key is an absolute view 
   *   name (i.e. "viewName@stateName") and each value is the config object 
   *   (template, controller) for the view. Even when you don't use the views object 
   *   explicitly on a state config, one is still created for you internally.
   *   So by decorating this builder function you have access to decorating template 
   *   and controller properties.
   * - **ownParams** `{object}` - returns an array of params that belong to the state, 
   *   not including any params defined by ancestor states.
   * - **path** `{string}` - returns the full path from the root down to this state. 
   *   Needed for state activation.
   * - **includes** `{object}` - returns an object that includes every state that 
   *   would pass a `$state.includes()` test.
   *
   * @example
   * <pre>
   * // Override the internal 'views' builder with a function that takes the state
   * // definition, and a reference to the internal function being overridden:
   * $stateProvider.decorator('views', function (state, parent) {
   *   var result = {},
   *       views = parent(state);
   *
   *   angular.forEach(views, function (config, name) {
   *     var autoName = (state.name + '.' + name).replace('.', '/');
   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
   *     result[name] = config;
   *   });
   *   return result;
   * });
   *
   * $stateProvider.state('home', {
   *   views: {
   *     'contact.list': { controller: 'ListController' },
   *     'contact.item': { controller: 'ItemController' }
   *   }
   * });
   *
   * // ...
   *
   * $state.go('home');
   * // Auto-populates list and item views with /partials/home/contact/list.html,
   * // and /partials/home/contact/item.html, respectively.
   * </pre>
   *
   * @param {string} name The name of the builder function to decorate. 
   * @param {object} func A function that is responsible for decorating the original 
   * builder function. The function receives two parameters:
   *
   *   - `{object}` - state - The state config object.
   *   - `{object}` - super - The original builder function.
   *
   * @return {object} $stateProvider - $stateProvider instance
   */
    this.decorator = decorator;
    function decorator(name, func) {
      /*jshint validthis: true */
      if (isString(name) && !isDefined(func)) {
        return stateBuilder[name];
      }
      if (!isFunction(func) || !isString(name)) {
        return this;
      }
      if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
        stateBuilder.$delegates[name] = stateBuilder[name];
      }
      stateBuilder[name] = func;
      return this;
    }
    /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#state
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Registers a state configuration under a given state name. The stateConfig object
   * has the following acceptable properties.
   *
   * @param {string} name A unique state name, e.g. "home", "about", "contacts".
   * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
   * @param {object} stateConfig State configuration object.
   * @param {string|function=} stateConfig.template
   * <a id='template'></a>
   *   html template as a string or a function that returns
   *   an html template as a string which should be used by the uiView directives. This property 
   *   takes precedence over templateUrl.
   *   
   *   If `template` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
   *     applying the current state
   *
   * <pre>template:
   *   "<h1>inline template definition</h1>" +
   *   "<div ui-view></div>"</pre>
   * <pre>template: function(params) {
   *       return "<h1>generated template</h1>"; }</pre>
   * </div>
   *
   * @param {string|function=} stateConfig.templateUrl
   * <a id='templateUrl'></a>
   *
   *   path or function that returns a path to an html
   *   template that should be used by uiView.
   *   
   *   If `templateUrl` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by 
   *     applying the current state
   *
   * <pre>templateUrl: "home.html"</pre>
   * <pre>templateUrl: function(params) {
   *     return myTemplates[params.pageId]; }</pre>
   *
   * @param {function=} stateConfig.templateProvider
   * <a id='templateProvider'></a>
   *    Provider function that returns HTML content string.
   * <pre> templateProvider:
   *       function(MyTemplateService, params) {
   *         return MyTemplateService.getTemplate(params.pageId);
   *       }</pre>
   *
   * @param {string|function=} stateConfig.controller
   * <a id='controller'></a>
   *
   *  Controller fn that should be associated with newly
   *   related scope or the name of a registered controller if passed as a string.
   *   Optionally, the ControllerAs may be declared here.
   * <pre>controller: "MyRegisteredController"</pre>
   * <pre>controller:
   *     "MyRegisteredController as fooCtrl"}</pre>
   * <pre>controller: function($scope, MyService) {
   *     $scope.data = MyService.getData(); }</pre>
   *
   * @param {function=} stateConfig.controllerProvider
   * <a id='controllerProvider'></a>
   *
   * Injectable provider function that returns the actual controller or string.
   * <pre>controllerProvider:
   *   function(MyResolveData) {
   *     if (MyResolveData.foo)
   *       return "FooCtrl"
   *     else if (MyResolveData.bar)
   *       return "BarCtrl";
   *     else return function($scope) {
   *       $scope.baz = "Qux";
   *     }
   *   }</pre>
   *
   * @param {string=} stateConfig.controllerAs
   * <a id='controllerAs'></a>
   * 
   * A controller alias name. If present the controller will be
   *   published to scope under the controllerAs name.
   * <pre>controllerAs: "myCtrl"</pre>
   *
   * @param {object=} stateConfig.resolve
   * <a id='resolve'></a>
   *
   * An optional map&lt;string, function&gt; of dependencies which
   *   should be injected into the controller. If any of these dependencies are promises, 
   *   the router will wait for them all to be resolved before the controller is instantiated.
   *   If all the promises are resolved successfully, the $stateChangeSuccess event is fired
   *   and the values of the resolved promises are injected into any controllers that reference them.
   *   If any  of the promises are rejected the $stateChangeError event is fired.
   *
   *   The map object is:
   *   
   *   - key - {string}: name of dependency to be injected into controller
   *   - factory - {string|function}: If string then it is alias for service. Otherwise if function, 
   *     it is injected and return value it treated as dependency. If result is a promise, it is 
   *     resolved before its value is injected into controller.
   *
   * <pre>resolve: {
   *     myResolve1:
   *       function($http, $stateParams) {
   *         return $http.get("/api/foos/"+stateParams.fooID);
   *       }
   *     }</pre>
   *
   * @param {string=} stateConfig.url
   * <a id='url'></a>
   *
   *   A url fragment with optional parameters. When a state is navigated or
   *   transitioned to, the `$stateParams` service will be populated with any 
   *   parameters that were passed.
   *
   * examples:
   * <pre>url: "/home"
   * url: "/users/:userid"
   * url: "/books/{bookid:[a-zA-Z_-]}"
   * url: "/books/{categoryid:int}"
   * url: "/books/{publishername:string}/{categoryid:int}"
   * url: "/messages?before&after"
   * url: "/messages?{before:date}&{after:date}"</pre>
   * url: "/messages/:mailboxid?{before:date}&{after:date}"
   *
   * @param {object=} stateConfig.views
   * <a id='views'></a>
   * an optional map&lt;string, object&gt; which defined multiple views, or targets views
   * manually/explicitly.
   *
   * Examples:
   *
   * Targets three named `ui-view`s in the parent state's template
   * <pre>views: {
   *     header: {
   *       controller: "headerCtrl",
   *       templateUrl: "header.html"
   *     }, body: {
   *       controller: "bodyCtrl",
   *       templateUrl: "body.html"
   *     }, footer: {
   *       controller: "footCtrl",
   *       templateUrl: "footer.html"
   *     }
   *   }</pre>
   *
   * Targets named `ui-view="header"` from grandparent state 'top''s template, and named `ui-view="body" from parent state's template.
   * <pre>views: {
   *     'header@top': {
   *       controller: "msgHeaderCtrl",
   *       templateUrl: "msgHeader.html"
   *     }, 'body': {
   *       controller: "messagesCtrl",
   *       templateUrl: "messages.html"
   *     }
   *   }</pre>
   *
   * @param {boolean=} [stateConfig.abstract=false]
   * <a id='abstract'></a>
   * An abstract state will never be directly activated,
   *   but can provide inherited properties to its common children states.
   * <pre>abstract: true</pre>
   *
   * @param {function=} stateConfig.onEnter
   * <a id='onEnter'></a>
   *
   * Callback function for when a state is entered. Good way
   *   to trigger an action or dispatch an event, such as opening a dialog.
   * If minifying your scripts, make sure to explictly annotate this function,
   * because it won't be automatically annotated by your build tools.
   *
   * <pre>onEnter: function(MyService, $stateParams) {
   *     MyService.foo($stateParams.myParam);
   * }</pre>
   *
   * @param {function=} stateConfig.onExit
   * <a id='onExit'></a>
   *
   * Callback function for when a state is exited. Good way to
   *   trigger an action or dispatch an event, such as opening a dialog.
   * If minifying your scripts, make sure to explictly annotate this function,
   * because it won't be automatically annotated by your build tools.
   *
   * <pre>onExit: function(MyService, $stateParams) {
   *     MyService.cleanup($stateParams.myParam);
   * }</pre>
   *
   * @param {boolean=} [stateConfig.reloadOnSearch=true]
   * <a id='reloadOnSearch'></a>
   *
   * If `false`, will not retrigger the same state
   *   just because a search/query parameter has changed (via $location.search() or $location.hash()). 
   *   Useful for when you'd like to modify $location.search() without triggering a reload.
   * <pre>reloadOnSearch: false</pre>
   *
   * @param {object=} stateConfig.data
   * <a id='data'></a>
   *
   * Arbitrary data object, useful for custom configuration.  The parent state's `data` is
   *   prototypally inherited.  In other words, adding a data property to a state adds it to
   *   the entire subtree via prototypal inheritance.
   *
   * <pre>data: {
   *     requiredRole: 'foo'
   * } </pre>
   *
   * @param {object=} stateConfig.params
   * <a id='params'></a>
   *
   * A map which optionally configures parameters declared in the `url`, or
   *   defines additional non-url parameters.  For each parameter being
   *   configured, add a configuration object keyed to the name of the parameter.
   *
   *   Each parameter configuration object may contain the following properties:
   *
   *   - ** value ** - {object|function=}: specifies the default value for this
   *     parameter.  This implicitly sets this parameter as optional.
   *
   *     When UI-Router routes to a state and no value is
   *     specified for this parameter in the URL or transition, the
   *     default value will be used instead.  If `value` is a function,
   *     it will be injected and invoked, and the return value used.
   *
   *     *Note*: `undefined` is treated as "no default value" while `null`
   *     is treated as "the default value is `null`".
   *
   *     *Shorthand*: If you only need to configure the default value of the
   *     parameter, you may use a shorthand syntax.   In the **`params`**
   *     map, instead mapping the param name to a full parameter configuration
   *     object, simply set map it to the default parameter value, e.g.:
   *
   * <pre>// define a parameter's default value
   * params: {
   *     param1: { value: "defaultValue" }
   * }
   * // shorthand default values
   * params: {
   *     param1: "defaultValue",
   *     param2: "param2Default"
   * }</pre>
   *
   *   - ** array ** - {boolean=}: *(default: false)* If true, the param value will be
   *     treated as an array of values.  If you specified a Type, the value will be
   *     treated as an array of the specified Type.  Note: query parameter values
   *     default to a special `"auto"` mode.
   *
   *     For query parameters in `"auto"` mode, if multiple  values for a single parameter
   *     are present in the URL (e.g.: `/foo?bar=1&bar=2&bar=3`) then the values
   *     are mapped to an array (e.g.: `{ foo: [ '1', '2', '3' ] }`).  However, if
   *     only one value is present (e.g.: `/foo?bar=1`) then the value is treated as single
   *     value (e.g.: `{ foo: '1' }`).
   *
   * <pre>params: {
   *     param1: { array: true }
   * }</pre>
   *
   *   - ** squash ** - {bool|string=}: `squash` configures how a default parameter value is represented in the URL when
   *     the current parameter value is the same as the default value. If `squash` is not set, it uses the
   *     configured default squash policy.
   *     (See {@link ui.router.util.$urlMatcherFactory#methods_defaultSquashPolicy `defaultSquashPolicy()`})
   *
   *   There are three squash settings:
   *
   *     - false: The parameter's default value is not squashed.  It is encoded and included in the URL
   *     - true: The parameter's default value is omitted from the URL.  If the parameter is preceeded and followed
   *       by slashes in the state's `url` declaration, then one of those slashes are omitted.
   *       This can allow for cleaner looking URLs.
   *     - `"<arbitrary string>"`: The parameter's default value is replaced with an arbitrary placeholder of  your choice.
   *
   * <pre>params: {
   *     param1: {
   *       value: "defaultId",
   *       squash: true
   * } }
   * // squash "defaultValue" to "~"
   * params: {
   *     param1: {
   *       value: "defaultValue",
   *       squash: "~"
   * } }
   * </pre>
   *
   *
   * @example
   * <pre>
   * // Some state name examples
   *
   * // stateName can be a single top-level name (must be unique).
   * $stateProvider.state("home", {});
   *
   * // Or it can be a nested state name. This state is a child of the
   * // above "home" state.
   * $stateProvider.state("home.newest", {});
   *
   * // Nest states as deeply as needed.
   * $stateProvider.state("home.newest.abc.xyz.inception", {});
   *
   * // state() returns $stateProvider, so you can chain state declarations.
   * $stateProvider
   *   .state("home", {})
   *   .state("about", {})
   *   .state("contacts", {});
   * </pre>
   *
   */
    this.state = state;
    function state(name, definition) {
      /*jshint validthis: true */
      if (isObject(name))
        definition = name;
      else
        definition.name = name;
      registerState(definition);
      return this;
    }
    /**
   * @ngdoc object
   * @name ui.router.state.$state
   *
   * @requires $rootScope
   * @requires $q
   * @requires ui.router.state.$view
   * @requires $injector
   * @requires ui.router.util.$resolve
   * @requires ui.router.state.$stateParams
   * @requires ui.router.router.$urlRouter
   *
   * @property {object} params A param object, e.g. {sectionId: section.id)}, that 
   * you'd like to test against the current active state.
   * @property {object} current A reference to the state's config object. However 
   * you passed it in. Useful for accessing custom data.
   * @property {object} transition Currently pending transition. A promise that'll 
   * resolve or reject.
   *
   * @description
   * `$state` service is responsible for representing states as well as transitioning
   * between them. It also provides interfaces to ask for current state or even states
   * you're coming from.
   */
    this.$get = $get;
    $get.$inject = [
      '$rootScope',
      '$q',
      '$view',
      '$injector',
      '$resolve',
      '$stateParams',
      '$urlRouter',
      '$location',
      '$urlMatcherFactory'
    ];
    function $get($rootScope, $q, $view, $injector, $resolve, $stateParams, $urlRouter, $location, $urlMatcherFactory) {
      var TransitionSuperseded = $q.reject(new Error('transition superseded'));
      var TransitionPrevented = $q.reject(new Error('transition prevented'));
      var TransitionAborted = $q.reject(new Error('transition aborted'));
      var TransitionFailed = $q.reject(new Error('transition failed'));
      // Handles the case where a state which is the target of a transition is not found, and the user
      // can optionally retry or defer the transition
      function handleRedirect(redirect, state, params, options) {
        /**
       * @ngdoc event
       * @name ui.router.state.$state#$stateNotFound
       * @eventOf ui.router.state.$state
       * @eventType broadcast on root scope
       * @description
       * Fired when a requested state **cannot be found** using the provided state name during transition.
       * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
       * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
       * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
       * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
       *
       * @param {Object} event Event object.
       * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
       * @param {State} fromState Current state object.
       * @param {Object} fromParams Current state params.
       *
       * @example
       *
       * <pre>
       * // somewhere, assume lazy.state has not been defined
       * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
       *
       * // somewhere else
       * $scope.$on('$stateNotFound',
       * function(event, unfoundState, fromState, fromParams){
       *     console.log(unfoundState.to); // "lazy.state"
       *     console.log(unfoundState.toParams); // {a:1, b:2}
       *     console.log(unfoundState.options); // {inherit:false} + default options
       * })
       * </pre>
       */
        var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params);
        if (evt.defaultPrevented) {
          $urlRouter.update();
          return TransitionAborted;
        }
        if (!evt.retry) {
          return null;
        }
        // Allow the handler to return a promise to defer state lookup retry
        if (options.$retry) {
          $urlRouter.update();
          return TransitionFailed;
        }
        var retryTransition = $state.transition = $q.when(evt.retry);
        retryTransition.then(function () {
          if (retryTransition !== $state.transition)
            return TransitionSuperseded;
          redirect.options.$retry = true;
          return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
        }, function () {
          return TransitionAborted;
        });
        $urlRouter.update();
        return retryTransition;
      }
      root.locals = {
        resolve: null,
        globals: { $stateParams: {} }
      };
      $state = {
        params: {},
        current: root.self,
        $current: root,
        transition: null
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#reload
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method that force reloads the current state. All resolves are re-resolved, events are not re-fired, 
     * and controllers reinstantiated (bug with controllers reinstantiating right now, fixing soon).
     *
     * @example
     * <pre>
     * var app angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     $state.reload();
     *   }
     * });
     * </pre>
     *
     * `reload()` is just an alias for:
     * <pre>
     * $state.transitionTo($state.current, $stateParams, { 
     *   reload: true, inherit: false, notify: true
     * });
     * </pre>
     *
     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
      $state.reload = function reload() {
        return $state.transitionTo($state.current, $stateParams, {
          reload: true,
          inherit: false,
          notify: true
        });
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#go
     * @methodOf ui.router.state.$state
     *
     * @description
     * Convenience method for transitioning to a new state. `$state.go` calls 
     * `$state.transitionTo` internally but automatically sets options to 
     * `{ location: true, inherit: true, relative: $state.$current, notify: true }`. 
     * This allows you to easily use an absolute or relative to path and specify 
     * only the parameters you'd like to update (while letting unspecified parameters 
     * inherit from the currently active ancestor states).
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.go('contact.detail');
     *   };
     * });
     * </pre>
     * <img src='../ngdoc_assets/StateGoExamples.png'/>
     *
     * @param {string} to Absolute state name or relative state path. Some examples:
     *
     * - `$state.go('contact.detail')` - will go to the `contact.detail` state
     * - `$state.go('^')` - will go to a parent state
     * - `$state.go('^.sibling')` - will go to a sibling state
     * - `$state.go('.child.grandchild')` - will go to grandchild state
     *
     * @param {object=} params A map of the parameters that will be sent to the state, 
     * will populate $stateParams. Any parameters that are not specified will be inherited from currently 
     * defined parameters. This allows, for example, going to a sibling state that shares parameters
     * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
     * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
     * will get you all current parameters, etc.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *
     * @returns {promise} A promise representing the state of the new transition.
     *
     * Possible success values:
     *
     * - $state.current
     *
     * <br/>Possible rejection values:
     *
     * - 'transition superseded' - when a newer transition has been started after this one
     * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
     * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
     *   when a `$stateNotFound` `event.retry` promise errors.
     * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
     * - *resolve error* - when an error has occurred with a `resolve`
     *
     */
      $state.go = function go(to, params, options) {
        return $state.transitionTo(to, params, extend({
          inherit: true,
          relative: $state.$current
        }, options));
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#transitionTo
     * @methodOf ui.router.state.$state
     *
     * @description
     * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
     * uses `transitionTo` internally. `$state.go` is recommended in most situations.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.transitionTo('contact.detail');
     *   };
     * });
     * </pre>
     *
     * @param {string} to State name.
     * @param {object=} toParams A map of the parameters that will be sent to the state,
     * will populate $stateParams.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *
     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
      $state.transitionTo = function transitionTo(to, toParams, options) {
        toParams = toParams || {};
        options = extend({
          location: true,
          inherit: false,
          relative: null,
          notify: true,
          reload: false,
          $retry: false
        }, options || {});
        var from = $state.$current, fromParams = $state.params, fromPath = from.path;
        var evt, toState = findState(to, options.relative);
        if (!isDefined(toState)) {
          var redirect = {
              to: to,
              toParams: toParams,
              options: options
            };
          var redirectResult = handleRedirect(redirect, from.self, fromParams, options);
          if (redirectResult) {
            return redirectResult;
          }
          // Always retry once if the $stateNotFound was not prevented
          // (handles either redirect changed or state lazy-definition)
          to = redirect.to;
          toParams = redirect.toParams;
          options = redirect.options;
          toState = findState(to, options.relative);
          if (!isDefined(toState)) {
            if (!options.relative)
              throw new Error('No such state \'' + to + '\'');
            throw new Error('Could not resolve \'' + to + '\' from state \'' + options.relative + '\'');
          }
        }
        if (toState[abstractKey])
          throw new Error('Cannot transition to abstract state \'' + to + '\'');
        if (options.inherit)
          toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
        if (!toState.params.$$validates(toParams))
          return TransitionFailed;
        toParams = toState.params.$$values(toParams);
        to = toState;
        var toPath = to.path;
        // Starting from the root of the path, keep all levels that haven't changed
        var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];
        if (!options.reload) {
          while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
            locals = toLocals[keep] = state.locals;
            keep++;
            state = toPath[keep];
          }
        }
        // If we're going to the same state and all locals are kept, we've got nothing to do.
        // But clear 'transition', as we still want to cancel any other pending transitions.
        // TODO: We may not want to bump 'transition' if we're called from a location change
        // that we've initiated ourselves, because we might accidentally abort a legitimate
        // transition initiated from code?
        if (shouldTriggerReload(to, from, locals, options)) {
          if (to.self.reloadOnSearch !== false)
            $urlRouter.update();
          $state.transition = null;
          return $q.when($state.current);
        }
        // Filter parameters before we pass them to event handlers etc.
        toParams = filterByKeys(to.params.$$keys(), toParams || {});
        // Broadcast start event and cancel the transition if requested
        if (options.notify) {
          /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeStart
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when the state transition **begins**. You can use `event.preventDefault()`
         * to prevent the transition from happening and then the transition promise will be
         * rejected with a `'transition prevented'` value.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         *
         * @example
         *
         * <pre>
         * $rootScope.$on('$stateChangeStart',
         * function(event, toState, toParams, fromState, fromParams){
         *     event.preventDefault();
         *     // transitionTo() promise will be rejected with
         *     // a 'transition prevented' error
         * })
         * </pre>
         */
          if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams).defaultPrevented) {
            $urlRouter.update();
            return TransitionPrevented;
          }
        }
        // Resolve locals for the remaining states, but don't update any global state just
        // yet -- if anything fails to resolve the current state needs to remain untouched.
        // We also set up an inheritance chain for the locals here. This allows the view directive
        // to quickly look up the correct definition for each view in the current state. Even
        // though we create the locals object itself outside resolveState(), it is initially
        // empty and gets filled asynchronously. We need to keep track of the promise for the
        // (fully resolved) current locals, and pass this down the chain.
        var resolved = $q.when(locals);
        for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
          locals = toLocals[l] = inherit(locals);
          resolved = resolveState(state, toParams, state === to, resolved, locals, options);
        }
        // Once everything is resolved, we are ready to perform the actual transition
        // and return a promise for the new state. We also keep track of what the
        // current promise is, so that we can detect overlapping transitions and
        // keep only the outcome of the last transition.
        var transition = $state.transition = resolved.then(function () {
            var l, entering, exiting;
            if ($state.transition !== transition)
              return TransitionSuperseded;
            // Exit 'from' states not kept
            for (l = fromPath.length - 1; l >= keep; l--) {
              exiting = fromPath[l];
              if (exiting.self.onExit) {
                $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
              }
              exiting.locals = null;
            }
            // Enter 'to' states not kept
            for (l = keep; l < toPath.length; l++) {
              entering = toPath[l];
              entering.locals = toLocals[l];
              if (entering.self.onEnter) {
                $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
              }
            }
            // Run it again, to catch any transitions in callbacks
            if ($state.transition !== transition)
              return TransitionSuperseded;
            // Update globals in $state
            $state.$current = to;
            $state.current = to.self;
            $state.params = toParams;
            copy($state.params, $stateParams);
            $state.transition = null;
            if (options.location && to.navigable) {
              $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
                $$avoidResync: true,
                replace: options.location === 'replace'
              });
            }
            if (options.notify) {
              /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeSuccess
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired once the state transition is **complete**.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         */
              $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
            }
            $urlRouter.update(true);
            return $state.current;
          }, function (error) {
            if ($state.transition !== transition)
              return TransitionSuperseded;
            $state.transition = null;
            /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeError
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when an **error occurs** during transition. It's important to note that if you
         * have any errors in your resolve functions (javascript errors, non-existent services, etc)
         * they will not throw traditionally. You must listen for this $stateChangeError event to
         * catch **ALL** errors.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         * @param {Error} error The resolve error object.
         */
            evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);
            if (!evt.defaultPrevented) {
              $urlRouter.update();
            }
            return $q.reject(error);
          });
        return transition;
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#is
     * @methodOf ui.router.state.$state
     *
     * @description
     * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
     * but only checks for the full state name. If params is supplied then it will be
     * tested for strict equality against the current active params object, so all params
     * must match with none missing and no extras.
     *
     * @example
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * // absolute name
     * $state.is('contact.details.item'); // returns true
     * $state.is(contactDetailItemStateObject); // returns true
     *
     * // relative name (. and ^), typically from a template
     * // E.g. from the 'contacts.details' template
     * <div ng-class="{highlighted: $state.is('.item')}">Item</div>
     * </pre>
     *
     * @param {string|object} stateOrName The state name (absolute or relative) or state object you'd like to check.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like
     * to test against the current active state.
     * @param {object=} options An options object.  The options are:
     *
     * - **`relative`** - {string|object} -  If `stateOrName` is a relative state name and `options.relative` is set, .is will
     * test relative to `options.relative` state (or name).
     *
     * @returns {boolean} Returns true if it is the state.
     */
      $state.is = function is(stateOrName, params, options) {
        options = extend({ relative: $state.$current }, options || {});
        var state = findState(stateOrName, options.relative);
        if (!isDefined(state)) {
          return undefined;
        }
        if ($state.$current !== state) {
          return false;
        }
        return params ? equalForKeys(state.params.$$values(params), $stateParams) : true;
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#includes
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method to determine if the current active state is equal to or is the child of the
     * state stateName. If any params are passed then they will be tested for a match as well.
     * Not all the parameters need to be passed, just the ones you'd like to test for equality.
     *
     * @example
     * Partial and relative names
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * // Using partial names
     * $state.includes("contacts"); // returns true
     * $state.includes("contacts.details"); // returns true
     * $state.includes("contacts.details.item"); // returns true
     * $state.includes("contacts.list"); // returns false
     * $state.includes("about"); // returns false
     *
     * // Using relative names (. and ^), typically from a template
     * // E.g. from the 'contacts.details' template
     * <div ng-class="{highlighted: $state.includes('.item')}">Item</div>
     * </pre>
     *
     * Basic globbing patterns
     * <pre>
     * $state.$current.name = 'contacts.details.item.url';
     *
     * $state.includes("*.details.*.*"); // returns true
     * $state.includes("*.details.**"); // returns true
     * $state.includes("**.item.**"); // returns true
     * $state.includes("*.details.item.url"); // returns true
     * $state.includes("*.details.*.url"); // returns true
     * $state.includes("*.details.*"); // returns false
     * $state.includes("item.**"); // returns false
     * </pre>
     *
     * @param {string} stateOrName A partial name, relative name, or glob pattern
     * to be searched for within the current state name.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`,
     * that you'd like to test against the current active state.
     * @param {object=} options An options object.  The options are:
     *
     * - **`relative`** - {string|object=} -  If `stateOrName` is a relative state reference and `options.relative` is set,
     * .includes will test relative to `options.relative` state (or name).
     *
     * @returns {boolean} Returns true if it does include the state
     */
      $state.includes = function includes(stateOrName, params, options) {
        options = extend({ relative: $state.$current }, options || {});
        if (isString(stateOrName) && isGlob(stateOrName)) {
          if (!doesStateMatchGlob(stateOrName)) {
            return false;
          }
          stateOrName = $state.$current.name;
        }
        var state = findState(stateOrName, options.relative);
        if (!isDefined(state)) {
          return undefined;
        }
        if (!isDefined($state.$current.includes[state.name])) {
          return false;
        }
        return params ? equalForKeys(state.params.$$values(params), $stateParams, objectKeys(params)) : true;
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#href
     * @methodOf ui.router.state.$state
     *
     * @description
     * A url generation method that returns the compiled url for the given state populated with the given params.
     *
     * @example
     * <pre>
     * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
     * </pre>
     *
     * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
     * @param {object=} params An object of parameter values to fill the state's required parameters.
     * @param {object=} options Options object. The options are:
     *
     * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
     *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
     *    ancestor with a valid url).
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
     * 
     * @returns {string} compiled state url
     */
      $state.href = function href(stateOrName, params, options) {
        options = extend({
          lossy: true,
          inherit: true,
          absolute: false,
          relative: $state.$current
        }, options || {});
        var state = findState(stateOrName, options.relative);
        if (!isDefined(state))
          return null;
        if (options.inherit)
          params = inheritParams($stateParams, params || {}, $state.$current, state);
        var nav = state && options.lossy ? state.navigable : state;
        if (!nav || nav.url === undefined || nav.url === null) {
          return null;
        }
        return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys(), params || {}), { absolute: options.absolute });
      };
      /**
     * @ngdoc function
     * @name ui.router.state.$state#get
     * @methodOf ui.router.state.$state
     *
     * @description
     * Returns the state configuration object for any specific state or all states.
     *
     * @param {string|object=} stateOrName (absolute or relative) If provided, will only get the config for
     * the requested state. If not provided, returns an array of ALL state configs.
     * @param {string|object=} context When stateOrName is a relative state reference, the state will be retrieved relative to context.
     * @returns {Object|Array} State configuration object or array of all objects.
     */
      $state.get = function (stateOrName, context) {
        if (arguments.length === 0)
          return map(objectKeys(states), function (name) {
            return states[name].self;
          });
        var state = findState(stateOrName, context || $state.$current);
        return state && state.self ? state.self : null;
      };
      function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
        // Make a restricted $stateParams with only the parameters that apply to this state if
        // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
        // we also need $stateParams to be available for any $injector calls we make during the
        // dependency resolution process.
        var $stateParams = paramsAreFiltered ? params : filterByKeys(state.params.$$keys(), params);
        var locals = { $stateParams: $stateParams };
        // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
        // We're also including $stateParams in this; that way the parameters are restricted
        // to the set that should be visible to the state, and are independent of when we update
        // the global $state and $stateParams values.
        dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
        var promises = [dst.resolve.then(function (globals) {
              dst.globals = globals;
            })];
        if (inherited)
          promises.push(inherited);
        // Resolve template and dependencies for all views.
        forEach(state.views, function (view, name) {
          var injectables = view.resolve && view.resolve !== state.resolve ? view.resolve : {};
          injectables.$template = [function () {
              return $view.load(name, {
                view: view,
                locals: locals,
                params: $stateParams,
                notify: options.notify
              }) || '';
            }];
          promises.push($resolve.resolve(injectables, locals, dst.resolve, state).then(function (result) {
            // References to the controller (only instantiated at link time)
            if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
              var injectLocals = angular.extend({}, injectables, locals);
              result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
            } else {
              result.$$controller = view.controller;
            }
            // Provide access to the state itself for internal use
            result.$$state = state;
            result.$$controllerAs = view.controllerAs;
            dst[name] = result;
          }));
        });
        // Wait for all the promises and then return the activation object
        return $q.all(promises).then(function (values) {
          return dst;
        });
      }
      return $state;
    }
    function shouldTriggerReload(to, from, locals, options) {
      if (to === from && (locals === from.locals && !options.reload || to.self.reloadOnSearch === false)) {
        return true;
      }
    }
  }
  angular.module('ui.router.state').value('$stateParams', {}).provider('$state', $StateProvider);
  $ViewProvider.$inject = [];
  function $ViewProvider() {
    this.$get = $get;
    /**
   * @ngdoc object
   * @name ui.router.state.$view
   *
   * @requires ui.router.util.$templateFactory
   * @requires $rootScope
   *
   * @description
   *
   */
    $get.$inject = [
      '$rootScope',
      '$templateFactory'
    ];
    function $get($rootScope, $templateFactory) {
      return {
        load: function load(name, options) {
          var result, defaults = {
              template: null,
              controller: null,
              view: null,
              locals: null,
              notify: true,
              async: true,
              params: {}
            };
          options = extend(defaults, options);
          if (options.view) {
            result = $templateFactory.fromConfig(options.view, options.params, options.locals);
          }
          if (result && options.notify) {
            /**
         * @ngdoc event
         * @name ui.router.state.$state#$viewContentLoading
         * @eventOf ui.router.state.$view
         * @eventType broadcast on root scope
         * @description
         *
         * Fired once the view **begins loading**, *before* the DOM is rendered.
         *
         * @param {Object} event Event object.
         * @param {Object} viewConfig The view config properties (template, controller, etc).
         *
         * @example
         *
         * <pre>
         * $scope.$on('$viewContentLoading',
         * function(event, viewConfig){
         *     // Access to all the view config properties.
         *     // and one special property 'targetView'
         *     // viewConfig.targetView
         * });
         * </pre>
         */
            $rootScope.$broadcast('$viewContentLoading', options);
          }
          return result;
        }
      };
    }
  }
  angular.module('ui.router.state').provider('$view', $ViewProvider);
  /**
 * @ngdoc object
 * @name ui.router.state.$uiViewScrollProvider
 *
 * @description
 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
 */
  function $ViewScrollProvider() {
    var useAnchorScroll = false;
    /**
   * @ngdoc function
   * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
   * @methodOf ui.router.state.$uiViewScrollProvider
   *
   * @description
   * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
   * scrolling based on the url anchor.
   */
    this.useAnchorScroll = function () {
      useAnchorScroll = true;
    };
    /**
   * @ngdoc object
   * @name ui.router.state.$uiViewScroll
   *
   * @requires $anchorScroll
   * @requires $timeout
   *
   * @description
   * When called with a jqLite element, it scrolls the element into view (after a
   * `$timeout` so the DOM has time to refresh).
   *
   * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
   * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
   */
    this.$get = [
      '$anchorScroll',
      '$timeout',
      function ($anchorScroll, $timeout) {
        if (useAnchorScroll) {
          return $anchorScroll;
        }
        return function ($element) {
          $timeout(function () {
            $element[0].scrollIntoView();
          }, 0, false);
        };
      }
    ];
  }
  angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-view
 *
 * @requires ui.router.state.$state
 * @requires $compile
 * @requires $controller
 * @requires $injector
 * @requires ui.router.state.$uiViewScroll
 * @requires $document
 *
 * @restrict ECA
 *
 * @description
 * The ui-view directive tells $state where to place your templates.
 *
 * @param {string=} name A view name. The name should be unique amongst the other views in the
 * same state. You can have views of the same name that live in different states.
 *
 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
 * scroll ui-view elements into view when they are populated during a state activation.
 *
 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
 *
 * @param {string=} onload Expression to evaluate whenever the view updates.
 * 
 * @example
 * A view can be unnamed or named. 
 * <pre>
 * <!-- Unnamed -->
 * <div ui-view></div> 
 * 
 * <!-- Named -->
 * <div ui-view="viewName"></div>
 * </pre>
 *
 * You can only have one unnamed view within any template (or root html). If you are only using a 
 * single view and it is unnamed then you can populate it like so:
 * <pre>
 * <div ui-view></div> 
 * $stateProvider.state("home", {
 *   template: "<h1>HELLO!</h1>"
 * })
 * </pre>
 * 
 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#views `views`}
 * config property, by name, in this case an empty name:
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 * 
 * But typically you'll only use the views property if you name your view or have more than one view 
 * in the same template. There's not really a compelling reason to name a view if its the only one, 
 * but you could if you wanted, like so:
 * <pre>
 * <div ui-view="main"></div>
 * </pre> 
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "main": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 * 
 * Really though, you'll use views to set up multiple views:
 * <pre>
 * <div ui-view></div>
 * <div ui-view="chart"></div> 
 * <div ui-view="data"></div> 
 * </pre>
 * 
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     },
 *     "chart": {
 *       template: "<chart_thing/>"
 *     },
 *     "data": {
 *       template: "<data_thing/>"
 *     }
 *   }    
 * })
 * </pre>
 *
 * Examples for `autoscroll`:
 *
 * <pre>
 * <!-- If autoscroll present with no expression,
 *      then scroll ui-view into view -->
 * <ui-view autoscroll/>
 *
 * <!-- If autoscroll present with valid expression,
 *      then scroll ui-view into view if expression evaluates to true -->
 * <ui-view autoscroll='true'/>
 * <ui-view autoscroll='false'/>
 * <ui-view autoscroll='scopeVariable'/>
 * </pre>
 */
  $ViewDirective.$inject = [
    '$state',
    '$injector',
    '$uiViewScroll',
    '$interpolate'
  ];
  function $ViewDirective($state, $injector, $uiViewScroll, $interpolate) {
    function getService() {
      return $injector.has ? function (service) {
        return $injector.has(service) ? $injector.get(service) : null;
      } : function (service) {
        try {
          return $injector.get(service);
        } catch (e) {
          return null;
        }
      };
    }
    var service = getService(), $animator = service('$animator'), $animate = service('$animate');
    // Returns a set of DOM manipulation functions based on which Angular version
    // it should use
    function getRenderer(attrs, scope) {
      var statics = function () {
        return {
          enter: function (element, target, cb) {
            target.after(element);
            cb();
          },
          leave: function (element, cb) {
            element.remove();
            cb();
          }
        };
      };
      if ($animate) {
        return {
          enter: function (element, target, cb) {
            var promise = $animate.enter(element, null, target, cb);
            if (promise && promise.then)
              promise.then(cb);
          },
          leave: function (element, cb) {
            var promise = $animate.leave(element, cb);
            if (promise && promise.then)
              promise.then(cb);
          }
        };
      }
      if ($animator) {
        var animate = $animator && $animator(scope, attrs);
        return {
          enter: function (element, target, cb) {
            animate.enter(element, null, target);
            cb();
          },
          leave: function (element, cb) {
            animate.leave(element);
            cb();
          }
        };
      }
      return statics();
    }
    var directive = {
        restrict: 'ECA',
        terminal: true,
        priority: 400,
        transclude: 'element',
        compile: function (tElement, tAttrs, $transclude) {
          return function (scope, $element, attrs) {
            var previousEl, currentEl, currentScope, latestLocals, onloadExp = attrs.onload || '', autoScrollExp = attrs.autoscroll, renderer = getRenderer(attrs, scope);
            scope.$on('$stateChangeSuccess', function () {
              updateView(false);
            });
            scope.$on('$viewContentLoading', function () {
              updateView(false);
            });
            updateView(true);
            function cleanupLastView() {
              if (previousEl) {
                previousEl.remove();
                previousEl = null;
              }
              if (currentScope) {
                currentScope.$destroy();
                currentScope = null;
              }
              if (currentEl) {
                renderer.leave(currentEl, function () {
                  previousEl = null;
                });
                previousEl = currentEl;
                currentEl = null;
              }
            }
            function updateView(firstTime) {
              var newScope, name = getUiViewName(scope, attrs, $element, $interpolate), previousLocals = name && $state.$current && $state.$current.locals[name];
              if (!firstTime && previousLocals === latestLocals)
                return;
              // nothing to do
              newScope = scope.$new();
              latestLocals = $state.$current.locals[name];
              var clone = $transclude(newScope, function (clone) {
                  renderer.enter(clone, $element, function onUiViewEnter() {
                    if (currentScope) {
                      currentScope.$emit('$viewContentAnimationEnded');
                    }
                    if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                      $uiViewScroll(clone);
                    }
                  });
                  cleanupLastView();
                });
              currentEl = clone;
              currentScope = newScope;
              /**
           * @ngdoc event
           * @name ui.router.state.directive:ui-view#$viewContentLoaded
           * @eventOf ui.router.state.directive:ui-view
           * @eventType emits on ui-view directive scope
           * @description           *
           * Fired once the view is **loaded**, *after* the DOM is rendered.
           *
           * @param {Object} event Event object.
           */
              currentScope.$emit('$viewContentLoaded');
              currentScope.$eval(onloadExp);
            }
          };
        }
      };
    return directive;
  }
  $ViewDirectiveFill.$inject = [
    '$compile',
    '$controller',
    '$state',
    '$interpolate'
  ];
  function $ViewDirectiveFill($compile, $controller, $state, $interpolate) {
    return {
      restrict: 'ECA',
      priority: -400,
      compile: function (tElement) {
        var initial = tElement.html();
        return function (scope, $element, attrs) {
          var current = $state.$current, name = getUiViewName(scope, attrs, $element, $interpolate), locals = current && current.locals[name];
          if (!locals) {
            return;
          }
          $element.data('$uiView', {
            name: name,
            state: locals.$$state
          });
          $element.html(locals.$template ? locals.$template : initial);
          var link = $compile($element.contents());
          if (locals.$$controller) {
            locals.$scope = scope;
            var controller = $controller(locals.$$controller, locals);
            if (locals.$$controllerAs) {
              scope[locals.$$controllerAs] = controller;
            }
            $element.data('$ngControllerController', controller);
            $element.children().data('$ngControllerController', controller);
          }
          link(scope);
        };
      }
    };
  }
  /**
 * Shared ui-view code for both directives:
 * Given scope, element, and its attributes, return the view's name
 */
  function getUiViewName(scope, attrs, element, $interpolate) {
    var name = $interpolate(attrs.uiView || attrs.name || '')(scope);
    var inherited = element.inheritedData('$uiView');
    return name.indexOf('@') >= 0 ? name : name + '@' + (inherited ? inherited.state.name : '');
  }
  angular.module('ui.router.state').directive('uiView', $ViewDirective);
  angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);
  function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed)
      ref = current + '(' + preparsed[1] + ')';
    parsed = ref.replace(/\n/g, ' ').match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4)
      throw new Error('Invalid state ref \'' + ref + '\'');
    return {
      state: parsed[1],
      paramExpr: parsed[3] || null
    };
  }
  function stateContext(el) {
    var stateData = el.parent().inheritedData('$uiView');
    if (stateData && stateData.state && stateData.state.name) {
      return stateData.state;
    }
  }
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref
 *
 * @requires ui.router.state.$state
 * @requires $timeout
 *
 * @restrict A
 *
 * @description
 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated 
 * URL, the directive will automatically generate & update the `href` attribute via 
 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking 
 * the link will trigger a state transition with optional parameters. 
 *
 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be 
 * handled natively by the browser.
 *
 * You can also use relative state paths within ui-sref, just like the relative 
 * paths passed to `$state.go()`. You just need to be aware that the path is relative
 * to the state that the link lives in, in other words the state that loaded the 
 * template containing the link.
 *
 * You can specify options to pass to {@link ui.router.state.$state#go $state.go()}
 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
 * and `reload`.
 *
 * @example
 * Here's an example of how you'd use ui-sref and how it would compile. If you have the 
 * following template:
 * <pre>
 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
 * 
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
 *     </li>
 * </ul>
 * </pre>
 * 
 * Then the compiled html would be (assuming Html5Mode is off and current state is contacts):
 * <pre>
 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a> | <a href="#/contacts?page=2" ui-sref="{page: 2}">Next page</a>
 * 
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
 *     </li>
 * </ul>
 *
 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
 * </pre>
 *
 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#go $state.go()}
 */
  $StateRefDirective.$inject = [
    '$state',
    '$timeout'
  ];
  function $StateRefDirective($state, $timeout) {
    var allowedOptions = [
        'location',
        'inherit',
        'reload'
      ];
    return {
      restrict: 'A',
      require: [
        '?^uiSrefActive',
        '?^uiSrefActiveEq'
      ],
      link: function (scope, element, attrs, uiSrefActive) {
        var ref = parseStateRef(attrs.uiSref, $state.current.name);
        var params = null, url = null, base = stateContext(element) || $state.$current;
        var newHref = null, isAnchor = element.prop('tagName') === 'A';
        var isForm = element[0].nodeName === 'FORM';
        var attr = isForm ? 'action' : 'href', nav = true;
        var options = {
            relative: base,
            inherit: true
          };
        var optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};
        angular.forEach(allowedOptions, function (option) {
          if (option in optionsOverride) {
            options[option] = optionsOverride[option];
          }
        });
        var update = function (newVal) {
          if (newVal)
            params = angular.copy(newVal);
          if (!nav)
            return;
          newHref = $state.href(ref.state, params, options);
          var activeDirective = uiSrefActive[1] || uiSrefActive[0];
          if (activeDirective) {
            activeDirective.$$setStateInfo(ref.state, params);
          }
          if (newHref === null) {
            nav = false;
            return false;
          }
          attrs.$set(attr, newHref);
        };
        if (ref.paramExpr) {
          scope.$watch(ref.paramExpr, function (newVal, oldVal) {
            if (newVal !== params)
              update(newVal);
          }, true);
          params = angular.copy(scope.$eval(ref.paramExpr));
        }
        update();
        if (isForm)
          return;
        element.bind('click', function (e) {
          var button = e.which || e.button;
          if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target'))) {
            // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
            var transition = $timeout(function () {
                $state.go(ref.state, params, options);
              });
            e.preventDefault();
            // if the state has no URL, ignore one preventDefault from the <a> directive.
            var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
            e.preventDefault = function () {
              if (ignorePreventDefaultCount-- <= 0)
                $timeout.cancel(transition);
            };
          }
        });
      }
    };
  }
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * A directive working alongside ui-sref to add classes to an element when the
 * related ui-sref directive's state is active, and removing them when it is inactive.
 * The primary use-case is to simplify the special appearance of navigation menus
 * relying on `ui-sref`, by having the "active" state's menu button appear different,
 * distinguishing it from the inactive menu items.
 *
 * ui-sref-active can live on the same element as ui-sref or on a parent element. The first
 * ui-sref-active found at the same level or above the ui-sref will be used.
 *
 * Will activate when the ui-sref's target state or any child state is active. If you
 * need to activate only when the ui-sref target state is active and *not* any of
 * it's children, then you will use
 * {@link ui.router.state.directive:ui-sref-active-eq ui-sref-active-eq}
 *
 * @example
 * Given the following template:
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item">
 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 *
 * When the app state is "app.user" (or any children states), and contains the state parameter "user" with value "bilbobaggins",
 * the resulting HTML will appear as (note the 'active' class):
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item active">
 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 * The class name is interpolated **once** during the directives link time (any further changes to the
 * interpolated value are ignored).
 *
 * Multiple classes may be specified in a space-separated format:
 * <pre>
 * <ul>
 *   <li ui-sref-active='class1 class2 class3'>
 *     <a ui-sref="app.user">link</a>
 *   </li>
 * </ul>
 * </pre>
 */
  /**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active-eq
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * The same as {@link ui.router.state.directive:ui-sref-active ui-sref-active} but will only activate
 * when the exact target state used in the `ui-sref` is active; no child states.
 *
 */
  $StateRefActiveDirective.$inject = [
    '$state',
    '$stateParams',
    '$interpolate'
  ];
  function $StateRefActiveDirective($state, $stateParams, $interpolate) {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        '$element',
        '$attrs',
        function ($scope, $element, $attrs) {
          var state, params, activeClass;
          // There probably isn't much point in $observing this
          // uiSrefActive and uiSrefActiveEq share the same directive object with some
          // slight difference in logic routing
          activeClass = $interpolate($attrs.uiSrefActiveEq || $attrs.uiSrefActive || '', false)($scope);
          // Allow uiSref to communicate with uiSrefActive[Equals]
          this.$$setStateInfo = function (newState, newParams) {
            state = $state.get(newState, stateContext($element));
            params = newParams;
            update();
          };
          $scope.$on('$stateChangeSuccess', update);
          // Update route state
          function update() {
            if (isMatch()) {
              $element.addClass(activeClass);
            } else {
              $element.removeClass(activeClass);
            }
          }
          function isMatch() {
            if (typeof $attrs.uiSrefActiveEq !== 'undefined') {
              return state && $state.is(state.name, params);
            } else {
              return state && $state.includes(state.name, params);
            }
          }
        }
      ]
    };
  }
  angular.module('ui.router.state').directive('uiSref', $StateRefDirective).directive('uiSrefActive', $StateRefActiveDirective).directive('uiSrefActiveEq', $StateRefActiveDirective);
  /**
 * @ngdoc filter
 * @name ui.router.state.filter:isState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
 */
  $IsStateFilter.$inject = ['$state'];
  function $IsStateFilter($state) {
    var isFilter = function (state) {
      return $state.is(state);
    };
    isFilter.$stateful = true;
    return isFilter;
  }
  /**
 * @ngdoc filter
 * @name ui.router.state.filter:includedByState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
 */
  $IncludedByStateFilter.$inject = ['$state'];
  function $IncludedByStateFilter($state) {
    var includesFilter = function (state) {
      return $state.includes(state);
    };
    includesFilter.$stateful = true;
    return includesFilter;
  }
  angular.module('ui.router.state').filter('isState', $IsStateFilter).filter('includedByState', $IncludedByStateFilter);
}(window, window.angular));
/*! ngStorage 0.3.0 | Copyright (c) 2013 Gias Kay Lee | MIT License */
'use strict';
!function () {
  function a(a) {
    return [
      '$rootScope',
      '$window',
      function (b, c) {
        for (var d, e, f, g = c[a] || (console.warn('This browser does not support Web Storage!'), {}), h = {
              $default: function (a) {
                for (var b in a)
                  angular.isDefined(h[b]) || (h[b] = a[b]);
                return h;
              },
              $reset: function (a) {
                for (var b in h)
                  '$' === b[0] || delete h[b];
                return h.$default(a);
              }
            }, i = 0; i < g.length; i++)
          (f = g.key(i)) && 'ngStorage-' === f.slice(0, 10) && (h[f.slice(10)] = angular.fromJson(g.getItem(f)));
        return d = angular.copy(h), b.$watch(function () {
          e || (e = setTimeout(function () {
            if (e = null, !angular.equals(h, d)) {
              angular.forEach(h, function (a, b) {
                angular.isDefined(a) && '$' !== b[0] && g.setItem('ngStorage-' + b, angular.toJson(a)), delete d[b];
              });
              for (var a in d)
                g.removeItem('ngStorage-' + a);
              d = angular.copy(h);
            }
          }, 100));
        }), 'localStorage' === a && c.addEventListener && c.addEventListener('storage', function (a) {
          'ngStorage-' === a.key.slice(0, 10) && (a.newValue ? h[a.key.slice(10)] = angular.fromJson(a.newValue) : delete h[a.key.slice(10)], d = angular.copy(h), b.$apply());
        }), h;
      }
    ];
  }
  angular.module('ngStorage', []).factory('$localStorage', a('localStorage')).factory('$sessionStorage', a('sessionStorage'));
}();
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.12.1 - 2015-02-20
 * License: MIT
 */
angular.module('ui.bootstrap', [
  'ui.bootstrap.tpls',
  'ui.bootstrap.transition',
  'ui.bootstrap.collapse',
  'ui.bootstrap.accordion',
  'ui.bootstrap.alert',
  'ui.bootstrap.bindHtml',
  'ui.bootstrap.buttons',
  'ui.bootstrap.carousel',
  'ui.bootstrap.dateparser',
  'ui.bootstrap.position',
  'ui.bootstrap.datepicker',
  'ui.bootstrap.dropdown',
  'ui.bootstrap.modal',
  'ui.bootstrap.pagination',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.popover',
  'ui.bootstrap.progressbar',
  'ui.bootstrap.rating',
  'ui.bootstrap.tabs',
  'ui.bootstrap.timepicker',
  'ui.bootstrap.typeahead'
]), angular.module('ui.bootstrap.tpls', [
  'template/accordion/accordion-group.html',
  'template/accordion/accordion.html',
  'template/alert/alert.html',
  'template/carousel/carousel.html',
  'template/carousel/slide.html',
  'template/datepicker/datepicker.html',
  'template/datepicker/day.html',
  'template/datepicker/month.html',
  'template/datepicker/popup.html',
  'template/datepicker/year.html',
  'template/modal/backdrop.html',
  'template/modal/window.html',
  'template/pagination/pager.html',
  'template/pagination/pagination.html',
  'template/tooltip/tooltip-html-unsafe-popup.html',
  'template/tooltip/tooltip-popup.html',
  'template/popover/popover.html',
  'template/progressbar/bar.html',
  'template/progressbar/progress.html',
  'template/progressbar/progressbar.html',
  'template/rating/rating.html',
  'template/tabs/tab.html',
  'template/tabs/tabset.html',
  'template/timepicker/timepicker.html',
  'template/typeahead/typeahead-match.html',
  'template/typeahead/typeahead-popup.html'
]), angular.module('ui.bootstrap.transition', []).factory('$transition', [
  '$q',
  '$timeout',
  '$rootScope',
  function (a, b, c) {
    function d(a) {
      for (var b in a)
        if (void 0 !== f.style[b])
          return a[b];
    }
    var e = function (d, f, g) {
        g = g || {};
        var h = a.defer(), i = e[g.animation ? 'animationEndEventName' : 'transitionEndEventName'], j = function () {
            c.$apply(function () {
              d.unbind(i, j), h.resolve(d);
            });
          };
        return i && d.bind(i, j), b(function () {
          angular.isString(f) ? d.addClass(f) : angular.isFunction(f) ? f(d) : angular.isObject(f) && d.css(f), i || h.resolve(d);
        }), h.promise.cancel = function () {
          i && d.unbind(i, j), h.reject('Transition cancelled');
        }, h.promise;
      }, f = document.createElement('trans'), g = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd',
        transition: 'transitionend'
      }, h = {
        WebkitTransition: 'webkitAnimationEnd',
        MozTransition: 'animationend',
        OTransition: 'oAnimationEnd',
        transition: 'animationend'
      };
    return e.transitionEndEventName = d(g), e.animationEndEventName = d(h), e;
  }
]), angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition']).directive('collapse', [
  '$transition',
  function (a) {
    return {
      link: function (b, c, d) {
        function e(b) {
          function d() {
            j === e && (j = void 0);
          }
          var e = a(c, b);
          return j && j.cancel(), j = e, e.then(d, d), e;
        }
        function f() {
          k ? (k = !1, g()) : (c.removeClass('collapse').addClass('collapsing'), e({ height: c[0].scrollHeight + 'px' }).then(g));
        }
        function g() {
          c.removeClass('collapsing'), c.addClass('collapse in'), c.css({ height: 'auto' });
        }
        function h() {
          if (k)
            k = !1, i(), c.css({ height: 0 });
          else {
            c.css({ height: c[0].scrollHeight + 'px' });
            {
              c[0].offsetWidth;
            }
            c.removeClass('collapse in').addClass('collapsing'), e({ height: 0 }).then(i);
          }
        }
        function i() {
          c.removeClass('collapsing'), c.addClass('collapse');
        }
        var j, k = !0;
        b.$watch(d.collapse, function (a) {
          a ? h() : f();
        });
      }
    };
  }
]), angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse']).constant('accordionConfig', { closeOthers: !0 }).controller('AccordionController', [
  '$scope',
  '$attrs',
  'accordionConfig',
  function (a, b, c) {
    this.groups = [], this.closeOthers = function (d) {
      var e = angular.isDefined(b.closeOthers) ? a.$eval(b.closeOthers) : c.closeOthers;
      e && angular.forEach(this.groups, function (a) {
        a !== d && (a.isOpen = !1);
      });
    }, this.addGroup = function (a) {
      var b = this;
      this.groups.push(a), a.$on('$destroy', function () {
        b.removeGroup(a);
      });
    }, this.removeGroup = function (a) {
      var b = this.groups.indexOf(a);
      -1 !== b && this.groups.splice(b, 1);
    };
  }
]).directive('accordion', function () {
  return {
    restrict: 'EA',
    controller: 'AccordionController',
    transclude: !0,
    replace: !1,
    templateUrl: 'template/accordion/accordion.html'
  };
}).directive('accordionGroup', function () {
  return {
    require: '^accordion',
    restrict: 'EA',
    transclude: !0,
    replace: !0,
    templateUrl: 'template/accordion/accordion-group.html',
    scope: {
      heading: '@',
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function () {
      this.setHeading = function (a) {
        this.heading = a;
      };
    },
    link: function (a, b, c, d) {
      d.addGroup(a), a.$watch('isOpen', function (b) {
        b && d.closeOthers(a);
      }), a.toggleOpen = function () {
        a.isDisabled || (a.isOpen = !a.isOpen);
      };
    }
  };
}).directive('accordionHeading', function () {
  return {
    restrict: 'EA',
    transclude: !0,
    template: '',
    replace: !0,
    require: '^accordionGroup',
    link: function (a, b, c, d, e) {
      d.setHeading(e(a, function () {
      }));
    }
  };
}).directive('accordionTransclude', function () {
  return {
    require: '^accordionGroup',
    link: function (a, b, c, d) {
      a.$watch(function () {
        return d[c.accordionTransclude];
      }, function (a) {
        a && (b.html(''), b.append(a));
      });
    }
  };
}), angular.module('ui.bootstrap.alert', []).controller('AlertController', [
  '$scope',
  '$attrs',
  function (a, b) {
    a.closeable = 'close' in b, this.close = a.close;
  }
]).directive('alert', function () {
  return {
    restrict: 'EA',
    controller: 'AlertController',
    templateUrl: 'template/alert/alert.html',
    transclude: !0,
    replace: !0,
    scope: {
      type: '@',
      close: '&'
    }
  };
}).directive('dismissOnTimeout', [
  '$timeout',
  function (a) {
    return {
      require: 'alert',
      link: function (b, c, d, e) {
        a(function () {
          e.close();
        }, parseInt(d.dismissOnTimeout, 10));
      }
    };
  }
]), angular.module('ui.bootstrap.bindHtml', []).directive('bindHtmlUnsafe', function () {
  return function (a, b, c) {
    b.addClass('ng-binding').data('$binding', c.bindHtmlUnsafe), a.$watch(c.bindHtmlUnsafe, function (a) {
      b.html(a || '');
    });
  };
}), angular.module('ui.bootstrap.buttons', []).constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
}).controller('ButtonsController', [
  'buttonConfig',
  function (a) {
    this.activeClass = a.activeClass || 'active', this.toggleEvent = a.toggleEvent || 'click';
  }
]).directive('btnRadio', function () {
  return {
    require: [
      'btnRadio',
      'ngModel'
    ],
    controller: 'ButtonsController',
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f.$render = function () {
        b.toggleClass(e.activeClass, angular.equals(f.$modelValue, a.$eval(c.btnRadio)));
      }, b.bind(e.toggleEvent, function () {
        var d = b.hasClass(e.activeClass);
        (!d || angular.isDefined(c.uncheckable)) && a.$apply(function () {
          f.$setViewValue(d ? null : a.$eval(c.btnRadio)), f.$render();
        });
      });
    }
  };
}).directive('btnCheckbox', function () {
  return {
    require: [
      'btnCheckbox',
      'ngModel'
    ],
    controller: 'ButtonsController',
    link: function (a, b, c, d) {
      function e() {
        return g(c.btnCheckboxTrue, !0);
      }
      function f() {
        return g(c.btnCheckboxFalse, !1);
      }
      function g(b, c) {
        var d = a.$eval(b);
        return angular.isDefined(d) ? d : c;
      }
      var h = d[0], i = d[1];
      i.$render = function () {
        b.toggleClass(h.activeClass, angular.equals(i.$modelValue, e()));
      }, b.bind(h.toggleEvent, function () {
        a.$apply(function () {
          i.$setViewValue(b.hasClass(h.activeClass) ? f() : e()), i.$render();
        });
      });
    }
  };
}), angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']).controller('CarouselController', [
  '$scope',
  '$timeout',
  '$interval',
  '$transition',
  function (a, b, c, d) {
    function e() {
      f();
      var b = +a.interval;
      !isNaN(b) && b > 0 && (h = c(g, b));
    }
    function f() {
      h && (c.cancel(h), h = null);
    }
    function g() {
      var b = +a.interval;
      i && !isNaN(b) && b > 0 ? a.next() : a.pause();
    }
    var h, i, j = this, k = j.slides = a.slides = [], l = -1;
    j.currentSlide = null;
    var m = !1;
    j.select = a.select = function (c, f) {
      function g() {
        if (!m) {
          if (j.currentSlide && angular.isString(f) && !a.noTransition && c.$element) {
            c.$element.addClass(f);
            {
              c.$element[0].offsetWidth;
            }
            angular.forEach(k, function (a) {
              angular.extend(a, {
                direction: '',
                entering: !1,
                leaving: !1,
                active: !1
              });
            }), angular.extend(c, {
              direction: f,
              active: !0,
              entering: !0
            }), angular.extend(j.currentSlide || {}, {
              direction: f,
              leaving: !0
            }), a.$currentTransition = d(c.$element, {}), function (b, c) {
              a.$currentTransition.then(function () {
                h(b, c);
              }, function () {
                h(b, c);
              });
            }(c, j.currentSlide);
          } else
            h(c, j.currentSlide);
          j.currentSlide = c, l = i, e();
        }
      }
      function h(b, c) {
        angular.extend(b, {
          direction: '',
          active: !0,
          leaving: !1,
          entering: !1
        }), angular.extend(c || {}, {
          direction: '',
          active: !1,
          leaving: !1,
          entering: !1
        }), a.$currentTransition = null;
      }
      var i = k.indexOf(c);
      void 0 === f && (f = i > l ? 'next' : 'prev'), c && c !== j.currentSlide && (a.$currentTransition ? (a.$currentTransition.cancel(), b(g)) : g());
    }, a.$on('$destroy', function () {
      m = !0;
    }), j.indexOfSlide = function (a) {
      return k.indexOf(a);
    }, a.next = function () {
      var b = (l + 1) % k.length;
      return a.$currentTransition ? void 0 : j.select(k[b], 'next');
    }, a.prev = function () {
      var b = 0 > l - 1 ? k.length - 1 : l - 1;
      return a.$currentTransition ? void 0 : j.select(k[b], 'prev');
    }, a.isActive = function (a) {
      return j.currentSlide === a;
    }, a.$watch('interval', e), a.$on('$destroy', f), a.play = function () {
      i || (i = !0, e());
    }, a.pause = function () {
      a.noPause || (i = !1, f());
    }, j.addSlide = function (b, c) {
      b.$element = c, k.push(b), 1 === k.length || b.active ? (j.select(k[k.length - 1]), 1 == k.length && a.play()) : b.active = !1;
    }, j.removeSlide = function (a) {
      var b = k.indexOf(a);
      k.splice(b, 1), k.length > 0 && a.active ? j.select(b >= k.length ? k[b - 1] : k[b]) : l > b && l--;
    };
  }
]).directive('carousel', [function () {
    return {
      restrict: 'EA',
      transclude: !0,
      replace: !0,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }]).directive('slide', function () {
  return {
    require: '^carousel',
    restrict: 'EA',
    transclude: !0,
    replace: !0,
    templateUrl: 'template/carousel/slide.html',
    scope: { active: '=?' },
    link: function (a, b, c, d) {
      d.addSlide(a, b), a.$on('$destroy', function () {
        d.removeSlide(a);
      }), a.$watch('active', function (b) {
        b && d.select(a);
      });
    }
  };
}), angular.module('ui.bootstrap.dateparser', []).service('dateParser', [
  '$locale',
  'orderByFilter',
  function (a, b) {
    function c(a) {
      var c = [], d = a.split('');
      return angular.forEach(e, function (b, e) {
        var f = a.indexOf(e);
        if (f > -1) {
          a = a.split(''), d[f] = '(' + b.regex + ')', a[f] = '$';
          for (var g = f + 1, h = f + e.length; h > g; g++)
            d[g] = '', a[g] = '$';
          a = a.join(''), c.push({
            index: f,
            apply: b.apply
          });
        }
      }), {
        regex: new RegExp('^' + d.join('') + '$'),
        map: b(c, 'index')
      };
    }
    function d(a, b, c) {
      return 1 === b && c > 28 ? 29 === c && (a % 4 === 0 && a % 100 !== 0 || a % 400 === 0) : 3 === b || 5 === b || 8 === b || 10 === b ? 31 > c : !0;
    }
    this.parsers = {};
    var e = {
        yyyy: {
          regex: '\\d{4}',
          apply: function (a) {
            this.year = +a;
          }
        },
        yy: {
          regex: '\\d{2}',
          apply: function (a) {
            this.year = +a + 2000;
          }
        },
        y: {
          regex: '\\d{1,4}',
          apply: function (a) {
            this.year = +a;
          }
        },
        MMMM: {
          regex: a.DATETIME_FORMATS.MONTH.join('|'),
          apply: function (b) {
            this.month = a.DATETIME_FORMATS.MONTH.indexOf(b);
          }
        },
        MMM: {
          regex: a.DATETIME_FORMATS.SHORTMONTH.join('|'),
          apply: function (b) {
            this.month = a.DATETIME_FORMATS.SHORTMONTH.indexOf(b);
          }
        },
        MM: {
          regex: '0[1-9]|1[0-2]',
          apply: function (a) {
            this.month = a - 1;
          }
        },
        M: {
          regex: '[1-9]|1[0-2]',
          apply: function (a) {
            this.month = a - 1;
          }
        },
        dd: {
          regex: '[0-2][0-9]{1}|3[0-1]{1}',
          apply: function (a) {
            this.date = +a;
          }
        },
        d: {
          regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
          apply: function (a) {
            this.date = +a;
          }
        },
        EEEE: { regex: a.DATETIME_FORMATS.DAY.join('|') },
        EEE: { regex: a.DATETIME_FORMATS.SHORTDAY.join('|') }
      };
    this.parse = function (b, e) {
      if (!angular.isString(b) || !e)
        return b;
      e = a.DATETIME_FORMATS[e] || e, this.parsers[e] || (this.parsers[e] = c(e));
      var f = this.parsers[e], g = f.regex, h = f.map, i = b.match(g);
      if (i && i.length) {
        for (var j, k = {
              year: 1900,
              month: 0,
              date: 1,
              hours: 0
            }, l = 1, m = i.length; m > l; l++) {
          var n = h[l - 1];
          n.apply && n.apply.call(k, i[l]);
        }
        return d(k.year, k.month, k.date) && (j = new Date(k.year, k.month, k.date, k.hours)), j;
      }
    };
  }
]), angular.module('ui.bootstrap.position', []).factory('$position', [
  '$document',
  '$window',
  function (a, b) {
    function c(a, c) {
      return a.currentStyle ? a.currentStyle[c] : b.getComputedStyle ? b.getComputedStyle(a)[c] : a.style[c];
    }
    function d(a) {
      return 'static' === (c(a, 'position') || 'static');
    }
    var e = function (b) {
      for (var c = a[0], e = b.offsetParent || c; e && e !== c && d(e);)
        e = e.offsetParent;
      return e || c;
    };
    return {
      position: function (b) {
        var c = this.offset(b), d = {
            top: 0,
            left: 0
          }, f = e(b[0]);
        f != a[0] && (d = this.offset(angular.element(f)), d.top += f.clientTop - f.scrollTop, d.left += f.clientLeft - f.scrollLeft);
        var g = b[0].getBoundingClientRect();
        return {
          width: g.width || b.prop('offsetWidth'),
          height: g.height || b.prop('offsetHeight'),
          top: c.top - d.top,
          left: c.left - d.left
        };
      },
      offset: function (c) {
        var d = c[0].getBoundingClientRect();
        return {
          width: d.width || c.prop('offsetWidth'),
          height: d.height || c.prop('offsetHeight'),
          top: d.top + (b.pageYOffset || a[0].documentElement.scrollTop),
          left: d.left + (b.pageXOffset || a[0].documentElement.scrollLeft)
        };
      },
      positionElements: function (a, b, c, d) {
        var e, f, g, h, i = c.split('-'), j = i[0], k = i[1] || 'center';
        e = d ? this.offset(a) : this.position(a), f = b.prop('offsetWidth'), g = b.prop('offsetHeight');
        var l = {
            center: function () {
              return e.left + e.width / 2 - f / 2;
            },
            left: function () {
              return e.left;
            },
            right: function () {
              return e.left + e.width;
            }
          }, m = {
            center: function () {
              return e.top + e.height / 2 - g / 2;
            },
            top: function () {
              return e.top;
            },
            bottom: function () {
              return e.top + e.height;
            }
          };
        switch (j) {
        case 'right':
          h = {
            top: m[k](),
            left: l[j]()
          };
          break;
        case 'left':
          h = {
            top: m[k](),
            left: e.left - f
          };
          break;
        case 'bottom':
          h = {
            top: m[j](),
            left: l[k]()
          };
          break;
        default:
          h = {
            top: e.top - g,
            left: l[k]()
          };
        }
        return h;
      }
    };
  }
]), angular.module('ui.bootstrap.datepicker', [
  'ui.bootstrap.dateparser',
  'ui.bootstrap.position'
]).constant('datepickerConfig', {
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  datepickerMode: 'day',
  minMode: 'day',
  maxMode: 'year',
  showWeeks: !0,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
}).controller('DatepickerController', [
  '$scope',
  '$attrs',
  '$parse',
  '$interpolate',
  '$timeout',
  '$log',
  'dateFilter',
  'datepickerConfig',
  function (a, b, c, d, e, f, g, h) {
    var i = this, j = { $setViewValue: angular.noop };
    this.modes = [
      'day',
      'month',
      'year'
    ], angular.forEach([
      'formatDay',
      'formatMonth',
      'formatYear',
      'formatDayHeader',
      'formatDayTitle',
      'formatMonthTitle',
      'minMode',
      'maxMode',
      'showWeeks',
      'startingDay',
      'yearRange'
    ], function (c, e) {
      i[c] = angular.isDefined(b[c]) ? 8 > e ? d(b[c])(a.$parent) : a.$parent.$eval(b[c]) : h[c];
    }), angular.forEach([
      'minDate',
      'maxDate'
    ], function (d) {
      b[d] ? a.$parent.$watch(c(b[d]), function (a) {
        i[d] = a ? new Date(a) : null, i.refreshView();
      }) : i[d] = h[d] ? new Date(h[d]) : null;
    }), a.datepickerMode = a.datepickerMode || h.datepickerMode, a.uniqueId = 'datepicker-' + a.$id + '-' + Math.floor(10000 * Math.random()), this.activeDate = angular.isDefined(b.initDate) ? a.$parent.$eval(b.initDate) : new Date(), a.isActive = function (b) {
      return 0 === i.compare(b.date, i.activeDate) ? (a.activeDateId = b.uid, !0) : !1;
    }, this.init = function (a) {
      j = a, j.$render = function () {
        i.render();
      };
    }, this.render = function () {
      if (j.$modelValue) {
        var a = new Date(j.$modelValue), b = !isNaN(a);
        b ? this.activeDate = a : f.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'), j.$setValidity('date', b);
      }
      this.refreshView();
    }, this.refreshView = function () {
      if (this.element) {
        this._refreshView();
        var a = j.$modelValue ? new Date(j.$modelValue) : null;
        j.$setValidity('date-disabled', !a || this.element && !this.isDisabled(a));
      }
    }, this.createDateObject = function (a, b) {
      var c = j.$modelValue ? new Date(j.$modelValue) : null;
      return {
        date: a,
        label: g(a, b),
        selected: c && 0 === this.compare(a, c),
        disabled: this.isDisabled(a),
        current: 0 === this.compare(a, new Date())
      };
    }, this.isDisabled = function (c) {
      return this.minDate && this.compare(c, this.minDate) < 0 || this.maxDate && this.compare(c, this.maxDate) > 0 || b.dateDisabled && a.dateDisabled({
        date: c,
        mode: a.datepickerMode
      });
    }, this.split = function (a, b) {
      for (var c = []; a.length > 0;)
        c.push(a.splice(0, b));
      return c;
    }, a.select = function (b) {
      if (a.datepickerMode === i.minMode) {
        var c = j.$modelValue ? new Date(j.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
        c.setFullYear(b.getFullYear(), b.getMonth(), b.getDate()), j.$setViewValue(c), j.$render();
      } else
        i.activeDate = b, a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) - 1];
    }, a.move = function (a) {
      var b = i.activeDate.getFullYear() + a * (i.step.years || 0), c = i.activeDate.getMonth() + a * (i.step.months || 0);
      i.activeDate.setFullYear(b, c, 1), i.refreshView();
    }, a.toggleMode = function (b) {
      b = b || 1, a.datepickerMode === i.maxMode && 1 === b || a.datepickerMode === i.minMode && -1 === b || (a.datepickerMode = i.modes[i.modes.indexOf(a.datepickerMode) + b]);
    }, a.keys = {
      13: 'enter',
      32: 'space',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
    var k = function () {
      e(function () {
        i.element[0].focus();
      }, 0, !1);
    };
    a.$on('datepicker.focus', k), a.keydown = function (b) {
      var c = a.keys[b.which];
      if (c && !b.shiftKey && !b.altKey)
        if (b.preventDefault(), b.stopPropagation(), 'enter' === c || 'space' === c) {
          if (i.isDisabled(i.activeDate))
            return;
          a.select(i.activeDate), k();
        } else
          !b.ctrlKey || 'up' !== c && 'down' !== c ? (i.handleKeyDown(c, b), i.refreshView()) : (a.toggleMode('up' === c ? 1 : -1), k());
    };
  }
]).directive('datepicker', function () {
  return {
    restrict: 'EA',
    replace: !0,
    templateUrl: 'template/datepicker/datepicker.html',
    scope: {
      datepickerMode: '=?',
      dateDisabled: '&'
    },
    require: [
      'datepicker',
      '?^ngModel'
    ],
    controller: 'DatepickerController',
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f && e.init(f);
    }
  };
}).directive('daypicker', [
  'dateFilter',
  function (a) {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/datepicker/day.html',
      require: '^datepicker',
      link: function (b, c, d, e) {
        function f(a, b) {
          return 1 !== b || a % 4 !== 0 || a % 100 === 0 && a % 400 !== 0 ? i[b] : 29;
        }
        function g(a, b) {
          var c = new Array(b), d = new Date(a), e = 0;
          for (d.setHours(12); b > e;)
            c[e++] = new Date(d), d.setDate(d.getDate() + 1);
          return c;
        }
        function h(a) {
          var b = new Date(a);
          b.setDate(b.getDate() + 4 - (b.getDay() || 7));
          var c = b.getTime();
          return b.setMonth(0), b.setDate(1), Math.floor(Math.round((c - b) / 86400000) / 7) + 1;
        }
        b.showWeeks = e.showWeeks, e.step = { months: 1 }, e.element = c;
        var i = [
            31,
            28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31
          ];
        e._refreshView = function () {
          var c = e.activeDate.getFullYear(), d = e.activeDate.getMonth(), f = new Date(c, d, 1), i = e.startingDay - f.getDay(), j = i > 0 ? 7 - i : -i, k = new Date(f);
          j > 0 && k.setDate(-j + 1);
          for (var l = g(k, 42), m = 0; 42 > m; m++)
            l[m] = angular.extend(e.createDateObject(l[m], e.formatDay), {
              secondary: l[m].getMonth() !== d,
              uid: b.uniqueId + '-' + m
            });
          b.labels = new Array(7);
          for (var n = 0; 7 > n; n++)
            b.labels[n] = {
              abbr: a(l[n].date, e.formatDayHeader),
              full: a(l[n].date, 'EEEE')
            };
          if (b.title = a(e.activeDate, e.formatDayTitle), b.rows = e.split(l, 7), b.showWeeks) {
            b.weekNumbers = [];
            for (var o = h(b.rows[0][0].date), p = b.rows.length; b.weekNumbers.push(o++) < p;);
          }
        }, e.compare = function (a, b) {
          return new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate());
        }, e.handleKeyDown = function (a) {
          var b = e.activeDate.getDate();
          if ('left' === a)
            b -= 1;
          else if ('up' === a)
            b -= 7;
          else if ('right' === a)
            b += 1;
          else if ('down' === a)
            b += 7;
          else if ('pageup' === a || 'pagedown' === a) {
            var c = e.activeDate.getMonth() + ('pageup' === a ? -1 : 1);
            e.activeDate.setMonth(c, 1), b = Math.min(f(e.activeDate.getFullYear(), e.activeDate.getMonth()), b);
          } else
            'home' === a ? b = 1 : 'end' === a && (b = f(e.activeDate.getFullYear(), e.activeDate.getMonth()));
          e.activeDate.setDate(b);
        }, e.refreshView();
      }
    };
  }
]).directive('monthpicker', [
  'dateFilter',
  function (a) {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/datepicker/month.html',
      require: '^datepicker',
      link: function (b, c, d, e) {
        e.step = { years: 1 }, e.element = c, e._refreshView = function () {
          for (var c = new Array(12), d = e.activeDate.getFullYear(), f = 0; 12 > f; f++)
            c[f] = angular.extend(e.createDateObject(new Date(d, f, 1), e.formatMonth), { uid: b.uniqueId + '-' + f });
          b.title = a(e.activeDate, e.formatMonthTitle), b.rows = e.split(c, 3);
        }, e.compare = function (a, b) {
          return new Date(a.getFullYear(), a.getMonth()) - new Date(b.getFullYear(), b.getMonth());
        }, e.handleKeyDown = function (a) {
          var b = e.activeDate.getMonth();
          if ('left' === a)
            b -= 1;
          else if ('up' === a)
            b -= 3;
          else if ('right' === a)
            b += 1;
          else if ('down' === a)
            b += 3;
          else if ('pageup' === a || 'pagedown' === a) {
            var c = e.activeDate.getFullYear() + ('pageup' === a ? -1 : 1);
            e.activeDate.setFullYear(c);
          } else
            'home' === a ? b = 0 : 'end' === a && (b = 11);
          e.activeDate.setMonth(b);
        }, e.refreshView();
      }
    };
  }
]).directive('yearpicker', [
  'dateFilter',
  function () {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/datepicker/year.html',
      require: '^datepicker',
      link: function (a, b, c, d) {
        function e(a) {
          return parseInt((a - 1) / f, 10) * f + 1;
        }
        var f = d.yearRange;
        d.step = { years: f }, d.element = b, d._refreshView = function () {
          for (var b = new Array(f), c = 0, g = e(d.activeDate.getFullYear()); f > c; c++)
            b[c] = angular.extend(d.createDateObject(new Date(g + c, 0, 1), d.formatYear), { uid: a.uniqueId + '-' + c });
          a.title = [
            b[0].label,
            b[f - 1].label
          ].join(' - '), a.rows = d.split(b, 5);
        }, d.compare = function (a, b) {
          return a.getFullYear() - b.getFullYear();
        }, d.handleKeyDown = function (a) {
          var b = d.activeDate.getFullYear();
          'left' === a ? b -= 1 : 'up' === a ? b -= 5 : 'right' === a ? b += 1 : 'down' === a ? b += 5 : 'pageup' === a || 'pagedown' === a ? b += ('pageup' === a ? -1 : 1) * d.step.years : 'home' === a ? b = e(d.activeDate.getFullYear()) : 'end' === a && (b = e(d.activeDate.getFullYear()) + f - 1), d.activeDate.setFullYear(b);
        }, d.refreshView();
      }
    };
  }
]).constant('datepickerPopupConfig', {
  datepickerPopup: 'yyyy-MM-dd',
  currentText: 'Today',
  clearText: 'Clear',
  closeText: 'Done',
  closeOnDateSelection: !0,
  appendToBody: !1,
  showButtonBar: !0
}).directive('datepickerPopup', [
  '$compile',
  '$parse',
  '$document',
  '$position',
  'dateFilter',
  'dateParser',
  'datepickerPopupConfig',
  function (a, b, c, d, e, f, g) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: {
        isOpen: '=?',
        currentText: '@',
        clearText: '@',
        closeText: '@',
        dateDisabled: '&'
      },
      link: function (h, i, j, k) {
        function l(a) {
          return a.replace(/([A-Z])/g, function (a) {
            return '-' + a.toLowerCase();
          });
        }
        function m(a) {
          if (a) {
            if (angular.isDate(a) && !isNaN(a))
              return k.$setValidity('date', !0), a;
            if (angular.isString(a)) {
              var b = f.parse(a, n) || new Date(a);
              return isNaN(b) ? void k.$setValidity('date', !1) : (k.$setValidity('date', !0), b);
            }
            return void k.$setValidity('date', !1);
          }
          return k.$setValidity('date', !0), null;
        }
        var n, o = angular.isDefined(j.closeOnDateSelection) ? h.$parent.$eval(j.closeOnDateSelection) : g.closeOnDateSelection, p = angular.isDefined(j.datepickerAppendToBody) ? h.$parent.$eval(j.datepickerAppendToBody) : g.appendToBody;
        h.showButtonBar = angular.isDefined(j.showButtonBar) ? h.$parent.$eval(j.showButtonBar) : g.showButtonBar, h.getText = function (a) {
          return h[a + 'Text'] || g[a + 'Text'];
        }, j.$observe('datepickerPopup', function (a) {
          n = a || g.datepickerPopup, k.$render();
        });
        var q = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
        q.attr({
          'ng-model': 'date',
          'ng-change': 'dateSelection()'
        });
        var r = angular.element(q.children()[0]);
        j.datepickerOptions && angular.forEach(h.$parent.$eval(j.datepickerOptions), function (a, b) {
          r.attr(l(b), a);
        }), h.watchData = {}, angular.forEach([
          'minDate',
          'maxDate',
          'datepickerMode'
        ], function (a) {
          if (j[a]) {
            var c = b(j[a]);
            if (h.$parent.$watch(c, function (b) {
                h.watchData[a] = b;
              }), r.attr(l(a), 'watchData.' + a), 'datepickerMode' === a) {
              var d = c.assign;
              h.$watch('watchData.' + a, function (a, b) {
                a !== b && d(h.$parent, a);
              });
            }
          }
        }), j.dateDisabled && r.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })'), k.$parsers.unshift(m), h.dateSelection = function (a) {
          angular.isDefined(a) && (h.date = a), k.$setViewValue(h.date), k.$render(), o && (h.isOpen = !1, i[0].focus());
        }, i.bind('input change keyup', function () {
          h.$apply(function () {
            h.date = k.$modelValue;
          });
        }), k.$render = function () {
          var a = k.$viewValue ? e(k.$viewValue, n) : '';
          i.val(a), h.date = m(k.$modelValue);
        };
        var s = function (a) {
            h.isOpen && a.target !== i[0] && h.$apply(function () {
              h.isOpen = !1;
            });
          }, t = function (a) {
            h.keydown(a);
          };
        i.bind('keydown', t), h.keydown = function (a) {
          27 === a.which ? (a.preventDefault(), a.stopPropagation(), h.close()) : 40 !== a.which || h.isOpen || (h.isOpen = !0);
        }, h.$watch('isOpen', function (a) {
          a ? (h.$broadcast('datepicker.focus'), h.position = p ? d.offset(i) : d.position(i), h.position.top = h.position.top + i.prop('offsetHeight'), c.bind('click', s)) : c.unbind('click', s);
        }), h.select = function (a) {
          if ('today' === a) {
            var b = new Date();
            angular.isDate(k.$modelValue) ? (a = new Date(k.$modelValue), a.setFullYear(b.getFullYear(), b.getMonth(), b.getDate())) : a = new Date(b.setHours(0, 0, 0, 0));
          }
          h.dateSelection(a);
        }, h.close = function () {
          h.isOpen = !1, i[0].focus();
        };
        var u = a(q)(h);
        q.remove(), p ? c.find('body').append(u) : i.after(u), h.$on('$destroy', function () {
          u.remove(), i.unbind('keydown', t), c.unbind('click', s);
        });
      }
    };
  }
]).directive('datepickerPopupWrap', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    templateUrl: 'template/datepicker/popup.html',
    link: function (a, b) {
      b.bind('click', function (a) {
        a.preventDefault(), a.stopPropagation();
      });
    }
  };
}), angular.module('ui.bootstrap.dropdown', []).constant('dropdownConfig', { openClass: 'open' }).service('dropdownService', [
  '$document',
  function (a) {
    var b = null;
    this.open = function (e) {
      b || (a.bind('click', c), a.bind('keydown', d)), b && b !== e && (b.isOpen = !1), b = e;
    }, this.close = function (e) {
      b === e && (b = null, a.unbind('click', c), a.unbind('keydown', d));
    };
    var c = function (a) {
        if (b) {
          var c = b.getToggleElement();
          a && c && c[0].contains(a.target) || b.$apply(function () {
            b.isOpen = !1;
          });
        }
      }, d = function (a) {
        27 === a.which && (b.focusToggleElement(), c());
      };
  }
]).controller('DropdownController', [
  '$scope',
  '$attrs',
  '$parse',
  'dropdownConfig',
  'dropdownService',
  '$animate',
  function (a, b, c, d, e, f) {
    var g, h = this, i = a.$new(), j = d.openClass, k = angular.noop, l = b.onToggle ? c(b.onToggle) : angular.noop;
    this.init = function (d) {
      h.$element = d, b.isOpen && (g = c(b.isOpen), k = g.assign, a.$watch(g, function (a) {
        i.isOpen = !!a;
      }));
    }, this.toggle = function (a) {
      return i.isOpen = arguments.length ? !!a : !i.isOpen;
    }, this.isOpen = function () {
      return i.isOpen;
    }, i.getToggleElement = function () {
      return h.toggleElement;
    }, i.focusToggleElement = function () {
      h.toggleElement && h.toggleElement[0].focus();
    }, i.$watch('isOpen', function (b, c) {
      f[b ? 'addClass' : 'removeClass'](h.$element, j), b ? (i.focusToggleElement(), e.open(i)) : e.close(i), k(a, b), angular.isDefined(b) && b !== c && l(a, { open: !!b });
    }), a.$on('$locationChangeSuccess', function () {
      i.isOpen = !1;
    }), a.$on('$destroy', function () {
      i.$destroy();
    });
  }
]).directive('dropdown', function () {
  return {
    controller: 'DropdownController',
    link: function (a, b, c, d) {
      d.init(b);
    }
  };
}).directive('dropdownToggle', function () {
  return {
    require: '?^dropdown',
    link: function (a, b, c, d) {
      if (d) {
        d.toggleElement = b;
        var e = function (e) {
          e.preventDefault(), b.hasClass('disabled') || c.disabled || a.$apply(function () {
            d.toggle();
          });
        };
        b.bind('click', e), b.attr({
          'aria-haspopup': !0,
          'aria-expanded': !1
        }), a.$watch(d.isOpen, function (a) {
          b.attr('aria-expanded', !!a);
        }), a.$on('$destroy', function () {
          b.unbind('click', e);
        });
      }
    }
  };
}), angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition']).factory('$$stackedMap', function () {
  return {
    createNew: function () {
      var a = [];
      return {
        add: function (b, c) {
          a.push({
            key: b,
            value: c
          });
        },
        get: function (b) {
          for (var c = 0; c < a.length; c++)
            if (b == a[c].key)
              return a[c];
        },
        keys: function () {
          for (var b = [], c = 0; c < a.length; c++)
            b.push(a[c].key);
          return b;
        },
        top: function () {
          return a[a.length - 1];
        },
        remove: function (b) {
          for (var c = -1, d = 0; d < a.length; d++)
            if (b == a[d].key) {
              c = d;
              break;
            }
          return a.splice(c, 1)[0];
        },
        removeTop: function () {
          return a.splice(a.length - 1, 1)[0];
        },
        length: function () {
          return a.length;
        }
      };
    }
  };
}).directive('modalBackdrop', [
  '$timeout',
  function (a) {
    return {
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/modal/backdrop.html',
      link: function (b, c, d) {
        b.backdropClass = d.backdropClass || '', b.animate = !1, a(function () {
          b.animate = !0;
        });
      }
    };
  }
]).directive('modalWindow', [
  '$modalStack',
  '$timeout',
  function (a, b) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: !0,
      transclude: !0,
      templateUrl: function (a, b) {
        return b.templateUrl || 'template/modal/window.html';
      },
      link: function (c, d, e) {
        d.addClass(e.windowClass || ''), c.size = e.size, b(function () {
          c.animate = !0, d[0].querySelectorAll('[autofocus]').length || d[0].focus();
        }), c.close = function (b) {
          var c = a.getTop();
          c && c.value.backdrop && 'static' != c.value.backdrop && b.target === b.currentTarget && (b.preventDefault(), b.stopPropagation(), a.dismiss(c.key, 'backdrop click'));
        };
      }
    };
  }
]).directive('modalTransclude', function () {
  return {
    link: function (a, b, c, d, e) {
      e(a.$parent, function (a) {
        b.empty(), b.append(a);
      });
    }
  };
}).factory('$modalStack', [
  '$transition',
  '$timeout',
  '$document',
  '$compile',
  '$rootScope',
  '$$stackedMap',
  function (a, b, c, d, e, f) {
    function g() {
      for (var a = -1, b = n.keys(), c = 0; c < b.length; c++)
        n.get(b[c]).value.backdrop && (a = c);
      return a;
    }
    function h(a) {
      var b = c.find('body').eq(0), d = n.get(a).value;
      n.remove(a), j(d.modalDomEl, d.modalScope, 300, function () {
        d.modalScope.$destroy(), b.toggleClass(m, n.length() > 0), i();
      });
    }
    function i() {
      if (k && -1 == g()) {
        var a = l;
        j(k, l, 150, function () {
          a.$destroy(), a = null;
        }), k = void 0, l = void 0;
      }
    }
    function j(c, d, e, f) {
      function g() {
        g.done || (g.done = !0, c.remove(), f && f());
      }
      d.animate = !1;
      var h = a.transitionEndEventName;
      if (h) {
        var i = b(g, e);
        c.bind(h, function () {
          b.cancel(i), g(), d.$apply();
        });
      } else
        b(g);
    }
    var k, l, m = 'modal-open', n = f.createNew(), o = {};
    return e.$watch(g, function (a) {
      l && (l.index = a);
    }), c.bind('keydown', function (a) {
      var b;
      27 === a.which && (b = n.top(), b && b.value.keyboard && (a.preventDefault(), e.$apply(function () {
        o.dismiss(b.key, 'escape key press');
      })));
    }), o.open = function (a, b) {
      n.add(a, {
        deferred: b.deferred,
        modalScope: b.scope,
        backdrop: b.backdrop,
        keyboard: b.keyboard
      });
      var f = c.find('body').eq(0), h = g();
      if (h >= 0 && !k) {
        l = e.$new(!0), l.index = h;
        var i = angular.element('<div modal-backdrop></div>');
        i.attr('backdrop-class', b.backdropClass), k = d(i)(l), f.append(k);
      }
      var j = angular.element('<div modal-window></div>');
      j.attr({
        'template-url': b.windowTemplateUrl,
        'window-class': b.windowClass,
        size: b.size,
        index: n.length() - 1,
        animate: 'animate'
      }).html(b.content);
      var o = d(j)(b.scope);
      n.top().value.modalDomEl = o, f.append(o), f.addClass(m);
    }, o.close = function (a, b) {
      var c = n.get(a);
      c && (c.value.deferred.resolve(b), h(a));
    }, o.dismiss = function (a, b) {
      var c = n.get(a);
      c && (c.value.deferred.reject(b), h(a));
    }, o.dismissAll = function (a) {
      for (var b = this.getTop(); b;)
        this.dismiss(b.key, a), b = this.getTop();
    }, o.getTop = function () {
      return n.top();
    }, o;
  }
]).provider('$modal', function () {
  var a = {
      options: {
        backdrop: !0,
        keyboard: !0
      },
      $get: [
        '$injector',
        '$rootScope',
        '$q',
        '$http',
        '$templateCache',
        '$controller',
        '$modalStack',
        function (b, c, d, e, f, g, h) {
          function i(a) {
            return a.template ? d.when(a.template) : e.get(angular.isFunction(a.templateUrl) ? a.templateUrl() : a.templateUrl, { cache: f }).then(function (a) {
              return a.data;
            });
          }
          function j(a) {
            var c = [];
            return angular.forEach(a, function (a) {
              (angular.isFunction(a) || angular.isArray(a)) && c.push(d.when(b.invoke(a)));
            }), c;
          }
          var k = {};
          return k.open = function (b) {
            var e = d.defer(), f = d.defer(), k = {
                result: e.promise,
                opened: f.promise,
                close: function (a) {
                  h.close(k, a);
                },
                dismiss: function (a) {
                  h.dismiss(k, a);
                }
              };
            if (b = angular.extend({}, a.options, b), b.resolve = b.resolve || {}, !b.template && !b.templateUrl)
              throw new Error('One of template or templateUrl options is required.');
            var l = d.all([i(b)].concat(j(b.resolve)));
            return l.then(function (a) {
              var d = (b.scope || c).$new();
              d.$close = k.close, d.$dismiss = k.dismiss;
              var f, i = {}, j = 1;
              b.controller && (i.$scope = d, i.$modalInstance = k, angular.forEach(b.resolve, function (b, c) {
                i[c] = a[j++];
              }), f = g(b.controller, i), b.controllerAs && (d[b.controllerAs] = f)), h.open(k, {
                scope: d,
                deferred: e,
                content: a[0],
                backdrop: b.backdrop,
                keyboard: b.keyboard,
                backdropClass: b.backdropClass,
                windowClass: b.windowClass,
                windowTemplateUrl: b.windowTemplateUrl,
                size: b.size
              });
            }, function (a) {
              e.reject(a);
            }), l.then(function () {
              f.resolve(!0);
            }, function () {
              f.reject(!1);
            }), k;
          }, k;
        }
      ]
    };
  return a;
}), angular.module('ui.bootstrap.pagination', []).controller('PaginationController', [
  '$scope',
  '$attrs',
  '$parse',
  function (a, b, c) {
    var d = this, e = { $setViewValue: angular.noop }, f = b.numPages ? c(b.numPages).assign : angular.noop;
    this.init = function (f, g) {
      e = f, this.config = g, e.$render = function () {
        d.render();
      }, b.itemsPerPage ? a.$parent.$watch(c(b.itemsPerPage), function (b) {
        d.itemsPerPage = parseInt(b, 10), a.totalPages = d.calculateTotalPages();
      }) : this.itemsPerPage = g.itemsPerPage;
    }, this.calculateTotalPages = function () {
      var b = this.itemsPerPage < 1 ? 1 : Math.ceil(a.totalItems / this.itemsPerPage);
      return Math.max(b || 0, 1);
    }, this.render = function () {
      a.page = parseInt(e.$viewValue, 10) || 1;
    }, a.selectPage = function (b) {
      a.page !== b && b > 0 && b <= a.totalPages && (e.$setViewValue(b), e.$render());
    }, a.getText = function (b) {
      return a[b + 'Text'] || d.config[b + 'Text'];
    }, a.noPrevious = function () {
      return 1 === a.page;
    }, a.noNext = function () {
      return a.page === a.totalPages;
    }, a.$watch('totalItems', function () {
      a.totalPages = d.calculateTotalPages();
    }), a.$watch('totalPages', function (b) {
      f(a.$parent, b), a.page > b ? a.selectPage(b) : e.$render();
    });
  }
]).constant('paginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: !1,
  directionLinks: !0,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: !0
}).directive('pagination', [
  '$parse',
  'paginationConfig',
  function (a, b) {
    return {
      restrict: 'EA',
      scope: {
        totalItems: '=',
        firstText: '@',
        previousText: '@',
        nextText: '@',
        lastText: '@'
      },
      require: [
        'pagination',
        '?ngModel'
      ],
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: !0,
      link: function (c, d, e, f) {
        function g(a, b, c) {
          return {
            number: a,
            text: b,
            active: c
          };
        }
        function h(a, b) {
          var c = [], d = 1, e = b, f = angular.isDefined(k) && b > k;
          f && (l ? (d = Math.max(a - Math.floor(k / 2), 1), e = d + k - 1, e > b && (e = b, d = e - k + 1)) : (d = (Math.ceil(a / k) - 1) * k + 1, e = Math.min(d + k - 1, b)));
          for (var h = d; e >= h; h++) {
            var i = g(h, h, h === a);
            c.push(i);
          }
          if (f && !l) {
            if (d > 1) {
              var j = g(d - 1, '...', !1);
              c.unshift(j);
            }
            if (b > e) {
              var m = g(e + 1, '...', !1);
              c.push(m);
            }
          }
          return c;
        }
        var i = f[0], j = f[1];
        if (j) {
          var k = angular.isDefined(e.maxSize) ? c.$parent.$eval(e.maxSize) : b.maxSize, l = angular.isDefined(e.rotate) ? c.$parent.$eval(e.rotate) : b.rotate;
          c.boundaryLinks = angular.isDefined(e.boundaryLinks) ? c.$parent.$eval(e.boundaryLinks) : b.boundaryLinks, c.directionLinks = angular.isDefined(e.directionLinks) ? c.$parent.$eval(e.directionLinks) : b.directionLinks, i.init(j, b), e.maxSize && c.$parent.$watch(a(e.maxSize), function (a) {
            k = parseInt(a, 10), i.render();
          });
          var m = i.render;
          i.render = function () {
            m(), c.page > 0 && c.page <= c.totalPages && (c.pages = h(c.page, c.totalPages));
          };
        }
      }
    };
  }
]).constant('pagerConfig', {
  itemsPerPage: 10,
  previousText: '\xab Previous',
  nextText: 'Next \xbb',
  align: !0
}).directive('pager', [
  'pagerConfig',
  function (a) {
    return {
      restrict: 'EA',
      scope: {
        totalItems: '=',
        previousText: '@',
        nextText: '@'
      },
      require: [
        'pager',
        '?ngModel'
      ],
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: !0,
      link: function (b, c, d, e) {
        var f = e[0], g = e[1];
        g && (b.align = angular.isDefined(d.align) ? b.$parent.$eval(d.align) : a.align, f.init(g, a));
      }
    };
  }
]), angular.module('ui.bootstrap.tooltip', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).provider('$tooltip', function () {
  function a(a) {
    var b = /[A-Z]/g, c = '-';
    return a.replace(b, function (a, b) {
      return (b ? c : '') + a.toLowerCase();
    });
  }
  var b = {
      placement: 'top',
      animation: !0,
      popupDelay: 0
    }, c = {
      mouseenter: 'mouseleave',
      click: 'click',
      focus: 'blur'
    }, d = {};
  this.options = function (a) {
    angular.extend(d, a);
  }, this.setTriggers = function (a) {
    angular.extend(c, a);
  }, this.$get = [
    '$window',
    '$compile',
    '$timeout',
    '$document',
    '$position',
    '$interpolate',
    function (e, f, g, h, i, j) {
      return function (e, k, l) {
        function m(a) {
          var b = a || n.trigger || l, d = c[b] || b;
          return {
            show: b,
            hide: d
          };
        }
        var n = angular.extend({}, b, d), o = a(e), p = j.startSymbol(), q = j.endSymbol(), r = '<div ' + o + '-popup title="' + p + 'title' + q + '" content="' + p + 'content' + q + '" placement="' + p + 'placement' + q + '" animation="animation" is-open="isOpen"></div>';
        return {
          restrict: 'EA',
          compile: function () {
            var a = f(r);
            return function (b, c, d) {
              function f() {
                D.isOpen ? l() : j();
              }
              function j() {
                (!C || b.$eval(d[k + 'Enable'])) && (s(), D.popupDelay ? z || (z = g(o, D.popupDelay, !1), z.then(function (a) {
                  a();
                })) : o()());
              }
              function l() {
                b.$apply(function () {
                  p();
                });
              }
              function o() {
                return z = null, y && (g.cancel(y), y = null), D.content ? (q(), w.css({
                  top: 0,
                  left: 0,
                  display: 'block'
                }), D.$digest(), E(), D.isOpen = !0, D.$digest(), E) : angular.noop;
              }
              function p() {
                D.isOpen = !1, g.cancel(z), z = null, D.animation ? y || (y = g(r, 500)) : r();
              }
              function q() {
                w && r(), x = D.$new(), w = a(x, function (a) {
                  A ? h.find('body').append(a) : c.after(a);
                });
              }
              function r() {
                y = null, w && (w.remove(), w = null), x && (x.$destroy(), x = null);
              }
              function s() {
                t(), u();
              }
              function t() {
                var a = d[k + 'Placement'];
                D.placement = angular.isDefined(a) ? a : n.placement;
              }
              function u() {
                var a = d[k + 'PopupDelay'], b = parseInt(a, 10);
                D.popupDelay = isNaN(b) ? n.popupDelay : b;
              }
              function v() {
                var a = d[k + 'Trigger'];
                F(), B = m(a), B.show === B.hide ? c.bind(B.show, f) : (c.bind(B.show, j), c.bind(B.hide, l));
              }
              var w, x, y, z, A = angular.isDefined(n.appendToBody) ? n.appendToBody : !1, B = m(void 0), C = angular.isDefined(d[k + 'Enable']), D = b.$new(!0), E = function () {
                  var a = i.positionElements(c, w, D.placement, A);
                  a.top += 'px', a.left += 'px', w.css(a);
                };
              D.isOpen = !1, d.$observe(e, function (a) {
                D.content = a, !a && D.isOpen && p();
              }), d.$observe(k + 'Title', function (a) {
                D.title = a;
              });
              var F = function () {
                c.unbind(B.show, j), c.unbind(B.hide, l);
              };
              v();
              var G = b.$eval(d[k + 'Animation']);
              D.animation = angular.isDefined(G) ? !!G : n.animation;
              var H = b.$eval(d[k + 'AppendToBody']);
              A = angular.isDefined(H) ? H : A, A && b.$on('$locationChangeSuccess', function () {
                D.isOpen && p();
              }), b.$on('$destroy', function () {
                g.cancel(y), g.cancel(z), F(), r(), D = null;
              });
            };
          }
        };
      };
    }
  ];
}).directive('tooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: !0,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
}).directive('tooltip', [
  '$tooltip',
  function (a) {
    return a('tooltip', 'tooltip', 'mouseenter');
  }
]).directive('tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: !0,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
}).directive('tooltipHtmlUnsafe', [
  '$tooltip',
  function (a) {
    return a('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }
]), angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip']).directive('popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: !0,
    scope: {
      title: '@',
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/popover/popover.html'
  };
}).directive('popover', [
  '$tooltip',
  function (a) {
    return a('popover', 'popover', 'click');
  }
]), angular.module('ui.bootstrap.progressbar', []).constant('progressConfig', {
  animate: !0,
  max: 100
}).controller('ProgressController', [
  '$scope',
  '$attrs',
  'progressConfig',
  function (a, b, c) {
    var d = this, e = angular.isDefined(b.animate) ? a.$parent.$eval(b.animate) : c.animate;
    this.bars = [], a.max = angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max, this.addBar = function (b, c) {
      e || c.css({ transition: 'none' }), this.bars.push(b), b.$watch('value', function (c) {
        b.percent = +(100 * c / a.max).toFixed(2);
      }), b.$on('$destroy', function () {
        c = null, d.removeBar(b);
      });
    }, this.removeBar = function (a) {
      this.bars.splice(this.bars.indexOf(a), 1);
    };
  }
]).directive('progress', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    controller: 'ProgressController',
    require: 'progress',
    scope: {},
    templateUrl: 'template/progressbar/progress.html'
  };
}).directive('bar', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    require: '^progress',
    scope: {
      value: '=',
      type: '@'
    },
    templateUrl: 'template/progressbar/bar.html',
    link: function (a, b, c, d) {
      d.addBar(a, b);
    }
  };
}).directive('progressbar', function () {
  return {
    restrict: 'EA',
    replace: !0,
    transclude: !0,
    controller: 'ProgressController',
    scope: {
      value: '=',
      type: '@'
    },
    templateUrl: 'template/progressbar/progressbar.html',
    link: function (a, b, c, d) {
      d.addBar(a, angular.element(b.children()[0]));
    }
  };
}), angular.module('ui.bootstrap.rating', []).constant('ratingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null
}).controller('RatingController', [
  '$scope',
  '$attrs',
  'ratingConfig',
  function (a, b, c) {
    var d = { $setViewValue: angular.noop };
    this.init = function (e) {
      d = e, d.$render = this.render, this.stateOn = angular.isDefined(b.stateOn) ? a.$parent.$eval(b.stateOn) : c.stateOn, this.stateOff = angular.isDefined(b.stateOff) ? a.$parent.$eval(b.stateOff) : c.stateOff;
      var f = angular.isDefined(b.ratingStates) ? a.$parent.$eval(b.ratingStates) : new Array(angular.isDefined(b.max) ? a.$parent.$eval(b.max) : c.max);
      a.range = this.buildTemplateObjects(f);
    }, this.buildTemplateObjects = function (a) {
      for (var b = 0, c = a.length; c > b; b++)
        a[b] = angular.extend({ index: b }, {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        }, a[b]);
      return a;
    }, a.rate = function (b) {
      !a.readonly && b >= 0 && b <= a.range.length && (d.$setViewValue(b), d.$render());
    }, a.enter = function (b) {
      a.readonly || (a.value = b), a.onHover({ value: b });
    }, a.reset = function () {
      a.value = d.$viewValue, a.onLeave();
    }, a.onKeydown = function (b) {
      /(37|38|39|40)/.test(b.which) && (b.preventDefault(), b.stopPropagation(), a.rate(a.value + (38 === b.which || 39 === b.which ? 1 : -1)));
    }, this.render = function () {
      a.value = d.$viewValue;
    };
  }
]).directive('rating', function () {
  return {
    restrict: 'EA',
    require: [
      'rating',
      'ngModel'
    ],
    scope: {
      readonly: '=?',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'RatingController',
    templateUrl: 'template/rating/rating.html',
    replace: !0,
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f && e.init(f);
    }
  };
}), angular.module('ui.bootstrap.tabs', []).controller('TabsetController', [
  '$scope',
  function (a) {
    var b = this, c = b.tabs = a.tabs = [];
    b.select = function (a) {
      angular.forEach(c, function (b) {
        b.active && b !== a && (b.active = !1, b.onDeselect());
      }), a.active = !0, a.onSelect();
    }, b.addTab = function (a) {
      c.push(a), 1 === c.length ? a.active = !0 : a.active && b.select(a);
    }, b.removeTab = function (a) {
      var e = c.indexOf(a);
      if (a.active && c.length > 1 && !d) {
        var f = e == c.length - 1 ? e - 1 : e + 1;
        b.select(c[f]);
      }
      c.splice(e, 1);
    };
    var d;
    a.$on('$destroy', function () {
      d = !0;
    });
  }
]).directive('tabset', function () {
  return {
    restrict: 'EA',
    transclude: !0,
    replace: !0,
    scope: { type: '@' },
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    link: function (a, b, c) {
      a.vertical = angular.isDefined(c.vertical) ? a.$parent.$eval(c.vertical) : !1, a.justified = angular.isDefined(c.justified) ? a.$parent.$eval(c.justified) : !1;
    }
  };
}).directive('tab', [
  '$parse',
  function (a) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: !0,
      templateUrl: 'template/tabs/tab.html',
      transclude: !0,
      scope: {
        active: '=?',
        heading: '@',
        onSelect: '&select',
        onDeselect: '&deselect'
      },
      controller: function () {
      },
      compile: function (b, c, d) {
        return function (b, c, e, f) {
          b.$watch('active', function (a) {
            a && f.select(b);
          }), b.disabled = !1, e.disabled && b.$parent.$watch(a(e.disabled), function (a) {
            b.disabled = !!a;
          }), b.select = function () {
            b.disabled || (b.active = !0);
          }, f.addTab(b), b.$on('$destroy', function () {
            f.removeTab(b);
          }), b.$transcludeFn = d;
        };
      }
    };
  }
]).directive('tabHeadingTransclude', [function () {
    return {
      restrict: 'A',
      require: '^tab',
      link: function (a, b) {
        a.$watch('headingElement', function (a) {
          a && (b.html(''), b.append(a));
        });
      }
    };
  }]).directive('tabContentTransclude', function () {
  function a(a) {
    return a.tagName && (a.hasAttribute('tab-heading') || a.hasAttribute('data-tab-heading') || 'tab-heading' === a.tagName.toLowerCase() || 'data-tab-heading' === a.tagName.toLowerCase());
  }
  return {
    restrict: 'A',
    require: '^tabset',
    link: function (b, c, d) {
      var e = b.$eval(d.tabContentTransclude);
      e.$transcludeFn(e.$parent, function (b) {
        angular.forEach(b, function (b) {
          a(b) ? e.headingElement = b : c.append(b);
        });
      });
    }
  };
}), angular.module('ui.bootstrap.timepicker', []).constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: !0,
  meridians: null,
  readonlyInput: !1,
  mousewheel: !0
}).controller('TimepickerController', [
  '$scope',
  '$attrs',
  '$parse',
  '$log',
  '$locale',
  'timepickerConfig',
  function (a, b, c, d, e, f) {
    function g() {
      var b = parseInt(a.hours, 10), c = a.showMeridian ? b > 0 && 13 > b : b >= 0 && 24 > b;
      return c ? (a.showMeridian && (12 === b && (b = 0), a.meridian === p[1] && (b += 12)), b) : void 0;
    }
    function h() {
      var b = parseInt(a.minutes, 10);
      return b >= 0 && 60 > b ? b : void 0;
    }
    function i(a) {
      return angular.isDefined(a) && a.toString().length < 2 ? '0' + a : a;
    }
    function j(a) {
      k(), o.$setViewValue(new Date(n)), l(a);
    }
    function k() {
      o.$setValidity('time', !0), a.invalidHours = !1, a.invalidMinutes = !1;
    }
    function l(b) {
      var c = n.getHours(), d = n.getMinutes();
      a.showMeridian && (c = 0 === c || 12 === c ? 12 : c % 12), a.hours = 'h' === b ? c : i(c), a.minutes = 'm' === b ? d : i(d), a.meridian = n.getHours() < 12 ? p[0] : p[1];
    }
    function m(a) {
      var b = new Date(n.getTime() + 60000 * a);
      n.setHours(b.getHours(), b.getMinutes()), j();
    }
    var n = new Date(), o = { $setViewValue: angular.noop }, p = angular.isDefined(b.meridians) ? a.$parent.$eval(b.meridians) : f.meridians || e.DATETIME_FORMATS.AMPMS;
    this.init = function (c, d) {
      o = c, o.$render = this.render;
      var e = d.eq(0), g = d.eq(1), h = angular.isDefined(b.mousewheel) ? a.$parent.$eval(b.mousewheel) : f.mousewheel;
      h && this.setupMousewheelEvents(e, g), a.readonlyInput = angular.isDefined(b.readonlyInput) ? a.$parent.$eval(b.readonlyInput) : f.readonlyInput, this.setupInputEvents(e, g);
    };
    var q = f.hourStep;
    b.hourStep && a.$parent.$watch(c(b.hourStep), function (a) {
      q = parseInt(a, 10);
    });
    var r = f.minuteStep;
    b.minuteStep && a.$parent.$watch(c(b.minuteStep), function (a) {
      r = parseInt(a, 10);
    }), a.showMeridian = f.showMeridian, b.showMeridian && a.$parent.$watch(c(b.showMeridian), function (b) {
      if (a.showMeridian = !!b, o.$error.time) {
        var c = g(), d = h();
        angular.isDefined(c) && angular.isDefined(d) && (n.setHours(c), j());
      } else
        l();
    }), this.setupMousewheelEvents = function (b, c) {
      var d = function (a) {
        a.originalEvent && (a = a.originalEvent);
        var b = a.wheelDelta ? a.wheelDelta : -a.deltaY;
        return a.detail || b > 0;
      };
      b.bind('mousewheel wheel', function (b) {
        a.$apply(d(b) ? a.incrementHours() : a.decrementHours()), b.preventDefault();
      }), c.bind('mousewheel wheel', function (b) {
        a.$apply(d(b) ? a.incrementMinutes() : a.decrementMinutes()), b.preventDefault();
      });
    }, this.setupInputEvents = function (b, c) {
      if (a.readonlyInput)
        return a.updateHours = angular.noop, void (a.updateMinutes = angular.noop);
      var d = function (b, c) {
        o.$setViewValue(null), o.$setValidity('time', !1), angular.isDefined(b) && (a.invalidHours = b), angular.isDefined(c) && (a.invalidMinutes = c);
      };
      a.updateHours = function () {
        var a = g();
        angular.isDefined(a) ? (n.setHours(a), j('h')) : d(!0);
      }, b.bind('blur', function () {
        !a.invalidHours && a.hours < 10 && a.$apply(function () {
          a.hours = i(a.hours);
        });
      }), a.updateMinutes = function () {
        var a = h();
        angular.isDefined(a) ? (n.setMinutes(a), j('m')) : d(void 0, !0);
      }, c.bind('blur', function () {
        !a.invalidMinutes && a.minutes < 10 && a.$apply(function () {
          a.minutes = i(a.minutes);
        });
      });
    }, this.render = function () {
      var a = o.$modelValue ? new Date(o.$modelValue) : null;
      isNaN(a) ? (o.$setValidity('time', !1), d.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (a && (n = a), k(), l());
    }, a.incrementHours = function () {
      m(60 * q);
    }, a.decrementHours = function () {
      m(60 * -q);
    }, a.incrementMinutes = function () {
      m(r);
    }, a.decrementMinutes = function () {
      m(-r);
    }, a.toggleMeridian = function () {
      m(720 * (n.getHours() < 12 ? 1 : -1));
    };
  }
]).directive('timepicker', function () {
  return {
    restrict: 'EA',
    require: [
      'timepicker',
      '?^ngModel'
    ],
    controller: 'TimepickerController',
    replace: !0,
    scope: {},
    templateUrl: 'template/timepicker/timepicker.html',
    link: function (a, b, c, d) {
      var e = d[0], f = d[1];
      f && e.init(f, b.find('input'));
    }
  };
}), angular.module('ui.bootstrap.typeahead', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).factory('typeaheadParser', [
  '$parse',
  function (a) {
    var b = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function (c) {
        var d = c.match(b);
        if (!d)
          throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "' + c + '".');
        return {
          itemName: d[3],
          source: a(d[4]),
          viewMapper: a(d[2] || d[1]),
          modelMapper: a(d[1])
        };
      }
    };
  }
]).directive('typeahead', [
  '$compile',
  '$parse',
  '$q',
  '$timeout',
  '$document',
  '$position',
  'typeaheadParser',
  function (a, b, c, d, e, f, g) {
    var h = [
        9,
        13,
        27,
        38,
        40
      ];
    return {
      require: 'ngModel',
      link: function (i, j, k, l) {
        var m, n = i.$eval(k.typeaheadMinLength) || 1, o = i.$eval(k.typeaheadWaitMs) || 0, p = i.$eval(k.typeaheadEditable) !== !1, q = b(k.typeaheadLoading).assign || angular.noop, r = b(k.typeaheadOnSelect), s = k.typeaheadInputFormatter ? b(k.typeaheadInputFormatter) : void 0, t = k.typeaheadAppendToBody ? i.$eval(k.typeaheadAppendToBody) : !1, u = i.$eval(k.typeaheadFocusFirst) !== !1, v = b(k.ngModel).assign, w = g.parse(k.typeahead), x = i.$new();
        i.$on('$destroy', function () {
          x.$destroy();
        });
        var y = 'typeahead-' + x.$id + '-' + Math.floor(10000 * Math.random());
        j.attr({
          'aria-autocomplete': 'list',
          'aria-expanded': !1,
          'aria-owns': y
        });
        var z = angular.element('<div typeahead-popup></div>');
        z.attr({
          id: y,
          matches: 'matches',
          active: 'activeIdx',
          select: 'select(activeIdx)',
          query: 'query',
          position: 'position'
        }), angular.isDefined(k.typeaheadTemplateUrl) && z.attr('template-url', k.typeaheadTemplateUrl);
        var A = function () {
            x.matches = [], x.activeIdx = -1, j.attr('aria-expanded', !1);
          }, B = function (a) {
            return y + '-option-' + a;
          };
        x.$watch('activeIdx', function (a) {
          0 > a ? j.removeAttr('aria-activedescendant') : j.attr('aria-activedescendant', B(a));
        });
        var C = function (a) {
          var b = { $viewValue: a };
          q(i, !0), c.when(w.source(i, b)).then(function (c) {
            var d = a === l.$viewValue;
            if (d && m)
              if (c.length > 0) {
                x.activeIdx = u ? 0 : -1, x.matches.length = 0;
                for (var e = 0; e < c.length; e++)
                  b[w.itemName] = c[e], x.matches.push({
                    id: B(e),
                    label: w.viewMapper(x, b),
                    model: c[e]
                  });
                x.query = a, x.position = t ? f.offset(j) : f.position(j), x.position.top = x.position.top + j.prop('offsetHeight'), j.attr('aria-expanded', !0);
              } else
                A();
            d && q(i, !1);
          }, function () {
            A(), q(i, !1);
          });
        };
        A(), x.query = void 0;
        var D, E = function (a) {
            D = d(function () {
              C(a);
            }, o);
          }, F = function () {
            D && d.cancel(D);
          };
        l.$parsers.unshift(function (a) {
          return m = !0, a && a.length >= n ? o > 0 ? (F(), E(a)) : C(a) : (q(i, !1), F(), A()), p ? a : a ? void l.$setValidity('editable', !1) : (l.$setValidity('editable', !0), a);
        }), l.$formatters.push(function (a) {
          var b, c, d = {};
          return s ? (d.$model = a, s(i, d)) : (d[w.itemName] = a, b = w.viewMapper(i, d), d[w.itemName] = void 0, c = w.viewMapper(i, d), b !== c ? b : a);
        }), x.select = function (a) {
          var b, c, e = {};
          e[w.itemName] = c = x.matches[a].model, b = w.modelMapper(i, e), v(i, b), l.$setValidity('editable', !0), r(i, {
            $item: c,
            $model: b,
            $label: w.viewMapper(i, e)
          }), A(), d(function () {
            j[0].focus();
          }, 0, !1);
        }, j.bind('keydown', function (a) {
          0 !== x.matches.length && -1 !== h.indexOf(a.which) && (-1 != x.activeIdx || 13 !== a.which && 9 !== a.which) && (a.preventDefault(), 40 === a.which ? (x.activeIdx = (x.activeIdx + 1) % x.matches.length, x.$digest()) : 38 === a.which ? (x.activeIdx = (x.activeIdx > 0 ? x.activeIdx : x.matches.length) - 1, x.$digest()) : 13 === a.which || 9 === a.which ? x.$apply(function () {
            x.select(x.activeIdx);
          }) : 27 === a.which && (a.stopPropagation(), A(), x.$digest()));
        }), j.bind('blur', function () {
          m = !1;
        });
        var G = function (a) {
          j[0] !== a.target && (A(), x.$digest());
        };
        e.bind('click', G), i.$on('$destroy', function () {
          e.unbind('click', G), t && H.remove();
        });
        var H = a(z)(x);
        t ? e.find('body').append(H) : j.after(H);
      }
    };
  }
]).directive('typeaheadPopup', function () {
  return {
    restrict: 'EA',
    scope: {
      matches: '=',
      query: '=',
      active: '=',
      position: '=',
      select: '&'
    },
    replace: !0,
    templateUrl: 'template/typeahead/typeahead-popup.html',
    link: function (a, b, c) {
      a.templateUrl = c.templateUrl, a.isOpen = function () {
        return a.matches.length > 0;
      }, a.isActive = function (b) {
        return a.active == b;
      }, a.selectActive = function (b) {
        a.active = b;
      }, a.selectMatch = function (b) {
        a.select({ activeIdx: b });
      };
    }
  };
}).directive('typeaheadMatch', [
  '$http',
  '$templateCache',
  '$compile',
  '$parse',
  function (a, b, c, d) {
    return {
      restrict: 'EA',
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function (e, f, g) {
        var h = d(g.templateUrl)(e.$parent) || 'template/typeahead/typeahead-match.html';
        a.get(h, { cache: b }).success(function (a) {
          f.replaceWith(c(a.trim())(e));
        });
      }
    };
  }
]).filter('typeaheadHighlight', function () {
  function a(a) {
    return a.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }
  return function (b, c) {
    return c ? ('' + b).replace(new RegExp(a(c), 'gi'), '<strong>$&</strong>') : b;
  };
}), angular.module('template/accordion/accordion-group.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/accordion/accordion-group.html', '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a href class="accordion-toggle" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n\t  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>\n');
  }
]), angular.module('template/accordion/accordion.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/accordion/accordion.html', '<div class="panel-group" ng-transclude></div>');
  }
]), angular.module('template/alert/alert.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/alert/alert.html', '<div class="alert" ng-class="[\'alert-\' + (type || \'warning\'), closeable ? \'alert-dismissable\' : null]" role="alert">\n    <button ng-show="closeable" type="button" class="close" ng-click="close()">\n        <span aria-hidden="true">&times;</span>\n        <span class="sr-only">Close</span>\n    </button>\n    <div ng-transclude></div>\n</div>\n');
  }
]), angular.module('template/carousel/carousel.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/carousel/carousel.html', '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel" ng-swipe-right="prev()" ng-swipe-left="next()">\n    <ol class="carousel-indicators" ng-show="slides.length > 1">\n        <li ng-repeat="slide in slides track by $index" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-left"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides.length > 1"><span class="glyphicon glyphicon-chevron-right"></span></a>\n</div>\n');
  }
]), angular.module('template/carousel/slide.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/carousel/slide.html', '<div ng-class="{\n    \'active\': leaving || (active && !entering),\n    \'prev\': (next || active) && direction==\'prev\',\n    \'next\': (next || active) && direction==\'next\',\n    \'right\': direction==\'prev\',\n    \'left\': direction==\'next\'\n  }" class="item text-center" ng-transclude></div>\n');
  }
]), angular.module('template/datepicker/datepicker.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/datepicker.html', '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">\n  <daypicker ng-switch-when="day" tabindex="0"></daypicker>\n  <monthpicker ng-switch-when="month" tabindex="0"></monthpicker>\n  <yearpicker ng-switch-when="year" tabindex="0"></yearpicker>\n</div>');
  }
]), angular.module('template/datepicker/day.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/day.html', '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr>\n      <th ng-show="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
  }
]), angular.module('template/datepicker/month.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/month.html', '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
  }
]), angular.module('template/datepicker/popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/popup.html', '<ul class="dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">\n\t<li ng-transclude></li>\n\t<li ng-if="showButtonBar" style="padding:10px 9px 2px">\n\t\t<span class="btn-group pull-left">\n\t\t\t<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>\n\t\t\t<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>\n\t\t</span>\n\t\t<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>\n\t</li>\n</ul>\n');
  }
]), angular.module('template/datepicker/year.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/datepicker/year.html', '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows track by $index">\n      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
  }
]), angular.module('template/modal/backdrop.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/modal/backdrop.html', '<div class="modal-backdrop fade {{ backdropClass }}"\n     ng-class="{in: animate}"\n     ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n></div>\n');
  }
]), angular.module('template/modal/window.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/modal/window.html', '<div tabindex="-1" role="dialog" class="modal fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog" ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}"><div class="modal-content" modal-transclude></div></div>\n</div>');
  }
]), angular.module('template/pagination/pager.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/pagination/pager.html', '<ul class="pager">\n  <li ng-class="{disabled: noPrevious(), previous: align}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-class="{disabled: noNext(), next: align}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n</ul>');
  }
]), angular.module('template/pagination/pagination.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/pagination/pagination.html', '<ul class="pagination">\n  <li ng-if="boundaryLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(1)">{{getText(\'first\')}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noPrevious()}"><a href ng-click="selectPage(page - 1)">{{getText(\'previous\')}}</a></li>\n  <li ng-repeat="page in pages track by $index" ng-class="{active: page.active}"><a href ng-click="selectPage(page.number)">{{page.text}}</a></li>\n  <li ng-if="directionLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(page + 1)">{{getText(\'next\')}}</a></li>\n  <li ng-if="boundaryLinks" ng-class="{disabled: noNext()}"><a href ng-click="selectPage(totalPages)">{{getText(\'last\')}}</a></li>\n</ul>');
  }
]), angular.module('template/tooltip/tooltip-html-unsafe-popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tooltip/tooltip-html-unsafe-popup.html', '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n');
  }
]), angular.module('template/tooltip/tooltip-popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tooltip/tooltip-popup.html', '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n');
  }
]), angular.module('template/popover/popover.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/popover/popover.html', '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n');
  }
]), angular.module('template/progressbar/bar.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/progressbar/bar.html', '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>');
  }
]), angular.module('template/progressbar/progress.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/progressbar/progress.html', '<div class="progress" ng-transclude></div>');
  }
]), angular.module('template/progressbar/progressbar.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/progressbar/progressbar.html', '<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: percent + \'%\'}" aria-valuetext="{{percent | number:0}}%" ng-transclude></div>\n</div>');
  }
]), angular.module('template/rating/rating.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/rating/rating.html', '<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}">\n    <i ng-repeat="r in range track by $index" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')">\n        <span class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    </i>\n</span>');
  }
]), angular.module('template/tabs/tab.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tabs/tab.html', '<li ng-class="{active: active, disabled: disabled}">\n  <a href ng-click="select()" tab-heading-transclude>{{heading}}</a>\n</li>\n');
  }
]), angular.module('template/tabs/tabset.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/tabs/tabset.html', '<div>\n  <ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n');
  }
]), angular.module('template/timepicker/timepicker.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/timepicker/timepicker.html', '<table>\n\t<tbody>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n\t\t\t<td>&nbsp;</td>\n\t\t\t<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n\t\t\t<td ng-show="showMeridian"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n\t\t\t\t<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t</td>\n\t\t\t<td>:</td>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n\t\t\t\t<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t</td>\n\t\t\t<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n\t\t</tr>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n\t\t\t<td>&nbsp;</td>\n\t\t\t<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n\t\t\t<td ng-show="showMeridian"></td>\n\t\t</tr>\n\t</tbody>\n</table>\n');
  }
]), angular.module('template/typeahead/typeahead-match.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/typeahead/typeahead-match.html', '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>');
  }
]), angular.module('template/typeahead/typeahead-popup.html', []).run([
  '$templateCache',
  function (a) {
    a.put('template/typeahead/typeahead-popup.html', '<ul class="dropdown-menu" ng-show="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n');
  }
]);
/**
 * oclazyload - Load modules on demand (lazy load) with angularJS
 * @version v0.5.2
 * @link https://github.com/ocombe/ocLazyLoad
 * @license MIT
 * @author Olivier Combe <olivier.combe@gmail.com>
 */
!function () {
  'use strict';
  function e(e) {
    var n = [];
    return angular.forEach(e.requires, function (e) {
      -1 === l.indexOf(e) && n.push(e);
    }), n;
  }
  function n(e) {
    try {
      return angular.module(e);
    } catch (n) {
      if (/No module/.test(n) || n.message.indexOf('$injector:nomod') > -1)
        return !1;
    }
  }
  function r(e) {
    try {
      return angular.module(e);
    } catch (n) {
      throw (/No module/.test(n) || n.message.indexOf('$injector:nomod') > -1) && (n.message = 'The module "' + e + '" that you are trying to load does not exist. ' + n.message), n;
    }
  }
  function a(e, n, r, a) {
    if (n) {
      var t, i, u, l;
      for (t = 0, i = n.length; i > t; t++)
        if (u = n[t], angular.isArray(u)) {
          if (null !== e) {
            if (!e.hasOwnProperty(u[0]))
              throw new Error('unsupported provider ' + u[0]);
            l = e[u[0]];
          }
          var s = o(u, r);
          if ('invoke' !== u[1])
            s && angular.isDefined(l) && l[u[1]].apply(l, u[2]);
          else {
            var f = function (e) {
              var n = c.indexOf(r + '-' + e);
              (-1 === n || a) && (-1 === n && c.push(r + '-' + e), angular.isDefined(l) && l[u[1]].apply(l, u[2]));
            };
            if (angular.isFunction(u[2][0]))
              f(u[2][0]);
            else if (angular.isArray(u[2][0]))
              for (var d = 0, g = u[2][0].length; g > d; d++)
                angular.isFunction(u[2][0][d]) && f(u[2][0][d]);
          }
        }
    }
  }
  function t(e, n, r) {
    if (n) {
      var o, u, s, f = [];
      for (o = n.length - 1; o >= 0; o--)
        if (u = n[o], 'string' != typeof u && (u = i(u)), u && -1 === d.indexOf(u)) {
          var c = -1 === l.indexOf(u);
          if (s = angular.module(u), c && (l.push(u), t(e, s.requires, r)), s._runBlocks.length > 0)
            for (g[u] = []; s._runBlocks.length > 0;)
              g[u].push(s._runBlocks.shift());
          angular.isDefined(g[u]) && (c || r.rerun) && (f = f.concat(g[u])), a(e, s._invokeQueue, u, r.reconfig), a(e, s._configBlocks, u, r.reconfig), p(c ? 'ocLazyLoad.moduleLoaded' : 'ocLazyLoad.moduleReloaded', u), n.pop(), d.push(u);
        }
      var h = e.getInstanceInjector();
      angular.forEach(f, function (e) {
        h.invoke(e);
      });
    }
  }
  function o(e, n) {
    var r = e[2][0], a = e[1], t = !1;
    angular.isUndefined(f[n]) && (f[n] = {}), angular.isUndefined(f[n][a]) && (f[n][a] = []);
    var o = function (e) {
      t = !0, f[n][a].push(e), p('ocLazyLoad.componentLoaded', [
        n,
        a,
        e
      ]);
    };
    if (angular.isString(r) && -1 === f[n][a].indexOf(r))
      o(r);
    else {
      if (!angular.isObject(r))
        return !1;
      angular.forEach(r, function (e) {
        angular.isString(e) && -1 === f[n][a].indexOf(e) && o(e);
      });
    }
    return t;
  }
  function i(e) {
    var n = null;
    return angular.isString(e) ? n = e : angular.isObject(e) && e.hasOwnProperty('name') && angular.isString(e.name) && (n = e.name), n;
  }
  function u(e) {
    if (0 === s.length) {
      var n = [e], r = [
          'ng:app',
          'ng-app',
          'x-ng-app',
          'data-ng-app'
        ], t = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/, o = function (e) {
          return e && n.push(e);
        };
      angular.forEach(r, function (n) {
        r[n] = !0, o(document.getElementById(n)), n = n.replace(':', '\\:'), e[0].querySelectorAll && (angular.forEach(e[0].querySelectorAll('.' + n), o), angular.forEach(e[0].querySelectorAll('.' + n + '\\:'), o), angular.forEach(e[0].querySelectorAll('[' + n + ']'), o));
      }), angular.forEach(n, function (n) {
        if (0 === s.length) {
          var a = ' ' + e.className + ' ', o = t.exec(a);
          o ? s.push((o[2] || '').replace(/\s+/g, ',')) : angular.forEach(n.attributes, function (e) {
            0 === s.length && r[e.name] && s.push(e.value);
          });
        }
      });
    }
    if (0 === s.length)
      throw 'No module found during bootstrap, unable to init ocLazyLoad';
    var i = function u(e) {
      if (-1 === l.indexOf(e)) {
        l.push(e);
        var n = angular.module(e);
        a(null, n._invokeQueue, e), a(null, n._configBlocks, e), angular.forEach(n.requires, u);
      }
    };
    angular.forEach(s, function (e) {
      i(e);
    });
  }
  var l = ['ng'], s = [], f = {}, c = [], d = [], g = {}, h = angular.module('oc.lazyLoad', ['ng']), p = angular.noop;
  h.provider('$ocLazyLoad', [
    '$controllerProvider',
    '$provide',
    '$compileProvider',
    '$filterProvider',
    '$injector',
    '$animateProvider',
    function (a, o, s, f, c, g) {
      var h, m, v, y = {}, L = {
          $controllerProvider: a,
          $compileProvider: s,
          $filterProvider: f,
          $provide: o,
          $injector: c,
          $animateProvider: g
        }, w = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0], O = !1, j = !1;
      u(angular.element(window.document)), this.$get = [
        '$log',
        '$q',
        '$templateCache',
        '$http',
        '$rootElement',
        '$rootScope',
        '$cacheFactory',
        '$interval',
        function (a, o, u, s, f, c, g, E) {
          var $, x = g('ocLazyLoad'), b = !1, z = !1;
          O || (a = {}, a.error = angular.noop, a.warn = angular.noop, a.info = angular.noop), L.getInstanceInjector = function () {
            return $ ? $ : $ = f.data('$injector') || angular.injector();
          }, p = function (e, n) {
            j && c.$broadcast(e, n), O && a.info(e, n);
          };
          var P = function (e, n, r) {
            var a, t, i = o.defer(), u = function (e) {
                var n = new Date().getTime();
                return e.indexOf('?') >= 0 ? '&' === e.substring(0, e.length - 1) ? e + '_dc=' + n : e + '&_dc=' + n : e + '?_dc=' + n;
              };
            switch (angular.isUndefined(x.get(n)) && x.put(n, i.promise), e) {
            case 'css':
              a = document.createElement('link'), a.type = 'text/css', a.rel = 'stylesheet', a.href = r.cache === !1 ? u(n) : n;
              break;
            case 'js':
              a = document.createElement('script'), a.src = r.cache === !1 ? u(n) : n;
              break;
            default:
              i.reject(new Error('Requested type "' + e + '" is not known. Could not inject "' + n + '"'));
            }
            a.onload = a.onreadystatechange = function () {
              a.readyState && !/^c|loade/.test(a.readyState) || t || (a.onload = a.onreadystatechange = null, t = 1, p('ocLazyLoad.fileLoaded', n), i.resolve());
            }, a.onerror = function () {
              i.reject(new Error('Unable to load ' + n));
            }, a.async = r.serie ? 0 : 1;
            var l = w.lastChild;
            if (r.insertBefore) {
              var s = angular.element(r.insertBefore);
              s && s.length > 0 && (l = s[0]);
            }
            if (w.insertBefore(a, l), 'css' == e) {
              if (!b) {
                var f = navigator.userAgent.toLowerCase();
                if (/iP(hone|od|ad)/.test(navigator.platform)) {
                  var c = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), d = parseFloat([
                      parseInt(c[1], 10),
                      parseInt(c[2], 10),
                      parseInt(c[3] || 0, 10)
                    ].join('.'));
                  z = 6 > d;
                } else if (f.indexOf('android') > -1) {
                  var g = parseFloat(f.slice(f.indexOf('android') + 8));
                  z = 4.4 > g;
                } else if (f.indexOf('safari') > -1 && -1 == f.indexOf('chrome')) {
                  var h = parseFloat(f.match(/version\/([\.\d]+)/i)[1]);
                  z = 6 > h;
                }
              }
              if (z)
                var m = 1000, v = E(function () {
                    try {
                      a.sheet.cssRules, E.cancel(v), a.onload();
                    } catch (e) {
                      --m <= 0 && a.onerror();
                    }
                  }, 20);
            }
            return i.promise;
          };
          angular.isUndefined(h) && (h = function (e, n, r) {
            var a = [];
            angular.forEach(e, function (e) {
              a.push(P('js', e, r));
            }), o.all(a).then(function () {
              n();
            }, function (e) {
              n(e);
            });
          }, h.ocLazyLoadLoader = !0), angular.isUndefined(m) && (m = function (e, n, r) {
            var a = [];
            angular.forEach(e, function (e) {
              a.push(P('css', e, r));
            }), o.all(a).then(function () {
              n();
            }, function (e) {
              n(e);
            });
          }, m.ocLazyLoadLoader = !0), angular.isUndefined(v) && (v = function (e, n, r) {
            var a = [];
            return angular.forEach(e, function (e) {
              var n = o.defer();
              a.push(n.promise), s.get(e, r).success(function (r) {
                angular.isString(r) && r.length > 0 && angular.forEach(angular.element(r), function (e) {
                  'SCRIPT' === e.nodeName && 'text/ng-template' === e.type && u.put(e.id, e.innerHTML);
                }), angular.isUndefined(x.get(e)) && x.put(e, !0), n.resolve();
              }).error(function (r) {
                n.reject(new Error('Unable to load template file "' + e + '": ' + r));
              });
            }), o.all(a).then(function () {
              n();
            }, function (e) {
              n(e);
            });
          }, v.ocLazyLoadLoader = !0);
          var D = function (e, n) {
            var r = [], t = [], i = [], u = [], l = null;
            angular.extend(n || {}, e);
            var s = function (e) {
              l = x.get(e), angular.isUndefined(l) || n.cache === !1 ? /\.(css|less)[^\.]*$/.test(e) && -1 === r.indexOf(e) ? r.push(e) : /\.(htm|html)[^\.]*$/.test(e) && -1 === t.indexOf(e) ? t.push(e) : -1 === i.indexOf(e) && i.push(e) : l && u.push(l);
            };
            if (n.serie ? s(n.files.shift()) : angular.forEach(n.files, function (e) {
                s(e);
              }), r.length > 0) {
              var f = o.defer();
              m(r, function (e) {
                angular.isDefined(e) && m.hasOwnProperty('ocLazyLoadLoader') ? (a.error(e), f.reject(e)) : f.resolve();
              }, n), u.push(f.promise);
            }
            if (t.length > 0) {
              var c = o.defer();
              v(t, function (e) {
                angular.isDefined(e) && v.hasOwnProperty('ocLazyLoadLoader') ? (a.error(e), c.reject(e)) : c.resolve();
              }, n), u.push(c.promise);
            }
            if (i.length > 0) {
              var d = o.defer();
              h(i, function (e) {
                angular.isDefined(e) && h.hasOwnProperty('ocLazyLoadLoader') ? (a.error(e), d.reject(e)) : d.resolve();
              }, n), u.push(d.promise);
            }
            return n.serie && n.files.length > 0 ? o.all(u).then(function () {
              return D(e, n);
            }) : o.all(u);
          };
          return {
            getModuleConfig: function (e) {
              if (!angular.isString(e))
                throw new Error('You need to give the name of the module to get');
              return y[e] ? y[e] : null;
            },
            setModuleConfig: function (e) {
              if (!angular.isObject(e))
                throw new Error('You need to give the module config object to set');
              return y[e.name] = e, e;
            },
            getModules: function () {
              return l;
            },
            isLoaded: function (e) {
              var r = function (e) {
                var r = l.indexOf(e) > -1;
                return r || (r = !!n(e)), r;
              };
              if (angular.isString(e) && (e = [e]), angular.isArray(e)) {
                var a, t;
                for (a = 0, t = e.length; t > a; a++)
                  if (!r(e[a]))
                    return !1;
                return !0;
              }
              throw new Error('You need to define the module(s) name(s)');
            },
            load: function (u, s) {
              var f, c, g = this, h = null, p = [], m = [], v = o.defer();
              if (angular.isUndefined(s) && (s = {}), angular.isArray(u))
                return angular.forEach(u, function (e) {
                  e && m.push(g.load(e, s));
                }), o.all(m).then(function () {
                  v.resolve(u);
                }, function (e) {
                  v.reject(e);
                }), v.promise;
              if (f = i(u), 'string' == typeof u ? (h = g.getModuleConfig(u), h || (h = { files: [u] }, f = null)) : 'object' == typeof u && (h = g.setModuleConfig(u)), null === h ? (c = 'Module "' + f + '" is not configured, cannot load.', a.error(c), v.reject(new Error(c))) : angular.isDefined(h.template) && (angular.isUndefined(h.files) && (h.files = []), angular.isString(h.template) ? h.files.push(h.template) : angular.isArray(h.template) && h.files.concat(h.template)), p.push = function (e) {
                  -1 === this.indexOf(e) && Array.prototype.push.apply(this, arguments);
                }, angular.isDefined(f) && n(f) && -1 !== l.indexOf(f) && (p.push(f), angular.isUndefined(h.files)))
                return v.resolve(), v.promise;
              var y = {};
              angular.extend(y, s, h);
              var w = function O(t) {
                var u, l, s, f, c = [];
                if (u = i(t), null === u)
                  return o.when();
                try {
                  l = r(u);
                } catch (d) {
                  var h = o.defer();
                  return a.error(d.message), h.reject(d), h.promise;
                }
                return s = e(l), angular.forEach(s, function (e) {
                  if ('string' == typeof e) {
                    var r = g.getModuleConfig(e);
                    if (null === r)
                      return void p.push(e);
                    e = r;
                  }
                  return n(e.name) ? void ('string' != typeof t && (f = e.files.filter(function (n) {
                    return g.getModuleConfig(e.name).files.indexOf(n) < 0;
                  }), 0 !== f.length && a.warn('Module "', u, '" attempted to redefine configuration for dependency. "', e.name, '"\n Additional Files Loaded:', f), c.push(D(e.files, y).then(function () {
                    return O(e);
                  })))) : ('object' == typeof e && (e.hasOwnProperty('name') && e.name && (g.setModuleConfig(e), p.push(e.name)), e.hasOwnProperty('css') && 0 !== e.css.length && angular.forEach(e.css, function (e) {
                    P('css', e, y);
                  })), void (e.hasOwnProperty('files') && 0 !== e.files.length && e.files && c.push(D(e, y).then(function () {
                    return O(e);
                  }))));
                }), o.all(c);
              };
              return D(h, y).then(function () {
                null === f ? v.resolve(u) : (p.push(f), w(f).then(function () {
                  try {
                    d = [], t(L, p, y);
                  } catch (e) {
                    return a.error(e.message), void v.reject(e);
                  }
                  v.resolve(u);
                }, function (e) {
                  v.reject(e);
                }));
              }, function (e) {
                v.reject(e);
              }), v.promise;
            }
          };
        }
      ], this.config = function (e) {
        if (angular.isDefined(e.jsLoader) || angular.isDefined(e.asyncLoader)) {
          if (!angular.isFunction(e.jsLoader || e.asyncLoader))
            throw 'The js loader needs to be a function';
          h = e.jsLoader || e.asyncLoader;
        }
        if (angular.isDefined(e.cssLoader)) {
          if (!angular.isFunction(e.cssLoader))
            throw 'The css loader needs to be a function';
          m = e.cssLoader;
        }
        if (angular.isDefined(e.templatesLoader)) {
          if (!angular.isFunction(e.templatesLoader))
            throw 'The template loader needs to be a function';
          v = e.templatesLoader;
        }
        angular.isDefined(e.modules) && (angular.isArray(e.modules) ? angular.forEach(e.modules, function (e) {
          y[e.name] = e;
        }) : y[e.modules.name] = e.modules), angular.isDefined(e.debug) && (O = e.debug), angular.isDefined(e.events) && (j = e.events);
      };
    }
  ]), h.directive('ocLazyLoad', [
    '$ocLazyLoad',
    '$compile',
    '$animate',
    '$parse',
    function (e, n, r, a) {
      return {
        restrict: 'A',
        terminal: !0,
        priority: 1000,
        compile: function (t) {
          var o = t[0].innerHTML;
          return t.html(''), function (t, i, u) {
            var l = a(u.ocLazyLoad);
            t.$watch(function () {
              return l(t) || u.ocLazyLoad;
            }, function (a) {
              angular.isDefined(a) && e.load(a).then(function () {
                r.enter(n(o)(t), null, i);
              });
            }, !0);
          };
        }
      };
    }
  ]);
  var m = angular.bootstrap;
  angular.bootstrap = function (e, n, r) {
    return s = n.slice(), m(e, n, r);
  }, Array.prototype.indexOf || (Array.prototype.indexOf = function (e, n) {
    var r;
    if (null == this)
      throw new TypeError('"this" is null or not defined');
    var a = Object(this), t = a.length >>> 0;
    if (0 === t)
      return -1;
    var o = +n || 0;
    if (1 / 0 === Math.abs(o) && (o = 0), o >= t)
      return -1;
    for (r = Math.max(o >= 0 ? o : t - Math.abs(o), 0); t > r;) {
      if (r in a && a[r] === e)
        return r;
      r++;
    }
    return -1;
  });
}();
/*!
 * angular-translate - v2.6.1 - 2015-03-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
angular.module('pascalprecht.translate', ['ng']).run([
  '$translate',
  function (a) {
    var b = a.storageKey(), c = a.storage(), d = function () {
        var d = a.preferredLanguage();
        angular.isString(d) ? a.use(d) : c.put(b, a.use());
      };
    c ? c.get(b) ? a.use(c.get(b))['catch'](d) : d() : angular.isString(a.preferredLanguage()) && a.use(a.preferredLanguage());
  }
]), angular.module('pascalprecht.translate').provider('$translate', [
  '$STORAGE_KEY',
  '$windowProvider',
  function (a, b) {
    var c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r = {}, s = [], t = a, u = [], v = !1, w = 'translate-cloak', x = !1, y = '.', z = 0, A = '2.6.1', B = function () {
        var a, c, d = b.$get().navigator, e = [
            'language',
            'browserLanguage',
            'systemLanguage',
            'userLanguage'
          ];
        if (angular.isArray(d.languages))
          for (a = 0; a < d.languages.length; a++)
            if (c = d.languages[a], c && c.length)
              return c;
        for (a = 0; a < e.length; a++)
          if (c = d[e[a]], c && c.length)
            return c;
        return null;
      };
    B.displayName = 'angular-translate/service: getFirstBrowserLanguage';
    var C = function () {
      return (B() || '').split('-').join('_');
    };
    C.displayName = 'angular-translate/service: getLocale';
    var D = function (a, b) {
        for (var c = 0, d = a.length; d > c; c++)
          if (a[c] === b)
            return c;
        return -1;
      }, E = function () {
        return this.replace(/^\s+|\s+$/g, '');
      }, F = function (a) {
        for (var b = [], c = angular.lowercase(a), e = 0, f = s.length; f > e; e++)
          b.push(angular.lowercase(s[e]));
        if (D(b, c) > -1)
          return a;
        if (d) {
          var g;
          for (var h in d) {
            var i = !1, j = Object.prototype.hasOwnProperty.call(d, h) && angular.lowercase(h) === angular.lowercase(a);
            if ('*' === h.slice(-1) && (i = h.slice(0, -1) === a.slice(0, h.length - 1)), (j || i) && (g = d[h], D(b, angular.lowercase(g)) > -1))
              return g;
          }
        }
        var k = a.split('_');
        return k.length > 1 && D(b, angular.lowercase(k[0])) > -1 ? k[0] : a;
      }, G = function (a, b) {
        if (!a && !b)
          return r;
        if (a && !b) {
          if (angular.isString(a))
            return r[a];
        } else
          angular.isObject(r[a]) || (r[a] = {}), angular.extend(r[a], H(b));
        return this;
      };
    this.translations = G, this.cloakClassName = function (a) {
      return a ? (w = a, this) : w;
    };
    var H = function (a, b, c, d) {
      var e, f, g, h;
      b || (b = []), c || (c = {});
      for (e in a)
        Object.prototype.hasOwnProperty.call(a, e) && (h = a[e], angular.isObject(h) ? H(h, b.concat(e), c, e) : (f = b.length ? '' + b.join(y) + y + e : e, b.length && e === d && (g = '' + b.join(y), c[g] = '@:' + f), c[f] = h));
      return c;
    };
    this.addInterpolation = function (a) {
      return u.push(a), this;
    }, this.useMessageFormatInterpolation = function () {
      return this.useInterpolation('$translateMessageFormatInterpolation');
    }, this.useInterpolation = function (a) {
      return l = a, this;
    }, this.useSanitizeValueStrategy = function (a) {
      return v = a, this;
    }, this.preferredLanguage = function (a) {
      return I(a), this;
    };
    var I = function (a) {
      return a && (c = a), c;
    };
    this.translationNotFoundIndicator = function (a) {
      return this.translationNotFoundIndicatorLeft(a), this.translationNotFoundIndicatorRight(a), this;
    }, this.translationNotFoundIndicatorLeft = function (a) {
      return a ? (o = a, this) : o;
    }, this.translationNotFoundIndicatorRight = function (a) {
      return a ? (p = a, this) : p;
    }, this.fallbackLanguage = function (a) {
      return J(a), this;
    };
    var J = function (a) {
      return a ? (angular.isString(a) ? (f = !0, e = [a]) : angular.isArray(a) && (f = !1, e = a), angular.isString(c) && D(e, c) < 0 && e.push(c), this) : f ? e[0] : e;
    };
    this.use = function (a) {
      if (a) {
        if (!r[a] && !m)
          throw new Error('$translateProvider couldn\'t find translationTable for langKey: \'' + a + '\'');
        return g = a, this;
      }
      return g;
    };
    var K = function (a) {
      return a ? void (t = a) : j ? j + t : t;
    };
    this.storageKey = K, this.useUrlLoader = function (a, b) {
      return this.useLoader('$translateUrlLoader', angular.extend({ url: a }, b));
    }, this.useStaticFilesLoader = function (a) {
      return this.useLoader('$translateStaticFilesLoader', a);
    }, this.useLoader = function (a, b) {
      return m = a, n = b || {}, this;
    }, this.useLocalStorage = function () {
      return this.useStorage('$translateLocalStorage');
    }, this.useCookieStorage = function () {
      return this.useStorage('$translateCookieStorage');
    }, this.useStorage = function (a) {
      return i = a, this;
    }, this.storagePrefix = function (a) {
      return a ? (j = a, this) : a;
    }, this.useMissingTranslationHandlerLog = function () {
      return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
    }, this.useMissingTranslationHandler = function (a) {
      return k = a, this;
    }, this.usePostCompiling = function (a) {
      return x = !!a, this;
    }, this.determinePreferredLanguage = function (a) {
      var b = a && angular.isFunction(a) ? a() : C();
      return c = s.length ? F(b) : b, this;
    }, this.registerAvailableLanguageKeys = function (a, b) {
      return a ? (s = a, b && (d = b), this) : s;
    }, this.useLoaderCache = function (a) {
      return a === !1 ? q = void 0 : a === !0 ? q = !0 : 'undefined' == typeof a ? q = '$translationCache' : a && (q = a), this;
    }, this.directivePriority = function (a) {
      return void 0 === a ? z : (z = a, this);
    }, this.$get = [
      '$log',
      '$injector',
      '$rootScope',
      '$q',
      function (a, b, d, j) {
        var s, y, B, C = b.get(l || '$translateDefaultInterpolation'), L = !1, M = {}, N = {}, O = function (a, b, d, f) {
            if (angular.isArray(a)) {
              var h = function (a) {
                for (var c = {}, e = [], g = function (a) {
                      var e = j.defer(), g = function (b) {
                          c[a] = b, e.resolve([
                            a,
                            b
                          ]);
                        };
                      return O(a, b, d, f).then(g, g), e.promise;
                    }, h = 0, i = a.length; i > h; h++)
                  e.push(g(a[h]));
                return j.all(e).then(function () {
                  return c;
                });
              };
              return h(a);
            }
            var k = j.defer();
            a && (a = E.apply(a));
            var l = function () {
                var a = c ? N[c] : N[g];
                if (y = 0, i && !a) {
                  var b = s.get(t);
                  if (a = N[b], e && e.length) {
                    var d = D(e, b);
                    y = 0 === d ? 1 : 0, D(e, c) < 0 && e.push(c);
                  }
                }
                return a;
              }();
            return l ? l.then(function () {
              $(a, b, d, f).then(k.resolve, k.reject);
            }, k.reject) : $(a, b, d, f).then(k.resolve, k.reject), k.promise;
          }, P = function (a) {
            return o && (a = [
              o,
              a
            ].join(' ')), p && (a = [
              a,
              p
            ].join(' ')), a;
          }, Q = function (a) {
            g = a, d.$emit('$translateChangeSuccess', { language: a }), i && s.put(O.storageKey(), g), C.setLocale(g), angular.forEach(M, function (a, b) {
              M[b].setLocale(g);
            }), d.$emit('$translateChangeEnd', { language: a });
          }, R = function (a) {
            if (!a)
              throw 'No language key specified for loading.';
            var c = j.defer();
            d.$emit('$translateLoadingStart', { language: a }), L = !0;
            var e = q;
            'string' == typeof e && (e = b.get(e));
            var f = angular.extend({}, n, {
                key: a,
                $http: angular.extend({}, { cache: e }, n.$http)
              });
            return b.get(m)(f).then(function (b) {
              var e = {};
              d.$emit('$translateLoadingSuccess', { language: a }), angular.isArray(b) ? angular.forEach(b, function (a) {
                angular.extend(e, H(a));
              }) : angular.extend(e, H(b)), L = !1, c.resolve({
                key: a,
                table: e
              }), d.$emit('$translateLoadingEnd', { language: a });
            }, function (a) {
              d.$emit('$translateLoadingError', { language: a }), c.reject(a), d.$emit('$translateLoadingEnd', { language: a });
            }), c.promise;
          };
        if (i && (s = b.get(i), !s.get || !s.put))
          throw new Error('Couldn\'t use storage \'' + i + '\', missing get() or put() method!');
        angular.isFunction(C.useSanitizeValueStrategy) && C.useSanitizeValueStrategy(v), u.length && angular.forEach(u, function (a) {
          var d = b.get(a);
          d.setLocale(c || g), angular.isFunction(d.useSanitizeValueStrategy) && d.useSanitizeValueStrategy(v), M[d.getInterpolationIdentifier()] = d;
        });
        var S = function (a) {
            var b = j.defer();
            return Object.prototype.hasOwnProperty.call(r, a) ? b.resolve(r[a]) : N[a] ? N[a].then(function (a) {
              G(a.key, a.table), b.resolve(a.table);
            }, b.reject) : b.reject(), b.promise;
          }, T = function (a, b, c, d) {
            var e = j.defer();
            return S(a).then(function (f) {
              if (Object.prototype.hasOwnProperty.call(f, b)) {
                d.setLocale(a);
                var h = f[b];
                '@:' === h.substr(0, 2) ? T(a, h.substr(2), c, d).then(e.resolve, e.reject) : e.resolve(d.interpolate(f[b], c)), d.setLocale(g);
              } else
                e.reject();
            }, e.reject), e.promise;
          }, U = function (a, b, c, d) {
            var e, f = r[a];
            if (f && Object.prototype.hasOwnProperty.call(f, b)) {
              if (d.setLocale(a), e = d.interpolate(f[b], c), '@:' === e.substr(0, 2))
                return U(a, e.substr(2), c, d);
              d.setLocale(g);
            }
            return e;
          }, V = function (a) {
            if (k) {
              var c = b.get(k)(a, g);
              return void 0 !== c ? c : a;
            }
            return a;
          }, W = function (a, b, c, d, f) {
            var g = j.defer();
            if (a < e.length) {
              var h = e[a];
              T(h, b, c, d).then(g.resolve, function () {
                W(a + 1, b, c, d, f).then(g.resolve);
              });
            } else
              g.resolve(f ? f : V(b));
            return g.promise;
          }, X = function (a, b, c, d) {
            var f;
            if (a < e.length) {
              var g = e[a];
              f = U(g, b, c, d), f || (f = X(a + 1, b, c, d));
            }
            return f;
          }, Y = function (a, b, c, d) {
            return W(B > 0 ? B : y, a, b, c, d);
          }, Z = function (a, b, c) {
            return X(B > 0 ? B : y, a, b, c);
          }, $ = function (a, b, c, d) {
            var f = j.defer(), h = g ? r[g] : r, i = c ? M[c] : C;
            if (h && Object.prototype.hasOwnProperty.call(h, a)) {
              var l = h[a];
              '@:' === l.substr(0, 2) ? O(l.substr(2), b, c, d).then(f.resolve, f.reject) : f.resolve(i.interpolate(l, b));
            } else {
              var m;
              k && !L && (m = V(a)), g && e && e.length ? Y(a, b, i, d).then(function (a) {
                f.resolve(a);
              }, function (a) {
                f.reject(P(a));
              }) : k && !L && m ? f.resolve(d ? d : m) : d ? f.resolve(d) : f.reject(P(a));
            }
            return f.promise;
          }, _ = function (a, b, c) {
            var d, f = g ? r[g] : r, h = C;
            if (M && Object.prototype.hasOwnProperty.call(M, c) && (h = M[c]), f && Object.prototype.hasOwnProperty.call(f, a)) {
              var i = f[a];
              d = '@:' === i.substr(0, 2) ? _(i.substr(2), b, c) : h.interpolate(i, b);
            } else {
              var j;
              k && !L && (j = V(a)), g && e && e.length ? (y = 0, d = Z(a, b, h)) : d = k && !L && j ? j : P(a);
            }
            return d;
          };
        if (O.preferredLanguage = function (a) {
            return a && I(a), c;
          }, O.cloakClassName = function () {
            return w;
          }, O.fallbackLanguage = function (a) {
            if (void 0 !== a && null !== a) {
              if (J(a), m && e && e.length)
                for (var b = 0, c = e.length; c > b; b++)
                  N[e[b]] || (N[e[b]] = R(e[b]));
              O.use(O.use());
            }
            return f ? e[0] : e;
          }, O.useFallbackLanguage = function (a) {
            if (void 0 !== a && null !== a)
              if (a) {
                var b = D(e, a);
                b > -1 && (B = b);
              } else
                B = 0;
          }, O.proposedLanguage = function () {
            return h;
          }, O.storage = function () {
            return s;
          }, O.use = function (a) {
            if (!a)
              return g;
            var b = j.defer();
            d.$emit('$translateChangeStart', { language: a });
            var c = F(a);
            return c && (a = c), r[a] || !m || N[a] ? (b.resolve(a), Q(a)) : (h = a, N[a] = R(a).then(function (c) {
              return G(c.key, c.table), b.resolve(c.key), Q(c.key), h === a && (h = void 0), c;
            }, function (a) {
              h === a && (h = void 0), d.$emit('$translateChangeError', { language: a }), b.reject(a), d.$emit('$translateChangeEnd', { language: a });
            })), b.promise;
          }, O.storageKey = function () {
            return K();
          }, O.isPostCompilingEnabled = function () {
            return x;
          }, O.refresh = function (a) {
            function b() {
              f.resolve(), d.$emit('$translateRefreshEnd', { language: a });
            }
            function c() {
              f.reject(), d.$emit('$translateRefreshEnd', { language: a });
            }
            if (!m)
              throw new Error('Couldn\'t refresh translation table, no loader registered!');
            var f = j.defer();
            if (d.$emit('$translateRefreshStart', { language: a }), a)
              r[a] ? R(a).then(function (c) {
                G(c.key, c.table), a === g && Q(g), b();
              }, c) : c();
            else {
              var h = [], i = {};
              if (e && e.length)
                for (var k = 0, l = e.length; l > k; k++)
                  h.push(R(e[k])), i[e[k]] = !0;
              g && !i[g] && h.push(R(g)), j.all(h).then(function (a) {
                angular.forEach(a, function (a) {
                  r[a.key] && delete r[a.key], G(a.key, a.table);
                }), g && Q(g), b();
              });
            }
            return f.promise;
          }, O.instant = function (a, b, d) {
            if (null === a || angular.isUndefined(a))
              return a;
            if (angular.isArray(a)) {
              for (var f = {}, h = 0, i = a.length; i > h; h++)
                f[a[h]] = O.instant(a[h], b, d);
              return f;
            }
            if (angular.isString(a) && a.length < 1)
              return a;
            a && (a = E.apply(a));
            var j, l = [];
            c && l.push(c), g && l.push(g), e && e.length && (l = l.concat(e));
            for (var m = 0, n = l.length; n > m; m++) {
              var q = l[m];
              if (r[q] && ('undefined' != typeof r[q][a] ? j = _(a, b, d) : (o || p) && (j = P(a))), 'undefined' != typeof j)
                break;
            }
            return j || '' === j || (j = C.interpolate(a, b), k && !L && (j = V(a))), j;
          }, O.versionInfo = function () {
            return A;
          }, O.loaderCache = function () {
            return q;
          }, O.directivePriority = function () {
            return z;
          }, m && (angular.equals(r, {}) && O.use(O.use()), e && e.length))
          for (var ab = function (a) {
                return G(a.key, a.table), d.$emit('$translateChangeEnd', { language: a.key }), a;
              }, bb = 0, cb = e.length; cb > bb; bb++)
            N[e[bb]] = R(e[bb]).then(ab);
        return O;
      }
    ];
  }
]), angular.module('pascalprecht.translate').factory('$translateDefaultInterpolation', [
  '$interpolate',
  function (a) {
    var b, c = {}, d = 'default', e = null, f = {
        escaped: function (a) {
          var b = {};
          for (var c in a)
            Object.prototype.hasOwnProperty.call(a, c) && (b[c] = angular.isNumber(a[c]) ? a[c] : angular.element('<div></div>').text(a[c]).html());
          return b;
        }
      }, g = function (a) {
        var b;
        return b = angular.isFunction(f[e]) ? f[e](a) : a;
      };
    return c.setLocale = function (a) {
      b = a;
    }, c.getInterpolationIdentifier = function () {
      return d;
    }, c.useSanitizeValueStrategy = function (a) {
      return e = a, this;
    }, c.interpolate = function (b, c) {
      return e && (c = g(c)), a(b)(c || {});
    }, c;
  }
]), angular.module('pascalprecht.translate').constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY'), angular.module('pascalprecht.translate').directive('translate', [
  '$translate',
  '$q',
  '$interpolate',
  '$compile',
  '$parse',
  '$rootScope',
  function (a, b, c, d, e, f) {
    var g = function () {
      return this.replace(/^\s+|\s+$/g, '');
    };
    return {
      restrict: 'AE',
      scope: !0,
      priority: a.directivePriority(),
      compile: function (b, h) {
        var i = h.translateValues ? h.translateValues : void 0, j = h.translateInterpolation ? h.translateInterpolation : void 0, k = b[0].outerHTML.match(/translate-value-+/i), l = '^(.*)(' + c.startSymbol() + '.*' + c.endSymbol() + ')(.*)', m = '^(.*)' + c.startSymbol() + '(.*)' + c.endSymbol() + '(.*)';
        return function (b, n, o) {
          b.interpolateParams = {}, b.preText = '', b.postText = '';
          var p = {}, q = function (a) {
              if (angular.isFunction(q._unwatchOld) && (q._unwatchOld(), q._unwatchOld = void 0), angular.equals(a, '') || !angular.isDefined(a)) {
                var d = g.apply(n.text()).match(l);
                if (angular.isArray(d)) {
                  b.preText = d[1], b.postText = d[3], p.translate = c(d[2])(b.$parent);
                  var e = n.text().match(m);
                  angular.isArray(e) && e[2] && e[2].length && (q._unwatchOld = b.$watch(e[2], function (a) {
                    p.translate = a, w();
                  }));
                } else
                  p.translate = n.text().replace(/^\s+|\s+$/g, '');
              } else
                p.translate = a;
              w();
            }, r = function (a) {
              o.$observe(a, function (b) {
                p[a] = b, w();
              });
            }, s = !0;
          o.$observe('translate', function (a) {
            'undefined' == typeof a ? q('') : '' === a && s || (p.translate = a, w()), s = !1;
          });
          for (var t in o)
            o.hasOwnProperty(t) && 'translateAttr' === t.substr(0, 13) && r(t);
          if (o.$observe('translateDefault', function (a) {
              b.defaultText = a;
            }), i && o.$observe('translateValues', function (a) {
              a && b.$parent.$watch(function () {
                angular.extend(b.interpolateParams, e(a)(b.$parent));
              });
            }), k) {
            var u = function (a) {
              o.$observe(a, function (c) {
                var d = angular.lowercase(a.substr(14, 1)) + a.substr(15);
                b.interpolateParams[d] = c;
              });
            };
            for (var v in o)
              Object.prototype.hasOwnProperty.call(o, v) && 'translateValue' === v.substr(0, 14) && 'translateValues' !== v && u(v);
          }
          var w = function () {
              for (var a in p)
                p.hasOwnProperty(a) && x(a, p[a], b, b.interpolateParams, b.defaultText);
            }, x = function (b, c, d, e, f) {
              c ? a(c, e, j, f).then(function (a) {
                y(a, d, !0, b);
              }, function (a) {
                y(a, d, !1, b);
              }) : y(c, d, !1, b);
            }, y = function (b, c, e, f) {
              if ('translate' === f) {
                e || 'undefined' == typeof c.defaultText || (b = c.defaultText), n.html(c.preText + b + c.postText);
                var g = a.isPostCompilingEnabled(), i = 'undefined' != typeof h.translateCompile, j = i && 'false' !== h.translateCompile;
                (g && !i || j) && d(n.contents())(c);
              } else {
                e || 'undefined' == typeof c.defaultText || (b = c.defaultText);
                var k = o.$attr[f].substr(15);
                n.attr(k, b);
              }
            };
          b.$watch('interpolateParams', w, !0);
          var z = f.$on('$translateChangeSuccess', w);
          n.text().length && q(''), w(), b.$on('$destroy', z);
        };
      }
    };
  }
]), angular.module('pascalprecht.translate').directive('translateCloak', [
  '$rootScope',
  '$translate',
  function (a, b) {
    return {
      compile: function (c) {
        var d = function () {
            c.addClass(b.cloakClassName());
          }, e = function () {
            c.removeClass(b.cloakClassName());
          }, f = a.$on('$translateChangeEnd', function () {
            e(), f(), f = null;
          });
        return d(), function (a, c, f) {
          f.translateCloak && f.translateCloak.length && f.$observe('translateCloak', function (a) {
            b(a).then(e, d);
          });
        };
      }
    };
  }
]), angular.module('pascalprecht.translate').filter('translate', [
  '$parse',
  '$translate',
  function (a, b) {
    var c = function (c, d, e) {
      return angular.isObject(d) || (d = a(d)(this)), b.instant(c, d, e);
    };
    return c.$stateful = !0, c;
  }
]);
/*!
 * angular-translate - v2.6.1 - 2015-03-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateStaticFilesLoader', [
  '$q',
  '$http',
  function (a, b) {
    return function (c) {
      if (!(c && (angular.isArray(c.files) || angular.isString(c.prefix) && angular.isString(c.suffix))))
        throw new Error('Couldn\'t load static files, no files and prefix or suffix specified!');
      c.files || (c.files = [{
          prefix: c.prefix,
          suffix: c.suffix
        }]);
      for (var d = function (d) {
            if (!d || !angular.isString(d.prefix) || !angular.isString(d.suffix))
              throw new Error('Couldn\'t load static file, no prefix or suffix specified!');
            var e = a.defer();
            return b(angular.extend({
              url: [
                d.prefix,
                c.key,
                d.suffix
              ].join(''),
              method: 'GET',
              params: ''
            }, c.$http)).success(function (a) {
              e.resolve(a);
            }).error(function () {
              e.reject(c.key);
            }), e.promise;
          }, e = a.defer(), f = [], g = c.files.length, h = 0; g > h; h++)
        f.push(d({
          prefix: c.files[h].prefix,
          key: c.key,
          suffix: c.files[h].suffix
        }));
      return a.all(f).then(function (a) {
        for (var b = a.length, c = {}, d = 0; b > d; d++)
          for (var f in a[d])
            c[f] = a[d][f];
        e.resolve(c);
      }, function (a) {
        e.reject(a);
      }), e.promise;
    };
  }
]);
/*!
 * angular-translate - v2.6.1 - 2015-03-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateCookieStorage', [
  '$cookieStore',
  function (a) {
    var b = {
        get: function (b) {
          return a.get(b);
        },
        set: function (b, c) {
          a.put(b, c);
        },
        put: function (b, c) {
          a.put(b, c);
        }
      };
    return b;
  }
]);
/*!
 * angular-translate - v2.6.1 - 2015-03-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateLocalStorage', [
  '$window',
  '$translateCookieStorage',
  function (a, b) {
    var c = function () {
        var b;
        return {
          get: function (c) {
            return b || (b = a.localStorage.getItem(c)), b;
          },
          set: function (c, d) {
            b = d, a.localStorage.setItem(c, d);
          },
          put: function (c, d) {
            b = d, a.localStorage.setItem(c, d);
          }
        };
      }(), d = 'localStorage' in a;
    if (d) {
      var e = 'pascalprecht.translate.storageTest';
      try {
        null !== a.localStorage ? (a.localStorage.setItem(e, 'foo'), a.localStorage.removeItem(e), d = !0) : d = !1;
      } catch (f) {
        d = !1;
      }
    }
    var g = d ? c : b;
    return g;
  }
]);
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function () {
  var n = this, t = n._, r = Array.prototype, e = Object.prototype, u = Function.prototype, i = r.push, a = r.slice, o = r.concat, l = e.toString, c = e.hasOwnProperty, f = Array.isArray, s = Object.keys, p = u.bind, h = function (n) {
      return n instanceof h ? n : this instanceof h ? void (this._wrapped = n) : new h(n);
    };
  'undefined' != typeof exports ? ('undefined' != typeof module && module.exports && (exports = module.exports = h), exports._ = h) : n._ = h, h.VERSION = '1.7.0';
  var g = function (n, t, r) {
    if (t === void 0)
      return n;
    switch (null == r ? 3 : r) {
    case 1:
      return function (r) {
        return n.call(t, r);
      };
    case 2:
      return function (r, e) {
        return n.call(t, r, e);
      };
    case 3:
      return function (r, e, u) {
        return n.call(t, r, e, u);
      };
    case 4:
      return function (r, e, u, i) {
        return n.call(t, r, e, u, i);
      };
    }
    return function () {
      return n.apply(t, arguments);
    };
  };
  h.iteratee = function (n, t, r) {
    return null == n ? h.identity : h.isFunction(n) ? g(n, t, r) : h.isObject(n) ? h.matches(n) : h.property(n);
  }, h.each = h.forEach = function (n, t, r) {
    if (null == n)
      return n;
    t = g(t, r);
    var e, u = n.length;
    if (u === +u)
      for (e = 0; u > e; e++)
        t(n[e], e, n);
    else {
      var i = h.keys(n);
      for (e = 0, u = i.length; u > e; e++)
        t(n[i[e]], i[e], n);
    }
    return n;
  }, h.map = h.collect = function (n, t, r) {
    if (null == n)
      return [];
    t = h.iteratee(t, r);
    for (var e, u = n.length !== +n.length && h.keys(n), i = (u || n).length, a = Array(i), o = 0; i > o; o++)
      e = u ? u[o] : o, a[o] = t(n[e], e, n);
    return a;
  };
  var v = 'Reduce of empty array with no initial value';
  h.reduce = h.foldl = h.inject = function (n, t, r, e) {
    null == n && (n = []), t = g(t, e, 4);
    var u, i = n.length !== +n.length && h.keys(n), a = (i || n).length, o = 0;
    if (arguments.length < 3) {
      if (!a)
        throw new TypeError(v);
      r = n[i ? i[o++] : o++];
    }
    for (; a > o; o++)
      u = i ? i[o] : o, r = t(r, n[u], u, n);
    return r;
  }, h.reduceRight = h.foldr = function (n, t, r, e) {
    null == n && (n = []), t = g(t, e, 4);
    var u, i = n.length !== +n.length && h.keys(n), a = (i || n).length;
    if (arguments.length < 3) {
      if (!a)
        throw new TypeError(v);
      r = n[i ? i[--a] : --a];
    }
    for (; a--;)
      u = i ? i[a] : a, r = t(r, n[u], u, n);
    return r;
  }, h.find = h.detect = function (n, t, r) {
    var e;
    return t = h.iteratee(t, r), h.some(n, function (n, r, u) {
      return t(n, r, u) ? (e = n, !0) : void 0;
    }), e;
  }, h.filter = h.select = function (n, t, r) {
    var e = [];
    return null == n ? e : (t = h.iteratee(t, r), h.each(n, function (n, r, u) {
      t(n, r, u) && e.push(n);
    }), e);
  }, h.reject = function (n, t, r) {
    return h.filter(n, h.negate(h.iteratee(t)), r);
  }, h.every = h.all = function (n, t, r) {
    if (null == n)
      return !0;
    t = h.iteratee(t, r);
    var e, u, i = n.length !== +n.length && h.keys(n), a = (i || n).length;
    for (e = 0; a > e; e++)
      if (u = i ? i[e] : e, !t(n[u], u, n))
        return !1;
    return !0;
  }, h.some = h.any = function (n, t, r) {
    if (null == n)
      return !1;
    t = h.iteratee(t, r);
    var e, u, i = n.length !== +n.length && h.keys(n), a = (i || n).length;
    for (e = 0; a > e; e++)
      if (u = i ? i[e] : e, t(n[u], u, n))
        return !0;
    return !1;
  }, h.contains = h.include = function (n, t) {
    return null == n ? !1 : (n.length !== +n.length && (n = h.values(n)), h.indexOf(n, t) >= 0);
  }, h.invoke = function (n, t) {
    var r = a.call(arguments, 2), e = h.isFunction(t);
    return h.map(n, function (n) {
      return (e ? t : n[t]).apply(n, r);
    });
  }, h.pluck = function (n, t) {
    return h.map(n, h.property(t));
  }, h.where = function (n, t) {
    return h.filter(n, h.matches(t));
  }, h.findWhere = function (n, t) {
    return h.find(n, h.matches(t));
  }, h.max = function (n, t, r) {
    var e, u, i = -1 / 0, a = -1 / 0;
    if (null == t && null != n) {
      n = n.length === +n.length ? n : h.values(n);
      for (var o = 0, l = n.length; l > o; o++)
        e = n[o], e > i && (i = e);
    } else
      t = h.iteratee(t, r), h.each(n, function (n, r, e) {
        u = t(n, r, e), (u > a || u === -1 / 0 && i === -1 / 0) && (i = n, a = u);
      });
    return i;
  }, h.min = function (n, t, r) {
    var e, u, i = 1 / 0, a = 1 / 0;
    if (null == t && null != n) {
      n = n.length === +n.length ? n : h.values(n);
      for (var o = 0, l = n.length; l > o; o++)
        e = n[o], i > e && (i = e);
    } else
      t = h.iteratee(t, r), h.each(n, function (n, r, e) {
        u = t(n, r, e), (a > u || 1 / 0 === u && 1 / 0 === i) && (i = n, a = u);
      });
    return i;
  }, h.shuffle = function (n) {
    for (var t, r = n && n.length === +n.length ? n : h.values(n), e = r.length, u = Array(e), i = 0; e > i; i++)
      t = h.random(0, i), t !== i && (u[i] = u[t]), u[t] = r[i];
    return u;
  }, h.sample = function (n, t, r) {
    return null == t || r ? (n.length !== +n.length && (n = h.values(n)), n[h.random(n.length - 1)]) : h.shuffle(n).slice(0, Math.max(0, t));
  }, h.sortBy = function (n, t, r) {
    return t = h.iteratee(t, r), h.pluck(h.map(n, function (n, r, e) {
      return {
        value: n,
        index: r,
        criteria: t(n, r, e)
      };
    }).sort(function (n, t) {
      var r = n.criteria, e = t.criteria;
      if (r !== e) {
        if (r > e || r === void 0)
          return 1;
        if (e > r || e === void 0)
          return -1;
      }
      return n.index - t.index;
    }), 'value');
  };
  var m = function (n) {
    return function (t, r, e) {
      var u = {};
      return r = h.iteratee(r, e), h.each(t, function (e, i) {
        var a = r(e, i, t);
        n(u, e, a);
      }), u;
    };
  };
  h.groupBy = m(function (n, t, r) {
    h.has(n, r) ? n[r].push(t) : n[r] = [t];
  }), h.indexBy = m(function (n, t, r) {
    n[r] = t;
  }), h.countBy = m(function (n, t, r) {
    h.has(n, r) ? n[r]++ : n[r] = 1;
  }), h.sortedIndex = function (n, t, r, e) {
    r = h.iteratee(r, e, 1);
    for (var u = r(t), i = 0, a = n.length; a > i;) {
      var o = i + a >>> 1;
      r(n[o]) < u ? i = o + 1 : a = o;
    }
    return i;
  }, h.toArray = function (n) {
    return n ? h.isArray(n) ? a.call(n) : n.length === +n.length ? h.map(n, h.identity) : h.values(n) : [];
  }, h.size = function (n) {
    return null == n ? 0 : n.length === +n.length ? n.length : h.keys(n).length;
  }, h.partition = function (n, t, r) {
    t = h.iteratee(t, r);
    var e = [], u = [];
    return h.each(n, function (n, r, i) {
      (t(n, r, i) ? e : u).push(n);
    }), [
      e,
      u
    ];
  }, h.first = h.head = h.take = function (n, t, r) {
    return null == n ? void 0 : null == t || r ? n[0] : 0 > t ? [] : a.call(n, 0, t);
  }, h.initial = function (n, t, r) {
    return a.call(n, 0, Math.max(0, n.length - (null == t || r ? 1 : t)));
  }, h.last = function (n, t, r) {
    return null == n ? void 0 : null == t || r ? n[n.length - 1] : a.call(n, Math.max(n.length - t, 0));
  }, h.rest = h.tail = h.drop = function (n, t, r) {
    return a.call(n, null == t || r ? 1 : t);
  }, h.compact = function (n) {
    return h.filter(n, h.identity);
  };
  var y = function (n, t, r, e) {
    if (t && h.every(n, h.isArray))
      return o.apply(e, n);
    for (var u = 0, a = n.length; a > u; u++) {
      var l = n[u];
      h.isArray(l) || h.isArguments(l) ? t ? i.apply(e, l) : y(l, t, r, e) : r || e.push(l);
    }
    return e;
  };
  h.flatten = function (n, t) {
    return y(n, t, !1, []);
  }, h.without = function (n) {
    return h.difference(n, a.call(arguments, 1));
  }, h.uniq = h.unique = function (n, t, r, e) {
    if (null == n)
      return [];
    h.isBoolean(t) || (e = r, r = t, t = !1), null != r && (r = h.iteratee(r, e));
    for (var u = [], i = [], a = 0, o = n.length; o > a; a++) {
      var l = n[a];
      if (t)
        a && i === l || u.push(l), i = l;
      else if (r) {
        var c = r(l, a, n);
        h.indexOf(i, c) < 0 && (i.push(c), u.push(l));
      } else
        h.indexOf(u, l) < 0 && u.push(l);
    }
    return u;
  }, h.union = function () {
    return h.uniq(y(arguments, !0, !0, []));
  }, h.intersection = function (n) {
    if (null == n)
      return [];
    for (var t = [], r = arguments.length, e = 0, u = n.length; u > e; e++) {
      var i = n[e];
      if (!h.contains(t, i)) {
        for (var a = 1; r > a && h.contains(arguments[a], i); a++);
        a === r && t.push(i);
      }
    }
    return t;
  }, h.difference = function (n) {
    var t = y(a.call(arguments, 1), !0, !0, []);
    return h.filter(n, [
      'n',
      function (n) {
        return !h.contains(t, n);
      }
    ]);
  }, h.zip = function (n) {
    if (null == n)
      return [];
    for (var t = h.max(arguments, 'length').length, r = Array(t), e = 0; t > e; e++)
      r[e] = h.pluck(arguments, e);
    return r;
  }, h.object = function (n, t) {
    if (null == n)
      return {};
    for (var r = {}, e = 0, u = n.length; u > e; e++)
      t ? r[n[e]] = t[e] : r[n[e][0]] = n[e][1];
    return r;
  }, h.indexOf = function (n, t, r) {
    if (null == n)
      return -1;
    var e = 0, u = n.length;
    if (r) {
      if ('number' != typeof r)
        return e = h.sortedIndex(n, t), n[e] === t ? e : -1;
      e = 0 > r ? Math.max(0, u + r) : r;
    }
    for (; u > e; e++)
      if (n[e] === t)
        return e;
    return -1;
  }, h.lastIndexOf = function (n, t, r) {
    if (null == n)
      return -1;
    var e = n.length;
    for ('number' == typeof r && (e = 0 > r ? e + r + 1 : Math.min(e, r + 1)); --e >= 0;)
      if (n[e] === t)
        return e;
    return -1;
  }, h.range = function (n, t, r) {
    arguments.length <= 1 && (t = n || 0, n = 0), r = r || 1;
    for (var e = Math.max(Math.ceil((t - n) / r), 0), u = Array(e), i = 0; e > i; i++, n += r)
      u[i] = n;
    return u;
  };
  var d = function () {
  };
  h.bind = function (n, t) {
    var r, e;
    if (p && n.bind === p)
      return p.apply(n, a.call(arguments, 1));
    if (!h.isFunction(n))
      throw new TypeError('Bind must be called on a function');
    return r = a.call(arguments, 2), e = function () {
      if (!(this instanceof e))
        return n.apply(t, r.concat(a.call(arguments)));
      d.prototype = n.prototype;
      var u = new d();
      d.prototype = null;
      var i = n.apply(u, r.concat(a.call(arguments)));
      return h.isObject(i) ? i : u;
    };
  }, h.partial = function (n) {
    var t = a.call(arguments, 1);
    return function () {
      for (var r = 0, e = t.slice(), u = 0, i = e.length; i > u; u++)
        e[u] === h && (e[u] = arguments[r++]);
      for (; r < arguments.length;)
        e.push(arguments[r++]);
      return n.apply(this, e);
    };
  }, h.bindAll = function (n) {
    var t, r, e = arguments.length;
    if (1 >= e)
      throw new Error('bindAll must be passed function names');
    for (t = 1; e > t; t++)
      r = arguments[t], n[r] = h.bind(n[r], n);
    return n;
  }, h.memoize = function (n, t) {
    var r = function (e) {
      var u = r.cache, i = t ? t.apply(this, arguments) : e;
      return h.has(u, i) || (u[i] = n.apply(this, arguments)), u[i];
    };
    return r.cache = {}, r;
  }, h.delay = function (n, t) {
    var r = a.call(arguments, 2);
    return setTimeout(function () {
      return n.apply(null, r);
    }, t);
  }, h.defer = function (n) {
    return h.delay.apply(h, [
      n,
      1
    ].concat(a.call(arguments, 1)));
  }, h.throttle = function (n, t, r) {
    var e, u, i, a = null, o = 0;
    r || (r = {});
    var l = function () {
      o = r.leading === !1 ? 0 : h.now(), a = null, i = n.apply(e, u), a || (e = u = null);
    };
    return function () {
      var c = h.now();
      o || r.leading !== !1 || (o = c);
      var f = t - (c - o);
      return e = this, u = arguments, 0 >= f || f > t ? (clearTimeout(a), a = null, o = c, i = n.apply(e, u), a || (e = u = null)) : a || r.trailing === !1 || (a = setTimeout(l, f)), i;
    };
  }, h.debounce = function (n, t, r) {
    var e, u, i, a, o, l = function () {
        var c = h.now() - a;
        t > c && c > 0 ? e = setTimeout(l, t - c) : (e = null, r || (o = n.apply(i, u), e || (i = u = null)));
      };
    return function () {
      i = this, u = arguments, a = h.now();
      var c = r && !e;
      return e || (e = setTimeout(l, t)), c && (o = n.apply(i, u), i = u = null), o;
    };
  }, h.wrap = function (n, t) {
    return h.partial(t, n);
  }, h.negate = function (n) {
    return function () {
      return !n.apply(this, arguments);
    };
  }, h.compose = function () {
    var n = arguments, t = n.length - 1;
    return function () {
      for (var r = t, e = n[t].apply(this, arguments); r--;)
        e = n[r].call(this, e);
      return e;
    };
  }, h.after = function (n, t) {
    return function () {
      return --n < 1 ? t.apply(this, arguments) : void 0;
    };
  }, h.before = function (n, t) {
    var r;
    return function () {
      return --n > 0 ? r = t.apply(this, arguments) : t = null, r;
    };
  }, h.once = h.partial(h.before, 2), h.keys = function (n) {
    if (!h.isObject(n))
      return [];
    if (s)
      return s(n);
    var t = [];
    for (var r in n)
      h.has(n, r) && t.push(r);
    return t;
  }, h.values = function (n) {
    for (var t = h.keys(n), r = t.length, e = Array(r), u = 0; r > u; u++)
      e[u] = n[t[u]];
    return e;
  }, h.pairs = function (n) {
    for (var t = h.keys(n), r = t.length, e = Array(r), u = 0; r > u; u++)
      e[u] = [
        t[u],
        n[t[u]]
      ];
    return e;
  }, h.invert = function (n) {
    for (var t = {}, r = h.keys(n), e = 0, u = r.length; u > e; e++)
      t[n[r[e]]] = r[e];
    return t;
  }, h.functions = h.methods = function (n) {
    var t = [];
    for (var r in n)
      h.isFunction(n[r]) && t.push(r);
    return t.sort();
  }, h.extend = function (n) {
    if (!h.isObject(n))
      return n;
    for (var t, r, e = 1, u = arguments.length; u > e; e++) {
      t = arguments[e];
      for (r in t)
        c.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, h.pick = function (n, t, r) {
    var e, u = {};
    if (null == n)
      return u;
    if (h.isFunction(t)) {
      t = g(t, r);
      for (e in n) {
        var i = n[e];
        t(i, e, n) && (u[e] = i);
      }
    } else {
      var l = o.apply([], a.call(arguments, 1));
      n = new Object(n);
      for (var c = 0, f = l.length; f > c; c++)
        e = l[c], e in n && (u[e] = n[e]);
    }
    return u;
  }, h.omit = function (n, t, r) {
    if (h.isFunction(t))
      t = h.negate(t);
    else {
      var e = h.map(o.apply([], a.call(arguments, 1)), String);
      t = function (n, t) {
        return !h.contains(e, t);
      };
    }
    return h.pick(n, t, r);
  }, h.defaults = function (n) {
    if (!h.isObject(n))
      return n;
    for (var t = 1, r = arguments.length; r > t; t++) {
      var e = arguments[t];
      for (var u in e)
        n[u] === void 0 && (n[u] = e[u]);
    }
    return n;
  }, h.clone = function (n) {
    return h.isObject(n) ? h.isArray(n) ? n.slice() : h.extend({}, n) : n;
  }, h.tap = function (n, t) {
    return t(n), n;
  };
  var b = function (n, t, r, e) {
    if (n === t)
      return 0 !== n || 1 / n === 1 / t;
    if (null == n || null == t)
      return n === t;
    n instanceof h && (n = n._wrapped), t instanceof h && (t = t._wrapped);
    var u = l.call(n);
    if (u !== l.call(t))
      return !1;
    switch (u) {
    case '[object RegExp]':
    case '[object String]':
      return '' + n == '' + t;
    case '[object Number]':
      return +n !== +n ? +t !== +t : 0 === +n ? 1 / +n === 1 / t : +n === +t;
    case '[object Date]':
    case '[object Boolean]':
      return +n === +t;
    }
    if ('object' != typeof n || 'object' != typeof t)
      return !1;
    for (var i = r.length; i--;)
      if (r[i] === n)
        return e[i] === t;
    var a = n.constructor, o = t.constructor;
    if (a !== o && 'constructor' in n && 'constructor' in t && !(h.isFunction(a) && a instanceof a && h.isFunction(o) && o instanceof o))
      return !1;
    r.push(n), e.push(t);
    var c, f;
    if ('[object Array]' === u) {
      if (c = n.length, f = c === t.length)
        for (; c-- && (f = b(n[c], t[c], r, e)););
    } else {
      var s, p = h.keys(n);
      if (c = p.length, f = h.keys(t).length === c)
        for (; c-- && (s = p[c], f = h.has(t, s) && b(n[s], t[s], r, e)););
    }
    return r.pop(), e.pop(), f;
  };
  h.isEqual = function (n, t) {
    return b(n, t, [], []);
  }, h.isEmpty = function (n) {
    if (null == n)
      return !0;
    if (h.isArray(n) || h.isString(n) || h.isArguments(n))
      return 0 === n.length;
    for (var t in n)
      if (h.has(n, t))
        return !1;
    return !0;
  }, h.isElement = function (n) {
    return !(!n || 1 !== n.nodeType);
  }, h.isArray = f || function (n) {
    return '[object Array]' === l.call(n);
  }, h.isObject = function (n) {
    var t = typeof n;
    return 'function' === t || 'object' === t && !!n;
  }, h.each([
    'Arguments',
    'Function',
    'String',
    'Number',
    'Date',
    'RegExp'
  ], function (n) {
    h['is' + n] = function (t) {
      return l.call(t) === '[object ' + n + ']';
    };
  }), h.isArguments(arguments) || (h.isArguments = function (n) {
    return h.has(n, 'callee');
  }), 'function' != typeof /./ && (h.isFunction = function (n) {
    return 'function' == typeof n || !1;
  }), h.isFinite = function (n) {
    return isFinite(n) && !isNaN(parseFloat(n));
  }, h.isNaN = function (n) {
    return h.isNumber(n) && n !== +n;
  }, h.isBoolean = function (n) {
    return n === !0 || n === !1 || '[object Boolean]' === l.call(n);
  }, h.isNull = function (n) {
    return null === n;
  }, h.isUndefined = function (n) {
    return n === void 0;
  }, h.has = function (n, t) {
    return null != n && c.call(n, t);
  }, h.noConflict = function () {
    return n._ = t, this;
  }, h.identity = function (n) {
    return n;
  }, h.constant = function (n) {
    return function () {
      return n;
    };
  }, h.noop = function () {
  }, h.property = function (n) {
    return function (t) {
      return t[n];
    };
  }, h.matches = function (n) {
    var t = h.pairs(n), r = t.length;
    return function (n) {
      if (null == n)
        return !r;
      n = new Object(n);
      for (var e = 0; r > e; e++) {
        var u = t[e], i = u[0];
        if (u[1] !== n[i] || !(i in n))
          return !1;
      }
      return !0;
    };
  }, h.times = function (n, t, r) {
    var e = Array(Math.max(0, n));
    t = g(t, r, 1);
    for (var u = 0; n > u; u++)
      e[u] = t(u);
    return e;
  }, h.random = function (n, t) {
    return null == t && (t = n, n = 0), n + Math.floor(Math.random() * (t - n + 1));
  }, h.now = Date.now || function () {
    return new Date().getTime();
  };
  var _ = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#x27;',
      '`': '&#x60;'
    }, w = h.invert(_), j = function (n) {
      var t = function (t) {
          return n[t];
        }, r = '(?:' + h.keys(n).join('|') + ')', e = RegExp(r), u = RegExp(r, 'g');
      return function (n) {
        return n = null == n ? '' : '' + n, e.test(n) ? n.replace(u, t) : n;
      };
    };
  h.escape = j(_), h.unescape = j(w), h.result = function (n, t) {
    if (null == n)
      return void 0;
    var r = n[t];
    return h.isFunction(r) ? n[t]() : r;
  };
  var x = 0;
  h.uniqueId = function (n) {
    var t = ++x + '';
    return n ? n + t : t;
  }, h.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };
  var A = /(.)^/, k = {
      '\'': '\'',
      '\\': '\\',
      '\r': 'r',
      '\n': 'n',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    }, O = /\\|'|\r|\n|\u2028|\u2029/g, F = function (n) {
      return '\\' + k[n];
    };
  h.template = function (n, t, r) {
    !t && r && (t = r), t = h.defaults({}, t, h.templateSettings);
    var e = RegExp([
        (t.escape || A).source,
        (t.interpolate || A).source,
        (t.evaluate || A).source
      ].join('|') + '|$', 'g'), u = 0, i = '__p+=\'';
    n.replace(e, function (t, r, e, a, o) {
      return i += n.slice(u, o).replace(O, F), u = o + t.length, r ? i += '\'+\n((__t=(' + r + '))==null?\'\':_.escape(__t))+\n\'' : e ? i += '\'+\n((__t=(' + e + '))==null?\'\':__t)+\n\'' : a && (i += '\';\n' + a + '\n__p+=\''), t;
    }), i += '\';\n', t.variable || (i = 'with(obj||{}){\n' + i + '}\n'), i = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + i + 'return __p;\n';
    try {
      var a = new Function(t.variable || 'obj', '_', i);
    } catch (o) {
      throw o.source = i, o;
    }
    var l = function (n) {
        return a.call(this, n, h);
      }, c = t.variable || 'obj';
    return l.source = 'function(' + c + '){\n' + i + '}', l;
  }, h.chain = function (n) {
    var t = h(n);
    return t._chain = !0, t;
  };
  var E = function (n) {
    return this._chain ? h(n).chain() : n;
  };
  h.mixin = function (n) {
    h.each(h.functions(n), function (t) {
      var r = h[t] = n[t];
      h.prototype[t] = function () {
        var n = [this._wrapped];
        return i.apply(n, arguments), E.call(this, r.apply(h, n));
      };
    });
  }, h.mixin(h), h.each([
    'pop',
    'push',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift'
  ], function (n) {
    var t = r[n];
    h.prototype[n] = function () {
      var r = this._wrapped;
      return t.apply(r, arguments), 'shift' !== n && 'splice' !== n || 0 !== r.length || delete r[0], E.call(this, r);
    };
  }), h.each([
    'concat',
    'join',
    'slice'
  ], function (n) {
    var t = r[n];
    h.prototype[n] = function () {
      return E.call(this, t.apply(this._wrapped, arguments));
    };
  }), h.prototype.value = function () {
    return this._wrapped;
  }, 'function' == typeof define && define.amd && define('underscore', [], function () {
    return h;
  });
}.call(this));
//# sourceMappingURL=underscore-min.map
angular.module('zeroclipboard', []).provider('uiZeroclipConfig', function () {
  // default configs
  var _zeroclipConfig = {
      buttonClass: '',
      swfPath: 'ZeroClipboard.swf',
      trustedDomains: [window.location.host],
      cacheBust: true,
      forceHandCursor: false,
      zIndex: 999999999,
      debug: true,
      title: null,
      autoActivate: true,
      flashLoadTimeout: 30000,
      hoverClass: 'zeroclipboard-is-hover',
      activeClass: 'zeroclipboard-is-active'
    };
  this.setZcConf = function (zcConf) {
    angular.extend(_zeroclipConfig, zcConf);
  };
  this.$get = function () {
    return { zeroclipConfig: _zeroclipConfig };
  };
}).directive('uiZeroclip', [
  '$document',
  '$window',
  'uiZeroclipConfig',
  function ($document, $window, uiZeroclipConfig) {
    var zeroclipConfig = uiZeroclipConfig.zeroclipConfig || {};
    var ZeroClipboard = $window.ZeroClipboard;
    return {
      scope: {
        onCopied: '&zeroclipCopied',
        onError: '&?zeroclipOnError',
        client: '=?uiZeroclip',
        value: '=zeroclipModel',
        text: '@zeroclipText'
      },
      link: function (scope, element, attrs) {
        // config
        ZeroClipboard.config(zeroclipConfig);
        var btn = element[0];
        if (angular.isFunction(ZeroClipboard)) {
          scope.client = new ZeroClipboard(btn);
        }
        scope.$watch('value', function (v) {
          if (v === undefined) {
            return;
          }
          element.attr('data-clipboard-text', v);
        });
        scope.$watch('text', function (v) {
          element.attr('data-clipboard-text', v);
        });
        scope.client.on('aftercopy', _completeHnd = function (e) {
          scope.$apply(function () {
            scope.onCopied({ $event: e });
          });
        });
        scope.client.on('error', function (e) {
          if (scope.onError) {
            scope.$apply(function () {
              scope.onError({ $event: e });
            });
          }
          ZeroClipboard.destroy();
        });
        scope.$on('$destroy', function () {
          scope.client.off('complete', _completeHnd);
        });
      }
    };
  }
]);
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function (root, factory) {
  /* CommonJS */
  if (typeof exports == 'object')
    module.exports = factory();
  else if (typeof define == 'function' && define.amd)
    define(factory);
  else
    root.Spinner = factory();
}(this, function () {
  'use strict';
  var prefixes = [
      'webkit',
      'Moz',
      'ms',
      'O'
    ], animations = {}, useCssAnimations;
  /* Whether to use CSS animations or setTimeout */
  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div'), n;
    for (n in prop)
      el[n] = prop[n];
    return el;
  }
  /**
   * Appends children and returns the parent.
   */
  function ins(parent) {
    for (var i = 1, n = arguments.length; i < n; i++)
      parent.appendChild(arguments[i]);
    return parent;
  }
  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = function () {
      var el = createEl('style', { type: 'text/css' });
      ins(document.getElementsByTagName('head')[0], el);
      return el.sheet || el.styleSheet;
    }();
  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = [
        'opacity',
        trail,
        ~~(alpha * 100),
        i,
        lines
      ].join('-'), start = 0.01 + i / lines * 100, z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha), prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase(), pre = prefix && '-' + prefix + '-' || '';
    if (!animations[name]) {
      sheet.insertRule('@' + pre + 'keyframes ' + name + '{' + '0%{opacity:' + z + '}' + start + '%{opacity:' + alpha + '}' + (start + 0.01) + '%{opacity:1}' + (start + trail) % 100 + '%{opacity:' + alpha + '}' + '100%{opacity:' + z + '}' + '}', sheet.cssRules.length);
      animations[name] = 1;
    }
    return name;
  }
  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style, pp, i;
    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (i = 0; i < prefixes.length; i++) {
      pp = prefixes[i] + prop;
      if (s[pp] !== undefined)
        return pp;
    }
    if (s[prop] !== undefined)
      return prop;
  }
  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n) || n] = prop[n];
    return el;
  }
  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i = 1; i < arguments.length; i++) {
      var def = arguments[i];
      for (var n in def)
        if (obj[n] === undefined)
          obj[n] = def[n];
    }
    return obj;
  }
  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
  }
  // Built-in defaults
  var defaults = {
      lines: 12,
      length: 7,
      width: 5,
      radius: 10,
      rotate: 0,
      corners: 1,
      color: '#000',
      direction: 1,
      speed: 1,
      trail: 100,
      opacity: 1 / 4,
      fps: 20,
      zIndex: 2000000000,
      className: 'spinner',
      top: '50%',
      left: '50%',
      position: 'absolute'
    };
  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults);
  }
  // Global defaults that override the built-ins:
  Spinner.defaults = {};
  merge(Spinner.prototype, {
    spin: function (target) {
      this.stop();
      var self = this, o = self.opts, el = self.el = css(createEl(0, { className: o.className }), {
          position: o.position,
          width: 0,
          zIndex: o.zIndex
        });
      css(el, {
        left: o.left,
        top: o.top
      });
      if (target) {
        target.insertBefore(el, target.firstChild || null);
      }
      el.setAttribute('role', 'progressbar');
      self.lines(el, self.opts);
      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0, start = (o.lines - 1) * (1 - o.direction) / 2, alpha, fps = o.fps, f = fps / o.speed, ostep = (1 - o.opacity) / (f * o.trail / 100), astep = f / o.lines;
        ;
        (function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity);
            self.opacity(el, j * o.direction + start, alpha, o);
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps));
        }());
      }
      return self;
    },
    stop: function () {
      var el = this.el;
      if (el) {
        clearTimeout(this.timeout);
        if (el.parentNode)
          el.parentNode.removeChild(el);
        this.el = undefined;
      }
      return this;
    },
    lines: function (el, o) {
      var i = 0, start = (o.lines - 1) * (1 - o.direction) / 2, seg;
      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: o.length + o.width + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360 / o.lines * i + o.rotate) + 'deg) translate(' + o.radius + 'px' + ',0)',
          borderRadius: (o.corners * o.width >> 1) + 'px'
        });
      }
      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1 + ~(o.width / 2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
        });
        if (o.shadow)
          ins(seg, css(fill('#000', '0 0 4px ' + '#000'), { top: 2 + 'px' }));
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')));
      }
      return el;
    },
    opacity: function (el, i, val) {
      if (i < el.childNodes.length)
        el.childNodes[i].style.opacity = val;
    }
  });
  function initVML() {
    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr);
    }
    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)');
    Spinner.prototype.lines = function (el, o) {
      var r = o.length + o.width, s = 2 * r;
      function grp() {
        return css(vml('group', {
          coordsize: s + ' ' + s,
          coordorigin: -r + ' ' + -r
        }), {
          width: s,
          height: s
        });
      }
      var margin = -(o.width + o.length) * 2 + 'px', g = css(grp(), {
          position: 'absolute',
          top: margin,
          left: margin
        }), i;
      function seg(i, dx, filter) {
        ins(g, ins(css(grp(), {
          rotation: 360 / o.lines * i + 'deg',
          left: ~~dx
        }), ins(css(vml('roundrect', { arcsize: o.corners }), {
          width: r,
          height: o.width,
          left: o.radius,
          top: -o.width >> 1,
          filter: filter
        }), vml('fill', {
          color: getColor(o.color, i),
          opacity: o.opacity
        }), vml('stroke', { opacity: 0 }))));
      }
      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');
      for (i = 1; i <= o.lines; i++)
        seg(i);
      return ins(el, g);
    };
    Spinner.prototype.opacity = function (el, i, val, o) {
      var c = el.firstChild;
      o = o.shadow && o.lines || 0;
      if (c && i + o < c.childNodes.length) {
        c = c.childNodes[i + o];
        c = c && c.firstChild;
        c = c && c.firstChild;
        if (c)
          c.opacity = val;
      }
    };
  }
  var probe = css(createEl('group'), { behavior: 'url(#default#VML)' });
  if (!vendor(probe, 'transform') && probe.adj)
    initVML();
  else
    useCssAnimations = vendor(probe, 'animation');
  return Spinner;
}));
/**
 * angular-spinner version 0.6.1
 * License: MIT.
 * Copyright (C) 2013, 2014, Uri Shaked and contributors.
 */
(function (root) {
  'use strict';
  function factory(angular, Spinner) {
    return angular.module('angularSpinner', []).provider('usSpinnerConfig', function () {
      var _config = {};
      return {
        setDefaults: function (config) {
          _config = config || _config;
        },
        $get: function () {
          return { config: _config };
        }
      };
    }).factory('usSpinnerService', [
      '$rootScope',
      function ($rootScope) {
        var config = {};
        config.spin = function (key) {
          $rootScope.$broadcast('us-spinner:spin', key);
        };
        config.stop = function (key) {
          $rootScope.$broadcast('us-spinner:stop', key);
        };
        return config;
      }
    ]).directive('usSpinner', [
      '$window',
      'usSpinnerConfig',
      function ($window, usSpinnerConfig) {
        return {
          scope: true,
          link: function (scope, element, attr) {
            var SpinnerConstructor = Spinner || $window.Spinner;
            scope.spinner = null;
            scope.key = angular.isDefined(attr.spinnerKey) ? attr.spinnerKey : false;
            scope.startActive = angular.isDefined(attr.spinnerStartActive) ? scope.$eval(attr.spinnerStartActive) : scope.key ? false : true;
            function stopSpinner() {
              if (scope.spinner) {
                scope.spinner.stop();
              }
            }
            scope.spin = function () {
              if (scope.spinner) {
                scope.spinner.spin(element[0]);
              }
            };
            scope.stop = function () {
              scope.startActive = false;
              stopSpinner();
            };
            scope.$watch(attr.usSpinner, function (options) {
              stopSpinner();
              options = options || {};
              for (var property in usSpinnerConfig.config) {
                if (options[property] === undefined) {
                  options[property] = usSpinnerConfig.config[property];
                }
              }
              scope.spinner = new SpinnerConstructor(options);
              if (!scope.key || scope.startActive) {
                scope.spinner.spin(element[0]);
              }
            }, true);
            scope.$on('us-spinner:spin', function (event, key) {
              if (key === scope.key) {
                scope.spin();
              }
            });
            scope.$on('us-spinner:stop', function (event, key) {
              if (key === scope.key) {
                scope.stop();
              }
            });
            scope.$on('$destroy', function () {
              scope.stop();
              scope.spinner = null;
            });
          }
        };
      }
    ]);
  }
  if (typeof define === 'function' && define.amd) {
    /* AMD module */
    define([
      'angular',
      'spin'
    ], factory);
  } else {
    /* Browser global */
    factory(root.angular);
  }
}(window));
/*
PNotify 2.0.1 sciactive.com/pnotify/
(C) 2014 Hunter Perrin
license GPL/LGPL/MPL
*/
/*
 * ====== PNotify ======
 *
 * http://sciactive.com/pnotify/
 *
 * Copyright 2009-2014 Hunter Perrin
 *
 * Triple licensed under the GPL, LGPL, and MPL.
 * 	http://gnu.org/licenses/gpl.html
 * 	http://gnu.org/licenses/lgpl.html
 * 	http://mozilla.org/MPL/MPL-1.1.html
 */
// Uses AMD or browser globals for jQuery.
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('pnotify', ['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  var default_stack = {
      dir1: 'down',
      dir2: 'left',
      push: 'bottom',
      spacing1: 25,
      spacing2: 25,
      context: $('body')
    };
  var timer,
    // Position all timer.
    body, jwindow = $(window);
  // Set global variables.
  var do_when_ready = function () {
    body = $('body');
    PNotify.prototype.options.stack.context = body;
    jwindow = $(window);
    // Reposition the notices when the window resizes.
    jwindow.bind('resize', function () {
      if (timer)
        clearTimeout(timer);
      timer = setTimeout(function () {
        PNotify.positionAll(true);
      }, 10);
    });
  };
  PNotify = function (options) {
    this.parseOptions(options);
    this.init();
  };
  $.extend(PNotify.prototype, {
    version: '2.0.1',
    options: {
      title: false,
      title_escape: false,
      text: false,
      text_escape: false,
      styling: 'bootstrap3',
      addclass: '',
      cornerclass: '',
      auto_display: true,
      width: '300px',
      min_height: '16px',
      type: 'notice',
      icon: true,
      opacity: 1,
      animation: 'fade',
      animate_speed: 'slow',
      position_animate_speed: 500,
      shadow: true,
      hide: true,
      delay: 8000,
      mouse_reset: true,
      remove: true,
      insert_brs: true,
      destroy: true,
      stack: default_stack
    },
    modules: {},
    runModules: function (event, arg) {
      var curArg;
      for (var module in this.modules) {
        curArg = typeof arg === 'object' && module in arg ? arg[module] : arg;
        if (typeof this.modules[module][event] === 'function')
          this.modules[module][event](this, typeof this.options[module] === 'object' ? this.options[module] : {}, curArg);
      }
    },
    state: 'initializing',
    timer: null,
    styles: null,
    elem: null,
    container: null,
    title_container: null,
    text_container: null,
    animating: false,
    timerHide: false,
    init: function () {
      var that = this;
      // First and foremost, we don't want our module objects all referencing the prototype.
      this.modules = {};
      $.extend(true, this.modules, PNotify.prototype.modules);
      // Get our styling object.
      if (typeof this.options.styling === 'object') {
        this.styles = this.options.styling;
      } else {
        this.styles = PNotify.styling[this.options.styling];
      }
      // Create our widget.
      // Stop animation, reset the removal timer when the user mouses over.
      this.elem = $('<div />', {
        'class': 'ui-pnotify ' + this.options.addclass,
        'css': { 'display': 'none' },
        'mouseenter': function (e) {
          if (that.options.mouse_reset && that.animating === 'out') {
            if (!that.timerHide)
              return;
            that.cancelRemove();
          }
          // Stop the close timer.
          if (that.options.hide && that.options.mouse_reset)
            that.cancelRemove();
        },
        'mouseleave': function (e) {
          // Start the close timer.
          if (that.options.hide && that.options.mouse_reset)
            that.queueRemove();
          PNotify.positionAll();
        }
      });
      // Create a container for the notice contents.
      this.container = $('<div />', { 'class': this.styles.container + ' ui-pnotify-container ' + (this.options.type === 'error' ? this.styles.error : this.options.type === 'info' ? this.styles.info : this.options.type === 'success' ? this.styles.success : this.styles.notice) }).appendTo(this.elem);
      if (this.options.cornerclass !== '')
        this.container.removeClass('ui-corner-all').addClass(this.options.cornerclass);
      // Create a drop shadow.
      if (this.options.shadow)
        this.container.addClass('ui-pnotify-shadow');
      // Add the appropriate icon.
      if (this.options.icon !== false) {
        $('<div />', { 'class': 'ui-pnotify-icon' }).append($('<span />', { 'class': this.options.icon === true ? this.options.type === 'error' ? this.styles.error_icon : this.options.type === 'info' ? this.styles.info_icon : this.options.type === 'success' ? this.styles.success_icon : this.styles.notice_icon : this.options.icon })).prependTo(this.container);
      }
      // Add a title.
      this.title_container = $('<h4 />', { 'class': 'ui-pnotify-title' }).appendTo(this.container);
      if (this.options.title === false)
        this.title_container.hide();
      else if (this.options.title_escape)
        this.title_container.text(this.options.title);
      else
        this.title_container.html(this.options.title);
      // Add text.
      this.text_container = $('<div />', { 'class': 'ui-pnotify-text' }).appendTo(this.container);
      if (this.options.text === false)
        this.text_container.hide();
      else if (this.options.text_escape)
        this.text_container.text(this.options.text);
      else
        this.text_container.html(this.options.insert_brs ? String(this.options.text).replace(/\n/g, '<br />') : this.options.text);
      // Set width and min height.
      if (typeof this.options.width === 'string')
        this.elem.css('width', this.options.width);
      if (typeof this.options.min_height === 'string')
        this.container.css('min-height', this.options.min_height);
      // Add the notice to the notice array.
      if (this.options.stack.push === 'top')
        PNotify.notices = $.merge([this], PNotify.notices);
      else
        PNotify.notices = $.merge(PNotify.notices, [this]);
      // Now position all the notices if they are to push to the top.
      if (this.options.stack.push === 'top')
        this.queuePosition(false, 1);
      // Mark the stack so it won't animate the new notice.
      this.options.stack.animation = false;
      // Run the modules.
      this.runModules('init');
      // Display the notice.
      if (this.options.auto_display)
        this.open();
      return this;
    },
    update: function (options) {
      // Save old options.
      var oldOpts = this.options;
      // Then update to the new options.
      this.parseOptions(oldOpts, options);
      // Update the corner class.
      if (this.options.cornerclass !== oldOpts.cornerclass)
        this.container.removeClass('ui-corner-all ' + oldOpts.cornerclass).addClass(this.options.cornerclass);
      // Update the shadow.
      if (this.options.shadow !== oldOpts.shadow) {
        if (this.options.shadow)
          this.container.addClass('ui-pnotify-shadow');
        else
          this.container.removeClass('ui-pnotify-shadow');
      }
      // Update the additional classes.
      if (this.options.addclass === false)
        this.elem.removeClass(oldOpts.addclass);
      else if (this.options.addclass !== oldOpts.addclass)
        this.elem.removeClass(oldOpts.addclass).addClass(this.options.addclass);
      // Update the title.
      if (this.options.title === false)
        this.title_container.slideUp('fast');
      else if (this.options.title !== oldOpts.title) {
        if (this.options.title_escape)
          this.title_container.text(this.options.title);
        else
          this.title_container.html(this.options.title);
        if (oldOpts.title === false)
          this.title_container.slideDown(200);
      }
      // Update the text.
      if (this.options.text === false) {
        this.text_container.slideUp('fast');
      } else if (this.options.text !== oldOpts.text) {
        if (this.options.text_escape)
          this.text_container.text(this.options.text);
        else
          this.text_container.html(this.options.insert_brs ? String(this.options.text).replace(/\n/g, '<br />') : this.options.text);
        if (oldOpts.text === false)
          this.text_container.slideDown(200);
      }
      // Change the notice type.
      if (this.options.type !== oldOpts.type)
        this.container.removeClass(this.styles.error + ' ' + this.styles.notice + ' ' + this.styles.success + ' ' + this.styles.info).addClass(this.options.type === 'error' ? this.styles.error : this.options.type === 'info' ? this.styles.info : this.options.type === 'success' ? this.styles.success : this.styles.notice);
      if (this.options.icon !== oldOpts.icon || this.options.icon === true && this.options.type !== oldOpts.type) {
        // Remove any old icon.
        this.container.find('div.ui-pnotify-icon').remove();
        if (this.options.icon !== false) {
          // Build the new icon.
          $('<div />', { 'class': 'ui-pnotify-icon' }).append($('<span />', { 'class': this.options.icon === true ? this.options.type === 'error' ? this.styles.error_icon : this.options.type === 'info' ? this.styles.info_icon : this.options.type === 'success' ? this.styles.success_icon : this.styles.notice_icon : this.options.icon })).prependTo(this.container);
        }
      }
      // Update the width.
      if (this.options.width !== oldOpts.width)
        this.elem.animate({ width: this.options.width });
      // Update the minimum height.
      if (this.options.min_height !== oldOpts.min_height)
        this.container.animate({ minHeight: this.options.min_height });
      // Update the opacity.
      if (this.options.opacity !== oldOpts.opacity)
        this.elem.fadeTo(this.options.animate_speed, this.options.opacity);
      // Update the timed hiding.
      if (!this.options.hide)
        this.cancelRemove();
      else if (!oldOpts.hide)
        this.queueRemove();
      this.queuePosition(true);
      // Run the modules.
      this.runModules('update', oldOpts);
      return this;
    },
    open: function () {
      this.state = 'opening';
      // Run the modules.
      this.runModules('beforeOpen');
      var that = this;
      // If the notice is not in the DOM, append it.
      if (!this.elem.parent().length)
        this.elem.appendTo(this.options.stack.context ? this.options.stack.context : body);
      // Try to put it in the right position.
      if (this.options.stack.push !== 'top')
        this.position(true);
      // First show it, then set its opacity, then hide it.
      if (this.options.animation === 'fade' || this.options.animation.effect_in === 'fade') {
        // If it's fading in, it should start at 0.
        this.elem.show().fadeTo(0, 0).hide();
      } else {
        // Or else it should be set to the opacity.
        if (this.options.opacity !== 1)
          this.elem.show().fadeTo(0, this.options.opacity).hide();
      }
      this.animateIn(function () {
        that.queuePosition(true);
        // Now set it to hide.
        if (that.options.hide)
          that.queueRemove();
        that.state = 'open';
        // Run the modules.
        that.runModules('afterOpen');
      });
      return this;
    },
    remove: function (timer_hide) {
      this.state = 'closing';
      this.timerHide = !!timer_hide;
      // Make sure it's a boolean.
      // Run the modules.
      this.runModules('beforeClose');
      var that = this;
      if (this.timer) {
        window.clearTimeout(this.timer);
        this.timer = null;
      }
      this.animateOut(function () {
        that.state = 'closed';
        // Run the modules.
        that.runModules('afterClose');
        that.queuePosition(true);
        // If we're supposed to remove the notice from the DOM, do it.
        if (that.options.remove)
          that.elem.detach();
        // Run the modules.
        that.runModules('beforeDestroy');
        // Remove object from PNotify.notices to prevent memory leak (issue #49)
        // unless destroy is off
        if (that.options.destroy) {
          if (PNotify.notices !== null) {
            var idx = $.inArray(that, PNotify.notices);
            if (idx !== -1) {
              PNotify.notices.splice(idx, 1);
            }
          }
        }
        // Run the modules.
        that.runModules('afterDestroy');
      });
      return this;
    },
    get: function () {
      return this.elem;
    },
    parseOptions: function (options, moreOptions) {
      this.options = $.extend(true, {}, PNotify.prototype.options);
      // This is the only thing that *should* be copied by reference.
      this.options.stack = PNotify.prototype.options.stack;
      var optArray = [
          options,
          moreOptions
        ], curOpts;
      for (var curIndex in optArray) {
        curOpts = optArray[curIndex];
        if (typeof curOpts == 'undefined')
          break;
        if (typeof curOpts !== 'object') {
          this.options.text = curOpts;
        } else {
          for (var option in curOpts) {
            if (this.modules[option]) {
              // Avoid overwriting module defaults.
              $.extend(true, this.options[option], curOpts[option]);
            } else {
              this.options[option] = curOpts[option];
            }
          }
        }
      }
    },
    animateIn: function (callback) {
      // Declare that the notice is animating in. (Or has completed animating in.)
      this.animating = 'in';
      var animation;
      if (typeof this.options.animation.effect_in !== 'undefined')
        animation = this.options.animation.effect_in;
      else
        animation = this.options.animation;
      if (animation === 'none') {
        this.elem.show();
        callback();
      } else if (animation === 'show')
        this.elem.show(this.options.animate_speed, callback);
      else if (animation === 'fade')
        this.elem.show().fadeTo(this.options.animate_speed, this.options.opacity, callback);
      else if (animation === 'slide')
        this.elem.slideDown(this.options.animate_speed, callback);
      else if (typeof animation === 'function')
        animation('in', callback, this.elem);
      else
        this.elem.show(animation, typeof this.options.animation.options_in === 'object' ? this.options.animation.options_in : {}, this.options.animate_speed, callback);
      if (this.elem.parent().hasClass('ui-effects-wrapper'))
        this.elem.parent().css({
          'position': 'fixed',
          'overflow': 'visible'
        });
      if (animation !== 'slide')
        this.elem.css('overflow', 'visible');
      this.container.css('overflow', 'hidden');
    },
    animateOut: function (callback) {
      // Declare that the notice is animating out. (Or has completed animating out.)
      this.animating = 'out';
      var animation;
      if (typeof this.options.animation.effect_out !== 'undefined')
        animation = this.options.animation.effect_out;
      else
        animation = this.options.animation;
      if (animation === 'none') {
        this.elem.hide();
        callback();
      } else if (animation === 'show')
        this.elem.hide(this.options.animate_speed, callback);
      else if (animation === 'fade')
        this.elem.fadeOut(this.options.animate_speed, callback);
      else if (animation === 'slide')
        this.elem.slideUp(this.options.animate_speed, callback);
      else if (typeof animation === 'function')
        animation('out', callback, this.elem);
      else
        this.elem.hide(animation, typeof this.options.animation.options_out === 'object' ? this.options.animation.options_out : {}, this.options.animate_speed, callback);
      if (this.elem.parent().hasClass('ui-effects-wrapper'))
        this.elem.parent().css({
          'position': 'fixed',
          'overflow': 'visible'
        });
      if (animation !== 'slide')
        this.elem.css('overflow', 'visible');
      this.container.css('overflow', 'hidden');
    },
    position: function (dontSkipHidden) {
      // Get the notice's stack.
      var s = this.options.stack, e = this.elem;
      if (e.parent().hasClass('ui-effects-wrapper'))
        e = this.elem.css({
          'left': '0',
          'top': '0',
          'right': '0',
          'bottom': '0'
        }).parent();
      if (typeof s.context === 'undefined')
        s.context = body;
      if (!s)
        return;
      if (typeof s.nextpos1 !== 'number')
        s.nextpos1 = s.firstpos1;
      if (typeof s.nextpos2 !== 'number')
        s.nextpos2 = s.firstpos2;
      if (typeof s.addpos2 !== 'number')
        s.addpos2 = 0;
      var hidden = e.css('display') === 'none';
      // Skip this notice if it's not shown.
      if (!hidden || dontSkipHidden) {
        var curpos1, curpos2;
        // Store what will need to be animated.
        var animate = {};
        // Calculate the current pos1 value.
        var csspos1;
        switch (s.dir1) {
        case 'down':
          csspos1 = 'top';
          break;
        case 'up':
          csspos1 = 'bottom';
          break;
        case 'left':
          csspos1 = 'right';
          break;
        case 'right':
          csspos1 = 'left';
          break;
        }
        curpos1 = parseInt(e.css(csspos1).replace(/(?:\..*|[^0-9.])/g, ''));
        if (isNaN(curpos1))
          curpos1 = 0;
        // Remember the first pos1, so the first visible notice goes there.
        if (typeof s.firstpos1 === 'undefined' && !hidden) {
          s.firstpos1 = curpos1;
          s.nextpos1 = s.firstpos1;
        }
        // Calculate the current pos2 value.
        var csspos2;
        switch (s.dir2) {
        case 'down':
          csspos2 = 'top';
          break;
        case 'up':
          csspos2 = 'bottom';
          break;
        case 'left':
          csspos2 = 'right';
          break;
        case 'right':
          csspos2 = 'left';
          break;
        }
        curpos2 = parseInt(e.css(csspos2).replace(/(?:\..*|[^0-9.])/g, ''));
        if (isNaN(curpos2))
          curpos2 = 0;
        // Remember the first pos2, so the first visible notice goes there.
        if (typeof s.firstpos2 === 'undefined' && !hidden) {
          s.firstpos2 = curpos2;
          s.nextpos2 = s.firstpos2;
        }
        // Check that it's not beyond the viewport edge.
        if (s.dir1 === 'down' && s.nextpos1 + e.height() > (s.context.is(body) ? jwindow.height() : s.context.prop('scrollHeight')) || s.dir1 === 'up' && s.nextpos1 + e.height() > (s.context.is(body) ? jwindow.height() : s.context.prop('scrollHeight')) || s.dir1 === 'left' && s.nextpos1 + e.width() > (s.context.is(body) ? jwindow.width() : s.context.prop('scrollWidth')) || s.dir1 === 'right' && s.nextpos1 + e.width() > (s.context.is(body) ? jwindow.width() : s.context.prop('scrollWidth'))) {
          // If it is, it needs to go back to the first pos1, and over on pos2.
          s.nextpos1 = s.firstpos1;
          s.nextpos2 += s.addpos2 + (typeof s.spacing2 === 'undefined' ? 25 : s.spacing2);
          s.addpos2 = 0;
        }
        // Animate if we're moving on dir2.
        if (s.animation && s.nextpos2 < curpos2) {
          switch (s.dir2) {
          case 'down':
            animate.top = s.nextpos2 + 'px';
            break;
          case 'up':
            animate.bottom = s.nextpos2 + 'px';
            break;
          case 'left':
            animate.right = s.nextpos2 + 'px';
            break;
          case 'right':
            animate.left = s.nextpos2 + 'px';
            break;
          }
        } else {
          if (typeof s.nextpos2 === 'number')
            e.css(csspos2, s.nextpos2 + 'px');
        }
        // Keep track of the widest/tallest notice in the column/row, so we can push the next column/row.
        switch (s.dir2) {
        case 'down':
        case 'up':
          if (e.outerHeight(true) > s.addpos2)
            s.addpos2 = e.height();
          break;
        case 'left':
        case 'right':
          if (e.outerWidth(true) > s.addpos2)
            s.addpos2 = e.width();
          break;
        }
        // Move the notice on dir1.
        if (typeof s.nextpos1 === 'number') {
          // Animate if we're moving toward the first pos.
          if (s.animation && (curpos1 > s.nextpos1 || animate.top || animate.bottom || animate.right || animate.left)) {
            switch (s.dir1) {
            case 'down':
              animate.top = s.nextpos1 + 'px';
              break;
            case 'up':
              animate.bottom = s.nextpos1 + 'px';
              break;
            case 'left':
              animate.right = s.nextpos1 + 'px';
              break;
            case 'right':
              animate.left = s.nextpos1 + 'px';
              break;
            }
          } else
            e.css(csspos1, s.nextpos1 + 'px');
        }
        // Run the animation.
        if (animate.top || animate.bottom || animate.right || animate.left)
          e.animate(animate, {
            duration: this.options.position_animate_speed,
            queue: false
          });
        // Calculate the next dir1 position.
        switch (s.dir1) {
        case 'down':
        case 'up':
          s.nextpos1 += e.height() + (typeof s.spacing1 === 'undefined' ? 25 : s.spacing1);
          break;
        case 'left':
        case 'right':
          s.nextpos1 += e.width() + (typeof s.spacing1 === 'undefined' ? 25 : s.spacing1);
          break;
        }
      }
      return this;
    },
    queuePosition: function (animate, milliseconds) {
      if (timer)
        clearTimeout(timer);
      if (!milliseconds)
        milliseconds = 10;
      timer = setTimeout(function () {
        PNotify.positionAll(animate);
      }, milliseconds);
      return this;
    },
    cancelRemove: function () {
      if (this.timer)
        window.clearTimeout(this.timer);
      if (this.state === 'closing') {
        // If it's animating out, animate back in really quickly.
        this.elem.stop(true);
        this.state = 'open';
        this.animating = 'in';
        this.elem.css('height', 'auto').animate({
          'width': this.options.width,
          'opacity': this.options.opacity
        }, 'fast');
      }
      return this;
    },
    queueRemove: function () {
      var that = this;
      // Cancel any current removal timer.
      this.cancelRemove();
      this.timer = window.setTimeout(function () {
        that.remove(true);
      }, isNaN(this.options.delay) ? 0 : this.options.delay);
      return this;
    }
  });
  // These functions affect all notices.
  $.extend(PNotify, {
    notices: [],
    removeAll: function () {
      $.each(PNotify.notices, function () {
        if (this.remove)
          this.remove();
      });
    },
    positionAll: function (animate) {
      // This timer is used for queueing this function so it doesn't run
      // repeatedly.
      if (timer)
        clearTimeout(timer);
      timer = null;
      // Reset the next position data.
      $.each(PNotify.notices, function () {
        var s = this.options.stack;
        if (!s)
          return;
        s.nextpos1 = s.firstpos1;
        s.nextpos2 = s.firstpos2;
        s.addpos2 = 0;
        s.animation = animate;
      });
      $.each(PNotify.notices, function () {
        this.position();
      });
    },
    styling: {
      jqueryui: {
        container: 'ui-widget ui-widget-content ui-corner-all',
        notice: 'ui-state-highlight',
        notice_icon: 'ui-icon ui-icon-info',
        info: '',
        info_icon: 'ui-icon ui-icon-info',
        success: 'ui-state-default',
        success_icon: 'ui-icon ui-icon-circle-check',
        error: 'ui-state-error',
        error_icon: 'ui-icon ui-icon-alert'
      },
      bootstrap2: {
        container: 'alert',
        notice: '',
        notice_icon: 'icon-exclamation-sign',
        info: 'alert-info',
        info_icon: 'icon-info-sign',
        success: 'alert-success',
        success_icon: 'icon-ok-sign',
        error: 'alert-error',
        error_icon: 'icon-warning-sign'
      },
      bootstrap3: {
        container: 'alert',
        notice: 'alert-warning',
        notice_icon: 'glyphicon glyphicon-exclamation-sign',
        info: 'alert-info',
        info_icon: 'glyphicon glyphicon-info-sign',
        success: 'alert-success',
        success_icon: 'glyphicon glyphicon-ok-sign',
        error: 'alert-danger',
        error_icon: 'glyphicon glyphicon-warning-sign'
      }
    }
  });
  /*
	 * uses icons from http://fontawesome.io/
	 * version 4.0.3
	 */
  PNotify.styling.fontawesome = $.extend({}, PNotify.styling.bootstrap3);
  $.extend(PNotify.styling.fontawesome, {
    notice_icon: 'fa fa-exclamation-circle',
    info_icon: 'fa fa-info',
    success_icon: 'fa fa-check',
    error_icon: 'fa fa-warning'
  });
  if (document.body)
    do_when_ready();
  else
    $(do_when_ready);
  return PNotify;
}));
// Confirm
// Uses AMD or browser globals for jQuery.
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('pnotify.confirm', [
      'jquery',
      'pnotify'
    ], factory);
  } else {
    // Browser globals
    factory(jQuery, PNotify);
  }
}(function ($, PNotify) {
  PNotify.prototype.options.confirm = {
    confirm: false,
    prompt: false,
    prompt_class: '',
    prompt_default: '',
    prompt_multi_line: false,
    align: 'right',
    buttons: [
      {
        text: 'Ok',
        addClass: '',
        promptTrigger: true,
        click: function (notice, value) {
          notice.remove();
          notice.get().trigger('pnotify.confirm', [
            notice,
            value
          ]);
        }
      },
      {
        text: 'Cancel',
        addClass: '',
        click: function (notice) {
          notice.remove();
          notice.get().trigger('pnotify.cancel', notice);
        }
      }
    ]
  };
  PNotify.prototype.modules.confirm = {
    container: null,
    prompt: null,
    init: function (notice, options) {
      this.container = $('<div style="margin-top:5px;clear:both;" />').css('text-align', options.align).appendTo(notice.container);
      if (options.confirm || options.prompt)
        this.makeDialog(notice, options);
      else
        this.container.hide();
    },
    update: function (notice, options) {
      if (options.confirm) {
        this.makeDialog(notice, options);
        this.container.show();
      } else {
        this.container.hide().empty();
      }
    },
    afterOpen: function (notice, options) {
      if (options.prompt)
        this.prompt.focus();
    },
    makeDialog: function (notice, options) {
      var already = false, that = this, btn, elem;
      this.container.empty();
      if (options.prompt) {
        this.prompt = $('<' + (options.prompt_multi_line ? 'textarea rows="5"' : 'input type="text"') + ' style="margin-bottom:5px;clear:both;" />').addClass(notice.styles.input + ' ' + options.prompt_class).val(options.prompt_default).appendTo(this.container);
      }
      for (var i in options.buttons) {
        btn = options.buttons[i];
        if (already)
          this.container.append(' ');
        else
          already = true;
        elem = $('<button type="button" />').addClass(notice.styles.btn + ' ' + btn.addClass).text(btn.text).appendTo(this.container).on('click', function (btn) {
          return function () {
            if (typeof btn.click == 'function') {
              btn.click(notice, options.prompt ? that.prompt.val() : null);
            }
          };
        }(btn));
        if (options.prompt && !options.prompt_multi_line && btn.promptTrigger)
          this.prompt.keypress(function (elem) {
            return function (e) {
              if (e.keyCode == 13)
                elem.click();
            };
          }(elem));
        if (notice.styles.text) {
          elem.wrapInner('<span class="' + notice.styles.text + '"></span>');
        }
        if (notice.styles.btnhover) {
          elem.hover(function (elem) {
            return function () {
              elem.addClass(notice.styles.btnhover);
            };
          }(elem), function (elem) {
            return function () {
              elem.removeClass(notice.styles.btnhover);
            };
          }(elem));
        }
        if (notice.styles.btnactive) {
          elem.on('mousedown', function (elem) {
            return function () {
              elem.addClass(notice.styles.btnactive);
            };
          }(elem)).on('mouseup', function (elem) {
            return function () {
              elem.removeClass(notice.styles.btnactive);
            };
          }(elem));
        }
        if (notice.styles.btnfocus) {
          elem.on('focus', function (elem) {
            return function () {
              elem.addClass(notice.styles.btnfocus);
            };
          }(elem)).on('blur', function (elem) {
            return function () {
              elem.removeClass(notice.styles.btnfocus);
            };
          }(elem));
        }
      }
    }
  };
  $.extend(PNotify.styling.jqueryui, {
    btn: 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only',
    btnhover: 'ui-state-hover',
    btnactive: 'ui-state-active',
    btnfocus: 'ui-state-focus',
    input: '',
    text: 'ui-button-text'
  });
  $.extend(PNotify.styling.bootstrap2, {
    btn: 'btn',
    input: ''
  });
  $.extend(PNotify.styling.bootstrap3, {
    btn: 'btn btn-default',
    input: 'form-control'
  });
  $.extend(PNotify.styling.fontawesome, {
    btn: 'btn btn-default',
    input: 'form-control'
  });
}));
// Buttons
// Uses AMD or browser globals for jQuery.
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as a module.
    define('pnotify.buttons', [
      'jquery',
      'pnotify'
    ], factory);
  } else {
    // Browser globals
    factory(jQuery, PNotify);
  }
}(function ($, PNotify) {
  PNotify.prototype.options.buttons = {
    closer: true,
    closer_hover: true,
    sticker: true,
    sticker_hover: true,
    labels: {
      close: 'Close',
      stick: 'Stick'
    }
  };
  PNotify.prototype.modules.buttons = {
    myOptions: null,
    closer: null,
    sticker: null,
    init: function (notice, options) {
      var that = this;
      this.myOptions = options;
      notice.elem.on({
        'mouseenter': function (e) {
          // Show the buttons.
          if (that.myOptions.sticker && !(notice.options.nonblock && notice.options.nonblock.nonblock))
            that.sticker.trigger('pnotify_icon').css('visibility', 'visible');
          if (that.myOptions.closer && !(notice.options.nonblock && notice.options.nonblock.nonblock))
            that.closer.css('visibility', 'visible');
        },
        'mouseleave': function (e) {
          // Hide the buttons.
          if (that.myOptions.sticker_hover)
            that.sticker.css('visibility', 'hidden');
          if (that.myOptions.closer_hover)
            that.closer.css('visibility', 'hidden');
        }
      });
      // Provide a button to stick the notice.
      this.sticker = $('<div />', {
        'class': 'ui-pnotify-sticker',
        'css': {
          'cursor': 'pointer',
          'visibility': options.sticker_hover ? 'hidden' : 'visible'
        },
        'click': function () {
          notice.options.hide = !notice.options.hide;
          if (notice.options.hide)
            notice.queueRemove();
          else
            notice.cancelRemove();
          $(this).trigger('pnotify_icon');
        }
      }).bind('pnotify_icon', function () {
        $(this).children().removeClass(notice.styles.pin_up + ' ' + notice.styles.pin_down).addClass(notice.options.hide ? notice.styles.pin_up : notice.styles.pin_down);
      }).append($('<span />', {
        'class': notice.styles.pin_up,
        'title': options.labels.stick
      })).prependTo(notice.container);
      if (!options.sticker || notice.options.nonblock && notice.options.nonblock.nonblock)
        this.sticker.css('display', 'none');
      // Provide a button to close the notice.
      this.closer = $('<div />', {
        'class': 'ui-pnotify-closer',
        'css': {
          'cursor': 'pointer',
          'visibility': options.closer_hover ? 'hidden' : 'visible'
        },
        'click': function () {
          notice.remove(false);
          that.sticker.css('visibility', 'hidden');
          that.closer.css('visibility', 'hidden');
        }
      }).append($('<span />', {
        'class': notice.styles.closer,
        'title': options.labels.close
      })).prependTo(notice.container);
      if (!options.closer || notice.options.nonblock && notice.options.nonblock.nonblock)
        this.closer.css('display', 'none');
    },
    update: function (notice, options) {
      this.myOptions = options;
      // Update the sticker and closer buttons.
      if (!options.closer || notice.options.nonblock && notice.options.nonblock.nonblock)
        this.closer.css('display', 'none');
      else if (options.closer)
        this.closer.css('display', 'block');
      if (!options.sticker || notice.options.nonblock && notice.options.nonblock.nonblock)
        this.sticker.css('display', 'none');
      else if (options.sticker)
        this.sticker.css('display', 'block');
      // Update the sticker icon.
      this.sticker.trigger('pnotify_icon');
      // Update the hover status of the buttons.
      if (options.sticker_hover)
        this.sticker.css('visibility', 'hidden');
      else if (!(notice.options.nonblock && notice.options.nonblock.nonblock))
        this.sticker.css('visibility', 'visible');
      if (options.closer_hover)
        this.closer.css('visibility', 'hidden');
      else if (!(notice.options.nonblock && notice.options.nonblock.nonblock))
        this.closer.css('visibility', 'visible');
    }
  };
  $.extend(PNotify.styling.jqueryui, {
    closer: 'ui-icon ui-icon-close',
    pin_up: 'ui-icon ui-icon-pin-w',
    pin_down: 'ui-icon ui-icon-pin-s'
  });
  $.extend(PNotify.styling.bootstrap2, {
    closer: 'icon-remove',
    pin_up: 'icon-pause',
    pin_down: 'icon-play'
  });
  $.extend(PNotify.styling.bootstrap3, {
    closer: 'glyphicon glyphicon-remove',
    pin_up: 'glyphicon glyphicon-pause',
    pin_down: 'glyphicon glyphicon-play'
  });
  $.extend(PNotify.styling.fontawesome, {
    closer: 'fa fa-times',
    pin_up: 'fa fa-pause',
    pin_down: 'fa fa-play'
  });
}));
(function () {
  'use strict';
  angular.module('jlareau.pnotify', []).provider('notificationService', [function () {
      var settings = { styling: 'bootstrap3' };
      var stacks = {};
      var defaultStack = false;
      var initHash = function (stackName) {
        var hash = angular.copy(settings);
        if ((stackName || (stackName = defaultStack)) && stackName in stacks) {
          hash.stack = stacks[stackName].stack;
          if (stacks[stackName].addclass) {
            hash.addclass = 'addclass' in hash ? hash.addclass + ' ' + stacks[stackName].addclass : stacks[stackName].addclass;
          }
        }
        return hash;
      };
      this.setDefaults = function (defaults) {
        settings = defaults;
        return this;
      };
      this.setStack = function (name, addclass, stack) {
        if (angular.isObject(addclass)) {
          stack = addclass;
          addclass = false;
        }
        stacks[name] = {
          stack: stack,
          addclass: addclass
        };
        return this;
      };
      this.setDefaultStack = function (name) {
        defaultStack = name;
        return this;
      };
      this.$get = [function () {
          return {
            getSettings: function () {
              return settings;
            },
            notice: function (content, stack) {
              var hash = initHash(stack);
              hash.type = 'notice';
              hash.text = content;
              return this.notify(hash);
            },
            info: function (content, stack) {
              var hash = initHash(stack);
              hash.type = 'info';
              hash.text = content;
              return this.notify(hash);
            },
            success: function (content, stack) {
              var hash = initHash(stack);
              hash.type = 'success';
              hash.text = content;
              return this.notify(hash);
            },
            error: function (content, stack) {
              var hash = initHash(stack);
              hash.type = 'error';
              hash.text = content;
              return this.notify(hash);
            },
            notifyWithDefaults: function (options, stack) {
              var defaults = initHash(stack);
              var combined = angular.extend(defaults, options);
              return this.notify(combined);
            },
            notify: function (hash) {
              return new PNotify(hash);
            }
          };
        }];
    }]);
  ;
}());
/*
 angular-file-upload v1.1.5
 https://github.com/nervgh/angular-file-upload
*/
!function (a, b) {
  return 'function' == typeof define && define.amd ? (define('angular-file-upload', ['angular'], function (a) {
    return b(a);
  }), void 0) : b(a);
}('undefined' == typeof angular ? null : angular, function (a) {
  var b = a.module('angularFileUpload', []);
  return b.value('fileUploaderOptions', {
    url: '/',
    alias: 'file',
    headers: {},
    queue: [],
    progress: 0,
    autoUpload: !1,
    removeAfterUpload: !1,
    method: 'POST',
    filters: [],
    formData: [],
    queueLimit: Number.MAX_VALUE,
    withCredentials: !1
  }).factory('FileUploader', [
    'fileUploaderOptions',
    '$rootScope',
    '$http',
    '$window',
    '$compile',
    function (b, c, d, e, f) {
      function g(c) {
        var d = a.copy(b);
        a.extend(this, d, c, {
          isUploading: !1,
          _nextIndex: 0,
          _failFilterIndex: -1,
          _directives: {
            select: [],
            drop: [],
            over: []
          }
        }), this.filters.unshift({
          name: 'queueLimit',
          fn: this._queueLimitFilter
        }), this.filters.unshift({
          name: 'folder',
          fn: this._folderFilter
        });
      }
      function h(b) {
        var c = a.isElement(b), d = c ? b.value : b, e = a.isString(d) ? 'FakePath' : 'Object', f = '_createFrom' + e;
        this[f](d);
      }
      function i(b, c, d) {
        var e = a.isElement(c), f = e ? a.element(c) : null, h = e ? null : c;
        a.extend(this, {
          url: b.url,
          alias: b.alias,
          headers: a.copy(b.headers),
          formData: a.copy(b.formData),
          removeAfterUpload: b.removeAfterUpload,
          withCredentials: b.withCredentials,
          method: b.method
        }, d, {
          uploader: b,
          file: new g.FileLikeObject(c),
          isReady: !1,
          isUploading: !1,
          isUploaded: !1,
          isSuccess: !1,
          isCancel: !1,
          isError: !1,
          progress: 0,
          index: null,
          _file: h,
          _input: f
        }), f && this._replaceNode(f);
      }
      function j(b) {
        a.extend(this, b), this.uploader._directives[this.prop].push(this), this._saveLinks(), this.bind();
      }
      function k() {
        k.super_.apply(this, arguments), this.uploader.isHTML5 || this.element.removeAttr('multiple'), this.element.prop('value', null);
      }
      function l() {
        l.super_.apply(this, arguments);
      }
      function m() {
        m.super_.apply(this, arguments);
      }
      return g.prototype.isHTML5 = !(!e.File || !e.FormData), g.prototype.addToQueue = function (b, c, d) {
        var e = this.isArrayLikeObject(b) ? b : [b], f = this._getFilters(d), h = this.queue.length, i = [];
        a.forEach(e, function (a) {
          var b = new g.FileLikeObject(a);
          if (this._isValidFile(b, f, c)) {
            var d = new g.FileItem(this, a, c);
            i.push(d), this.queue.push(d), this._onAfterAddingFile(d);
          } else {
            var e = this.filters[this._failFilterIndex];
            this._onWhenAddingFileFailed(b, e, c);
          }
        }, this), this.queue.length !== h && (this._onAfterAddingAll(i), this.progress = this._getTotalProgress()), this._render(), this.autoUpload && this.uploadAll();
      }, g.prototype.removeFromQueue = function (a) {
        var b = this.getIndexOfItem(a), c = this.queue[b];
        c.isUploading && c.cancel(), this.queue.splice(b, 1), c._destroy(), this.progress = this._getTotalProgress();
      }, g.prototype.clearQueue = function () {
        for (; this.queue.length;)
          this.queue[0].remove();
        this.progress = 0;
      }, g.prototype.uploadItem = function (a) {
        var b = this.getIndexOfItem(a), c = this.queue[b], d = this.isHTML5 ? '_xhrTransport' : '_iframeTransport';
        c._prepareToUploading(), this.isUploading || (this.isUploading = !0, this[d](c));
      }, g.prototype.cancelItem = function (a) {
        var b = this.getIndexOfItem(a), c = this.queue[b], d = this.isHTML5 ? '_xhr' : '_form';
        c && c.isUploading && c[d].abort();
      }, g.prototype.uploadAll = function () {
        var b = this.getNotUploadedItems().filter(function (a) {
            return !a.isUploading;
          });
        b.length && (a.forEach(b, function (a) {
          a._prepareToUploading();
        }), b[0].upload());
      }, g.prototype.cancelAll = function () {
        var b = this.getNotUploadedItems();
        a.forEach(b, function (a) {
          a.cancel();
        });
      }, g.prototype.isFile = function (a) {
        var b = e.File;
        return b && a instanceof b;
      }, g.prototype.isFileLikeObject = function (a) {
        return a instanceof g.FileLikeObject;
      }, g.prototype.isArrayLikeObject = function (b) {
        return a.isObject(b) && 'length' in b;
      }, g.prototype.getIndexOfItem = function (b) {
        return a.isNumber(b) ? b : this.queue.indexOf(b);
      }, g.prototype.getNotUploadedItems = function () {
        return this.queue.filter(function (a) {
          return !a.isUploaded;
        });
      }, g.prototype.getReadyItems = function () {
        return this.queue.filter(function (a) {
          return a.isReady && !a.isUploading;
        }).sort(function (a, b) {
          return a.index - b.index;
        });
      }, g.prototype.destroy = function () {
        a.forEach(this._directives, function (b) {
          a.forEach(this._directives[b], function (a) {
            a.destroy();
          }, this);
        }, this);
      }, g.prototype.onAfterAddingAll = function () {
      }, g.prototype.onAfterAddingFile = function () {
      }, g.prototype.onWhenAddingFileFailed = function () {
      }, g.prototype.onBeforeUploadItem = function () {
      }, g.prototype.onProgressItem = function () {
      }, g.prototype.onProgressAll = function () {
      }, g.prototype.onSuccessItem = function () {
      }, g.prototype.onErrorItem = function () {
      }, g.prototype.onCancelItem = function () {
      }, g.prototype.onCompleteItem = function () {
      }, g.prototype.onCompleteAll = function () {
      }, g.prototype._getTotalProgress = function (a) {
        if (this.removeAfterUpload)
          return a || 0;
        var b = this.getNotUploadedItems().length, c = b ? this.queue.length - b : this.queue.length, d = 100 / this.queue.length, e = (a || 0) * d / 100;
        return Math.round(c * d + e);
      }, g.prototype._getFilters = function (b) {
        if (a.isUndefined(b))
          return this.filters;
        if (a.isArray(b))
          return b;
        var c = b.match(/[^\s,]+/g);
        return this.filters.filter(function (a) {
          return -1 !== c.indexOf(a.name);
        }, this);
      }, g.prototype._render = function () {
        c.$$phase || c.$apply();
      }, g.prototype._folderFilter = function (a) {
        return !(!a.size && !a.type);
      }, g.prototype._queueLimitFilter = function () {
        return this.queue.length < this.queueLimit;
      }, g.prototype._isValidFile = function (a, b, c) {
        return this._failFilterIndex = -1, b.length ? b.every(function (b) {
          return this._failFilterIndex++, b.fn.call(this, a, c);
        }, this) : !0;
      }, g.prototype._isSuccessCode = function (a) {
        return a >= 200 && 300 > a || 304 === a;
      }, g.prototype._transformResponse = function (b, c) {
        var e = this._headersGetter(c);
        return a.forEach(d.defaults.transformResponse, function (a) {
          b = a(b, e);
        }), b;
      }, g.prototype._parseHeaders = function (b) {
        var c, d, e, f = {};
        return b ? (a.forEach(b.split('\n'), function (a) {
          e = a.indexOf(':'), c = a.slice(0, e).trim().toLowerCase(), d = a.slice(e + 1).trim(), c && (f[c] = f[c] ? f[c] + ', ' + d : d);
        }), f) : f;
      }, g.prototype._headersGetter = function (a) {
        return function (b) {
          return b ? a[b.toLowerCase()] || null : a;
        };
      }, g.prototype._xhrTransport = function (b) {
        var c = b._xhr = new XMLHttpRequest(), d = new FormData(), e = this;
        e._onBeforeUploadItem(b), a.forEach(b.formData, function (b) {
          a.forEach(b, function (a, b) {
            d.append(b, a);
          });
        }), d.append(b.alias, b._file, b.file.name), c.upload.onprogress = function (a) {
          var c = Math.round(a.lengthComputable ? 100 * a.loaded / a.total : 0);
          e._onProgressItem(b, c);
        }, c.onload = function () {
          var a = e._parseHeaders(c.getAllResponseHeaders()), d = e._transformResponse(c.response, a), f = e._isSuccessCode(c.status) ? 'Success' : 'Error', g = '_on' + f + 'Item';
          e[g](b, d, c.status, a), e._onCompleteItem(b, d, c.status, a);
        }, c.onerror = function () {
          var a = e._parseHeaders(c.getAllResponseHeaders()), d = e._transformResponse(c.response, a);
          e._onErrorItem(b, d, c.status, a), e._onCompleteItem(b, d, c.status, a);
        }, c.onabort = function () {
          var a = e._parseHeaders(c.getAllResponseHeaders()), d = e._transformResponse(c.response, a);
          e._onCancelItem(b, d, c.status, a), e._onCompleteItem(b, d, c.status, a);
        }, c.open(b.method, b.url, !0), c.withCredentials = b.withCredentials, a.forEach(b.headers, function (a, b) {
          c.setRequestHeader(b, a);
        }), c.send(d), this._render();
      }, g.prototype._iframeTransport = function (b) {
        var c = a.element('<form style="display: none;" />'), d = a.element('<iframe name="iframeTransport' + Date.now() + '">'), e = b._input, f = this;
        b._form && b._form.replaceWith(e), b._form = c, f._onBeforeUploadItem(b), e.prop('name', b.alias), a.forEach(b.formData, function (b) {
          a.forEach(b, function (b, d) {
            var e = a.element('<input type="hidden" name="' + d + '" />');
            e.val(b), c.append(e);
          });
        }), c.prop({
          action: b.url,
          method: 'POST',
          target: d.prop('name'),
          enctype: 'multipart/form-data',
          encoding: 'multipart/form-data'
        }), d.bind('load', function () {
          try {
            var a = d[0].contentDocument.body.innerHTML;
          } catch (c) {
          }
          var e = {
              response: a,
              status: 200,
              dummy: !0
            }, g = {}, h = f._transformResponse(e.response, g);
          f._onSuccessItem(b, h, e.status, g), f._onCompleteItem(b, h, e.status, g);
        }), c.abort = function () {
          var a, g = {
              status: 0,
              dummy: !0
            }, h = {};
          d.unbind('load').prop('src', 'javascript:false;'), c.replaceWith(e), f._onCancelItem(b, a, g.status, h), f._onCompleteItem(b, a, g.status, h);
        }, e.after(c), c.append(e).append(d), c[0].submit(), this._render();
      }, g.prototype._onWhenAddingFileFailed = function (a, b, c) {
        this.onWhenAddingFileFailed(a, b, c);
      }, g.prototype._onAfterAddingFile = function (a) {
        this.onAfterAddingFile(a);
      }, g.prototype._onAfterAddingAll = function (a) {
        this.onAfterAddingAll(a);
      }, g.prototype._onBeforeUploadItem = function (a) {
        a._onBeforeUpload(), this.onBeforeUploadItem(a);
      }, g.prototype._onProgressItem = function (a, b) {
        var c = this._getTotalProgress(b);
        this.progress = c, a._onProgress(b), this.onProgressItem(a, b), this.onProgressAll(c), this._render();
      }, g.prototype._onSuccessItem = function (a, b, c, d) {
        a._onSuccess(b, c, d), this.onSuccessItem(a, b, c, d);
      }, g.prototype._onErrorItem = function (a, b, c, d) {
        a._onError(b, c, d), this.onErrorItem(a, b, c, d);
      }, g.prototype._onCancelItem = function (a, b, c, d) {
        a._onCancel(b, c, d), this.onCancelItem(a, b, c, d);
      }, g.prototype._onCompleteItem = function (b, c, d, e) {
        b._onComplete(c, d, e), this.onCompleteItem(b, c, d, e);
        var f = this.getReadyItems()[0];
        return this.isUploading = !1, a.isDefined(f) ? (f.upload(), void 0) : (this.onCompleteAll(), this.progress = this._getTotalProgress(), this._render(), void 0);
      }, g.isFile = g.prototype.isFile, g.isFileLikeObject = g.prototype.isFileLikeObject, g.isArrayLikeObject = g.prototype.isArrayLikeObject, g.isHTML5 = g.prototype.isHTML5, g.inherit = function (a, b) {
        a.prototype = Object.create(b.prototype), a.prototype.constructor = a, a.super_ = b;
      }, g.FileLikeObject = h, g.FileItem = i, g.FileDirective = j, g.FileSelect = k, g.FileDrop = l, g.FileOver = m, h.prototype._createFromFakePath = function (a) {
        this.lastModifiedDate = null, this.size = null, this.type = 'like/' + a.slice(a.lastIndexOf('.') + 1).toLowerCase(), this.name = a.slice(a.lastIndexOf('/') + a.lastIndexOf('\\') + 2);
      }, h.prototype._createFromObject = function (b) {
        this.lastModifiedDate = a.copy(b.lastModifiedDate), this.size = b.size, this.type = b.type, this.name = b.name;
      }, i.prototype.upload = function () {
        this.uploader.uploadItem(this);
      }, i.prototype.cancel = function () {
        this.uploader.cancelItem(this);
      }, i.prototype.remove = function () {
        this.uploader.removeFromQueue(this);
      }, i.prototype.onBeforeUpload = function () {
      }, i.prototype.onProgress = function () {
      }, i.prototype.onSuccess = function () {
      }, i.prototype.onError = function () {
      }, i.prototype.onCancel = function () {
      }, i.prototype.onComplete = function () {
      }, i.prototype._onBeforeUpload = function () {
        this.isReady = !0, this.isUploading = !0, this.isUploaded = !1, this.isSuccess = !1, this.isCancel = !1, this.isError = !1, this.progress = 0, this.onBeforeUpload();
      }, i.prototype._onProgress = function (a) {
        this.progress = a, this.onProgress(a);
      }, i.prototype._onSuccess = function (a, b, c) {
        this.isReady = !1, this.isUploading = !1, this.isUploaded = !0, this.isSuccess = !0, this.isCancel = !1, this.isError = !1, this.progress = 100, this.index = null, this.onSuccess(a, b, c);
      }, i.prototype._onError = function (a, b, c) {
        this.isReady = !1, this.isUploading = !1, this.isUploaded = !0, this.isSuccess = !1, this.isCancel = !1, this.isError = !0, this.progress = 0, this.index = null, this.onError(a, b, c);
      }, i.prototype._onCancel = function (a, b, c) {
        this.isReady = !1, this.isUploading = !1, this.isUploaded = !1, this.isSuccess = !1, this.isCancel = !0, this.isError = !1, this.progress = 0, this.index = null, this.onCancel(a, b, c);
      }, i.prototype._onComplete = function (a, b, c) {
        this.onComplete(a, b, c), this.removeAfterUpload && this.remove();
      }, i.prototype._destroy = function () {
        this._input && this._input.remove(), this._form && this._form.remove(), delete this._form, delete this._input;
      }, i.prototype._prepareToUploading = function () {
        this.index = this.index || ++this.uploader._nextIndex, this.isReady = !0;
      }, i.prototype._replaceNode = function (a) {
        var b = f(a.clone())(a.scope());
        b.prop('value', null), a.css('display', 'none'), a.after(b);
      }, j.prototype.events = {}, j.prototype.bind = function () {
        for (var a in this.events) {
          var b = this.events[a];
          this.element.bind(a, this[b]);
        }
      }, j.prototype.unbind = function () {
        for (var a in this.events)
          this.element.unbind(a, this.events[a]);
      }, j.prototype.destroy = function () {
        var a = this.uploader._directives[this.prop].indexOf(this);
        this.uploader._directives[this.prop].splice(a, 1), this.unbind();
      }, j.prototype._saveLinks = function () {
        for (var a in this.events) {
          var b = this.events[a];
          this[b] = this[b].bind(this);
        }
      }, g.inherit(k, j), k.prototype.events = {
        $destroy: 'destroy',
        change: 'onChange'
      }, k.prototype.prop = 'select', k.prototype.getOptions = function () {
      }, k.prototype.getFilters = function () {
      }, k.prototype.isEmptyAfterSelection = function () {
        return !!this.element.attr('multiple');
      }, k.prototype.onChange = function () {
        var a = this.uploader.isHTML5 ? this.element[0].files : this.element[0], b = this.getOptions(), c = this.getFilters();
        this.uploader.isHTML5 || this.destroy(), this.uploader.addToQueue(a, b, c), this.isEmptyAfterSelection() && this.element.prop('value', null);
      }, g.inherit(l, j), l.prototype.events = {
        $destroy: 'destroy',
        drop: 'onDrop',
        dragover: 'onDragOver',
        dragleave: 'onDragLeave'
      }, l.prototype.prop = 'drop', l.prototype.getOptions = function () {
      }, l.prototype.getFilters = function () {
      }, l.prototype.onDrop = function (b) {
        var c = this._getTransfer(b);
        if (c) {
          var d = this.getOptions(), e = this.getFilters();
          this._preventAndStop(b), a.forEach(this.uploader._directives.over, this._removeOverClass, this), this.uploader.addToQueue(c.files, d, e);
        }
      }, l.prototype.onDragOver = function (b) {
        var c = this._getTransfer(b);
        this._haveFiles(c.types) && (c.dropEffect = 'copy', this._preventAndStop(b), a.forEach(this.uploader._directives.over, this._addOverClass, this));
      }, l.prototype.onDragLeave = function (b) {
        b.currentTarget === this.element[0] && (this._preventAndStop(b), a.forEach(this.uploader._directives.over, this._removeOverClass, this));
      }, l.prototype._getTransfer = function (a) {
        return a.dataTransfer ? a.dataTransfer : a.originalEvent.dataTransfer;
      }, l.prototype._preventAndStop = function (a) {
        a.preventDefault(), a.stopPropagation();
      }, l.prototype._haveFiles = function (a) {
        return a ? a.indexOf ? -1 !== a.indexOf('Files') : a.contains ? a.contains('Files') : !1 : !1;
      }, l.prototype._addOverClass = function (a) {
        a.addOverClass();
      }, l.prototype._removeOverClass = function (a) {
        a.removeOverClass();
      }, g.inherit(m, j), m.prototype.events = { $destroy: 'destroy' }, m.prototype.prop = 'over', m.prototype.overClass = 'nv-file-over', m.prototype.addOverClass = function () {
        this.element.addClass(this.getOverClass());
      }, m.prototype.removeOverClass = function () {
        this.element.removeClass(this.getOverClass());
      }, m.prototype.getOverClass = function () {
        return this.overClass;
      }, g;
    }
  ]).directive('nvFileSelect', [
    '$parse',
    'FileUploader',
    function (a, b) {
      return {
        link: function (c, d, e) {
          var f = c.$eval(e.uploader);
          if (!(f instanceof b))
            throw new TypeError('"Uploader" must be an instance of FileUploader');
          var g = new b.FileSelect({
              uploader: f,
              element: d
            });
          g.getOptions = a(e.options).bind(g, c), g.getFilters = function () {
            return e.filters;
          };
        }
      };
    }
  ]).directive('nvFileDrop', [
    '$parse',
    'FileUploader',
    function (a, b) {
      return {
        link: function (c, d, e) {
          var f = c.$eval(e.uploader);
          if (!(f instanceof b))
            throw new TypeError('"Uploader" must be an instance of FileUploader');
          if (f.isHTML5) {
            var g = new b.FileDrop({
                uploader: f,
                element: d
              });
            g.getOptions = a(e.options).bind(g, c), g.getFilters = function () {
              return e.filters;
            };
          }
        }
      };
    }
  ]).directive('nvFileOver', [
    'FileUploader',
    function (a) {
      return {
        link: function (b, c, d) {
          var e = b.$eval(d.uploader);
          if (!(e instanceof a))
            throw new TypeError('"Uploader" must be an instance of FileUploader');
          var f = new a.FileOver({
              uploader: e,
              element: c
            });
          f.getOverClass = function () {
            return d.overClass || this.overClass;
          };
        }
      };
    }
  ]), b;
});  //# sourceMappingURL=angular-file-upload.min.map
