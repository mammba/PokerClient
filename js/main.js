$( document ).ready(function() {
	
	var socket =  io.connect('http://pokertest.cloudapp.net');

	socket.on('connect', function() {
		console.log('Connected'); 
	});

	function addOpponent() {
	var opponentHtml = '<div class="seat opponent">\
                <div class="opponent-avatar">\
                  <img src="http://placehold.it/200x200?text=Opponent">\
                </div>\
                <div class="opponent-cards row">\
                  <div class="opponent-card col-xs-6">\
                    <img src="/img/cards/base.png">\
                  </div>\
                  <div class="opponent-card col-xs-6">\
                    <img src="/img/cards/base.png">\
                  </div>\
                </div>\
                <div class="opponent-stake"></div>\
              </div>';
		
	}
	socket.on('su', function(data) {
		console.log("Received:");
		console.log(data);
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