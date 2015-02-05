document.onselectstart = function() {
	return false;
};

var winResizeStack = {};
window.onresize = function() {
	for (var prop in winResizeStack) {
		winResizeStack[prop].call();
	}
};
var addWinResize = function(prop, fn) {
	winResizeStack[prop] = fn;
};
var delWinResize = function(prop) {
	delete winResizeStack[prop];
};
var resetWinResize = function() {
	winResizeStack = {};
};
var simWinResize = function() {
	window.resize();
};