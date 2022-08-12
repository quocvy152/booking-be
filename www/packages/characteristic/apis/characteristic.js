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
        }
    }
};
