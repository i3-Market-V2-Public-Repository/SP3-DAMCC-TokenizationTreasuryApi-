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
    const page_size = new Number (req.query.page_size);
    const limit =  (req.query.page_size && !Number.isNaN(page_size)) ? page_size : Number.MAX_SAFE_INTEGER;

    const page = new Number(req.query.page) || 1;
    const offset = (req.query.page && Number.isNaN(page)) ? page * page_size : 0;

    if (req.query.transferId){
        const {operations, count} = await paymentService.getOperationsByTransferId(req.query.transferId, limit, offset);
        return res.json({
            count: count,
            page: page,
            page_size: operations.length,
            total_pages: Math.ceil(Number.isNaN(page_size) ? 1: count / page_size),
            operations: operations
        });
    }
       
    if (req.query.type){
        const {operations, count} = await paymentService.getOperationsByType(req.query.type, limit, offset);
        return res.json({
            count: count,
            page: page,
            page_size: operations.length,
            total_pages: Math.ceil(Number.isNaN(page_size) ? 1: count / page_size),
            operations: operations
        });
    }

    if (req.query.status){
        const {operations, count} = await paymentService.getOperationsByStatus(req.query.status, limit, offset);
        return res.json({
            count: count,
            page: page,
            page_size: operations.length,
            total_pages: Math.ceil(Number.isNaN(page_size) ? 1: count / page_size),
            operations: operations
        });
    }

    if (req.query.user){
        const {operations, count} = await paymentService.getOperationsByUser(req.query.user, limit, offset);
        return res.json({
            count: count,
            page: page,
            page_size:operations.length,
            total_pages: Math.ceil(Number.isNaN(page_size) ? 1: count / page_size),
            operations: operations
        });
    }

    if (req.query.fromdate || req.query.todate){
        const {operations, count} = await paymentService.getOperationsByDate(req.query.fromdate, req.query.todate, limit, offset);
        return res.json({
            count: count,
            page: page,
            page_size: operations.length,
            total_pages: Math.ceil(Number.isNaN(page_size) ? 1: count / page_size),
            operations: operations
        });
    }

    return res.json((await paymentService.getOperations(limit, offset)))
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