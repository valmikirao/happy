(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var shuffle = exports.shuffle = function shuffle(array) {
	var arrayClone = [].concat(_toConsumableArray(array));

	return array.map(function () {
		var i = Math.floor(Math.random() * arrayClone.length);

		return arrayClone.splice(i, 1)[0];
	});
};

exports.default = function (ArrayParam) {
	if (ArrayParam !== undefined) {
		ArrayParam.prototype.shuffle = function () {
			return shuffle(this);
		};
	}
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWJcXGFycmF5LXJhbmRvbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQU8sSUFBTSw0QkFBVSxTQUFWLE9BQVUsQ0FBQyxLQUFELEVBQVc7QUFDakMsS0FBSSwwQ0FBaUIsS0FBakIsRUFBSjs7QUFFQSxRQUFPLE1BQU0sR0FBTixDQUFVLFlBQU07QUFDdEIsTUFBSSxJQUFJLEtBQUssS0FBTCxDQUFXLEtBQUssTUFBTCxLQUFnQixXQUFXLE1BQXRDLENBQVI7O0FBRUEsU0FBTyxXQUFXLE1BQVgsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FBUDtBQUNBLEVBSk0sQ0FBUDtBQUtBLENBUk07O2tCQVVRLFVBQUMsVUFBRCxFQUFnQjtBQUMzQixLQUFJLGVBQWUsU0FBbkIsRUFBOEI7QUFDMUIsYUFBVyxTQUFYLENBQXFCLE9BQXJCLEdBQStCLFlBQVk7QUFBQyxVQUFPLFFBQVEsSUFBUixDQUFQO0FBQXFCLEdBQWpFO0FBQ0g7QUFDSixDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBjb25zdCBzaHVmZmxlID0gKGFycmF5KSA9PiB7XHJcblx0dmFyIGFycmF5Q2xvbmUgPSBbLi4uYXJyYXldO1xyXG5cclxuXHRyZXR1cm4gYXJyYXkubWFwKCgpID0+IHtcclxuXHRcdHZhciBpID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyYXlDbG9uZS5sZW5ndGgpO1xyXG5cclxuXHRcdHJldHVybiBhcnJheUNsb25lLnNwbGljZShpLCAxKVswXTtcclxuXHR9KTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChBcnJheVBhcmFtKSA9PiB7XHJcbiAgICBpZiAoQXJyYXlQYXJhbSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgQXJyYXlQYXJhbS5wcm90b3R5cGUuc2h1ZmZsZSA9IGZ1bmN0aW9uICgpIHtyZXR1cm4gc2h1ZmZsZSh0aGlzKX07XHJcbiAgICB9XHJcbn07XHJcbiJdfQ==
