// TODO: Need better solution for this
const API_URL = process.env.API_URL;

export default {
	uriLogin() {
		console.log('url', API_URL);
		return `${API_URL}/auth/login`;
	},

	uriAnalytics(id = "") {
		return `${API_URL}/statistics/dashboard${id}`;
	},

	uriDashboard(id = "") {
		return `${API_URL}/statistics/business/${id}`;
	},

	uriLogs() {
		return `${API_URL}/statistics/logs`;
	},

	uriLogout() {
		return `${API_URL}/auth/logout`;
	},

	uriStaff(id = '') {
		return `${API_URL}/staff/${id}`;
	},

	uriRecoverPassword(id = '') {
		return `${API_URL}/staff/recover-password/${id}`;
	},

	uriStaffPassword() {
		return `${API_URL}/staff/password`;
	},

	uriStaffEmail() {
		return `${API_URL}/staff/email`;
	},

	uriPages(id = '') {
		return `${API_URL}/pages/${id}`;
	},

	uriEmailTemplate(id = '') {
		return `${API_URL}/email-templates/${id}`;
	},

	uriUsers(id = '') {
		return `${API_URL}/users/${id}`;
	},

	uriLibrary(id = '') {
		return `${API_URL}/library/${id}`;
	},
	
	uriAlbuns(id = '') {
		return `${API_URL}/albuns/${id}`;
	},
	
	uriBooks(id = '') {
		return `${API_URL}/books/${id}`;
	},

	uriNotifications(id = '') {
		return `${API_URL}/notifications/${id}`;
	},

	uriCountries(id = '') {
		return `${API_URL}/countries/${id}`;
	},

	uriSchedules(idPsychologist = '', startDate = '', endDate = '') {
		return `${API_URL}/psychologists/${idPsychologist}/schedules/${startDate}/${endDate}`;
	},
};
