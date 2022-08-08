
 "use strict";

 /**
  * EXTERNAL PACKAGES
  */
 const ObjectID                      = require('mongoose').Types.ObjectId;
 const path = require('path');
 const fs   = require('fs');
  /**
   * BASE
   */
  const { districts } = require('../constants/districts');
  const { provinces } = require('../constants/provinces');
 /**
  * MODELS
  */
 
 /**
  * COLLECTIONS
  */
 
class Model {
    listDistrict({ province }) {
        try {
            // let { province } = req.params;
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

            return { error: false, data: listDistricts };
        } catch (error) {
            return { error: true, message: error.message };
        }
    }

    listProvinceAll({  }) {
        try {
            // let { province } = req.params;
            let listProvince = Object.entries(provinces);
            return { error: false, data: listProvince };
        } catch (error) {
            return { error: true, message: error.message };
        }
    }

    getInfoProvince({ provinceCode }) {
        try {
            // let { province } = req.params;
            let listProvince        = Object.entries(provinces);
            // console.log({ provinceCode });
            let provinceArr = [];
            for (let province of listProvince){
                if ( province[1].code == Number(provinceCode) ){
                    provinceArr = province;
                    break;
                }
            }

            return { error: false, data: provinceArr };
        } catch (error) {
            return { error: true, message: error.message };
        }
    }

    listWard({ district }) {
        return new Promise(async resolve => {
            try {
                let listWards = [];
                let  filePath = path.resolve(__dirname, `../constants/wards/${district}.json`);
                // console.log({ filePath });
                await fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
                    if (!err) {
                        listWards = JSON.parse(data);
                        // console.log({ listWards });
                        return resolve({ error: true, data: listWards });
                    } else {
                        return resolve({ error: true, message: "district_not_exist" });
                    }
                });
            } catch (error) {
                return { error: true, message: error.message };
            }
        })

    }

    getInfoDistrict({ districtCode }) {
        try {
            // let { district } = req.params;
            let listDistricts        = Object.entries(districts);
            let districtArr = [];
            for (let district of listDistricts){
                if ( district[1].code == districtCode ){
                    districtArr = district;
                    break;
                }
            }

            return { error: false, data: districtArr };
        } catch (error) {
            return { error: true, message: error.message };
        }
    }

    getInfoWard({ district, wardCode }) {
        return new Promise(async resolve => {
            try {
                // let { district } = req.params;
                let listWards = [];
                let wardArr = [];
                
                let  filePath = path.resolve(__dirname, `../constants/wards/${district}.json`);
                await fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data){
                    if (!err) {
                        listWards = JSON.parse(data);
                        listWards = Object.entries(listWards);
                        for (let ward of listWards){
                            if ( ward[1].code == wardCode ){
                                wardArr = ward;
                                break;
                            }
                        }
                        // console.log(wardArr);
                        return resolve({ error: false, data: wardArr });
                    } else {
                        return resolve({ error: true,  message: "not_found_ward" });
                    }
                })
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}
exports.MODEL = new Model;
