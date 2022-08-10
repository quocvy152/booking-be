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
const { CF_ROUTINGS_BRAND } 				= require('../constants/brand.uri');

/**
 * MODELS
 */
const BRAND_MODEL 	= require('../models/brand').MODEL;

/**
 * COLLECTION
 */
const BRAND_COLL 	= require('../databases/brand-coll');

module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ****************** ================================
             * ========================== QUẢN LÝ THƯƠNG HIỆU  ==============================
             * ========================== ****************** ================================
             */

			/**
             * Function: Add brand (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BRAND.ADD_BRAND]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        const { name, icon } = req.body;
                        const resultAddBrand = await BRAND_MODEL.insert({ 
                            name, icon
                        });
                        res.json(resultAddBrand);
                    }]
                },
            },

            /**
             * Function: Update brand (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BRAND.UPDATE_BRAND]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async (req, res) => {
                        const { brandID } = req.params;
                        const { name, icon, status } = req.body;
                        const resultAddBrand = await BRAND_MODEL.update({ 
                            brandID, name, status, icon
                        });
                        res.json(resultAddBrand);
                    }]
                },
            },

            /**
             * Function: Info brand (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BRAND.INFO_BRAND]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { brandID } = req.params;
                        const resultInfoBrand = await BRAND_MODEL.getInfo({ brandID });
                        res.json(resultInfoBrand);
                    }]
                },
            },

            /**
             * Function: Remove brand (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BRAND.REMOVE_BRAND]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    delete: [ async (req, res) => {
                        const { brandID } = req.params;
                        const resultRemoveBrand = await BRAND_MODEL.remove({ brandID });
                        res.json(resultRemoveBrand);
                    }]
                },
            },

            /**
             * Function: List brand (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_BRAND.LIST_BRAND]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const resultListBrand = await BRAND_MODEL.getList();
                        res.json(resultListBrand);
                    }]
                },
            },
        }
    }
};
