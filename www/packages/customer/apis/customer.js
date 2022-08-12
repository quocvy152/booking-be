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
const { CF_ROUTINGS_CUSTOMER } 				= require('../constants/customer.uri');

/**
 * MODELS
 */
const CUSTOMER_MODEL 	= require('../models/customer').MODEL;
// const NON_MEMBER_MODEL	= require('../models/non_member').MODEL;
const CUSTOMER_COLL 	= require('../databases/customer-coll');

const USER_DEVICE_MODEL	= require('../models/user_device').MODEL;
// const TRIAL_PROGRAM_MODEL	= require('../../trial_program/models/trial_program').MODEL;

module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ****************** ================================
             * ========================== QUẢN LÝ CUSTOMER  ================================
             * ========================== ****************** ================================
             */

			/**
             * Function: Create customer (permission: all) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
            [CF_ROUTINGS_CUSTOMER.REGISTER_CUSTOMER]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        const { type, fullname, email, picture, id, birthday, token, phone, password, googleUID, facebookUID, appleUID } = req.body;
                        const infoAfterInsertCustomer = await CUSTOMER_MODEL.insert({ 
                           type, fullname, email, phone, password, googleUID, facebookUID, appleUID, picture, id, birthday, token
                        });
                        res.json(infoAfterInsertCustomer);
                    }]
                },
            },
			/**
			 * Function: Update customer (permission: customer) (API)
			 * Date: 19/06/2021
			 * Dev: MinhVH
			 */
            [CF_ROUTINGS_CUSTOMER.UPDATE_CUSTOMER]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        let { _id: customerID } = req.customer;
						const { 
							fullname, phone, email, birthday, password, oldPassword,
							point, pointRanking, status, avatar, gender
						} = req.body;

                        // console.log({birthday});

                        const infoAfterUpdate = await CUSTOMER_MODEL.update({
							customerID, fullname, email, birthday, phone, password, oldPassword, 
							point, pointRanking, status, avatar, gender
						})
                        res.json(infoAfterUpdate);
                    }]
                },
            },

            /**
			 * Function: Check change email when user Update (API)
			 * Date: 19/06/2021
			 * Dev: DePV
			 */
            [CF_ROUTINGS_CUSTOMER.SEND_OTP_CHANGE_EMAIL]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        let { _id: customerID } = req.customer;
						const { 
							newEmail
						} = req.body;
                        const infoAfterUpdate = await CUSTOMER_MODEL.checkUpdateEmailOrder({
							customerID, newEmail 
						})
                        res.json(infoAfterUpdate);
                    }]
                },
            },
            
             /**
			 * Function: Check change email when user Update (API)
			 * Date: 19/06/2021
			 * Dev: DePV
			 */
            [CF_ROUTINGS_CUSTOMER.CHECK_CODE_CHANGE_EMAIL]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        let { _id: customerID } = req.customer;
						const { 
							code
						} = req.body;
                        const infoAfterCheck = await CUSTOMER_MODEL.checkCodeChangeEmail({
							customerID, code
						})
                        res.json(infoAfterCheck);
                    }]
                },
            },

            /**
			 * Function: Update mật khẩu
			 * Date: 19/06/2021
			 * Dev: MinhVH
			 */
            [CF_ROUTINGS_CUSTOMER.UPDATE_PASSWORD]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        let { _id: customerID } = req.customer;
                        const { password, oldPassword } = req.body;
                        const infoAfterUpdate = await CUSTOMER_MODEL.updatePassword({
                            customerID, password, oldPassword, 
                        })
                        res.json(infoAfterUpdate);
                    }]
                },
            },

             /**
			 * Function: Update mật khẩu
			 * Date: 19/06/2021
			 * Dev: MinhVH
			 */
            [CF_ROUTINGS_CUSTOMER.UPDATE_PASSWORD_AFTER_FORGET]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        const { phone, password } = req.body;
                        const infoAfterUpdate = await CUSTOMER_MODEL.updatePasswordAfterForget({
                            phone, password 
                        })
                        res.json(infoAfterUpdate);
                    }]
                },
            },
			/**
             * Function: Delete customer (permission: admin) (API)
             * Date: 03/07/2021
             * Dev: MinhVH
             */
			 [CF_ROUTINGS_CUSTOMER.DELETE_CUSTOMER]: {
                config: {
                    auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { customerID } = req.query;

                        const infoAfterDelete = await CUSTOMER_MODEL.delete({ customerID });
                        res.json(infoAfterDelete);
                    }]
                },
            },

			/**
             * Function: Info customer (permission: customer) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
            [CF_ROUTINGS_CUSTOMER.INFO_CUSTOMER_API]: {
                config: {
					auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { _id: customerID } = req.customer;
                        const infoCustomer = await CUSTOMER_MODEL.getInfo({ customerID });
						res.json(infoCustomer);
                    }]
                },
            },

            /**
             * Function: api lấy thông tin khách hàng(Đăng nhập lần đầu tiên qua SDT)
             * Date: 11/09/2021
             * Dev: Depv
             */
             [CF_ROUTINGS_CUSTOMER.INFO_CUSTOMER_BY_PHONE]: {
                config: {
					auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { phone } = req.params;
                        const { key } = req.query;
                        if(key != "BtN0ldfQTfNqShKWzuqcCHnfWpyVFoXjHpkqvGTNYDlNXiFPyXMUHhAO4VJy")
                            return res.json({ error: true, message: "invalid_key" });
                        const infoCustomer = await CUSTOMER_MODEL.getInfoByPhone({ phone });
						res.json(infoCustomer);
                    }]
                },
            },


            /**
             * Function: Info customer (permission: customer) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
            */
            [CF_ROUTINGS_CUSTOMER.INFO_CUSTOMER_ROLE_ADMIN]: {
                config: {
					auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { customerID } = req.params;
                        const infoCustomer = await CUSTOMER_MODEL.getInfo({ customerID });
						res.json(infoCustomer);
                    }]
                },
            },

            /**
             * Function: Cập nhật điểm khách hàng
             * Date: 19/06/2021
             * Dev: Depv
            */
            [CF_ROUTINGS_CUSTOMER.UPDATE_POINT_CUSTOMER]: {
                config: {
					auth: [ roles.role.admin.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        const { customerID } = req.params;
                        const { point, pointRanking } = req.body;
                        const infoCustomer = await CUSTOMER_MODEL.updatePoint({ customerID, point, pointRanking, isSync: true });
						res.json(infoCustomer);
                    }]
                },
            },

            /**
             * Function: Info customer (permission: customer) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
            [CF_ROUTINGS_CUSTOMER.INFO_CUSTOMER_API]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        const { _id: customerID } = req.customer;
                        const infoCustomer = await CUSTOMER_MODEL.getInfo({ customerID });
                        res.json(infoCustomer);
                    }]
                },
            },

			 /**
             * Function: Info customer (permission: owner) (VIEW, API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.INFO_CUSTOMER]: {
                config: {
					auth: [ roles.role.all.bin ],
					title: 'Detail Customer - NANDIO',
                    type: 'view',
                    view: 'index.ejs',
					inc: path.resolve(__dirname, '../views/detail_customer'),
					code: CF_ROUTINGS_CUSTOMER.INFO_CUSTOMER
                },
                methods: {
                    get: [ async (req, res) => {
                        const { customerID, type } = req.query;
                        const infoCustomer = await CUSTOMER_MODEL.getInfo({ customerID });

						if(type === 'API'){
							return res.json(infoCustomer);
						}

						ChildRouter.renderToView(req, res, { infoCustomer });
                    }]
                },
            },

			/**
             * Function: List customer (permission: customer) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.LIST_CUSTOMER_API]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
						const { page, limit } = req.query;

                        const listCustomers = await CUSTOMER_MODEL.getListWithPaging({ page, limit });
						res.json(listCustomers);
                    }]
                },
            },

            /**
             * Function: List customer (permission: customer) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.LIST_CUSTOMER_SORT_SEGMENT_API]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
						const { gender, pointFrom, pointTo, segmentID, phone } = req.query;

                        const listCustomers = await CUSTOMER_MODEL.getListSortSegment({ gender, pointFrom, pointTo, segmentID, phone });
						
                        res.json(listCustomers);
                    }]
                },
            },

            /**
             * Function: List customer (permission: owner) (VIEW, API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.LIST_CUSTOMER]: {
                config: {
                    auth: [ roles.role.all.bin ],
					title: 'List Customer - NANDIO',
                    type: 'view',
                    view: 'index.ejs',
					inc: path.resolve(__dirname, '../views/list_customer'),
					code: CF_ROUTINGS_CUSTOMER.LIST_CUSTOMER
                },
                methods: {
                    get: [ async (req, res) => {
                        // const listCustomers = await CUSTOMER_MODEL.getList();
						ChildRouter.renderToView(req, res, {
							// listCustomers: listCustomers.data || []
						});
                    }]
                },
            },

            /**
             * Function: List customer (permission: owner) (VIEW, API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.LIST_CUSTOMER_PAGINATION]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        let { start, length, search } = req.body;
                        let page = Number(start)/Number(length) + 1;

                        const listCustomers = await CUSTOMER_MODEL.getListPagination({
                            page: Number(page), 
                            limit: Number(length), 
                            keyword: search.value 
                        });

						res.json(listCustomers);
                    }]
                },
            },

			/**
             * Function: Login customer (permission: all) (API)
             * Date: 19/06/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.LOGIN_CUSTOMER]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
						const { phone, password, deviceID, deviceName, registrationID } = req.body;
                        const infoLogin = await CUSTOMER_MODEL.login({ phone, password, deviceID, deviceName, registrationID });
                        res.json(infoLogin);
                    }]
                },
            },

			/**
             * Function: Auth login (permission: all) (API)
             * Date: 22/06/2021
             * Dev: MinhVH
             */
			 [CF_ROUTINGS_CUSTOMER.LOGIN_AUTH]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
						const { facebookUID, googleUID, appleUID, deviceID, deviceName, registrationID } = req.body;

                        const infoLoginAuth = await CUSTOMER_MODEL.authLogin({ 
							facebookUID, googleUID, appleUID, deviceID, deviceName, registrationID 
						});
                        res.json(infoLoginAuth);
                    }]
                },
            },

            /**
             * Function: Send OTP Phone đăng ký
             */
			 [CF_ROUTINGS_CUSTOMER.SEND_PHONE_OTP_REGISTER]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
						const { phone } = req.params;

                        const infoSendOTP = await CUSTOMER_MODEL.insertPhoneOTP({ 
							phone
						});
                        res.json(infoSendOTP);
                    }]
                },
            },

            /**
             * Function: Send OTP Phone đăng ký
             */
			 [CF_ROUTINGS_CUSTOMER.VERIFY_OTP_PHONE_REGISTER]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
						const { code } = req.params;
                        const { phone } = req.query;

                        const infoData = await CUSTOMER_MODEL.verifyPhoneRegisterOTP({ 
							code, phone
						});
                        console.log({
                            infoData
                        });
                        res.json(infoData);
                    }]
                },
            },

            /**
             * Function: Send OTP Phone quên mật khẩu
             */
			 [CF_ROUTINGS_CUSTOMER.SEND_PHONE_OTP_FORGET]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
						const { phone } = req.params;

                        const infoSendOTP = await CUSTOMER_MODEL.sendOTPForgot({ 
							phone
						});
                        res.json(infoSendOTP);
                    }]
                },
            },

            /**
             * Function: Send OTP Phone quên mật khẩu
             */
			 [CF_ROUTINGS_CUSTOMER.VERIFY_OTP_PHONE_FORGET]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
						const { code } = req.params;
                        const { phone } = req.query;

                        const infoData = await CUSTOMER_MODEL.verifyPhoneForgotOTP({ 
							code, phone
						});
                        res.json(infoData);
                    }]
                },
            },


			/**
             * ========================== ******************** ================================
             * ========================== QUẢN LÝ USER-DEVICE  ================================
             * ========================== ******************** ================================
             */

			/**
             * Function: Add user-device (permission: all) (API)
             * Date: 03/07/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.ADD_USER_DEVICE]: {
				config: {
					auth: [ roles.role.all.bin ],
					type: 'json',
				},
				methods: {
					post: [ async (req, res) => {
						const { deviceName, deviceID, registrationID } = req.body;

						const infoAfterInsert = await USER_DEVICE_MODEL.insert({ 
							deviceName, deviceID, registrationID
						});
                        console.log({ infoAfterInsert });
						res.json(infoAfterInsert);
					}]
				},
			},

			/**
             * Function: Update user-device (permission: all) (API)
             * Date: 10/09/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.UPDATE_CUSTOMER_FOR_USER_DEVICE]: {
				config: {
					auth: [ roles.role.all.bin ],
					type: 'json',
				},
				methods: {
					post: [ async (req, res) => {
						const { deviceID, customerID } = req.body;

						const infoAfterInsert = await USER_DEVICE_MODEL.updateCustomerForUserDevice({ 
							deviceID, customerID
						});
						res.json(infoAfterInsert);
					}]
				},
			},

			/**
             * Function: Get list user-device (permission: all) (API)
             * Date: 03/07/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.LIST_USER_DEVICE]: {
				config: {
					auth: [ roles.role.all.bin ],
					type: 'json',
				},
				methods: {
					get: [ async (req, res) => {
						const { page, limit } = req.query;

						const listNonMember = await USER_DEVICE_MODEL.getList({ page, limit });
						res.json(listNonMember);
					}]
				},
			},

			/**
             * Function: Get info user-device (permission: all) (API)
             * Date: 03/07/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.INFO_USER_DEVICE]: {
				config: {
					auth: [ roles.role.all.bin ],
					type: 'json',
				},
				methods: {
					get: [ async (req, res) => {
						const { userDeviceID } = req.query;

						const infoUserDevice = await USER_DEVICE_MODEL.getInfo({ userDeviceID });
						res.json(infoUserDevice);
					}]
				},
			},

			/**
             * Function: Get info user-device by device ID (permission: all) (API)
             * Date: 10/09/2021
             * Dev: MinhVH
             */
			[CF_ROUTINGS_CUSTOMER.INFO_USER_DEVICE_BY_DEVICE_ID]: {
				config: {
					auth: [ roles.role.all.bin ],
					type: 'json',
				},
				methods: {
					get: [ async (req, res) => {
						const { deviceID } = req.query;

						const infoUserDeviceByDeviceID = await USER_DEVICE_MODEL.getInfoByDeviceID({ deviceID });
						res.json(infoUserDeviceByDeviceID);
					}]
				},
			},

			/**
             * Function: Delete user-device (permission: admin) (API)
             * Date: 03/07/2021
             * Dev: MinhVH
             */
			 [CF_ROUTINGS_CUSTOMER.DELETE_USER_DEVICE]: {
				config: {
					auth: [ roles.role.admin.bin ],
					type: 'json',
				},
				methods: {
					get: [ async (req, res) => {
						const { userDeviceID } = req.query;

						const infoAfterDelete = await USER_DEVICE_MODEL.delete({ userDeviceID });
						res.json(infoAfterDelete);
					}]
				},
			},

        }
    }
};
