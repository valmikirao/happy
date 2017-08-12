"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function describe(name, tests) {
    tests();
}
exports.describe = describe;
function it(name, test) {
    test();
}
exports.it = it;
function before(beforeFunc) {
    beforeFunc();
}
exports.before = before;
function after(afterFunc) {
    afterFunc();
}
exports.after = after;
//# sourceMappingURL=mocha-debug.js.map