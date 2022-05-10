const {nameSpacedUUID} = require("../utils/uuid_generator");

class ClearingOperation {
    constructor(toAddress, tokenAmount) {
        console.log(`[ClearingOperation] constructor: ${toAddress} ${tokenAmount}`);
        this.transferId = nameSpacedUUID();
        this.toAdd = toAddress;
        this.tokenAmount = tokenAmount;
    }
}

module.exports = ClearingOperation