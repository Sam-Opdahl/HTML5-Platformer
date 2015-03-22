
var Path = {
	GRAPHICS: "assets/graphics/",
	MAPS: "data/maps/"
};

var ImageAsset = {
	tile_set_1: 0,
	tile_set_2: 1,
	rotate_icon: 2,
	bg1: 3,
	bg2: 4,
	bg3: 5,
	left_arrow: 6,
	right_arrow: 7,
	up_arrow: 8,
	down_arrow: 9,
	jump_button: 10,
	tile_set_3: 11,
	health_0: 12,
	health_1: 13,
	health_2: 14,
	health_3: 15,
	tile_set_4: 16
};

var SUB_MAPS = [
	3
];

var HOME_WORLD_PREFIX = "home_";

var AssetManager = (function() {
	var SOURCE_FILES = [
		"ScreenManager.js",
		"Screen.js",
		"World.js",
		"Map.js",
		"Tile.js",
		"Player.js",
		"Input.js",
		"Camera.js",
		"GameObject.js",
		"Enemy.js",
		"Animation.js",
		"Transition.js"
	];

	var IMAGE_PATH = [
		"tileset1_v2.png",
		"tileset2.png",
		"rotate.png",
		"bg1_v2.png",
		"bg2.png",
		"bg3.png",
		"left_arrow.png",
		"right_arrow.png",
		"up_arrow.png",
		"down_arrow.png",
		"jump_button.png",
		"tileset3.png",
		"health_0.png",
		"health_1.png",
		"health_2.png",
		"health_3.png",
		"tileset4.png"
	];

	var MAP_COUNT = 1;
	var HOME_WORLD_COUNT = 1;

	var subMapCount = 0;
	for (var i = 0; i < SUB_MAPS.length; i++) {
		subMapCount += SUB_MAPS[i];
	}

	//total # of assets to load. 
	//all images are loaded together, so they count as 1
	var assetsToLoad = MAP_COUNT + HOME_WORLD_COUNT + subMapCount + SOURCE_FILES.length + 1;
	var assetsLoaded = 0;

	var loader = new PxLoader();
	var images = [];
	var callback;

	var load = function() {
		//load remaining js source file
		for (var i = 0; i < SOURCE_FILES.length; i++) {
			$.getScript(SOURCE_FILES[i], function() {
				onAssetLoaded();
			});
		}

		//load image assets
		for (var i = 0; i < IMAGE_PATH.length; i++) {
			var image = new PxLoaderImage(Path.GRAPHICS + IMAGE_PATH[i]);
			loader.add(image);
			images.push(image);
		}
		
		loader.start();
		loader.addCompletionListener(function() {
			onAssetLoaded();
		});

		//load map files
		for (var i = 1; i <= MAP_COUNT; i++) {
			for (var j = 0; j <= SUB_MAPS[i-1]; j++) {
				$.getScript(Path.MAPS + i + "-" + j + ".js", function() {
					onAssetLoaded();
				});
			}
		}

		//load home world map files
		for (var i = 1; i <= HOME_WORLD_COUNT; i++) {
			$.getScript(Path.MAPS + HOME_WORLD_PREFIX + i + ".js", function() {
				onAssetLoaded();
			});
		}
	};

	var onAssetLoaded = function() {
		assetsLoaded++;
		if (assetsLoaded >= assetsToLoad) {
			if (typeof(callback) !== "undefined") {
				callback();
			}
		}
	};


	return {
		load: function(cb) {
			callback = cb;
			load();
		},
		getMapCount: function() {
			return MAP_COUNT;
		},
		getImage: function(name) {
			return images[name].img;
		},
	};

})();
