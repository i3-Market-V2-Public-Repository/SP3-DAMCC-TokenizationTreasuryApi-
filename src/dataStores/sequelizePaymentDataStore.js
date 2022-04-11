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

const {sequelize} = require('../app');
const {Sequelize, DataTypes, Op} = require("sequelize");
const PaymentDataStore = require("./paymentDataStore");
const SquelizeOperation = require("./squelizeModels/operation");
const OperationModel = require("./squelizeModels/operation");
const OperationEntity = require("../entities/operation");

class SequelizePaymentDataStore extends PaymentDataStore {


    constructor(db, user, password, config) {
        super();
        this.sequelize = new Sequelize(db, user, password, config);

        OperationModel.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                transferId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                user: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(Object.values(OperationModel.Status)),
                    allowNull: false,
                },
                type: {
                    type: DataTypes.ENUM(Object.values(OperationModel.Type)),
                    allowNull: false,
                },
                date: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            }, {
                timestamps: false,
                sequelize: this.sequelize,
                modelName: 'Operation'
            }
        )
        OperationModel.associate = (models) => {
    
        };
    }

    /**
     * 
     * @param {integer} offset (Optional) Skips offset results from the beginning
     * @param {integer} limit (Optional) Returns limit number of operations 
     * @returns An array containing all the operations in the database, on an Operation.
     */
     async getOperations(offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        try {
            console.log(`offest:${offset}, limit:${limit}`)
            return await OperationModel.findAll({
                offset: offset,
                limit: limit
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     *
     * @param {integer} id The ID of the operation to retrieve
     * @returns The first (and only) Operation object in the database that matches the id provided
     */
    async getOperationById(id) {
        try {
            return await OperationModel.findOne({
                where: {
                    id: id
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     *
     * @param {string} transferId
     * @param {integer} offset (Optional) Skips offset results from the beginning
     * @param {integer} limit (Optional) Returns limit number of operations 
     * @returns An array of Operation objects that match the transferId field or Operation.
     */
    async getOperationsByTransferId(transferId, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        try {
            return await OperationModel.findAll({
                where: {
                    transferId: transferId
                },
                offset: offset,
                limit: limit
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     *
     * @param {Operation.Types} type
     * @param {integer} offset (Optional) Skips offset results from the beginning
     * @param {integer} limit (Optional) Returns limit number of operations 
     * @returns An array of Operation objects that match the type field or Operation.
     */
    async getOperationsByType(type, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        try {
            return await OperationModel.findAll({
                where: {
                    type: type
                },
                offset: offset,
                limit: limit
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     *
     * @param {Operation.Status} status
     * @param {integer} offset (Optional) Skips offset results from the beginning
     * @param {integer} limit (Optional) Returns limit number of operations 
     * @returns An array of Operation objects that match the status field or Operation.NULL if none found
     */
    async getOperationsByStatus(status, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        try {
            return await OperationModel.findAll({
                where: {
                    status: status
                },
                offset: offset,
                limit: limit
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * 
     * @param {Date} fromDate In YYYY-MM-DD HH:MM:SS.ms+ZZ, example: 2022-03-18 10:26:02.809+00
     * @param {Date} toDate In YYYY-MM-DD HH:MM:SS.ms+ZZ, example: 2022-03-18 10:26:02.809+00
     * @param {integer} offset (Optional) Skips offset results from the beginning
     * @param {integer} limit (Optional) Returns limit number of operations 
     * @returns  An array of Operation objects that took place between fromDate(inclusive) and toDate(exclusive) 
     */
    async getOperationsByDate(fromDate = new Date(null), toDate = new Date(Date.now()), offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        try {
            if (fromDate.getTime()>toDate.getTime())
            throw Error("Date mismatch: fromDate is later than toDate")
        
            return await OperationModel.findAll({
                where: {
                    [Op.and]: [
                        { date: {[Op.gte]: fromDate}},
                        { date: {[Op.lte]: toDate}},
                    ],           
                },
                offset: offset,
                limit: limit
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     *
     * @param {string} user The hexademical value of the user's node address, example: '0x3c23fd1f50cde56530f4edcc173b48d1d65ea05c'
     * @param {integer} offset (Optional) Skips offset results from the beginning
     * @param {integer} limit (Optional) Returns limit number of operations 
     * @returns An array of Operation objects that were initiated by this particular user or Operation.NULL if none found
     */
     async getOperationsByUser(user, offset = 0, limit = Number.MAX_SAFE_INTEGER) {
        try {
            return await OperationModel.findAll({
                where: {
                    user: user
                },
                offset: offset,
                limit: limit
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Creates a new operation based on the fields of an existing object and saves it in the database
     * Auto-rollbacks the DB transaction if for some reason fails
     * @param {Operation} operation Any JS object that contains the fields
     *  {String: userId, Integer: transferId, Operation.type: type, Operation.Status: status}
     * @returns The Operatoon object that was created
     */
    async createOperation(operation) {
        console.log(`[SequelizePaymentDataStore][createOperation] ${JSON.stringify(operation)}`)
        try {
            return await this.sequelize.transaction(async (t) => {
                return await OperationModel.create({
                    transferId: operation.transferId,
                    user: operation.user,
                    status: operation.status,
                    type: operation.type,
                }, {transaction: t});
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Creates a new operation based on the spare values given and saves it in the database
     * Auto-rollbacks the DB transaction if for some reason fails
     * @param {integer} transId
     * @param {string} user
     * @param {Operation.Statuses} status
     * @param {Operation.types} type
     * @returns The Operatoon object that was created
     */
    async createOperationfromFields(transId, user, status, type) {
        try {
            return await this.sequelize.transaction(async (t) => {
                return await OperationModel.create({
                    transferId: transId,
                    user: user,
                    status: status,
                    type: type,
                }, {transaction: t});
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Deletes the row matching the id field of the given operation from the database
     * Auto-rollbacks the DB transaction if for some reason fails
     * @param {Operation} operation
     * @returns The number of rows deleted. Shud always be 1 (or 0 if the operaton was not present in the database)
     */
    async deleteOperation(operation) {
        try {
            return await this.sequelize.transaction(async (t) => {
                return await OperationModel.destroy({
                    where: {
                        id: operation.id
                    }
                }, {transaction: t});
            });

        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = SequelizePaymentDataStore;