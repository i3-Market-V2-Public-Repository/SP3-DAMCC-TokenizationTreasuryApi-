const EventHandler = require("./eventHandler");
const axios = require("axios");

class WebhookHandler extends EventHandler {

    constructor() {
        super();
    }

    async execute(event) {
        console.log("[WebhookHandler][execute] Event: " + JSON.stringify(event));

        axios.post(process.env.WEBHOOK, {
            transactionHash: event.transactionHash,
            blockHash: event.blockHash,
            type: event.type,
            transferId: event.returnValues.transferId,
            operation: event.returnValues.operation,
            fromAddress: event.returnValues.fromAddress,
            toAddress: event.returnValues.toAddress || ""
        }).then(response => {
            console.log('sent webhook successfully');
        }).catch(error => {
            console.error("Webhook got an error. ", error);
        });
    }
}

module.exports = WebhookHandler;