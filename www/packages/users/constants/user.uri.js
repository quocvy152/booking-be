const BASE_ROUTE = '/admin';

const CF_ROUTINGS_USER = {
    // USER PERMISSION
	ADD_USER: `${BASE_ROUTE}/add-user`,
	LIST_USER: `${BASE_ROUTE}/list-user`,
	INFO_USER: `${BASE_ROUTE}/info-user`,
    UPDATE_USER: `${BASE_ROUTE}/update-user`,
    UPDATE_PERSONAL_USER: `${BASE_ROUTE}/update-personal-user`,
    DELETE_USER: `${BASE_ROUTE}/delete-user`,

    ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_USER = CF_ROUTINGS_USER;
