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
const CHARACTERISTIC_MODEL                  = require('../models/characteristic').MODEL;
module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ************************ ================================
             * =========================== QUẢN LÝ LOẠI ĐẶC ĐIỂM  =================================
             * ========================== ************************ ================================
             */

			/**
             * Function: 
             *      + Create characteristic type (API)
             *      + List characteristic type (API)
             * Date: 11/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CHARACTERISTIC.CHARACTERISTIC_TYPES]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const resultListCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.getList();
                        res.json(resultListCharacteristicType);
                    }],
                    post: [ async function (req, res) {
                        const { name, icon, status } = req.body;

                        const resultInsertCharacteristicType = await CHARACTERISTIC_TYPE_MODEL.insert({ 
                            name, icon, status
                        });
                        res.json(resultInsertCharacteristicType);
                    }]
                },
            },

            /**
             * Function: 
             *      + Info characteristic type (API)
             *      + Remove characteristic type (API)
             *      + Update characteristic type (API)
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

            /**
             * ========================== ************************ ================================
             * =============================== QUẢN LÝ ĐẶC ĐIỂM  ==================================
             * ========================== ************************ ================================
             */

            /**
             * Function: 
             *      + Create characteristics (API)
             *      + List characteristics (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_CHARACTERISTIC.CHARACTERISTICS]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const resultListCharacteristic = await CHARACTERISTIC_MODEL.getList();
                        res.json(resultListCharacteristic);
                    }],
                    post: [ async function (req, res) {
                        const { characteristicTypeID, value, icon, status } = req.body;

                        const resultInsertCharacteristic = await CHARACTERISTIC_MODEL.insert({ 
                            characteristicTypeID, value, icon, status
                        });
                        res.json(resultInsertCharacteristic);
                    }]
                },
            },

            /**
             * Function: 
             *      + Info characteristics (API)
             *      + Remove characteristics (API)
             *      + Update characteristics (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CHARACTERISTIC.CHARACTERISTICS_CHARACTERISTICID]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { characteristicID } = req.params;
                        const resultInfoCharacteristic = await CHARACTERISTIC_MODEL.getInfo({ characteristicID });
                        res.json(resultInfoCharacteristic);
                    }],
                    put: [ async function (req, res) {
                        const { characteristicID } = req.params;
                        const { characteristicTypeID, value, icon } = req.body;

                        const resultUpdateCharacteristic = await CHARACTERISTIC_MODEL.update({ 
                            characteristicID, characteristicTypeID, value, icon
                        });
                        res.json(resultUpdateCharacteristic);
                    }],
                    delete: [ async function (req, res) {
                        const { characteristicID } = req.params;
                        const resultRemoveCharacteristic = await CHARACTERISTIC_MODEL.remove({ characteristicID });
                        res.json(resultRemoveCharacteristic);
                    }],
                },
            },

            /**
             * Function: 
             *      + Info characteristics (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CHARACTERISTIC.LIST_CHARACTERISTIC_OF_CHARACTERISTIC_TYPE]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { characteristicTypeID } = req.params;
                        const resultListOfCharacteristicType = await CHARACTERISTIC_MODEL.getListOfCharacteristicType({ characteristicTypeID });
                        res.json(resultListOfCharacteristicType);
                    }]
                },
            },

            /**
             * Function: 
             *      + Info characteristics (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_CHARACTERISTIC.LIST_CHARACTERISTIC_BY_CODE]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { code } = req.query;
                        const resultListCharacteristicByCode = await CHARACTERISTIC_MODEL.getListByCode({ code });
                        res.json(resultListCharacteristicByCode);
                    }]
                },
            },
        }
    }
};
