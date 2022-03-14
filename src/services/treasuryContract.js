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

'use strict';


class TreasuryContractService {

    constructor() {
    }

    connect() {
        throw "connect must implement connect for TreasuryContractService types"
    }

    initSmartContract() {
        throw "initSmartContract must implement initSmartContract for TreasuryContractService types"
    }

    addMarketPlace(senderAddress, marketplaceAddress) {
        throw "addMarketPlace must implement addMarketPlace for TreasuryContractService types"
    }

    exchangeIn(transferId, senderAddress, userAddress, tokens) {
        throw "exchangeIn must implement exchangeIn for TreasuryContractService types"
    }

    exchangeOut(transferId, senderAddress, marketplaceAddress) {
        throw "exchangeOut must implement exchangeOut for TreasuryContractService types"
    }

    payment(transferId, senderAddress, providerAddress, amount) {
        throw "payment must implement payment for TreasuryContractService types"
    }

    clearing(transferId, senderAddress) {
        throw "clearing must implement clearing for TreasuryContractService types"
    }

    setPaid(transferId, senderAddress, transferCode) {
        throw "setPaid must implement setPaid for TreasuryContractService types"
    }

    deploySignedTransaction(serializedTx) {
        throw "deploySignedTransaction must deploySignedTransaction serialize for TreasuryContractService types"
    }

    getTransactionReceipt(hash) {
        throw "getTransactionReceipt must implement getTransactionReceipt for TreasuryContractService types"
    }

    getTransactionByTransferId(transferId) {
        throw "getTransactionByTransferId must implement getTransactionByTransferId for TreasuryContractService types"
    }

    async gasLimit() {
        throw "gasLimit must implement gasLimit for TreasuryContractService types"
    }

    getLatestBlock() {
        throw "getLatestBlock must implement getLatestBlock for TreasuryContractService types"
    }

    getBalanceForAddress(address) {
        throw "getBalanceForAddress must implement getBalanceForAddress for TreasuryContractService types"
    }

    getMarketPlaceIndex(address) {
        throw "getMarketPlaceIndex must implement getMarketPlaceIndex for TreasuryContractService types"
    }

    registerHandlerOnTokenTransferred() {
        throw "registerHandlerOnTokenTransferred must registerHandlerOnTokenTransferred serialize for TreasuryContractService types"
    }

    sendContractMethod(method, senderAddress, ...args) {
        throw "sendContractMethod must implement sendContractMethod for TreasuryContractService types"
    }

    decodeTransactionError(data) {
        throw "decodeTransactionError must implement decodeTransactionError for TreasuryContractService types"
    }
}

module.exports = TreasuryContractService;