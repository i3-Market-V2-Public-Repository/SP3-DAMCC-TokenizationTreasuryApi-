/**
* Copyright (c) 2020-2022 in alphabetical order:
* GFT, Telesto Technologies
*
* This program and the accompanying materials are made
* available under the terms of the MIT
* which is available at https://github.com/panva/jose/blob/main/LICENSE.md
*
* License-Identifier: EUPL-2.0
*
* Contributors:
*    Vangelis Giannakosian (Telesto Technologies)
*    Dimitris Kokolakis (Telesto Technologies)
*
*/

const catchAsync = require('../utils/catchAsync');
const treasuryContract = require('../services/TreasuryContractService').getInstance()
const {nameSpacedUUID} = require('../utils/uuid_generator')

exports.getTransactionReceipt = catchAsync(async (req, res, next) => {
    const hash = req.params.transactionHash
    const receipt = await treasuryContract.getTransactionReceipt(hash)
    if (receipt) {
        return res.json({receipt})
    }
    return res.status(404).json()
})

exports.getMarketPlaceIndex = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const index = await treasuryContract.getMarketPlaceIndex(address)
    return res.json({index})
})

exports.getAddressBalance = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const balance = await treasuryContract.getBalanceForAddress(address)
    return res.json({balance})
})

exports.getTransactionForTransferId = catchAsync(async (req, res, next) => {
    const transferId = req.params.transferId
    const transfer = await treasuryContract.getTransactionByTransferId(transferId)
    if (transfer) {
        return res.json({transfer})
    }
    return res.status(404).json()
})

exports.addMarketPlace = catchAsync(async (req, res, next) => {

    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress and marketplaceAddress'
        })
    }

    const transactionObject = await treasuryContract.addMarketPlace(senderAddress, marketplaceAddress)
    return res.json({transactionObject})
})

exports.exchangeIn = catchAsync(async (req, res, next) => {
    const {senderAddress, userAddress, tokens} = req.body

    if (!senderAddress || !userAddress || !tokens) {
        return res.status(400).json({
            message: 'You must provide senderAddress, userAddress and tokens amount'
        })
    }
    const transferId = nameSpacedUUID();
    const transactionObject = await treasuryContract.exchangeIn(transferId, senderAddress, userAddress, tokens)
    return res.json({transferId, transactionObject})
})

exports.exchangeOut = catchAsync(async (req, res, next) => {
    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress and marketplaceAddress'
        })
    }

    const transferId = nameSpacedUUID();
    const transactionObject = await treasuryContract.exchangeOut(transferId, senderAddress, marketplaceAddress)
    return res.json({transferId, transactionObject})
})

exports.payment = catchAsync(async (req, res, next) => {
    const {senderAddress, providerAddress, amount} = req.body

    if (!senderAddress || !providerAddress || !amount) {
        return res.status(400).json({
            message: 'You must provide senderAddress, providerAddress and amount'
        })
    }

    const transferId = nameSpacedUUID();
    const transactionObject = await treasuryContract.payment(transferId, senderAddress, providerAddress, amount)
    return res.json({transferId, transactionObject})

})

exports.clearing = catchAsync(async (req, res, next) => {
    const {senderAddress} = req.body

    if (!senderAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress'
        })
    }

    const transferId = nameSpacedUUID();
    const transactionObject = await treasuryContract.clearing(transferId, senderAddress)
    return res.json({transferId, transactionObject})

})


exports.setPaid = catchAsync(async (req, res, next) => {
    const {senderAddress,transferId,transferCode} = req.body

    if (!senderAddress || !transferId || !transferCode) {
        return res.status(400).json({
            message: 'You must provide senderAddress, transferId and transferCode'
        })
    }

    const transactionObject = await treasuryContract.setPaid(transferId, senderAddress, transferCode)
    return res.json({transactionObject})
})


exports.deploySignedTransaction = catchAsync(async (req, res, next) => {
    const {serializedTx} = req.body

    if (!serializedTx){
        return res.status(400).json({
            message: 'You must provide the serializedTx'
        })
    }

    const transactionObject = await treasuryContract.deploySignedTransaction(serializedTx)
    return res.json({transactionObject})
})
