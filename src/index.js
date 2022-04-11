/*
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, HOPU, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 *  License-Identifier: EUPL-1.2
 *
 *  Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *    George Benos (Telesto Technologies)
 *    Germán Molina (HOPU)
 *
 */

require('dotenv').config();
const app = require('./app');
const TreasuryContract = require('./services/treasuryContractServiceWithCustomEventHandler');
const TokenTransferredHandler = require('./services/enventHandlers/tokenTransferredHandler');
const FiatMoneyPaymentHandler = require('./services/enventHandlers/fiatMoneyPaymentHandler');
const PaymentService = require('./services/paymentService');
const Network = require('../currentNetworkConfig')
const WebhookHandler = require("./services/enventHandlers/webhookHandler");
const DictionaryPaymentDataStorage = require("./dataStores/dictionaryPaymentDataStorage");
const SequelizePaymentDataStore = require("./dataStores/sequelizePaymentDataStore");

process.env.ETH_HOST = process.env.ETH_HOST || Network.NETWORK;
process.env.CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || Network.CONTRACT_ADDRESS;
process.env.MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || Network.MP_ADDRESS;
process.env.GAS_LIMIT = process.env.GAS_LIMIT || Network.GAS_PRICE;
process.env.CHAIN_ID = process.env.CHAIN_ID || Network.CHAIN_ID;
process.env.COMMUNITY_ADDRESS = process.env.COMMUNITY_ADDRESS || Network.COMMUNITY_ADDRESS;

process.env.PORT = process.env.PORT || 3001;
process.env.WEBHOOK = process.env.WEBHOOK || "http://127.0.0.1:3000/api/webhook";

function getPaymentStore() {
    const dataStore = new SequelizePaymentDataStore(
        'test_db',
        'test_user',
        'test_pass', {
            host: 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );
    return new DictionaryPaymentDataStorage();
}

async function deployTreasureService(paymentStore) {
    const treasuryContract = TreasuryContract.getInstance();
    treasuryContract.addTokenTransferredEventHandler(new TokenTransferredHandler(paymentStore));
    treasuryContract.addTokenTransferredEventHandler(new WebhookHandler());
    treasuryContract.addFiatMoneyPaymentEventHandler(new FiatMoneyPaymentHandler(paymentStore));
    treasuryContract.addFiatMoneyPaymentEventHandler(new WebhookHandler());
    await treasuryContract.connect();
}

async function deployPaymentService(paymentStore) {
    const paymentService = PaymentService.getInstance();
    const treasuryContract = TreasuryContract.getInstance();

    paymentService.setDataStore(paymentStore);
    paymentService.setTreasurySmartContractService(treasuryContract);
}

const paymentStore = getPaymentStore();

deployTreasureService(paymentStore).then(() => {
    console.log(`Treasure service deployed`);
});
deployPaymentService(paymentStore).then(() => {
    console.log(`Payment service deployed`);
});

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on  http://127.0.0.1:${port}`);
    console.log(`Swagger on http://127.0.0.1:${port}/api-docs/`);
});
