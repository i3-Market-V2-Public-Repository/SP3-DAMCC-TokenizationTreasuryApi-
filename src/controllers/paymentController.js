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
    const page_size = req.query.page_size;
    const limit =  (page_size && !Number.isNaN(page_size)) ? page_size : null;

    const page = req.query.page || 1;
    const offset = (page && !Number.isNaN(page) && page_size && !Number.isNaN(page_size)) ? (page-1) * page_size : null;

    if (req.query.transferId){
        const operations = await paymentService.getOperationsByTransferId(req.query.transferId, offset, limit);
        return res.json({
            page:  Number(page),
            page_size: operations.length,
            operations: operations
        });
    }
       
    if (req.query.type){
        const operations = await paymentService.getOperationsByType(req.query.type, offset, limit);
        return res.json({
            page: Number(page),
            page_size: operations.length,
            operations: operations
        });
    }

    if (req.query.status){
        const  operations = await paymentService.getOperationsByStatus(req.query.status, offset, limit);
        return res.json({
            page: Number(page),
            page_size: operations.length,
            operations: operations
        });
    }

    if (req.query.user){
        const operations  = await paymentService.getOperationsByUser(req.query.user, offset, limit);
        return res.json({
            page:  Number(page),
            page_size:operations.length,
            operations: operations
        });
    }

    if (req.query.fromdate || req.query.todate){
        const operations = await paymentService.getOperationsByDate(req.query.fromdate, req.query.todate, offset, limit);
        return res.json({
            page:  Number(page),
            page_size: operations.length,
            operations: operations
        });
    }

    const operations = await paymentService.getOperations(offset, limit);
    return res.json({
        page: Number(page),
        page_size: operations.length,
        operations: operations
    });
});

exports.exchangeIn = catchAsync(async (req, res, next) => {
    console.log(`Body: ${JSON.stringify(req.body)}`)
    const {userAddress, tokens} = req.body

    if (!userAddress || !tokens)
        return res.status(400).json({message: 'Must provide userAddress and tokens'});

    return res.json((await paymentService.exchangeIn(userAddress, tokens)));
});

exports.exchangeOut = catchAsync(async (req, res, next) => {
    const userAddress = req.body

    if (!userAddress)
        return res.status(400).json({message: 'Must provide the userAddress'});

    return res.json((await paymentService.exchangeOut(userAddress)));
});


exports.clearing = catchAsync(async (req, res, next) => {
    return res.json((await paymentService.clearing()));
});


exports.setPaid = catchAsync(async (req, res, next) => {
    const {transferId, transferCode} = req.body
    return res.json((await paymentService.setPaid(transferId, transferCode)));
});