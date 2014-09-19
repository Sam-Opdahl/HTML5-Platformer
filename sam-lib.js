var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 480;

var realKeyDown = {};
var previousKeyDown = {};
var keyDown = {};
var realMousePos = {};
var mousePos = {};
var realMouseClicked = {};
var previousMouseClicked = {};
var mouseClicked = {};

document.addEventListener("keydown", function(e) {
	realKeyDown[e.keyCode] = true;
}, false);
document.addEventListener("keyup", function(e) {
	realKeyDown[e.keyCode] = false;
}, false);
mainCanvas.addEventListener("mousemove", function(e) {
	var clientRect = mainCanvas.getBoundingClientRect();
	realMousePos = { 
		x: e.clientX - clientRect.left,
		y: e.clientY - clientRect.top
	}
}, false);
mainCanvas.addEventListener("mousedown", function(e) {
	realMouseClicked[e.button] = true;
}, false);
mainCanvas.addEventListener("mouseup", function(e) {
	realMouseClicked[e.button] = false;
}, false);

function isKeyPressed(code) {
	return keyDown[code] && !previousKeyDown[code];
}
function isKeyDown(code) {
	return keyDown[code];
}
function isMouseClicked(button) {
	return mouseClicked[button] && !previousMouseClicked[button];
}
function isMouseDown(button) {
	return mouseClicked[button];
}

var Keys = {
	A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, 
	N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
	SPACE: 32,
	LEFT: 37, 
	UP: 38,
	RIGHT: 39,
	DOWN: 40
};

function updateInput() {
	previousKeyDown = $.extend(true, {}, keyDown);
	previousMouseClicked = $.extend(true, {}, mouseClicked);
	keyDown = $.extend(true, {}, realKeyDown);
	mousePos = $.extend(true, {}, realMousePos);
	mouseClicked = $.extend(true, {}, realMouseClicked)
}

Number.prototype.clamp = function(min, max) {
	return Math.min(max, Math.max(this, min));
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Rectangle class
function Rectangle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.top = y;
	this.right = x + width;
	this.bottom = y + height;
	this.left = x;
}

Rectangle.prototype = {
	intersects: function(other) {
		return this.right > other.left &&
			this.bottom > other.top &&
			this.left < other.right &&
			this.top < other.bottom;
	}
};

//Color class
function Color(r, g, b) {
	this.r = parseInt(r);
	this.g = parseInt(g);
	this.b = parseInt(b);
}

Color.prototype = {
	toString: function() {
		return "rgb("+this.r+","+this.g+","+this.b+")";
	}
};

window.requestAnimationFrame = (function() {
	return window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame || 
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

var mainLoop = function() {
	updateInput();
	Game.update();
	Game.draw();

	requestAnimationFrame(mainLoop);
};

//initialization
window.onload = function() {
	mainCanvas.width = CANVAS_WIDTH;
	mainCanvas.height = CANVAS_HEIGHT;

	Game.initialize();
	requestAnimationFrame(mainLoop);
};