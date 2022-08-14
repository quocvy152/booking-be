"use strict";

/**
 * EXTERNAL PACKAGE
 */
const path = require('path');

/**
 * INTERNAL PACKAGE
 */
const ChildRouter                           = require('../../../routing/child_routing');
const roles                                 = require('../../../config/cf_role');
const { CF_ROUTINGS_CAR } 					= require('../constants/car.uri');

/**
 * MODELS
 */
const CAR_MODEL = require('../models/car').MODEL;
module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ************************ ================================
             * ========================== QUẢN LÝ USER PERMISSION  ================================
             * ========================== ************************ ================================
             */

			/**
             * Function: 
             *      + Create user (API)
             *      + List user (API)
             * Date: 11/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CAR.CARS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const resultGetListCar = await CAR_MODEL.getList();
                        res.json(resultGetListCar);
                    }],
                    post: [ async function (req, res) {
                        const { 
                            name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            avatar, gallery, status,
                            listCharacteristicID
                        } = req.body;

                        const resultInsertCar = await CAR_MODEL.insert({ 
                            name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            avatar, gallery, status,
                            listCharacteristicID
                        });
                        res.json(resultInsertCar);
                    }]
                },
            },

            /**
             * Function: 
             *      + Info user (API)
             *      + Remove user (API)
             *      + Update user (API)
             * Date: 11/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CAR.CARS_CARID]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { carID } = req.params;
                        const resultGetInfoCar = await CAR_MODEL.getInfo({ carID });
                        res.json(resultGetInfoCar);
                    }],
                    put: [ async function (req, res) {
                        const { carID } = req.params;
                        const { 
                            name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            avatar, gallery, status,
                            listCharacteristicID
                        } = req.body;

                        const resultUpdateCar = await CAR_MODEL.update({ 
                            carID, name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            avatar, gallery, status,
                            listCharacteristicID
                        });
                        res.json(resultUpdateCar);
                    }],
                    delete: [ async function (req, res) {
                        const { carID } = req.params;
                        const resultGetInfoCar = await CAR_MODEL.remove({ carID });
                        res.json(resultGetInfoCar);
                    }],
                },
            },

            /**
             * Function: 
             *      + Login (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_CAR.LOGIN]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { username, email, password } = req.body;
                        const resultLogin = await CAR_MODEL.login({ username, email, password });
                        res.json(resultLogin);
                    }]
                },
            },
        }
    }
};
