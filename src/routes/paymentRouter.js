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

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * @swagger
 * /api/v1/payments/operations:
 *   get:
 *     tags: [Payments]
 *     summary: Get list of operations by type, status, date and user)
 *     description: i3Treasury API endpoint to get list of a user operations. Add the address of the user to the address path variable.
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         description: Address of the user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *        content:
 *           application/json:
 *             schema:
 *               type: array
 *               properties:
 *                 index:
 *                   type: string
 *                   description: Index of marketplace.
 *                   example: 3
 *       400:
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid address
 */
router.get('/operations', paymentController.getOperations)



module.exports = router;