const BASE_ROUTE = '/characteristics';
const CHARACTERISTIC_TYPE_ROUTE = '/characteristic-types';

const CF_ROUTINGS_CHARACTERISTIC = {
	CHARACTERISTICS: `${BASE_ROUTE}`,
	CHARACTERISTICS_CHARACTERISTICID: `${BASE_ROUTE}/:characteristicID`,
	LIST_CHARACTERISTIC_OF_CHARACTERISTIC_TYPE: `${BASE_ROUTE}/list-of-characteristic-type/:characteristicTypeID`,
	LIST_CHARACTERISTIC_BY_CODE: `${BASE_ROUTE}/characteristic-type/list-detail`,
	CHARACTERISTIC_TYPES: `${BASE_ROUTE}${CHARACTERISTIC_TYPE_ROUTE}`,
	CHARACTERISTIC_TYPES_CHARACTERISTICTYPESID: `${BASE_ROUTE}${CHARACTERISTIC_TYPE_ROUTE}/:characteristicTypeID`,

    ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_CHARACTERISTIC = CF_ROUTINGS_CHARACTERISTIC;
