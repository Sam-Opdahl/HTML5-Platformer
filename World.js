
// World class ------------------------------------------------------------------------------------------------------------

function World(gameScreen, currentWorld) {
	this.gameScreen = gameScreen;
	this.worldId = currentWorld;
	this.mapId;
	this.currentMap;
	this.player;
	this.camera;

	this.collectedItems = [];

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
		if (door.value.indexOf(HOME_WORLD_PREFIX) == -1) {
			this.previousMapId = this.mapId;
			this.mapTransitionId = door.value;
			this.transition = new Transition(TransitionState.OUT, TransitionType.ZOOM, 4, door.getCenter());
			this.player.xCurSpeed = 0;
		} else {
			this.transitionToHomeWorld(door.value);
		}
	},

	transitionToHomeWorld: function(id) {
		this.gameScreen.goToWorld(id);
	},

	formatMapId: function() {
		return this.worldId + "-" + this.mapId;
	}
};


// HomeWorld class ------------------------------------------------------------------------------------------------------------

var HomeWorld = function (gameScreen, currentWorld) {
	World.call(this, gameScreen, currentWorld);
}

HomeWorld.inheritsFrom(World);

HomeWorld.prototype.loadMap = function() {
	this.currentMap = new Map(this);
	this.currentMap.loadMap(this.worldId);
}

HomeWorld.prototype.transitionToMap = function(door) {
	this.gameScreen.goToWorld(door.value);
}

HomeWorld.prototype.update = function(screenNotTransitioning) {
	World.prototype.update.call(this, screenNotTransitioning);
}

HomeWorld.prototype.draw = function(context) {
	World.prototype.draw.call(this, context);
}