import { notification } from 'antd';
import Strings from 'utils/strings';

export const trimObjects = (obj: any) => {
	for (const prop in obj) {
		obj[prop] = obj[prop].trim();
	}
	return obj;
};

export const emailIsValid = (email: string, error?: any) => {
	const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const isValid = email.match(emailRegex);

	if (!isValid && error) {
		notification.warn({
			message: Strings.errors.invalidFields,
			description: error as string,
			placement: 'bottomRight',
			duration: 5,
		});
	}

	return isValid;
}

export const capitalize = (string: string) => {
	if (!string) return '';
	return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}

export const translate = (text: any) => {
	if (!text) return '';

	if (typeof text === 'string') return text;

	const lang = Strings.getLanguage();
	const defaultLanguage = Strings.getLanguage();

	if (text[defaultLanguage] || text[lang]) {
		return text[defaultLanguage] || text[lang];
	}

	return Object.values(text).filter(val => !!val)[0] || '';
};

export const LANGUAGES = [
	{
		value: 'pt',
		label: 'PT',
	},
	{
		value: 'en',
		label: 'EN',
	},
	{
		value: 'es',
		label: 'ES',
	},
];