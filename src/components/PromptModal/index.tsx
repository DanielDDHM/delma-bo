/**
 *
 * PromptModal
 *
 */

import React from "react";
import "./styles.scss";
import { Prompt } from "react-router-dom";
import { Modal } from "antd";

import Strings from "utils/strings";

export class PromptModal extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            modalVisible: false,
            lastLocation: null,
            confirmedNavigation: false,
            loading: false
        };
    }

    showModal = (location: any) =>
        this.setState({
            modalVisible: true,
            lastLocation: location,
        });

    closeModal = (callback: any) => {
        this.setState(
            {
                modalVisible: false,
            },
            callback
        );
    };

    handleBlockedNavigation = (nextLocation: any) => {
        const { confirmedNavigation } = this.state;
        const { when } = this.props;

        if (!confirmedNavigation && when) {
            this.showModal(nextLocation);
            return false;
        }

        return true;
    };

    handleOnClickConfirm = async () => {
        const { onClickConfirm } = this.props;

        try {
            const ok = await onClickConfirm();

            if (ok)
                this.closeModal(() => {
                    const { navigate } = this.props;
                    const { lastLocation } = this.state;
                    if (lastLocation) {
                        this.setState(
                            {
                                confirmedNavigation: true,
                            },
                            () => {
                                navigate(lastLocation.pathname);
                            }
                        );
                    }
                });
            else {
                this.closeModal(() => {});
            }
        } catch (error) {
            console.log("ERROR", error);
        }
    };

    handleOnClickCancel = () => {
        this.closeModal(() => {
            const { navigate } = this.props;
            const { lastLocation } = this.state;
            if (lastLocation) {
                this.setState(
                    {
                        confirmedNavigation: true,
                    },
                    () => {
                        // Navigate to the previous blocked location with your navigate function
                        navigate(lastLocation.pathname);
                    }
                );
            }
        });
    };

    render() {
        const { text = null, when } = this.props;
        const { modalVisible } = this.state;
        return (
            <div>
                <Prompt when={when} message={this.handleBlockedNavigation} />
                <Modal
                    centered={true}
                    closable={false}
                    visible={modalVisible}
                    okText={Strings.generic.yes}
                    cancelText={Strings.generic.no}
                    onOk={this.handleOnClickConfirm}
                    onCancel={this.handleOnClickCancel}
                >
                    <p>{text ? text : Strings.generic.askToSave}</p>
                </Modal>
            </div>
        );
    }
}

export default PromptModal;
