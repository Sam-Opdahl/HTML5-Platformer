
// World class ------------------------------------------------------------------------------------------------------------

function World(gameScreen, currentWorld) {
	this.gameScreen = gameScreen;
	this.worldId = currentWorld;
	this.mapId;
	this.currentMap;
	this.player;
	this.camera;

	this.collectedItems = {};
	this.coinTotal = 0;
	this.specialItemsCollected = {};

	this.isTransitioningOffMap = false;
	this.isTransitioningOnMap = false;
	this.mapTransitionRect;
	this.transitionAlpha;
	this.mapTransitionId;

	this.transition = null;

	this.initialize();
}

World.prototype = {

	initialize: function() {
		this.loadMap(0);

		var startPos = this.currentMap.getStartPosition(0);
		this.player = new Player(this, startPos[0], startPos[1]);
		this.camera = new Camera(this);

		this.camera.update();
		this.getCurrentMap().spawnInitialEnemies();
	},

	update: function(screenNotTransitioning) {
		if (this.transition != null) {
			this.transition.update();
			if (this.transition.isComplete()) {
				if (this.transition.state == TransitionState.OUT) {
					this.loadMap(this.mapTransitionId);
					var startPos = this.getCurrentMap().getStartPosition(this.previousMapId);
					this.player.x = startPos[0];
					this.player.y = startPos[1];
					this.player.setStartValues();
					this.getCurrentMap().spawnInitialEnemies();

					this.transition = new Transition(TransitionState.IN, TransitionType.FADE, 0.01, null);
				} else {
					this.transition = null;
				}
			}
		}

		this.player.update(this.getCurrentMap(), screenNotTransitioning && (this.transition == null || (this.transition != null && this.transition.state == TransitionState.IN)));
		this.getCurrentMap().update();
		this.camera.update();
	},

	draw: function(context) {

		var map = this.getCurrentMap();

		if (map.backgrounds.length > 0) {
			for (var i = 0; i < map.backgrounds.length; i++) {
				var img = AssetManager.getImage(map.backgrounds[i]);
				var x = (this.camera.x * map.bgParallax[i]) % img.width;
				while (x < CANVAS_WIDTH) {
					context.drawImage(img, x, 0, img.width, CANVAS_HEIGHT);
					x += img.width - 1;
				}
			}
		} else {
			context.fillStyle = "black";
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		this.camera.translate(context);

		map.drawDynamicBgTiles(context);
		context.drawImage(map.backgroundCanvas, 0, 0);
		map.drawDynamicTiles(context);
		context.drawImage(map.foregroundCanvas, 0, 0);

		map.drawGameObjects(context);
		this.player.draw(context);

		if (this.transition != null && this.transition.transitionType == TransitionType.ZOOM) {
			this.transition.draw(context);
		}

		this.camera.restore(context);

		if (this.transition != null && this.transition.transitionType == TransitionType.FADE) {
			this.transition.draw(context);
		}

		//Draw health bar
		var img = AssetManager.getImage(ImageAsset.health_0 + this.player.health);
		context.drawImage(img, 5, 5, img.width-27, img.height-9);

		if (!(this instanceof HomeWorld)) {
			var x = CANVAS_WIDTH - 55;
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 88, 400, 8, 8, x, 5, 8, 8);
			context.font = "12px Verdana";
			context.fillStyle = "black";
			context.fillText("x " + this.coinTotal, x + 12, 13);

			context.fillStyle = "white";
			context.fillText("x " + this.coinTotal, x + 10, 12);

			if (this.specialItemsCollected[Constants.SPECIAL_ITEM_SAPPHIRE]) {
				context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 128, 864, 16, 16, x, 15, 16, 16);
			} else {
				context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 144, 880, 16, 16, x, 15, 16, 16);
			}
			x += 17;
			if (this.specialItemsCollected[Constants.SPECIAL_ITEM_EMERALD]) {
				context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 128, 848, 16, 16, x, 15, 16, 16);
			} else {
				context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 128, 880, 16, 16, x, 15, 16, 16);
			}
			x += 17;
			if (this.specialItemsCollected[Constants.SPECIAL_ITEM_RUBY]) {
				context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 112, 832, 16, 16, x, 15, 16, 16);
			} else {
				context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 112, 880, 16, 16, x, 15, 16, 16);
			}
		}
	},

	loadMap: function(mapId) {
		this.mapId = mapId;
		this.currentMap = new Map(this);
		this.currentMap.loadMap(this.formatMapId());
	},

	getCurrentMap: function() {
		return this.currentMap;
	},

	transitionToMap: function(door) {
		//check whether this door leads back to the home world or to a different area of the level.
		if (door.value.indexOf(HOME_WORLD_PREFIX) == -1) {
			this.previousMapId = this.mapId;
			this.mapTransitionId = door.value;
			this.transition = new Transition(TransitionState.OUT, TransitionType.ZOOM, 4, door.getCenter());
			this.player.xCurSpeed = 0;
		} else {
			//if the player collected the same or more number of special items, update their save.
			//if the player collected less special items, we'll consider it as they did worse and leave their previous collected items in tact.
			if (this.getSavedSpecialItemTotal() <= Object.keys(this.specialItemsCollected).length) {
				localStorage.setItem(Constants.SPECIAL_ITEM_SAPPHIRE + this.worldId, typeof(this.specialItemsCollected[Constants.SPECIAL_ITEM_SAPPHIRE]) !== "undefined" ? 1 : 0);
				localStorage.setItem(Constants.SPECIAL_ITEM_EMERALD + this.worldId, typeof(this.specialItemsCollected[Constants.SPECIAL_ITEM_EMERALD]) !== "undefined" ? 1 : 0);
				localStorage.setItem(Constants.SPECIAL_ITEM_RUBY + this.worldId, typeof(this.specialItemsCollected[Constants.SPECIAL_ITEM_RUBY]) !== "undefined" ? 1 : 0);
			}

			var key = Constants.COIN_TOTAL_INDENTIFIER + this.worldId;
			if (typeof(localStorage[key]) === "undefined" || localStorage[key] < this.coinTotal) {
				localStorage.setItem(key, this.coinTotal);
			}

			this.transitionToHomeWorld(door.value);
		}
	},

	transitionToHomeWorld: function(id) {
		this.gameScreen.goToWorld(id);
	},

	formatMapId: function() {
		return this.worldId + "-" + this.mapId;
	},

	//Event for when the player collects a new items.
	onCollectItem: function(key) {
		var val = this.getCurrentMap().items[key].value.toString();
		if (val.startsWith(Constants.COIN_IDENTIFIER)) {
			this.coinTotal += parseInt(val.substring(Constants.COIN_IDENTIFIER.length));
		} else {
			this.specialItemsCollected[val] = true;
		}

		this.collectedItems[key] = this.getCurrentMap().items[key];
		delete this.getCurrentMap().items[key];
	},

	getSavedCoinTotal: function(level) {
		var key = Constants.COIN_TOTAL_INDENTIFIER + level;
		return typeof(localStorage[key]) === "undefined" ? 0 : localStorage[key];
	},

	getSavedSpecialItemTotal: function() {
		var total = 0;
		for (var key in localStorage) {
			if (key.startsWith(Constants.SPECIAL_IDENTIFIER)) {
				if (localStorage.hasOwnProperty(key)) {
					if (localStorage[key] == 1) {
						total++;
					}
				}
			}
		}
		return total;
	},

	displayDoorInformation: function(door) { }
};


// HomeWorld class ------------------------------------------------------------------------------------------------------------

var DOOR_POPUP_COLOR = new Color(0, 0, 0, 0.7);
var DOOR_POPUP_WIDTH = 75;
var DOOR_POPUP_HEIGHT = 125;
var DOOR_POPUP_TOP_MARGIN = 10;
var DOOR_POPUP_X = CANVAS_WIDTH / 2 - DOOR_POPUP_WIDTH;

var HomeWorld = function(gameScreen, currentWorld) {
	World.call(this, gameScreen, currentWorld);

	this.doorInfoToDisplay = null
	this.displayLevelInfo = false;
	this.levelInfoCoinTotal = 0;
};

HomeWorld.inheritsFrom(World);

HomeWorld.prototype.loadMap = function() {
	this.currentMap = new Map(this);
	this.currentMap.loadMap(this.worldId);
};

HomeWorld.prototype.transitionToMap = function(door) {
	this.gameScreen.goToWorld(door.value);
};

HomeWorld.prototype.displayDoorInformation = function(door) {
	this.displayLevelInfo = true;
	if (this.doorInfoToDisplay != door.value) {
		this.doorInfoToDisplay = door.value;
		this.levelInfoCoinTotal = this.getSavedCoinTotal(door.value);
	}
};

HomeWorld.prototype.update = function(screenNotTransitioning) {
	this.displayLevelInfo = false;
	World.prototype.update.call(this, screenNotTransitioning);
};

HomeWorld.prototype.draw = function(context) {
	World.prototype.draw.call(this, context);

	if (this.displayLevelInfo) {
		context.fillStyle = DOOR_POPUP_COLOR;
		context.fillRect(DOOR_POPUP_X, DOOR_POPUP_TOP_MARGIN, DOOR_POPUP_WIDTH * 2, DOOR_POPUP_HEIGHT + DOOR_POPUP_TOP_MARGIN);
		context.fillStyle = "white";
		context.font = "11px Terminal";

		var x = DOOR_POPUP_X + 10;
		var y = DOOR_POPUP_TOP_MARGIN + 15;
		context.fillText("Level " + this.doorInfoToDisplay, x, y);
		y += 15;
		context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 88, 400, 8, 8, x, y, 8, 8);
		context.fillText(this.levelInfoCoinTotal.toString(), x + 15, y + 8);

		y += 20;
		if (localStorage[Constants.SPECIAL_ITEM_SAPPHIRE + this.doorInfoToDisplay] == 1) {
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 128, 864, 16, 16, x, y, 16, 16);
		} else {
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 144, 880, 16, 16, x, y, 16, 16);
		}
		x += 20;
		if (localStorage[Constants.SPECIAL_ITEM_EMERALD + this.doorInfoToDisplay] == 1) {
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 128, 848, 16, 16, x, y, 16, 16);
		} else {
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 128, 880, 16, 16, x, y, 16, 16);
		}
		x += 20;
		if (localStorage[Constants.SPECIAL_ITEM_RUBY + this.doorInfoToDisplay] == 1) {
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 112, 832, 16, 16, x, y, 16, 16);
		} else {
			context.drawImage(AssetManager.getImage(ImageAsset.tile_set_1), 112, 880, 16, 16, x, y, 16, 16);
		}
	}
};