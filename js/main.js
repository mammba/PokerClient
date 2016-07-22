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
var playerBalance = 0;
var aMinStake = 100;
var aMinCoeff = 2;
var roundMaxStake = 0;
$(document).ready(function() {
	
	var socket =  io.connect('http://pokertest.cloudapp.net');

	socket.on('connect', function() {
		console.log('Connected'); 
	});


	/* Chat */

    socket.on('connect', function() {
      output('<span class="connect-msg">Connected</span>');
    });

    socket.on('chatevent', function(data) {
      output('<div class="message"><span class="username-msg"><span class="chat-username">' + data.userName + '</span>:</span> ' + data.message + '</div>');
    });

    socket.on('disconnect', function() {
      output('<div class="message"><span class="disconnect-msg">Disconnected</span></div>');
    });

    function sendMessage() {
			var userName = $('#user-nickname').text();
            var message = $('#msg').val();
            if($('#msg').val() != "") {
	            $('#msg').val('');

	            var jsonObject = {userName: userName,
	                      message: message};
	            socket.emit('chatevent', jsonObject);
	            console.log('Sent message:');
	            console.log(jsonObject);
        	}
    }

    function output(message) {
            var currentTime = "<span class='time'>" +  moment().format('HH:mm') + "</span>";
            var element = $("<div class='message'>" + message + "</div>");
      $('#console').prepend(element);
    	console.log('Received message:');
    	console.log(message);
    }

    $('#send').click(function() {
		sendMessage();
	});

    $(document).keyup(function(e){
      if(e.keyCode == 13) {
        $('#send').click();
      }
    });

	/* End of Chat */

	
	var croupierHtml = 
			'<div class="seat croupier">\
				<div class="croupier-avatar">\
					<img src="http://placehold.it/200x200?text=Croupier">\
				</div>\
				<div class="croupier-cards row">\
					<div class="croupier-card col-xs-6 col-xs-offset-3">\
					<img src="/img/cards/back.png" id="croupier-card">\
					</div>\
				</div>\
			</div>';

	function addOpponent(index, opponent, data) {
		// New player connected
		//if (index >= opponents.length) {
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

			if (opponent.id == firstPlayerId && data.gameState == 'started') {
				$("#opponent-seats").append(croupierHtml);
			}
			$("#opponent-seats").append(opponentHtml);
			// Add croupier to the right if current user goes first
			if (opponent.id == myPlayerId && index == opponents.length-1 && data.gameState == 'started') {
				$("#opponent-seats").append(croupierHtml);
			}
			var w = parseInt(100 / (opponents.length+1),10);
			// Don't mix CSS and HTML please.
			$('.seat').css("width", w+"%");
		/*}
		// Update player info
		else {*/
			if (data.gameState == "waitForStart") {
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
			
			/*$("#opponent-"+index+"-nickname").text(opponent.name);
			$("#opponent-"+index+"-stake").text(opponent.stake);
			$("#opponent-"+index+"-state").text(((opponent.state == "waitForMove")?"Thinking...":""));
		}*/
	}
	
	function updateTable(data) {
		if (myPlayerId == null)
			myPlayerId = data.data.playerID;
		// Table cards
		var tableCards = data.data.tableCards;
		if (tableCards != null) {
			// Adding a deck to a table
			$("#table-cards0").attr("src", "/img/cards/back.png");
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
			$("#opponent-seats").html('');
			if (data.data.gameState == 'waitForStart')
				$("#opponent-seats").append(croupierHtml);
			for(var i = 0; i < playerArray.length; i++) {
				if (playerArray[i].id != data.data.playerID) {
					addOpponent(i, playerArray[i], data.data);
				}
				else {
					// Add player's cards
					if (playerArray[i].cards != null && playerArray[i].cards.length !=0) {
						$("#user-card1").attr("src", "img/cards/"+playerArray[i].cards[0].notation+".png");
						$("#user-card2").attr("src", "img/cards/"+playerArray[i].cards[1].notation+".png");
					}
					playerBalance = playerArray[i].balance;
					$("#user-nickname").val(playerArray[i].name);
					$("#user-stake").val(playerArray[i].stake);
					$("#user-state").val((playerArray[i].state == "waitForMove"?"I'm making a turn":""));
				}
				if (firstPlayerId == null && lastGameState == "waitForStart" && data.data.gameState == "started") {
					firstPlayerId = playerArray[i].id;
					lastGameState = "started";
					$("#croupier-card").attr("src", "/img/cards/base.png");
				}
			}
		}
		// Buttons
		var actionList = data.data.actionList;
		$("#call").addClass("disabled").prop("disabled", true);
		$("#raise").addClass("disabled").prop("disabled", true);
		$("#bet").addClass("disabled").prop("disabled", true);
		$("#fold").addClass("disabled").prop("disabled", true)
		$("#check").addClass("disabled").prop("disabled", true);
		for (var i = 0; i < actionList.length; i++) {
			if (actionList[i] == "call")
				$("#call").removeClass("disabled").prop("disabled", false);
			else if(actionList[i] == "fold")
				$("#fold").addClass("disabled").prop("disabled", false);
			else if (actionList[i] == "pass")
				$("#check").addClass("disabled").prop("disabled", false);
			else if (actionList[i] == "raise")
				$("#call").addClass("disabled").prop("disabled", false);
			else if (actionList[i] == "bet")
				$("#bet").addClass("disabled").prop("disabled", false);
		}
		// Min stake
		if (typeof data.data.minStake !== undefined && data.data.minStake != null)
			aMinStake = data.data.minStake;
		if (typeof data.data.minCoeff !== undefined && data.data.minCoeff != null)
			aMinCoeff = data.data.minCoeff;
		if (typeof data.data.overallStakes !== undefined && data.data.overallStakes != null)
			$("#table-stake").val(data.data.overallStakes);
		if (typeof data.data.roundMaxStake !== undefined && data.data.roundMaxStake != null) {
			roundMaxStake = data.data.roundMaxStake;
			if (roundMaxStake != 0)
				$("#check").addClass("disabled").prop("disabled", true);
			aMinStake = roundMaxStake;
		}
		// Winned ID's
		if (data.data.winnerIDs != null && typeof data.data.winnerIDs !== undefined && winnerIDs.length != 0) {
			var modalText = "";
			if (data.data.winnerIDs.length == 1) {
				// One winner
				if (data.data.winnerIDs[0] == data.data.playerID)
					modalText = 'You won!';
				else {
					for(var i = 0; i < playerArray.length; i++) {
						if (playerArray[i].id == data.data.winnerIDs[0]) {
							playerName = playerArray[i].name;
							break;
						}
					}
					modalText = "Player '"+playerName+"' had won!<br>";
				}
				modalText += data.data.overallStakes+" Innopoints!";
			}
			else {
				// Several winners
				modalText = "Winners are: ";
				var hadBefore = false;
				for(var i = 0; i < playerArray.length; i++) {
					for(var j = 0; j < data.data.winnerIDs.length; j++) {
						if (playerArray[i].id == data.data.winnerIDs[j]) {
							if (hadBefore)
								modalText += ", ";
							modalText += playerArray[i].name;
							hadBefore = true;
							break;
						}
					}
				}
				modalText += "!<br>";
				modalText += Math.floor(data.data.overallStakes/data.data.winnerIDs.length)+" Innopoints!";
			}
			$("#modalText").html(modalText);
			$("#winnersModal").modal('show');
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
	
	function logSentToConsole(data) {
		console.log("Sent:");
		console.log(data);
	}

	function sendCheck() {
		var anAction = "check";
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: 0
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}

	function sendCall() {
		var anAction = "call";
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: aMinStake
			}
		};
		socket.emit('su', aJsonObject);
		logSentToConsole(aJsonObject);
	}

	function sendBet() {
		var anAction = "raise";
		var aStake = aMinStake * aMinCoeff;
		if (playerBalance < aStake)
			aStake = playerBalance;
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
		if ($("#input-stake").val() < aMinStake * aMinCoeff) {
			$("#input-stake").val(aMinStake * aMinCoeff+1);
			return;
		}
		var aStake = $("#input-stake").val();
		if (playerBalance < aStake)
			aStake = playerBalance;
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
		var aJsonObject = {
			action: "su",
			data: {
			action: anAction,
			stake: 0
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

});