import { store } from "store";

export interface Props {
    dispatch: typeof store.dispatch;
    user: any;
}

export interface State {
    staff: Array<any>;
    openSidebar: boolean;
    tempStaff: any;
    openConfirmResendInviteModal: any;
}