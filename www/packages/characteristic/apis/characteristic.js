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
const { CF_ROUTINGS_CHARACTERISTIC } 		= require('../constants/characteristic.uri.js');

/**
 * MODELS
 */
const CHARACTERISTIC_TYPE_MODEL             = require('../models/characteristic_type').MODEL;
module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ************************ ================================
             * =============================== QUẢN LÝ ĐẶC ĐIỂM  ==================================
             * ========================== ************************ ================================
             */

			/**
             * Function: 
             *      + Create user (API)
             *      + List user (API)
             * Date: 11/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CHARACTERISTIC.CHARACTERISTIC_TYPES]: {
                config: {
                    auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const resultListCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.getList();
                        res.json(resultListCharacteristicType);
                    }],
                    post: [ async function (req, res) {
                        const { name, icon } = req.body;

                        const resultInsertCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.insert({ 
                            name, icon
                        });
                        res.json(resultInsertCharacteristicType);
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
             [CF_ROUTINGS_CHARACTERISTIC.CHARACTERISTIC_TYPES_CHARACTERISTICTYPESID]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { characteristicTypeID } = req.params;
                        const resultInfoCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.getInfo({ characteristicTypeID });
                        res.json(resultInfoCharacteristicType);
                    }],
                    put: [ async function (req, res) {
                        const { characteristicTypeID } = req.params;
                        const { name, icon } = req.body;

                        const resultUpdateCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.update({ 
                            characteristicTypeID, name, icon
                        });
                        res.json(resultUpdateCharacteristicType);
                    }],
                    delete: [ async function (req, res) {
                        const { characteristicTypeID } = req.params;
                        const resultRemoveCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.remove({ characteristicTypeID });
                        res.json(resultRemoveCharacteristicType);
                    }],
                },
            },
        }
    }
};
