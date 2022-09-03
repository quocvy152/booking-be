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
const { CF_ROUTINGS_FAVOURITE } 		    = require('../constants/favourite.uri');

/**
 * MODELS
 */
const FAVOURITE_MODEL 	= require('../models/favourite').MODEL;

/**
 * COLLECTION
 */
const FAVOURITE_COLL 	= require('../databases/favourite-coll');

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
             * Function: 
             *      + Add brand (API)
             *      + List brand (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_FAVOURITE.FAVOURITES]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const resultListBrand = await FAVOURITE_MODEL.getList();
                        res.json(resultListBrand);
                    }],
                    post: [ async (req, res) => {
                        const { userID, carID } = req.body;
                        const resultAddFavourite = await FAVOURITE_MODEL.insert({ 
                            userID, carID
                        });
                        res.json(resultAddFavourite);
                    }]
                },
            },

            /**
             * Function: 
             *      + Info favourite (API)
             *      + Update favourite (API)
             *      + Remove favourite (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_FAVOURITE.FAVOURITE_FAVOURITEID]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { favouriteID } = req.params;
                        const resultInfoFavourite = await FAVOURITE_MODEL.getInfo({ favouriteID });
                        res.json(resultInfoFavourite);
                    }],
                    put: [ async (req, res) => {
                        const { favouriteID } = req.params;
                        const { name, icon, status } = req.body;
                        const resultAddFavourite = await FAVOURITE_MODEL.update({ 
                            favouriteID, name, status, icon
                        });
                        res.json(resultAddFavourite);
                    }],
                    delete: [ async (req, res) => {
                        const { favouriteID } = req.params;
                        const resultUnFavourite = await FAVOURITE_MODEL.unFavourite({ favouriteID });
                        res.json(resultUnFavourite);
                    }]
                },
            },

            /**
             * Function: 
             *      + List favourite of user (API)
             * Date: 01/09/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_FAVOURITE.LIST_FAVOURITE_OF_USER]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { user, name } = req.query;
                        const resultListFavouriteOfUser = await FAVOURITE_MODEL.getListFavouriteOfUser({ userID: user, name });
                        res.json(resultListFavouriteOfUser);
                    }],
                },
            },
        }
    }
};
