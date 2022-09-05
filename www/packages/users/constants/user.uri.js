const BASE_ROUTE = '/users';

const CF_ROUTINGS_USER = {
	USERS: `${BASE_ROUTE}`,
	RESET_PASSWORD: `${BASE_ROUTE}/password/reset`,
	CHANGE_PASSWORD: `${BASE_ROUTE}/password/change`,
	USERS_INFO: `${BASE_ROUTE}/info/current`,
	USERS_USERID: `${BASE_ROUTE}/:userID`,
	UPDATE_USERS_USERID: `${BASE_ROUTE}/update/:userID`,
	UPDATE_STATUS_USER: `${BASE_ROUTE}/update-status`,
	LOGIN: `${BASE_ROUTE}/login`,
	UPDATE_AVATAR: `${BASE_ROUTE}/avatar/update`,

    ORIGIN_APP: BASE_ROUTE
}

exports.CF_ROUTINGS_USER = CF_ROUTINGS_USER;
