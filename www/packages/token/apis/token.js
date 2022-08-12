"use strict";

/**
 * INTERNAL PACKAGE
 */
const ChildRouter                               = require('../../../routing/child_routing');
const roles                                     = require('../../../config/cf_role');
const path                                      = require('path');
const fs                                        = require('fs');
/**
 * MODELS
 */

/**
 * COLLECTIONS
 */

module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ************** ================================
             * ========================== QUẢN LÝ CHUNG  ================================
             * ========================== ************** ================================
             */

            /**
             * REDIRECT TO HOME PAGE
             */
            '/': {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (_, res) => {
                        res.redirect('/product/list-product');
                    }]
                },
            },

        }
    }
};
