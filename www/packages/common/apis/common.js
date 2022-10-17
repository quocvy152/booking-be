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
const multer                                    = require('../../../config/cf_helpers_multer/index');
const { BOOKING_KEY }                           = require('../../../config/cf_constants');
const imgbbUploader = require('imgbb-uploader');

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

            [CF_ROUTINGS_COMMON.UPLOAD_IMGBB]: {
                config: {
                    auth: [ roles.role.all.bin ],
					type: 'JSON',
                },
                methods: {
                    post: [ multer.uploadSingle, async (req, res) => {
                        let avatar = req.file;

                        let resultUploadImg = await imgbbUploader(BOOKING_KEY.KEY_API_IMGBB, req.file.path);
                        let { display_url } = resultUploadImg;

                        fs.unlinkSync(req.file.path);
                        avatar.urlImgServer = display_url;

                        res.json({
                            error: false,
                            data: {
                                name: resultUploadImg.display_url,
                                size: resultUploadImg.size,
                                path: resultUploadImg.display_url,
                            }
                        })
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
                        let listProvince = provinces;
                        res.json({ error: false, data: listProvince });
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
                        let { province_id } = req.query;
                        let listDistrict = districts.filter(district => district['province_code'] == province_id);
                        res.json({ error: false, data: { province_id, listDistrict } });
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
                        let { district_id } = req.query;
                        let listWards = wards.filter(districtWards => districtWards['code'] == district_id);
                        res.json({ error: false, data: { district_id, listWards } });
                    }]
                },
            },

        }
    }
};
