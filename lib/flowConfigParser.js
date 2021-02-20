"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseFlowConfig;
exports.FlowConfig = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var KNOWN_REGEXPS = {
  ignore: true,
  options: {
    'suppress_comment': true,
    'module.name_mapper': true
  }
};
var KNOWN_BOOLEANS = {
  options: {
    'munge_underscores': true,
    'use_strict': true,
    'strip_root': true
  }
};
var KNOWN_NUMERICS = {
  options: {
    'server.max_workers': true,
    'traces': true
  }
};

function checkFlowConfigSectionName(section) {
  switch (section) {
    case 'ignore':
    case 'include':
    case 'lib':
    case 'options':
    case 'version':
      return section;

    default:
      return null;
  }
}
/**
 * Parse a given flow configuration (supplied as a string), and return the parsed representation.
 */


function parseFlowConfig(input) {
  var projectRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();
  var lines = input.split(/(\r?\n)+/).map(function (line) {
    return line.trim();
  }).filter(function (line) {
    return line.length > 0;
  });
  var structure = new FlowConfig();
  var section;
  var sectionName;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line.charAt(0) === '#' || line.charAt(0) === ';') {
      // This is a comment.
      continue;
    }

    var matchSection = /^\[(.+)\](\s*#(.*))?$/.exec(line);
    var matchedSectionName = matchSection ? checkFlowConfigSectionName(matchSection[1].trim()) : null;

    if (matchedSectionName) {
      sectionName = matchedSectionName;
      section = [];
      structure[sectionName] = section;
    } else if (!section || !sectionName) {
      throw new Error('Invalid flow configuration, found entry outside of a named section.');
    } else if (KNOWN_REGEXPS[sectionName] === true) {
      section.push(regexpify(line));
    } else {
      var matchesKeyValue = /^([A-Za-z0-9_.]+)=(.*)$/.exec(line);

      if (matchesKeyValue) {
        var key = matchesKeyValue[1];
        var value = matchesKeyValue[2];

        if (KNOWN_REGEXPS[sectionName] && KNOWN_REGEXPS[sectionName][key]) {
          var matchesMapper = /^\s*'(.*)'\s*->\s*'(.*)'$/.exec(value);

          if (matchesMapper) {
            value = [regexpify(matchesMapper[1]), matchesMapper[2].replace(/\\(\d)/g, '$$$1').replace(/<PROJECT_ROOT>/g, process.cwd())];
          } else {
            value = regexpify(value);
          }
        } else if (KNOWN_BOOLEANS[sectionName] && KNOWN_BOOLEANS[sectionName][key]) {
          value = value === 'true' ? true : false;
        } else if (KNOWN_NUMERICS[sectionName] && KNOWN_NUMERICS[sectionName][key]) {
          value = Number(value);
        } else {
          var _matchesMapper = /^\s*'(.*)'\s*->\s*'(.*)'$/.exec(value);

          if (_matchesMapper) {
            value = [_matchesMapper[1], _matchesMapper[2].replace(/<PROJECT_ROOT>/g, projectRoot)];
          }
        }

        section.push([key, value]);
      } else {
        section.push(line);
      }
    }
  }

  return structure;
}

function regexpify(input) {
  var projectRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();
  return new RegExp(input.replace(/\\([(|)])/g, function (a, b) {
    return b;
  }).replace(/<PROJECT_ROOT>/g, projectRoot).replace(/\//g, '\\/'));
}

var FlowConfig = /*#__PURE__*/function () {
  function FlowConfig() {
    _classCallCheck(this, FlowConfig);

    _defineProperty(this, "ignore", []);

    _defineProperty(this, "include", []);

    _defineProperty(this, "lib", []);

    _defineProperty(this, "options", []);

    _defineProperty(this, "version", []);
  }

  _createClass(FlowConfig, [{
    key: "ignoresFile",
    value: function ignoresFile(filename) {
      var ignore = this.ignore;
      var length = ignore.length;

      for (var i = 0; i < length; i++) {
        var pattern = ignore[i];

        if (pattern.test(filename)) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "suppressesType",
    value: function suppressesType(name) {
      var options = this.options;
      var length = options.length;

      for (var i = 0; i < length; i++) {
        var _options$i = _slicedToArray(options[i], 2),
            key = _options$i[0],
            value = _options$i[1];

        if (key === 'suppress_type' && name === value) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "suppressesComment",
    value: function suppressesComment(comment) {
      var options = this.options;
      var length = options.length;

      for (var i = 0; i < length; i++) {
        var _options$i2 = _slicedToArray(options[i], 2),
            key = _options$i2[0],
            value = _options$i2[1];

        if (key === 'suppress_comment' && value.test(comment)) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "remapModule",
    value: function remapModule(name) {
      var mappers = this.get('module.name_mapper');

      var _iterator = _createForOfIteratorHelper(mappers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              pattern = _step$value[0],
              redirect = _step$value[1];

          if (pattern.test(name)) {
            return name.replace(pattern, redirect);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return name;
    }
  }, {
    key: "get",
    value: function get(target) {
      var named = this[target];

      if (named !== null && _typeof(named) === 'object') {
        return named;
      }

      var options = this.options;
      var length = options.length;
      var result = [];

      for (var i = 0; i < length; i++) {
        var _options$i3 = _slicedToArray(options[i], 2),
            key = _options$i3[0],
            value = _options$i3[1];

        if (key === target) {
          if (KNOWN_BOOLEANS.options[key] || KNOWN_NUMERICS.options[key]) {
            return value;
          }

          result.push(value);
        }
      }

      return result;
    }
  }]);

  return FlowConfig;
}();

exports.FlowConfig = FlowConfig;