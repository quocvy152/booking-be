const BASE_ROUTE = '/brand';

const CF_ROUTINGS_BRAND = {
	ADD_BRAND: `${BASE_ROUTE}/add-brand`,
	UPDATE_BRAND: `${BASE_ROUTE}/update-brand/:brandID`,
	REMOVE_BRAND: `${BASE_ROUTE}/remove-brand/:brandID`,
	INFO_BRAND: `${BASE_ROUTE}/info-brand/:brandID`,
	LIST_BRAND: `${BASE_ROUTE}/list-brand`,

	ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_BRAND = CF_ROUTINGS_BRAND;
