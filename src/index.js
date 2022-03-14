/**
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 * License-Identifier: EUPL-1.2
 *
 * Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *
 */


require('dotenv').config()
const app = require('./app');
const TreasuryContract = require('./services/treasuryContractServiceWithCustomEventHandler');
const PaymentEventHandler = require('./services/enventHandlers/paymentServiceEventHandler');
const PaymentService = require('./services/paymentService');

async function deployTreasureService() {
    const treasuryContract = TreasuryContract.getInstance();
    treasuryContract.addEventHandler(new PaymentEventHandler);
    await treasuryContract.connect();
}

async function deployPaymentService() {
    const paymentService = PaymentService.getInstance();
    const treasuryContract = TreasuryContract.getInstance();
    const DictionaryPaymentDataStorage = require("./dataStores/dictionaryPaymentDataStorage");

    paymentService.setDataStore(new DictionaryPaymentDataStorage());
    paymentService.setTreasurySmartContractService(treasuryContract);
}


deployTreasureService();
deployPaymentService();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
