/**
  opponents:
[
	{
		id: 0,
		stake: 0,
		state: "active",
		name: "User 1"
	},
	{
		id: 1,
		stake: 0,
		state: "waitForMove"
		name: "User 2"
	},
]
* */
var opponents = [];
var firstPlayerId = null;
var myPlayerId = null;
var lastGameState = "waitForStart";
$( document ).ready(function() {
	
	var socket =  io.connect('http://pokertest.cloudapp.net');

	socket.on('connect', function() {
		console.log('Connected'); 
	});
	
	function addOpponent(index, opponent, tableCards) {
		// New player connected
		if (index >= opponents.length) {
			opponents[index] = opponent;
			var opponentHtml = 
			'<div class="seat opponent">\
				<div class="row">\
					<div class="col-xs-6">\
						<div class="opponent-avatar">\
							<img src="http://www.avatarpro.biz/avatar/'+opponent.name+'?s=250">\
						</div>\
					</div>\
					<div class="col-xs-6 opponent-info">\
						<div class="opponent-nickname" id="opponent-'+index+'-nickname">'+opponent.name+'</div>\
						<div class="opponent-stake" id="opponent-'+index+'-stake">'+opponent.stake+'</div>\
						<div class="opponent-state" id="opponent-'+index+'-state">'+((opponent.state == "waitForMove")?"Thinking...":"")+'</div>\
					</div>\
				</div>\
				<div class="row opponent-cards">\
					<div class="opponent-card col-xs-6">\
						<img src="/img/cards/base.png" id="opponent-'+index+'-card-1">\
					</div>\
					<div class="opponent-card col-xs-6">\
						<img src="/img/cards/base.png" id="opponent-'+index+'-card-2">\
					</div>\
				</div>\
			</div>';
			var croupierHtml = 
			'<div class="seat croupier">\
				<div class="croupier-avatar">\
					<img src="http://placehold.it/200x200?text=Croupier">\
				</div>\
				<div class="croupier-cards row">\
					<div class="croupier-card col-xs-6 col-xs-offset-3">\
					<img src="/img/cards/base.png" id="croupier-card">\
					</div>\
				</div>\
			</div>';
			if (opponent.id == firstPlayerId) {
				$("#opponent-seats").append(croupierHtml);
			}
			$("#opponent-seats").append(opponentHtml);
			// Add croupier to the right if current user goes first
			if (opponent.id == myPlayerId && index == opponents.length-1) {
				$("#opponent-seats").append(croupierHtml);
			}
			var w = parseInt(100 / (opponents.length+1),10);
			// Don't mix CSS and HTML please.
			$('.seat').css("width", w+"%");
		}
		// Update player info
		else {
			if (tableCards == null || tableCards.length == 0) {
				$("#opponent-"+index+"-card-1").attr("src", "/img/cards/base.png");
				$("#opponent-"+index+"-card-2").attr("src", "/img/cards/base.png");
			}
			else if (opponent.cards == null || opponent.cards.length == 0) {
				$("#opponent-"+index+"-card-1").attr("src", "/img/cards/back.png");
				$("#opponent-"+index+"-card-2").attr("src", "/img/cards/back.png");
			}
			else {
				$("#opponent-"+index+"-card-1").attr("src", "/img/cards/"+opponent.cards[0]+".png")
				$("#opponent-"+index+"-card-2").attr("src", "/img/cards/"+opponent.cards[1]+".png")
			}
			
			$("#opponent-"+index+"-nickname").text(opponent.name);
			$("#opponent-"+index+"-stake").text(opponent.stake);
			$("#opponent-"+index+"-state").text(((opponent.state == "waitForMove")?"Thinking...":""));
		}
	}
	
	function updateTable(data) {
		if (myPlayerId == null)
			myPlayerId = data.data.playerID;
		// Table cards
		var tableCards = data.data.tableCards;
		if (tableCards != null) {
			for(var i = 0; i < tableCards.length; i++) {
				var imgPath = "img/cards/"+tableCards[i].notation+".png";
				var cardId = '#table-card'+(i+1);
				if ($(cardId).attr("src") != imgPath) {
					$(cardId).attr("src",imgPath);
				}
			}
		}
		// Players
		var playerArray = data.data.players;
		if (playerArray != null) {
			for(var i = 0; i < playerArray.length; i++) {
				if (playerArray[i].id != data.data.playerID) {
					addOpponent(i, playerArray[i], tableCards);
					if (firstPlayerId == null && lastGameState == "waitForStart" && data.data.gameState == "started") {
						firstPlayerId = playerArray[i].id;
						lastGameState = "started";
						$("#croupier-card").attr("src", "/img/cards/back.png");
					}
				}
			}
		}
	}
	
	socket.on('su', function(data) {
		console.log("Received:");
		console.log(data);
		console.log("Opponents:");
		console.log(opponents);
		if (data.data.dataType == "TABLE_STATE")
			updateTable(data);
	});

	var aStake = $('#user-stake').val();
	var aMinStake = 100;
	var aMinCoeff = 2;

	function logSentToConsole(data) {
		console.log("Sent:");
		console.log(data);
	}

	function sendCheck() {
		var anAction = "check";
		aStake = 0;
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: aStake
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}

	function sendCall() {
		var anAction = "call";
		aStake = aMinStake;
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: aStake
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}

	function sendBet() {
		var anAction = "bet";
		aStake = aMinStake * aMinCoeff;
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: aStake
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}

	function sendRaise() {
		var anAction = "raise";
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: aStake
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}

	function sendFold() {
		var anAction = "fold";
		aStake = 0;
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: aStake
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}
	
	$('#check').click(function () {
		sendCheck();
	});
	$('#fold').click(function() {
		sendFold();
	});
	$('#call').click(function() {
		sendCall();
	});
	$('#raise').click(function() {
		sendRaise();
	});
	$('#bet').click(function() {
		sendBet();
	});
	$('#disconnect').click(function () {
		sendDisconnect();
	});
	$('#send').click(function() {
		sendMessage();
	});

});