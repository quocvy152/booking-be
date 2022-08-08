"use strict";
/**
 * EXTERNAL PACKAGE
 */
 const path = require('path');
/**
 * INTERNAL PACKAGE
 */
const ChildRouter                                   = require('../../../routing/child_routing');
const roles                                         = require('../../../config/cf_role');

/**
 * MODELS, COLLECTIONS
 */
 const OTP_MODEL                                = require('../models/otp').MODEL;

module.exports = class Auth extends ChildRouter {
    constructor() {
        super('/');
    }

    registerRouting() {
        return {
            /**
             * ========================== ************************ ================================
             * ========================== QUẢN LÝ GROUP PERMISSION ================================
             * ========================== ************************ ================================
             */

            /**
             * Function: Thêm khách hàng (API)
             * Date: 17/04/2021
             * Dev: SonLP
             */
            '/send-otp-register/:phone': {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    get: [ async (req, res) => {
                        let { phone }      = req.params;
                        let signalAfterCreateRecord = await OTP_MODEL.sendOTP({ phone });
                        res.json(signalAfterCreateRecord)
                    }]
                },
            },
            // [check ok]✅
            '/verify-otp-register/:phone': {
                config: {
                    auth: [ roles.role.all.bin ],
                    type: 'json',
                },
                methods: {
                    post: [ async (req, res) => {
                        let { phone }      = req.params;
                        let { code }       = req.body;
                        //type: SMS_PRE_REGISTER 
                        let signalAfterUpdate = await OTP_MODEL.verificationOTP({ phone, code});
                        res.json(signalAfterUpdate)
                    }]
                },
            },
        }
    }
};
