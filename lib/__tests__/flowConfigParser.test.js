"use strict";

var _assert = require("assert");

var _flowConfigParser = _interopRequireDefault(require("../flowConfigParser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Flow Config Parser', function () {
  it('should parse a very sparse configuration', function () {
    var result = (0, _flowConfigParser.default)("\n      [ignore]\n      node_modules/babel-cli/.*\n      .*/__tests__/.*\n      .*/src/(foo|bar)/.*\n      .*.ignore.js\n      <PROJECT_ROOT>/__tests__/.*\n\n      [include]\n      interfaces\n\n      [lib]\n\n      [options]\n      suppress_type=$FlowIssue\n      suppress_comment=.*@flowFixMe\n      module.name_mapper= '^image![a-zA-Z0-9$_]+$' -> 'ImageStub'\n      module.name_mapper.extension= 'css' -> '<PROJECT_ROOT>/CSSFlowStub.js.flow'\n      munge_underscores=true\n      server.max_workers=4\n\n      [version]\n      0.23.1\n    ");
    (0, _assert.equal)(result.suppressesType('$FlowIssue'), true);
    (0, _assert.equal)(result.suppressesType('Boolean'), false);
    (0, _assert.equal)(result.suppressesComment('@flowFixMe this is broken'), true);
    (0, _assert.equal)(result.suppressesComment('Hello World'), false);
    (0, _assert.equal)(result.remapModule('bluebird'), 'bluebird');
    (0, _assert.equal)(result.remapModule('image!abc'), 'ImageStub');
    (0, _assert.equal)(result.get('munge_underscores'), true);
    (0, _assert.equal)(result.get('server.max_workers'), 4);
    (0, _assert.equal)(result.ignoresFile('./node_modules/babel-cli/foo.js'), true);
    (0, _assert.equal)(result.ignoresFile('./__tests__/foo.js'), true);
    (0, _assert.equal)(result.ignoresFile('./src/foo.js'), false);
    (0, _assert.deepEqual)(result.get('version'), ['0.23.1']);
  });
  it('should allow replacements to work correctly in name_mapper', function () {
    var result = (0, _flowConfigParser.default)("\n      [ignore]\n\n      [include]\n\n      [lib]\n\n      [options]\n      module.name_mapper='some/matching/(.*)/group' -> 'replaced/\\1/group'\n    ");
    (0, _assert.equal)(result.remapModule('some/matching/test/group'), 'replaced/test/group');
  });
});