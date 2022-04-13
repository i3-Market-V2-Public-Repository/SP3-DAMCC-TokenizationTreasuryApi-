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

const catchAsync = require('../utils/catchAsync');
const paymentService = require('../services/paymentService').getInstance();

exports.getOperations = catchAsync(async (req, res, next) => {

    if (req.query.transferId)
        return res.json((await paymentService.getOperationsByTransferId(req.query.transferId)));

    if (req.query.type)
        return res.json((await paymentService.getOperationsByType(req.query.type)));

    if (req.query.status)
        return res.json((await paymentService.getOperationsByStatus(req.query.status)));

    if (req.query.user)
        return res.json((await paymentService.getOperationsByUser(req.query.user)));

    if (req.query.date)
        console.log(`Not implemented yet :p`)

    return res.json((await paymentService.getOperations()))
});

exports.exchangeIn = catchAsync(async (req, res, next) => {
    const {userAddress, tokens} = req.body

    if (!userAddress || !tokens) {
        return res.status(400).json({message: 'Must provide userAddress and tokens'});
    }

    return res.json((await paymentService.exchangeIn(userAddress, tokens)));
});

exports.exchangeOut = catchAsync(async (req, res, next) => {
    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({message: 'Must provide the senderAddress and marketplaceAddress'});
    }

    return res.json((await paymentService.exchangeOut(senderAddress, marketplaceAddress)));
});


exports.clearing = catchAsync(async (req, res, next) => {
    return res.json((await paymentService.clearing()));
});


exports.setPaid = catchAsync(async (req, res, next) => {
    const {senderAddress, transferId, transferCode} = req.body

    if (!senderAddress || !transferId || !transferCode) {
        return res.status(400).json({message: 'Must provide senderAddress, transferId and transferCode'});
    }

    return res.json((await paymentService.setPaid(senderAddress, transferId, transferCode)));
});

exports.feePayment = catchAsync(async (req, res, next) => {
    const {senderAddress, marketplaceAddress, feeAmount} = req.body

    if (!senderAddress || !marketplaceAddress || !feeAmount) {
        return res.status(400).json({message: 'Must provide senderAddress, marketplaceAddress and feeAmount'});
    }

    return res.json((await paymentService.feePayment(senderAddress, marketplaceAddress, feeAmount)));
});