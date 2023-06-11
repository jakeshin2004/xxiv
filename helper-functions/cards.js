const cardValues = require("../resources/card-values.json");

const suits = ["spades", "diamonds", "hearts", "clubs"];
const values = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];

function genCards(){
    var cards = [];

    while (cards.length < 4){
        let suit = suits[Math.floor(Math.random() * 4)];
        let value = values[Math.floor(Math.random() * 13)];

        if (cards.length == 0){
            cards.push([suit, value]);
        } else {
            let count = 0;
            for (let i = 0; i < cards.length; ++i){
                if (cards[i][0] == suit && cards[i][1] == value){
                    count++;
                    break;
                }
            }

            if (count == 0){
                cards.push([suit, value]);
            }
        }
    }

    var cardPaths = [];
    for (let i = 0; i < 4; ++i){
        cardPaths[i] = "./cards/" + cards[i][1] + "_of_" + cards[i][0] + ".png";
    }

    return cardPaths;
}

function parseCards(cardPath){
    cardPath = cardPath.split("/");
    let card = cardPath[2].split("_");
    
    return cardValues[card[0]];
}

module.exports = { genCards, parseCards };