import { store } from "store";

export interface Props {
    dispatch: typeof store.dispatch;
}

export interface State {
    users: Array<any>;
    page: number;
    pageSize: number;
    columnSearch: any;
    globalSearch: string;
    total: number;
}
