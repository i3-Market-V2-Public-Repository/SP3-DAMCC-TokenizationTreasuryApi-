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

'use strict';


class TreasuryContractService {

    constructor() {
    }

    connect() {
        throw "TreasuryContractService must implement connect for TreasuryContractService types"
    }

    initSmartContract() {
        throw "TreasuryContractService must implement initSmartContract for TreasuryContractService types"
    }

    addMarketPlace(senderAddress, marketplaceAddress) {
        throw "TreasuryContractService must implement addMarketPlace for TreasuryContractService types"
    }

    setCommunityWalletAndCommunityFee(senderAddress, communityWalletAddress, communityWalletFee){
        throw "TreasuryContractService must implement setCommunityWalletAndCommunityFee for TreasuryContractService types"
    }

    getCommunityWallet(){
        throw "TreasuryContractService must implement getCommunityWallet for TreasuryContractService types"
    }

    exchangeIn(transferId, senderAddress, userAddress, tokens) {
        throw "TreasuryContractService must implement exchangeIn for TreasuryContractService types"
    }

    exchangeOut(transferId, senderAddress, marketplaceAddress) {
        throw "TreasuryContractService must implement exchangeOut for TreasuryContractService types"
    }

    payment(transferId, senderAddress, providerAddress, amount) {
        throw "TreasuryContractService must implement payment for TreasuryContractService types"
    }

    async _getMarketplaceAddressByIndex(index) {
        throw "TreasuryContractService must implement _getMarketplaceAddressByIndex for TreasuryContractService types, returns the marketplace address"
    }

    async clearing(tokenTransfers, senderAddress) {
        throw "TreasuryContractService must implement clearing for TreasuryContractService types, returns a tsObject"
    }

    setPaid(transferId, senderAddress, transferCode) {
        throw "TreasuryContractService must implement setPaid for TreasuryContractService types"
    }

    feePayment(communityTransferId, marketplaceTransferId, dataProviderMPAddress, feeAmount, senderAddress) {
        throw "TreasuryContractService must implement feePayment for TreasuryContractService types"
    }

    deploySignedTransaction(serializedTx) {
        throw "TreasuryContractService must implement deploySignedTransaction serialize for TreasuryContractService types"
    }

    getTransactionReceipt(hash) {
        throw "TreasuryContractService must implement getTransactionReceipt for TreasuryContractService types"
    }

    getTransactionByTransferId(transferId) {
        throw "TreasuryContractService must implement getTransactionByTransferId for TreasuryContractService types"
    }

    async gasLimit() {
        throw "TreasuryContractService must implement gasLimit for TreasuryContractService types"
    }

    getLatestBlock() {
        throw "TreasuryContractService must implement getLatestBlock for TreasuryContractService types"
    }

    getBalanceForAddress(address) {
        throw "TreasuryContractService must implement getBalanceForAddress for TreasuryContractService types"
    }

    getMarketPlaceIndex(address) {
        throw "TreasuryContractService must implement getMarketPlaceIndex for TreasuryContractService types"
    }

    registerHandlerOnFiatMoneyPayment() {
        throw "TreasuryContractService must implement registerHandlerOnFiatMoneyPayment in TreasuryContractService types"
    }

    registerHandlerOnTokenTransferred() {
        throw "TreasuryContractService must implement registerHandlerOnTokenTransferred serialize for TreasuryContractService types"
    }

    sendContractMethod(method, senderAddress, ...args) {
        throw "TreasuryContractService must implement sendContractMethod for TreasuryContractService types"
    }

    decodeTransactionError(data) {
        throw "TreasuryContractService must implement decodeTransactionError for TreasuryContractService types"
    }
}

module.exports = TreasuryContractService;