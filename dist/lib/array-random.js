"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = function (array) {
    var arrayClone = array.slice();
    return array.map(function () {
        var i = Math.floor(Math.random() * arrayClone.length);
        return arrayClone.splice(i, 1)[0];
    });
};
exports.randomElement = function (array) {
    var i = Math.floor(Math.random() * array.length);
    return array[i];
};
//# sourceMappingURL=array-random.js.map