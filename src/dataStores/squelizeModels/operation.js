const {Model} = require("sequelize");


class Operation extends Model {

    /**
     *
     * Other Methods
     */
    static _clone = function (origin) {
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
    CLEARING_IN: "clearing_in",
    CLEARING_OUT: "clearing_out"
}


module.exports = Operation;
