const CHARACTERISTIC_MODEL 		= require('./models/characteristic').MODEL;
const CHARACTERISTIC_COLL  		= require('./databases/characteristic-coll');
const CHARACTERISTIC_TYPE_MODEL = require('./models/characteristic_type').MODEL;
const CHARACTERISTIC_TYPE_COLL  = require('./databases/characteristic_type-coll');
const CAR_CHARACTERISTIC_MODEL  = require('./models/car_characteristic').MODEL;
const CAR_CHARACTERISTIC_COLL   = require('./databases/car_characteristic-coll');
const CHARACTERISTIC_ROUTES     = require('./apis/characteristic');

module.exports = {
    CHARACTERISTIC_ROUTES,
    CHARACTERISTIC_COLL,
    CHARACTERISTIC_MODEL,
    CHARACTERISTIC_TYPE_COLL,
    CHARACTERISTIC_TYPE_MODEL,
    CAR_CHARACTERISTIC_COLL,
    CAR_CHARACTERISTIC_MODEL
}
