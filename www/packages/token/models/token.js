
 "use strict";

 /**
  * EXTERNAL PACKAGES
  */
const ObjectID                      = require('mongoose').Types.ObjectId;

/**
 * BASE
 */
 const BaseModel 					= require('../../../models/intalize/base_model');

/**
 * MODELS
 */
 
/**
 * COLLECTIONS
 */
let TOKEN_COLL = require('../databases/token-coll');
 
class Model extends BaseModel {
    constructor() {
        super(TOKEN_COLL);
    }

    insert({ userID, token }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID) || !token)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });
                
                // Cấp thời gian tồn tại cho token là 10 ngày
                var time = new Date();
                time.setDate(time.getDate() + 10);

                let expireTime = time;

                let dataInsert = {
                    userID, 
                    token,
                    expireAt: expireTime
                }

                let infoTokenAfterInsert = await this.insertData(dataInsert);
                if(!infoTokenAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo' });

                return resolve({ error: false, data: infoTokenAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfo({ userID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let listToken = await TOKEN_COLL.find({ userID }).sort({ _id: -1 });
                if(!listToken || !listToken.length)
                    return resolve({ error: true, message: 'Người dùng chưa đăng nhập' });

                // Kiểm tra thời gian hết hạn của token
                if(new Date(listToken[0].expireAt).getTime() < Date.now()) 
                    return resolve({ error: true, message: 'Token đã hết hạn sử dụng' });

                return resolve({ error: false, data: listToken[0] });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}
exports.MODEL = new Model;
