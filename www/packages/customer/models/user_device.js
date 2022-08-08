"use strict";

/**
 * EXTERNAL PACKAGES
 */
const ObjectID                      		= require('mongoose').Types.ObjectId;

/**
 * INTERNAL PACKAGES
 */

/**
 * BASES
 */
const BaseModel 							= require('../../../models/intalize/base_model');

/**
 * COLLECTIONS
 */
const USER_DEVICE_COLL 						= require('../databases/user_device-coll');
// const TRIAL_PROGRAM_MODEL	                = require('../../trial_program/models/trial_program').MODEL;
// const NOTIFICATION_MODEL  		            = require('../../notification/models/notification').MODEL;
// const VIEW_TRIAL_PROGRAM_MODEL  	        = require('../../trial_program/models/view_trial_program').MODEL;

class Model extends BaseModel {
    constructor() {
        super(USER_DEVICE_COLL);
    }

	insert({ deviceName, deviceID, customer }) {
        return new Promise(async resolve => {
            try {
				if(!deviceName || !deviceID)
					return resolve({ error: true, message: 'params_invalid' });

				let dataInsert = {
					deviceName, 
					deviceID, 
				}

                let checkExist = await USER_DEVICE_COLL.findOne({ deviceID });
                if(checkExist)
                    return resolve({ error: true, message: "deviceID_is_existed" });

				if(customer && ObjectID.isValid(customer)){
					dataInsert.customer = customer;
				}

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'create_user_device_failed' });
                // Tạo view_trial_program và notification khi có trialprogram
                // let infoTrialProgramCurrent = await TRIAL_PROGRAM_MODEL.getInfoTrialProgramCurrentV2();
                // if(!infoTrialProgramCurrent.error){

                //         let { title, description, content, _id: trialProgramID, userCreate: sender } = infoTrialProgramCurrent.data;
                //         // Tạo thông báo có trial program cho user
                //         await NOTIFICATION_MODEL.insert({ 
                //             title, description, content, type: 2, trialProgram: trialProgramID, sender, userDevice: infoAfterInsert._id, deviceID 
                //         });

                //         // User xem trial program để hiển thị popup
                //         await VIEW_TRIAL_PROGRAM_MODEL.insert({ trialProgramID, deviceID });
                // }
                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	updateCustomerForUserDevice({ deviceID, customerID, deviceName, registrationID }) {
        return new Promise(async resolve => {
            try {
				if(!ObjectID.isValid(customerID))
					return resolve({ error: true, message: 'params_invalid' });
              
                let infoAfterUpdate = await USER_DEVICE_COLL.findOneAndUpdate({deviceID}, {
					customer: customerID, deviceName, registrationID
				}, { new: true })
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'update_user_device_failed' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList({ page = 1, limit = 30 }){
        return new Promise(async resolve => {
            try {
				limit = +limit;
				page  = +page;

                let listUserDevice = await USER_DEVICE_COLL
					.find({})
					.populate('customer')
					.limit(limit)
					.skip((page - 1) * limit)
					.sort({ modifyAt: -1 })
					.lean();

                if(!listUserDevice)
                    return resolve({ error: true, message: "cannot_get_list_user_device" });

				let totalUserDevice = await USER_DEVICE_COLL.countDocuments({});

                return resolve({ 
					error: false, 
					data: {
						listUserDevice,
						currentPage: page,
						perPage: limit,
						total: totalUserDevice
					}
				});
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getInfo({ userDeviceID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userDeviceID))
                    return resolve({ error: true, message: "param_invalid" });

				let infoUserDevice = await USER_DEVICE_COLL
					.findById(userDeviceID)
					.lean();

                if(!infoUserDevice) 
                    return resolve({ error: true, message: "cannot_get_info_user_device" });

                return resolve({ error: false, data: infoUserDevice });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getInfoByDeviceID({ deviceID }) {
        return new Promise(async resolve => {
            try {
				let infoUserDevice = await USER_DEVICE_COLL
					.findOne({ deviceID })
					.lean();

                if(!infoUserDevice) 
                    return resolve({ error: true, message: "cannot_get_info_user_device" });

                return resolve({ error: false, data: infoUserDevice });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    delete({ userDeviceID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userDeviceID))
                    return resolve({ error: true, message: "param_invalid" });

				let infoAfterDelete = await USER_DEVICE_COLL.findByIdAndRemove(userDeviceID);

                if(!infoAfterDelete) 
                    return resolve({ error: true, message: "cannot_delete_user_device" });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}

exports.MODEL = new Model;
