const FAVOURITE_MODEL 		= require('./models/favourite').MODEL;
const FAVOURITE_COLL  		= require('./databases/favourite-coll');
const FAVOURITE_ROUTES      = require('./apis/favourite');

module.exports = {
    FAVOURITE_ROUTES,
    FAVOURITE_COLL,
    FAVOURITE_MODEL,
}
