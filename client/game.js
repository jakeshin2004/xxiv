const socket = io();
socket.emit("ready-game", "hello");
var roomID;
var expression = [];
var cardData = [];
var cardValues = [];
var answerData = [];
var playerName = "";
var answers = 0;
var cardsClicked = 0;

function disable(){
  document.querySelectorAll("button.operation").forEach((elem) => {
    elem.disabled = true;
  });

  for (let i = 1; i <= 4; ++i) {
    let card = document.querySelector("#card" + i);
    card.setAttribute("onclick", "");
    card.hidden = false;
  }
  answers = 0;
  cardsClicked = 0;
  document.querySelector("#callBtn").disabled = false;

  let cardDiv = document.getElementById("cardSpace");

  for (let i = 0; i < 3; ++i) {
    for (let child of cardDiv.children) {
      if (child.nodeName === "BUTTON") {
        cardDiv.removeChild(child);
      }
    }
  }

  answerData = [];
  expression = [];
}

socket.on("start", (data) => {
  // Edits player names in game.html
  
  cardValues = [];
  answers = 0;
  cardsClicked = 0;
  let playerCards = document.getElementsByClassName("playerInfo");

  disable();

  for (let i = 0; i < data.room.players.length; ++i) {
    playerCards[i].innerHTML = data.room.players[i] + 
    "<br>Score: " + data.room.playerScores[data.room.players[i]];
  }

  // Randomizes cards in game.html
  let cards = document.getElementsByClassName("card");

  for (let i = 0; i < 4; ++i) {
    cards[i].src = data.cards[i];
    cardValues.push(data.room.cardValues[i]);
  }

  roomID = data.roomID;
  playerName = window.localStorage.getItem("name");

  document.querySelectorAll("button.operation").forEach((elem) => {
    elem.disabled = true;
  });

  for (let i = 1; i <= 4; ++i) {
    let card = document.querySelector("#card" + i);
    card.setAttribute("onclick", "");
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

  for (let i = 1; i <= 4; ++i) {
    document
      .querySelector("#card" + i)
      .setAttribute("onclick", "answer(" + i + ")");
  }
  document.querySelector("#callBtn").disabled = true;
});

socket.on("disable", () => {
  disable();
});

function freeze() {
  socket.emit("freeze", roomID);
}

function answer(number) {
  switch (number) {
    case 1:
      expression.push(cardValues[0]);
      document.getElementById("card1").hidden = true;
      cardsClicked++;
      break;
    case 2:
      expression.push(cardValues[1]);
      document.getElementById("card2").hidden = true;
      cardsClicked++;
      break;
    case 3:
      expression.push(cardValues[2]);
      document.getElementById("card3").hidden = true;
      cardsClicked++;
      break;
    case 4:
      expression.push(cardValues[3]);
      document.getElementById("card4").hidden = true;
      cardsClicked++;
      break;
    case 5:
      expression.push(answerData[0]);
      document.getElementById("btn1").hidden = true;
      answers--;
      break;
    case 6:
      expression.push(answerData[1]);
      document.getElementById("btn2").hidden = true;
      answers--;
      break;
    case 7:
      expression.push(answerData[2]);
      document.getElementById("btn3").hidden = true;
      answers--;
      break;
    case 8:
      expression.push(answerData[3]);
      document.getElementById("btn4").hidden = true;
      answers--;
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
    case "root":
      expression.push("√");
      break;
  }

  if ((expression.length == 3) || (expression[1] == "√" && expression.length == 2)) {
    var ans = 0;
    if (expression[1] == "+") {
      ans = expression[0] + expression[2];
    } else if (expression[1] == "-") {
      ans = expression[0] - expression[2];
    } else if (expression[1] == "*") {
      ans = expression[0] * expression[2];
    } else if (expression[1] == "√") {
      ans = Math.sqrt(expression[0]);
    } else {
      ans = expression[0] / expression[2];
    }
    answerData.push(ans);
    answers++;
    // console.log(answers);
    if (answers != 1 || cardsClicked != 4) {
      let cardDiv = document.querySelector("#cardSpace");
      let text = document.createTextNode(ans);
      let button = document.createElement("button");
      if (answerData.length == 1) {
        button.setAttribute("id", "btn1");
        button.setAttribute("onclick", "answer(5)");
      } else if (answerData.length == 2) {
        button.setAttribute("id", "btn2");
        button.setAttribute("onclick", "answer(6)");
      } else if (answerData.length == 3) {
        button.setAttribute("id", "btn3");
        button.setAttribute("onclick", "answer(7)");
      } else {
        button.setAttribute("id", "btn4");
        button.setAttribute("onclick", "answer(8)");
      }

      button.setAttribute("class", "stepButton");
      button.appendChild(text);

      cardDiv.appendChild(button);
    } else {
      if (ans == 24) {
        console.log("WINNER!");
        cardValues = [];
        socket.emit("winner", { "roomID": roomID, "winner": window.localStorage.getItem("name") });
      } else {
        console.log("try again");
      }
      answerData = [];
    }
    expression = [];
  }
}
