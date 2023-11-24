import { store } from "store";

export interface Props {
    dispatch: typeof store.dispatch;
}