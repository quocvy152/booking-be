const CAR_MODEL 		= require('./models/car').MODEL;
const CAR_COLL  		= require('./databases/car-coll');
const CAR_ROUTES        = require('./apis/car');

module.exports = {
    CAR_ROUTES,
    CAR_COLL,
    CAR_MODEL,
}
