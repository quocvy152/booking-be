"use strict";

/**
 * INTERNAL PACKAGE
 */
const ChildRouter                               = require('../../../routing/child_routing');
const roles                                     = require('../../../config/cf_role');
const USER_SESSION							    = require('../../../session/user-session');
const { CF_ROUTINGS_COMMON }                    = require('../constants/common.uri');
const path                                      = require('path');
const fs                                        = require('fs');
/**
 * MODELS
 */
const USER_MODEL 	= require('../../users/models/user').MODEL;
const { districts }                                 = require('../constants/districts');
const { provinces }                                 = require('../constants/provinces');
const { wards }                                     = require('../constants/wards');

/**
 * COLLECTIONS
 */
const CUSTOMER_COLL = require('../../customer/databases/customer-coll');

const { config }    = require('../../upload-s3/constants');
let AWS             = require('aws-sdk');

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
             * Function: Đăng nhập account (VIEW, API)
             * Date: 14/06/2021
             * Dev: VyPQ
             */
            // [CF_ROUTINGS_COMMON.LOGIN]: {
            //     config: {
			// 		auth: [ roles.role.all.bin ],
			// 		type: 'view',
            //         inc : 'pages/login-admin.ejs',
            //         view: 'pages/login-admin.ejs'
			// 	},
			// 	methods: {
			// 		get: [ (req, res) => {
			// 			 /**
            //              * CHECK AND REDIRECT WHEN LOGIN
            //              */
			// 			const infoLogin = USER_SESSION.getUser(req.session);
			// 			if (infoLogin && infoLogin.user && infoLogin.token)
			// 				return res.redirect('/product/list-product');

			// 			ChildRouter.renderToView(req, res);
			// 		}],
            //         post: [ async (req, res) => {
            //             const { email, password } = req.body;

            //             const infoSignIn = await USER_MODEL.signIn({ email, password });

			// 			if (!infoSignIn.error) {
			// 				const { user, token } = infoSignIn.data;

            //                 USER_SESSION.saveUser(req.session, {
            //                     user, 
            //                     token,
            //                 });
            //             }
            //             res.json(infoSignIn);
            //         }],
			// 	},
            // },

            /**
             * Function: Clear session and redirect to login page (API)
             * Date: 14/06/2021
             * Dev: VyPQ
             */
            // [CF_ROUTINGS_COMMON.LOGOUT]: {
            //     config: {
            //         auth: [ roles.role.all.bin ],
			// 		type: 'json',
            //     },
            //     methods: {
            //         get: [ (req, res) => {
            //             USER_SESSION.destroySession(req.session);
			// 			res.redirect('/login');
            //         }]
            //     },
            // },

            [CF_ROUTINGS_COMMON.LIST_PROVINCES]: {
                config: {
                    auth: [ roles.role.all.bin ],
					type: 'JSON',
                },
                methods: {
                    get: [ (req, res) => {
                        let listProvince = provinces;
                        res.json({ listProvince });
                    }]
                },
            },

            [CF_ROUTINGS_COMMON.LIST_DISTRICTS]: {
                config: {
                    auth: [ roles.role.all.bin ],
					type: 'JSON',
                },
                methods: {
                    get: [ (req, res) => {
                        let { province } = req.params;
                        let listDistrict = districts.filter(district => district['province_code'] == province);
                        res.json({ province, listDistrict });
                    }]
                },
            },

            [CF_ROUTINGS_COMMON.LIST_WARDS]: {
                config: {
                    auth: [ roles.role.all.bin ],
					type: 'JSON',
                },
                methods: {
                    get: [ (req, res) => {
                        let { district } = req.params;
                        let listWards = wards.filter(districtWards => districtWards['code'] == district);
                        res.json({ district, listWards });
                    }]
                },
            },

        }
    }
};
