const {nameSpacedUUID} = require("../utils/uuid_generator");

class TokenTransfer {
    constructor(from, to, token) {
        console.log(`[TokenTransfer] constructor: ${from} ${to} ${token}`);
        this.transferId = nameSpacedUUID();
        this.fromAddress = from;
        this.toAddress = to;
        this.tokenAmount = token;
        this.isPaid = false;
        this.transferCode = ''
    }
}

module.exports = TokenTransfer