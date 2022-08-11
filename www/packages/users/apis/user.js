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
             * Function: Tạo user (permission: admin) (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_USER.ADD_USER]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { username, email, password, role, status } = req.body;

                        const infoAfterInsertAccount = await USER_MODEL.insert({ 
                            username, email, password, role, status
                        });
                        res.json(infoAfterInsertAccount);
                    }]
                },
            },

			/**
             * Function: Danh sách user (permission: admin) (API, VIEW)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
			[CF_ROUTINGS_USER.LIST_USER]: {
                config: {
                    auth: [ roles.role.admin.bin ],
					type: 'view',
                    view: 'index.ejs',
					title: 'List User - NANDIO',
					code: CF_ROUTINGS_USER.LIST_USER,
					inc: path.resolve(__dirname, '../views/list_user.ejs')
                },
                methods: {
                    get: [ async function (req, res) {
						const { type } = req.query;
						const listUser = await USER_MODEL.getList();

						if(type === 'API'){
							return res.json(listUser);
						}

                        ChildRouter.renderToView(req, res, { listUser });
                    }]
                },
            },

			/**
			 * Function: Xóa user (permission: admin) (API)
			 * Date: 10/08/2022
			 * Dev: VyPQ
			 */
			[CF_ROUTINGS_USER.DELETE_USER]: {
                config: {
                    auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
						const { userID } = req.query;

                        const infoAfterDelete = await USER_MODEL.delete({ userID });
                        res.json(infoAfterDelete);
                    }]
                },
            },

             /**
             * Function: Cập nhật tài khoản cá nhân (permission: admin) (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
			[CF_ROUTINGS_USER.UPDATE_PERSONAL_USER]: {
                config: {
                    auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { userID, password, oldPassword, status, role } = req.body;

                        const infoAfterUpdate = await USER_MODEL.updatePersonalUser({ 
                            userID, password, oldPassword, status, role
                        });
                        res.json(infoAfterUpdate);
                    }]
                },
            },

			/**
             * Function: Cập nhật user (permission: admin) (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
			 [CF_ROUTINGS_USER.UPDATE_USER]: {
                config: {
                    auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { userID, username, password, status, role } = req.body;

                        const infoAfterUpdate = await USER_MODEL.update({ 
                            userID, username, password, status, role
                        });
                        res.json(infoAfterUpdate);
                    }]
                },
            },

            /**
             * Function: Thông tin user (permission: admin) (API)
             * Date: 10/08/2022
             * Dev: VyPQ
             */
			[CF_ROUTINGS_USER.INFO_USER]: {
                config: {
                    auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async function (req, res) {
						const { _id: userID } = req.user;

                        const infoUser = await USER_MODEL.getInfo({ userID });
                        res.json(infoUser);
                    }]
                },
            },

        }
    }
};
