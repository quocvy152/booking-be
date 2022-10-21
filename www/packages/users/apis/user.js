"use strict";

/**
 * EXTERNAL PACKAGE
 */
const path = require('path');
const fs   = require('fs');
const imgbbUploader = require('imgbb-uploader');

/**
 * INTERNAL PACKAGE
 */
const ChildRouter                           = require('../../../routing/child_routing');
const roles                                 = require('../../../config/cf_role');
const multer                                = require('../../../config/cf_helpers_multer/index');
const uploadImage                           = require('../../../config/services/cf_firebase');
const { CF_ROUTINGS_USER } 					= require('../constants/user.uri');
const { BOOKING_KEY }                       = require('../../../config/cf_constants');

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
                        const { name } = req.query;
                        const resultGetListUser = await USER_MODEL.getList({ name });
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
                    put: [ multer.uploadFields, async function (req, res) {
                        const { userID } = req.params;

                        const { 
                            username, email, currentPass, newPass, confirmPass, role, status, firstName,  
                            lastName, address, phone, citizenIdentificationNo, drivingLicenseNo,
                        } = req.body;

                        let avatar, citizenIdentificationFront, citizenIdentificationBack, drivingLicenseFront, drivingLicenseBack;
                        let listImageValidateInfo = req.files;

                        for(let keyImage in listImageValidateInfo) {
                            let resultUploadImg = await imgbbUploader(BOOKING_KEY.KEY_API_IMGBB, listImageValidateInfo[keyImage][0].path);

                            let { image: { filename }, size } = resultUploadImg;
                            
                            let { display_url } = resultUploadImg;
                            fs.unlinkSync(listImageValidateInfo[keyImage][0].path);

                            let objInfoFile = {
                                name: filename,
                                size: size,
                                path: display_url
                            }

                            switch(keyImage) {
                                case 'file': {
                                    avatar = objInfoFile;
                                }
                                case 'citizenIdentificationFront': {
                                    citizenIdentificationFront = objInfoFile;
                                }
                                case 'citizenIdentificationBack': {
                                    citizenIdentificationBack = objInfoFile;
                                }
                                case 'drivingLicenseFront': {
                                    drivingLicenseFront = objInfoFile;
                                }
                                case 'drivingLicenseBack': {
                                    drivingLicenseBack = objInfoFile;
                                }
                            }
                        }

                        const resultUpdateUser = await USER_MODEL.update({ 
                            userID, username, email, currentPass, newPass, confirmPass, role, status, firstName, lastName, avatar,
                            address, phone, citizenIdentificationNo, citizenIdentificationFront, citizenIdentificationBack,
                            drivingLicenseNo, drivingLicenseFront, drivingLicenseBack
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
             *      + Reset Password (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_USER.RESET_PASSWORD]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async function (req, res) {
                        const { account } = req.body;
                        const resultResetPassword = await USER_MODEL.resetPassword({ account });
                        res.json(resultResetPassword);
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

            /**
             * Function: 
             *      + Update Avatar (API)
             * Date: 12/08/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_USER.UPDATE_AVATAR]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ multer.uploadSingle, async function (req, res) {
                        res.json(req.file);
                    }]
                },
            },

            /**
             * Function: 
             *      + Change Password (API)
             * Date: 27/08/2022
             * Dev: VyPQ
             */
            [CF_ROUTINGS_USER.CHANGE_PASSWORD]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { _id: userID } = req.user;
                        const { oldPassword, newPassword, confirmPassword } = req.body;
                        let infoUserAfterChangePass = await USER_MODEL.changePassword({ userID, oldPassword, newPassword, confirmPassword });
                        res.json(infoUserAfterChangePass);
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
             [CF_ROUTINGS_USER.UPDATE_USERS_USERID]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async function (req, res) {
                        const { userID } = req.params;

                        const { 
                            username, email, currentPass, newPass, confirmPass, role, status, firstName,  
                            lastName, address, phone, citizenIdentificationNo, drivingLicenseNo,
                            avatar, citizenIdentificationFront, citizenIdentificationBack, drivingLicenseFront, drivingLicenseBack
                        } = req.body;

                        const resultUpdateUser = await USER_MODEL.update({ 
                            userID, username, email, currentPass, newPass, confirmPass, role, status, firstName, lastName, avatar,
                            address, phone, citizenIdentificationNo, citizenIdentificationFront, citizenIdentificationBack,
                            drivingLicenseNo, drivingLicenseFront, drivingLicenseBack
                        });
                        res.json(resultUpdateUser);
                    }],
                },
            },

            [CF_ROUTINGS_USER.UPDATE_STATUS_USER]: {
                config: {
                    auth: [ roles.role.user.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async function (req, res) {
                        const { user } = req.query;
                        let infoUserAfterUpdateStatus = await USER_MODEL.updateStatus({ userID: user });
                        res.json(infoUserAfterUpdateStatus);
                    }]
                },
            },

            /**
             * Function: Cập nhật thông tin xác thực
             *      + CCCD
             *      + GPLX
             * Date: 09/09/2022
             * Dev: VyPQ
             */
             [CF_ROUTINGS_USER.UPDATE_VALIDATE_INFO]: {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    put: [ async function (req, res) {

                        const { user } = req.query;
                        const { 
                            citizenIdentificationNo, drivingLicenseNo, citizenIdentificationFront,
                            citizenIdentificationBack, drivingLicenseFront, drivingLicenseBack
                        } = req.body;

                        const resultUpdateValidateInfo = await USER_MODEL.updateValidateInfo({ 
                            userID: user,
                            citizenIdentificationNo,
                            drivingLicenseNo,
                            citizenIdentificationFront,
                            citizenIdentificationBack,
                            drivingLicenseFront,
                            drivingLicenseBack
                        })
                        res.json(resultUpdateValidateInfo);
                    }]
                },
            },
        }
    }
};
