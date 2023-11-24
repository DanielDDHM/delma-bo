import { store } from "store";

export interface Props {
	dispatch: typeof store.dispatch;
	match: any;
	language: string;
}

type type = {
	value: string;
	text: string;
};

type businesses = [];

export interface State {
	item: any | null;
	types: Array<type>;
	language: string;
	hasUnsavedFields: boolean;
}