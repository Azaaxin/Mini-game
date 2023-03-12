// script.js

const Player = function(x, y) {
	this.x = x;
	this.y = y;
};

const Entity = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.x_dir = 0;
	this.y_dir = 0;
	this.x_speed = 0;
	this.y_speed = 0;
}

var scaled_size  = 64;
var sprite_size  = 16;
var tile_count_x = 24;
var tile_count_y = 24;
var tile_size    = 128;

var map = [
	3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
	3,0,0,0,0,0,0,3,3,0,0,0,3,0,0,0,3,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,3,3,0,0,0,3,0,0,0,3,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,3,3,0,0,3,
	3,0,0,0,0,0,3,3,0,3,3,3,3,3,3,3,0,0,3,3,3,3,3,3,
	3,3,0,3,3,3,3,3,0,3,3,0,0,0,0,3,0,0,3,3,3,0,0,3,
	3,3,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,3,3,3,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,3,3,3,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,
	3,0,0,0,0,0,0,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,
	3,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,3,0,0,0,0,0,0,3,
	3,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,1,1,1,0,3,
	3,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,3,0,1,2,2,1,2,3,
	3,3,0,0,0,0,3,3,3,3,3,3,0,0,0,0,3,0,0,1,2,1,2,3,
	3,3,0,0,0,3,3,3,3,3,3,3,0,0,0,0,3,0,0,0,0,2,2,3,
	3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
];

var game = {
	player: new Entity(256, 256, tile_size, tile_size),
	camera: new Entity(-300, -300),
}

var player_speed = 5;
var player_movement = 100;
var player_movement_halfspeed = 0;

Player.prototype = {
	moveTo: function(x, y) {
		this.x = (x - scaled_size * 0.5) * 0.05;
		this.y = (y - scaled_size * 0.5) * 0.05;
	}

};

const Viewport = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

Viewport.prototype = {
	scrollTo: function(x, y) {
		this.x = x - this.w * 0.5;
		this.y = y - this.w * 0.5;
		this.x += (x - this.x - this.w * 0.5) * 0.05;
		this.y += (y - this.y - this.h * 0.5) * 0.05;
	}
};

var width  = 800;
var height = 600;
var viewport = new Viewport(400, 400, 600, 600);

function lerp(v0, v1, t) {
	return (1.0 - t) * v0 + t * v1;
}

var tile_sheet = new Image();

// tile_sheet.addEventListener("load", (event) => { loop(); });
tile_sheet.src = "textures1.png";

let keysPressed = {};
document.addEventListener('keydown', (event) => {
	keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
	delete keysPressed[event.key];
});

function drawSprite(x, y, w, h, context, sprite_id) {
	context.drawImage(tile_sheet, sprite_id * sprite_size, 0, sprite_size, sprite_size, x, y, w, h);
}

function clearWindow(context) {
	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function cameraUpdate(window_w, window_h) {
	var window_center_x = window_w >> 1; // document.documentElement.clientHeight >> 1;
	var window_center_y = window_h >> 1; // document.documentElement.clientWidth >> 1;
	var target = game.player;

	game.camera.x = lerp(game.camera.x, target.x - window_center_x, 0.1);
	game.camera.y = lerp(game.camera.y, target.y - window_center_y, 0.1);
}

// TODO: Check collision on multiple tiles, and later on multiple entities! COOOODEEEE
function checkCollision(entity) {
	var x_tile = Math.floor((entity.x + (entity.x_dir * tile_size)) / tile_size);
	var y_tile = Math.floor((entity.y + (entity.y_dir * tile_size)) / tile_size);

	var index = (y_tile * tile_count_y) + x_tile;

	// Minkowski sum collision detection!
	if (map[index] == 3) {
		var tile = new Entity(x_tile * tile_size, y_tile * tile_size, tile_size, tile_size);
		var w = (tile.w + entity.w) >> 1;
		var h = (tile.h + entity.h) >> 1;
		var dx = (entity.x + entity.x_speed + (entity.w >> 1)) - (tile.x + (tile.w >> 1));
		var dy = (entity.y + entity.y_speed + (entity.h >> 1)) - (tile.y + (tile.h >> 1));
		if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
			var wy = w * dy;
			var hx = h * dx;

			if (wy > hx) {
				// Top
				if (wy > -hx) {
					entity.y -= (dy - h);
				}
				// Right
				else {
					entity.x -= (dx + w);
				}
			}
			else {
				// Left
				if (wy > -hx) {
					entity.x -= (dx - w);
				}
				// Bottom
				else {
					entity.y -= (dy + h);
				}
			}
		}
	}

	return false;
}


function gameDraw(canvas, context) {
	clearWindow(context);

	for (let y = 0; y < tile_count_y; y++) {
		for (let x = 0; x < tile_count_x; x++) {
			let value = map[y * tile_count_y + x];
			drawSprite((x * tile_size) - game.camera.x, (y * tile_size) - game.camera.y, tile_size, tile_size, context, value);
		}
	}
	drawSprite(game.player.x - game.camera.x, game.player.y - game.camera.y, tile_size, tile_size, context, 4);
}

var canvas = null;
var context = null;

function gameLoop() {
	setTimeout(() => {
		if (!canvas || !context) {
			canvas = document.getElementById("canvas");
			context = canvas.getContext("2d");
		}
		context.canvas.width  = window.innerWidth;
		context.canvas.height = window.innerHeight;
		context.imageSmoothingEnabled = false;

		if (keysPressed['w']) {
			game.player.y_dir = -1;
		}
		else if (keysPressed['s']) {
			game.player.y_dir = 1;
		}
		else {
			game.player.y_dir = 0;
		}

		if (keysPressed['a']) {
			game.player.x_dir = -1;
		}
		else if (keysPressed['d']) {
			game.player.x_dir = 1;
		}
		else {
			game.player.x_dir = 0;
		}

		game.player.x_speed = player_speed * game.player.x_dir;
		game.player.y_speed = player_speed * game.player.y_dir;

		checkCollision(game.player);

		game.player.x += game.player.x_speed;
		game.player.y += game.player.y_speed;

		cameraUpdate(context.canvas.width, context.canvas.height);

		gameDraw(canvas, context);
		gameLoop();
	}, 1 / 60);
}

function ready(func) {
	if (document.readyState === "complete" || document.readyState === "interactive") {
		setTimeout(func, 1);
	}
	else {
		document.addEventListener("DOMContentLoaded", func);
	}
}

ready(gameLoop);
