import { store } from "store";

export interface Props {
	dispatch: typeof store.dispatch;
	language: string;
}

export interface State {
	albuns: Array<any>;
}