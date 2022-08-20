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
const { CF_ROUTINGS_USER } 					= require('../constants/user.uri');

/**
 * MODELS
 */
const USER_MODEL = require('../models/user').MODEL;


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
            [CF_ROUTINGS_USER.USERS]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const resultGetListUser = await USER_MODEL.getList();
                        res.json(resultGetListUser);
                    }],
                    post: [ async function (req, res) {
                        const { username, email, password, confirmPass, role, status, firstName, lastName, address, phone, avatar } = req.body;

                        const resultInsertAccount = await USER_MODEL.insert({ 
                            username, email, password, confirmPass, role, status, firstName, lastName, address, phone, avatar
                        });
                        res.json(resultInsertAccount);
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
            [CF_ROUTINGS_USER.USERS_USERID]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { userID } = req.params;

                        const resultGetInfoUser = await USER_MODEL.getInfo({ userID });
                        res.json(resultGetInfoUser);
                    }],
                    put: [ async function (req, res) {
                        const { userID } = req.params;
                        const { username, email, currentPass, newPass, confirmPass, role, status, firstName, lastName, address, phone, avatar } = req.body;

                        const resultUpdateUser = await USER_MODEL.update({ 
                            userID, username, email, currentPass, newPass, confirmPass, role, status, firstName, lastName, address, phone, avatar
                        });
                        res.json(resultUpdateUser);
                    }],
                    delete: [ async function (req, res) {
                        const { userID } = req.params;

                        const resultGetInfoUser = await USER_MODEL.remove({ userID });
                        res.json(resultGetInfoUser);
                    }],
                },
            },

            /**
             * Function: 
             *      + GET INFO OF CURRENT USER (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_USER.USERS_INFO]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
                        const { _id } = req.user;
                        const resultGetInfoUser = await USER_MODEL.getInfo({ userID: _id });
                        res.json(resultGetInfoUser);
                    }]
                },
            },

            /**
             * Function: 
             *      + Login (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_USER.LOGIN]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { username, email, password } = req.body;
                        const resultLogin = await USER_MODEL.login({ username, email, password });
                        res.json(resultLogin);
                    }]
                },
            },
        }
    }
};
