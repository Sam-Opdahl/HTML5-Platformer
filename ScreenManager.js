
//Defines the state that a given screen can have at any moment.
ScreenState = {
	TransitionOn: 0,
	Active: 1,
	TransitionOff: 2,
	InActive: 3
};


ScreenManager = {

	screenList: [],

	update: function() {

	},

	draw: function() {

	},


	addScreen: function(screen) {
		this.screenList.push(screen);
	},

	removeScreen: function(screen) {
		int index = screenList.indexOf(screen);
		if (index != -1) {
			screenList.splice(index, 1);
		}
	}
};