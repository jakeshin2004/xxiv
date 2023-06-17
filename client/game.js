const socket = io();
socket.emit("ready-game", "hello");
var roomID;
var expression = [];
var cardData = [];
var cardValues = [];
var answerData = [];

socket.on("start", (data) => {
  // Edits player names in game.html
  let playerCards = document.getElementsByClassName("playerInfo");

  for (let i = 0; i < data.room.players.length; ++i) {
    playerCards[i].innerHTML =
      data.room.players[i] + "<br>Score: 0";
  }

  // Randomizes cards in game.html
  let cards = document.getElementsByClassName("card");

  for (let i = 0; i < 4; ++i) {
    cards[i].src = data.cards[i];
    cardValues.push(data.room.cardValues[i]);
  }

  roomID = data.roomID;

  document.querySelectorAll("button.operation").forEach((elem) => {
    elem.disabled = true;
  });

  for (let i = 1; i <= 4; ++i){
    let card = document.querySelector("#card" + i);
    card.setAttribute('onclick', '');
    card.hidden = false;
  }
});

socket.on("block-call", () => {
  document.querySelector("#callBtn").disabled = true;
});

socket.on("enable", () => {
  document.querySelectorAll("button.operation").forEach((elem) => {
    elem.disabled = false;
  });

  for (let i = 1; i <= 4; ++i){
    document.querySelector("#card" + i).setAttribute('onclick', 'answer(' + i + ')')
  }
  document.querySelector("#callBtn").disabled = true;
});

socket.on("disable", () => {
  document.querySelectorAll("button.operation").forEach((elem) => {
    elem.disabled = true;
  });

  for (let i = 1; i <= 4; ++i){
    let card = document.querySelector("#card" + i);
    card.setAttribute('onclick', '');
    card.hidden = false;
  }
  document.querySelector("#callBtn").disabled = false;

  let cardDiv = document.getElementById("cardSpace");
  
  for (let i = 0; i < 3; ++i){
    for (let child of cardDiv.children) {
      if (child.nodeName === "BUTTON") {
        cardDiv.removeChild(child);
      }
    }
  }

  answerData = [];
  expression = [];
});

function freeze() {
  socket.emit("freeze", roomID);
}

function answer(number) {
  switch (number) {
    case 1:
      expression.push(cardValues[0]);
      document.getElementById("card1").hidden = true;
      break;
    case 2:
      expression.push(cardValues[1]);
      document.getElementById("card2").hidden = true;
      break;
    case 3:
      expression.push(cardValues[2]);
      document.getElementById("card3").hidden = true;
      break;
    case 4:
      expression.push(cardValues[3]);
      document.getElementById("card4").hidden = true;
      break;
    case "+":
      expression.push("+");
      break;
    case "-":
      expression.push("-");
      break;
    case "*":
      expression.push("*");
      break;
    case "/":
      expression.push("/");
      break;
    case 5:
      expression.push(answerData[0]);
      document.getElementById("btn1").hidden = true;
      break;
    case 6:
      expression.push(answerData[1]);
      document.getElementById("btn2").hidden = true;
      break;
  }

  if (expression.length == 3 && answerData.length <= 2) {
    var ans = 0;
    console.log(expression);
    if (expression[1] == "+") {
      ans = expression[0] + expression[2];
    } else if (expression[1] == "-") {
      ans = expression[0] - expression[2];
    } else if (expression[1] == "*") {
      ans = expression[0] * expression[2];
    } else {
      ans = expression[0] / expression[2];
    }
    answerData.push(ans);
    console.log(answerData.length)
    if (answerData.length <= 2) {
      let cardDiv = document.querySelector("#cardSpace");
      let text = document.createTextNode(ans);
      let button = document.createElement("button");
      if (answerData.length == 1) {
        button.setAttribute('id', "btn1");
        button.setAttribute('onclick', "answer(5)");
      } else {
        button.setAttribute('id', "btn2");
        button.setAttribute('onclick', "answer(6)");
      }
      button.appendChild(text);

      cardDiv.appendChild(button);
      // console.log(cardDiv.children);

    } else {
      if (ans == 24) {
        console.log("WINNER!");
        socket.emit('winner', {"id": roomID})
      } else {
        console.log('try again');
      }
      answerData = [];
    }
    expression = [];
  }
}
