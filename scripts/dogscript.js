// CONSTANTS
_INTERVAL_RANGE = [1000, 5000]; // 2 - 5 sec
_THREAT_DURATION = 6000; // 6 sec
_MAX_HEALTH = 5;
_MAX_SUPPLY = 10;
_SUPPLY_COST = 15;
_COIN_EARNING = 3;
_THREATS = ['catcher', 'fleas', 'hunger', 'raccoon'];
_TOOLS = ['cash', 'soap', 'food', 'cage'];

// Global Variables
// var hasThreat = [false, false, false, false];
var currentThreat = [null, null, null, null];
var currentTool = null;
var health = [_MAX_HEALTH, _MAX_HEALTH, _MAX_HEALTH, _MAX_HEALTH];
var startThreatIntervals = [null, null, null, null];
var endThreatTimeouts = [null, null, null, null];
var supplyLevels = {'cash': _MAX_SUPPLY, 'soap': _MAX_SUPPLY,
					'food': _MAX_SUPPLY, 'cage': _MAX_SUPPLY};
var coinCount = 0;


// Execute on page load
$(document).ready(function() {

	// Randomly generate threats
	generateThreats();

	// Listen for toolbelt item selections
	$('.tool').click(function() {
		selectTool(this.id);
	});

	// Listen for threat clicks
	$('.threat-box').click(function() {
		rescueDog(this.id[10]);
	})


});

// Generates threats at random intervals
function generateThreats() {
	console.log("generating threats");
	var interval1 = generateInterval();
	var interval2 = generateInterval();
	var interval3 = generateInterval();
	var interval4 = generateInterval();

	startThreatIntervals[0] = setInterval(function() { startThreat(1); }, interval1);
	startThreatIntervals[1] = setInterval(function() { startThreat(2); }, interval2);
	startThreatIntervals[2] = setInterval(function() { startThreat(3); }, interval3);
	startThreatIntervals[3] = setInterval(function() { startThreat(4); }, interval4);
	
	console.log('setting interval ' + interval1);
	console.log('setting interval ' + interval2);
	console.log('setting interval ' + interval3);
	console.log('setting interval ' + interval4);	
}

// Creates threat if non-existent
function startThreat(dogId) {
	if (currentThreat[dogId - 1] == null) {
		var threat = randomThreat();
		var threatId = '#dog' + dogId + "-" + threat;
		currentThreat[dogId - 1] = threat;
		endThreatTimeouts[dogId - 1] = setTimeout(function() { endThreat(dogId, threatId); }, _THREAT_DURATION);
		$(threatId).show();
		floatThreat(threatId);
	}
}

// Removes threat at timeout and reduces dog health
function endThreat(dogId, threatId) {
	hurtDog(dogId);
	currentThreat[dogId - 1] = null;
	$(threatId).hide();
}

// Returns random threat id
function randomThreat() {
	var i = Math.floor(Math.random() * 4);
	return _THREATS[i];
}

// Returns a random interval within interval range
function generateInterval () {
	return _INTERVAL_RANGE[0] + Math.random() * (_INTERVAL_RANGE[1] - _INTERVAL_RANGE[0]);
}

// Makes threat objects float
function floatThreat(id) {
	$(id).jqFloat({
		width: 0,
		height: 30,
		speed: 1000
	});
}

// Select toolbelt item
function selectTool(tool) {
	if (supplyLevels[tool] == 0) {
		alert('You have no ' + tool + ' left!');
	}
	else {
		if (currentTool == null) {
			$('div').css("cursor", "url('images/" + tool + ".png'), pointer");
			currentTool = tool;
		}
		else if (currentTool == tool) {
			$('div').css("cursor", "default");		
			currentTool = null;
		}
	}
}

function rescueDog(dogId) {
	var threat = currentThreat[dogId - 1];
	if (threat != null && matches(threat, currentTool)) {
		alert('You rescued a dog!');
		var threatId = '#dog' + dogId + "-" + threat;
		currentThreat[dogId - 1] = null;
		$(threatId).hide();
		clearTimeout(endThreatTimeouts[dogId - 1]);

		supplyLevels[currentTool] -= 1;
		coinCount += _COIN_EARNING;

	}

}

function matches(threat, tool) {
	return _THREATS.indexOf(threat) == _TOOLS.indexOf(tool);
}

function hurtDog(dogId) {
	health[dogId - 1] -= 1;
	if (health[dogId - 1] == 0) {
		// alert('A dog died!');
		clearInterval(startThreatIntervals[dogId - 1]);
	}
}






function test3() {
	window.alert('hi');	
}





