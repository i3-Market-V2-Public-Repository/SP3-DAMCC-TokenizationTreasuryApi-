const {v1: uuidv1, v4: uuidv4, v5: uuidv5} = require('uuid');
const namespace = uuidv4();

function timestampUUID() {
    return uuidv1();
}

function randomUUID() {
    return uuidv4();
}

function nameSpacedUUID() {
    return uuidv5(uuidv4(), namespace)
}


module.exports = {
    timestampUUID,
    randomUUID,
    nameSpacedUUID
}