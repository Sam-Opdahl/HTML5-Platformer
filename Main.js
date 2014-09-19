Game = {
	canvas: null,
	context: null,

	loading: true,

	initialize: function() {
		this.canvas = document.getElementById("mainCanvas");
		this.context = this.canvas.getContext("2d");

		//Synchronously load remaining source files
		$.when(
			$.getScript("ScreenManager.js"),
			$.getScript("Screen.js"),
			$.Deferred(function(deferred){
				$(deferred.resolve);
			})
		).done(function() {
			Game.loading = false;
		});
	},

	update: function() {

	},

	draw: function() {
		this.context.fillStyle = "blue";
		this.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		this.context.fillStyle = "white";
		this.context.font = "18px Arial";
		if (this.loading) {
			this.context.fillText("Loading...", 20, 20);
		} else {
			this.context.fillText("Loading complete.", 20, 20);
		}
	},
};