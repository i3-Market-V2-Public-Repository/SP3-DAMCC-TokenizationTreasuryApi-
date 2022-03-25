NULL = {};


class Operation {

    constructor(type, status, user) {
        this.id = "";
        this.transferId = "";
        this.type = type;
        this.status = status;
        this.user = user;
        this.date = Date.now();
    }

    setDate(date) {
        this.date = date;
    }

    setId(id) {
        this.id = id;
    }

    setTransferId(transferId) {
        this.transferId = transferId;
    }

    static _clone(origin) {
        return Object.assign({}, origin);
    }
}

Operation.Status = {
    OPEN: "open",
    CLOSED: "closed",
    IN_PROGRESS: "in_progress"
}

Operation.Type = {
    EXCHANGE_IN: "exchange_in",
    EXCHANGE_OUT: "exchange_out",
    CLEARING: "clearing"
}

Operation.ClearingSubtypes = {
    CLEARING_IN: "clearing_in",
    CLEARING_OUT: "clearing_out",
}

module.exports = Operation;