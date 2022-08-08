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

            //==================WMS QUEUE=================//
            [CF_ROUTINGS_COMMON.WMS_PUSH_QUEUE]: {
                config: {
					auth: [ roles.role.all.bin ],
					type: 'json',
				},
				methods: {
					post: [ (req, res) => {
                        let { data: dataWMS, api_key } = req.body;
                        if (!api_key || api_key != `uaHHsZ9kshrZMCecyVEhprJKKBk35jDq6bHnMGx4PNFcfKfrgwyfLTQmkMZ2Ve2R2zPERcygB4ktrbHhx7q9BQ6LtGpZLZtDq8TRV3YnW9EXaYRxG6g8ydvQKJsnzKB`)
                            return res.status(401).json({
                                error: true, 
                                message: 'api_key invalid'
                            })

                        if (typeof dataWMS !== 'object' || dataWMS === null)
                            return res.status(400).json({
                                error: true, 
                                message: 'body object invalid'
                            })
                        console.log({
                            dataWMS
                        })
 
						AWS.config.update({
                            accessKeyId: config.aws_access_key_id,
                            secretAccessKey: config.aws_secret_access_key,
                            region: config.aws_region,
                        });
                        // Create an SQS service object
                        let sqs = new AWS.SQS({apiVersion: '2012-11-05'});

                        let params = {
                            // Remove DelaySeconds parameter and value for FIFO queues
                            DelaySeconds: 10,
                            MessageAttributes: {
                                "Title": {
                                    DataType: "String",
                                    StringValue: "Sync Data QR_CODE from WMS"
                                },
                                "Author": {
                                    DataType: "String",
                                    StringValue: "Smartlog"
                                },
                                "WeeksOn": {
                                    DataType: "Number",
                                    StringValue: "6"
                                }
                            },
                            MessageBody: JSON.stringify(dataWMS),
                            // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
                            // MessageGroupId: "Group1",  // Required for FIFO queues
                            QueueUrl: "https://sqs.ap-southeast-1.amazonaws.com/311139337643/WMS-v2"
                        };

                        sqs.sendMessage(params, function(err, data) {
                            if (err) {
                                return res.json({
                                    error: true,
                                    message: err.message
                                })
                            } else {
                                return res.json({
                                    error: false, 
                                    data
                                })
                            }
                        });
					}]
				},
            },
            //==================WMS QUEUE=================//

             /**
             * Function: Trang chủ admin (VIEW)
             * Date: 14/06/2021
             * Dev: MinhVH
             */
            [CF_ROUTINGS_COMMON.HOME]: {
                config: {
					auth: [ roles.role.editer.bin ],
					type: 'view',
					title: 'Home - NANDIO',
					code: CF_ROUTINGS_COMMON.HOME,
					inc: 'inc/admin/home.ejs',
                    view: 'index.ejs'
				},
				methods: {
					get: [ (req, res) => {
						const isLogin = USER_SESSION.getUser(req.session);
						if (!isLogin)
							return res.redirect('/logout');

						ChildRouter.renderToView(req, res);
					}]
				},
            },

            /**
             * Function: Đăng nhập account (VIEW, API)
             * Date: 14/06/2021
             * Dev: MinhVH
             */
            [CF_ROUTINGS_COMMON.LOGIN]: {
                config: {
					auth: [ roles.role.all.bin ],
					type: 'view',
                    inc : 'pages/login-admin.ejs',
                    view: 'pages/login-admin.ejs'
				},
				methods: {
					get: [ (req, res) => {
						 /**
                         * CHECK AND REDIRECT WHEN LOGIN
                         */
						const infoLogin = USER_SESSION.getUser(req.session);
						if (infoLogin && infoLogin.user && infoLogin.token)
							return res.redirect('/product/list-product');

						ChildRouter.renderToView(req, res);
					}],
                    post: [ async (req, res) => {
                        const { email, password } = req.body;

                        const infoSignIn = await USER_MODEL.signIn({ email, password });

						if (!infoSignIn.error) {
							const { user, token } = infoSignIn.data;

                            USER_SESSION.saveUser(req.session, {
                                user, 
                                token,
                            });
                        }
                        res.json(infoSignIn);
                    }],
				},
            },

            /**
             * Function: Clear session and redirect to login page (API)
             * Date: 14/06/2021
             * Dev: MinhVH
             */
            [CF_ROUTINGS_COMMON.LOGOUT]: {
                config: {
                    auth: [ roles.role.all.bin ],
					type: 'json',
                },
                methods: {
                    get: [ (req, res) => {
                        USER_SESSION.destroySession(req.session);
						res.redirect('/login');
                    }]
                },
            },

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
