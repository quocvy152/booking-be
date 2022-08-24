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
const multer                                = require('../../../config/cf_helpers_multer/index');

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
                    post: [ multer.uploadSingle, async function (req, res) {
                        const { 
                            name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            gallery, status, listCharacteristicID
                        } = req.body;
                        let avatar = req.file;

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
             *      + Get list my car (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CAR.GET_LIST_MY_CARS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { _id: userID } = req.user;
                        const resultListMyCar = await CAR_MODEL.getListMyCar({ userID });
                        res.json(resultListMyCar);
                    }]
                },
            },

            /**
             * Function: 
             *      + Get list my car (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CAR.REGISTER_CARS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ multer.uploadSingle, async function (req, res) {
                        console.log({
                            FILE: req.file
                        })
                        const { 
                            name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            gallery, status, listCharacteristicID
                        } = req.body;
                        let avatar = req.file;

                        console.log({
                            name, provinceID, districtID, 
                            wardID, provinceText, districtText, 
                            wardText, address, price, mortage, 
                            rules, userID, brandID, description, 
                            gallery, status, listCharacteristicID
                        })

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
        }
    }
};
