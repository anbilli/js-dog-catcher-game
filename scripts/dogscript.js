// CONSTANTS
_INTERVAL_RANGE = [1000, 5000]; // 2 - 5 sec
_THREAT_DURATION = 6000; // 6 sec
_MAX_HEALTH = 5;
_MAX_SUPPLY = 10;
_SUPPLY_COST = 15;
_COIN_EARNING = 3;
_THREATS = ['catcher', 'fleas', 'hunger', 'raccoon'];
_TOOLS = ['cash', 'soap', 'food', 'cage'];
_NUM_DOGS = 4;

// Global Variables
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
	//// Introduction ////

	// Intro pages navigation
	$('#instructions-btn1').click(function() {
		$('#title-page').hide();
		$('#instructions-page1').show();
	});

	$('#back-btn2').click(function() {
		$('#instructions-page1').hide();
		$('#title-page').show();
	});
	
	// Start game play
	$('#play-btn1').click(function() {
		$('#game-intro').hide();
		$('#title-page').hide();
		$('#game-play').show();
		generateThreats();
	});
	$('#play-btn2').click(function() {
		$('#game-intro').hide();
		$('#instructions-page1').hide();
		$('#game-play').show();
		generateThreats();
	});


	//// Game Play ////

	// Toolbelt item selections
	$('.tool').click(function() {
		selectTool(this.id);
	});

	// Threat elimination
	$('.threat-box').click(function() {
		rescueDog(this.id[10]);
	});

	// Purchase supplies
	$('.cart').click(function() {
		var tool = this.id.replace('-cart', '');
		$('#modal-supply').text(tool);
	});

	// Purchase yes response
	$('#buy-yes-btn').click(function() {
		var tool = $('#modal-supply').text();
		updateSupply(tool, 'replenish');
	});

	// Restart game yes response
	$('#restart-yes-btn').click(function() {
		generateThreats();
	});

	// Restart game no response
	$('#restart-no-btn').click(function() {
		$('#game-play').hide();
		$('#title-page').show();
		$('#game-intro').show();
	});


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
		if (currentTool == null) {
			if (supplyLevels[tool] == 0) {
				alert('You have no ' + tool + ' supply left!');
			}
			else {
				$('div').css("cursor", "url('images/" + tool + ".png'), pointer");
				currentTool = tool;
			}
		}
		else if (currentTool == tool) {
			$('div').css("cursor", "default");		
			currentTool = null;
		}
}

// Rescue dog using tool
function rescueDog(dogId) {
	var threat = currentThreat[dogId - 1];
	if (threat != null && matches(threat, currentTool)) {
		console.log('You rescued a dog!');

		// Remove threat
		var threatId = '#dog' + dogId + "-" + threat;
		currentThreat[dogId - 1] = null;
		$(threatId).hide();
		clearTimeout(endThreatTimeouts[dogId - 1]);

		// Expend supply and earn coins
		updateSupply(currentTool, 'expend');
		updateCoins(_COIN_EARNING);
	}
}

// Checks whether tool matches threat
function matches(threat, tool) {
	return _THREATS.indexOf(threat) == _TOOLS.indexOf(tool);
}

// Dog impacted by threat
function hurtDog(dogId) {
	health[dogId - 1] -= 1;

	// Reduce health bar
	var height = Math.floor(70 * (health[dogId - 1] / _MAX_HEALTH));
	var top = 70 - height;
	var healthBar = $('#health-level' + dogId);
	healthBar.css('height', String(height) + 'px');
	healthBar.css('top', String(top) + 'px');
	healthBar.css('border-top-right-radius', '0px');
	healthBar.css('border-top-left-radius', '0px');

	// Check for dead dogs
	if (health[dogId - 1] == 0) {
		console.log('A dog died!');
		clearInterval(startThreatIntervals[dogId - 1]);

		var allDead = true;
		for (var i = 0; i < health.length; ++i) {
			if (health[i] > 0) { allDead = false; }
		}
		if (allDead == true) {
			gameover();
		}
	}
}

// Reduce or replenish supply according to task
function updateSupply(tool, task) {
	var supplyBar = $('#' + tool + '-level');
	if (task == 'expend') {
		supplyLevels[tool] -= 1;
		
		// Update supply bar
		var width = Math.floor(70 * (supplyLevels[tool] / _MAX_SUPPLY));
		supplyBar.css('width', String(width) + 'px');
		supplyBar.css('border-top-right-radius', '0px');
		supplyBar.css('border-bottom-right-radius', '0px');
	}
	else if (task == 'replenish') {
		if (coinCount < _SUPPLY_COST) {
			alert("You don't have enough coins to buy supplies!");
		}
		else if (supplyLevels[tool] == _MAX_SUPPLY) {
			alert("You already have maximum " + tool + " supply!");
		}
		else {
			updateCoins(-_SUPPLY_COST);
			supplyLevels[tool] = _MAX_SUPPLY;

			// Update supply bar
			replenishSupply(supplyBar);	
		}
	}
}

function replenishSupply(id) {
	id.css('width', '70px');
	id.css('border-top-right-radius', '3px');
	id.css('border-bottom-right-radius', '3px');	
}

// Adjust total coins by given amount
function updateCoins(amount) {
	coinCount += amount;
	$('#coin-count').text(coinCount);
}

// Gameover
function gameover() {
	$("#gameover-modal").modal();

	// Reset stats
	currentThreat = [null, null, null, null];
	currentTool = null;
	health = [_MAX_HEALTH, _MAX_HEALTH, _MAX_HEALTH, _MAX_HEALTH];
	startThreatIntervals = [null, null, null, null];
	endThreatTimeouts = [null, null, null, null];
	supplyLevels = {'cash': _MAX_SUPPLY, 'soap': _MAX_SUPPLY,
						'food': _MAX_SUPPLY, 'cage': _MAX_SUPPLY};
	updateCoins(-coinCount);

	// Reset bars
	for (var i = 0; i < _TOOLS.length; ++i) {
		replenishSupply($('#' + _TOOLS[i] + '-level'));
	}
	for (var i = 1; i <= _NUM_DOGS; ++i) {
		var healthBar = $('#health-level' + i);
		healthBar.css('height', '70px');
		healthBar.css('top', '0px');
		healthBar.css('border-top-right-radius', '3px');
		healthBar.css('border-top-left-radius', '3px');
	}
}




