import * as TYPES from '../constants';
import { store } from 'store';
import { BreadcrumbType } from 'components/Breadcrumb'

export const setLoader = (value: boolean) => ({ type: TYPES.SET_LOADER, value });
export const setTitle = (value: string) => ({ type: TYPES.SET_TITLE, value });
export const setUser = (value: object) => ({ type: TYPES.SET_USER, value });
export const setToken = (value: string) => ({ type: TYPES.SET_TOKEN, value });
export const setLogout = () => ({ type: TYPES.SET_LOGOUT });
export const setStaffModal = (value: any) => ({ type: TYPES.SET_STAFF_DIALOG, value });
export const setBreadcrumb = (value: BreadcrumbType | null) => ({ type: TYPES.SET_BREADCRUMB, value });
export const updateCrumb = () => ({ type: TYPES.UPDATE_CRUMB });
export const setUpdater = (dispatch: any) => ({ type: TYPES.SET_UPDATER, dispatch });
export const setLogsFilters = (value: object) => ({ type: TYPES.SET_LOGS_FILTERS, value });
export const setLanguage = (value: string | null) => ({ type: TYPES.SET_LANGUAGE, value });

export const delayedDispatch = (value: any, time = 400) => {
	setTimeout(() => store.dispatch(value), time);
}