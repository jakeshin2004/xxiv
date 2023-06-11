
const socket = io();
socket.emit('ready-game', 'hello');

socket.on('start', (data) => {

    // Edits player names in game.html
    let playerCards = document.getElementsByClassName('playerInfo');

    for (let i = 0; i < data.room.players.length; ++i){
        playerCards[i].innerHTML = data.room.players[i] + "<br>Round Score: xxx<br>Cumulative Score: xxx";
    }

    // Randomizes cards in game.html
    let cards = document.getElementsByClassName("card");

    for (let i = 0; i < 4; ++i){
        cards[i].src = data.cards[i];
    }
});

