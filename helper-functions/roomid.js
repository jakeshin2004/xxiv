function genRandomID() {
    let a = Math.floor(Math.random() * 26) + "A".charCodeAt(0);
    let b = Math.floor(Math.random() * 26) + "A".charCodeAt(0);
    let c = Math.floor(Math.random() * 26) + "A".charCodeAt(0);
    let d = Math.floor(Math.random() * 26) + "A".charCodeAt(0);
    return String.fromCharCode(a, b, c, d);
}

function codeExists(id, curRooms) {
    var idExists = false;
    for (let room in curRooms) {
        if (id === room) {
            idExists = true;
            break;
        }
    }
    return idExists;
}

function genRoomID(curRooms) {
    var id = "";
    var idExists = true;
    while (idExists) {
        id = genRandomID();
        idExists = codeExists(id, curRooms);
    }
    return id;
}

module.exports = { genRoomID };
