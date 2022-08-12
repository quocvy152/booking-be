"use strict";

/**
 * EXTERNAL PAKCAGE
 */
const ObjectID                            = require('mongoose').Types.ObjectId;

/**
 * INTERNAL PAKCAGE
 */
const BaseModel                           = require('../../../models/intalize/base_model');
const IMAGE_COLL                          = require('../databases/image-coll');

class Model extends BaseModel {
    constructor() {
        super(IMAGE_COLL);
    }

    insert({ name, size, path, userCreate }) {
        return new Promise(async (resolve) => {
            try {
                let resultInsert = await this.insertData({ name, size, path, userCreate });
                if(!resultInsert)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });
                return resolve({ error: false, data : resultInsert });
            }catch(error){
                return resolve({ error: true, message: error.message });
            }
        })
    }

    delete({ imageID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(imageID))
                    return resolve({ error: true, message: "param_not_valid" });

                const infoAfterDelete = await IMAGE_COLL.findByIdAndRemove(imageID);

                if(!infoAfterDelete) 
                    return resolve({ error: true, message: "image_is_not_exists" });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Update order
     * Dattv
     */
     updateOrder({ arrayObject }) {
        return new Promise(async resolve => {
            try {
                
                if(!arrayObject.length)
                    return resolve({ error: true, message: 'params_invalid' });
                
                for (let item of arrayObject) {
                    let updateOrder = await IMAGE_COLL.findByIdAndUpdate(item._id, {
                        order: Number(item.index)
                    }, { new: true })

                    if(!updateOrder)
                        return resolve({ error: true, message: 'cannot_update_order' });
                }

                return resolve({ error: false, message: "update success" });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * Update CTA
     * Dattv
     */
     updateCTA({ arrObjectImageCTA }) {
        return new Promise(async resolve => {
            try {
                
                if(!arrObjectImageCTA.length)
                    return resolve({ error: true, message: 'params_invalid' });
                
                for (let item of arrObjectImageCTA) {
                    let updateCTA = await IMAGE_COLL.findByIdAndUpdate(item.imageID, {
                        order: Number(item.order), typeCTA: Number(item.typeCTA), valueCTA: item.valueCTA
                    }, { new: true });

                    if(!updateCTA)
                        return resolve({ error: true, message: 'cannot_update_order' });
                }

                return resolve({ error: false, message: "update success" });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
