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
                        let listProvince = Object.entries(provinces);
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
                        let listDistricts = [];

                        let filterObject = (obj, filter, filterValue) => 
                            Object.keys(obj).reduce((acc, val) =>
                            (obj[val][filter] === filterValue ? {
                                ...acc,
                                [val]: obj[val]  
                            } : acc
                        ), {});

                        if (province && !Number.isNaN(Number(province))) {
                            listDistricts = filterObject(districts, 'parent_code', province.toString())
                        }
                        res.json({ province, listDistricts });
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
                        let listWards = [];
                        let  filePath = path.resolve(__dirname, `../constants/wards/${district}.json`);
                        fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
                            if (!err) {
                                listWards = JSON.parse(data);
                                res.json({ district, listWards  });
                            } else {
                                res.json({ error: true, message: "district_not_exist" });
                            }
                        });
                    }]
                },
            },

        }
    }
};
