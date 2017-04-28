import {autobind} from "core-decorators";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button from "focus-components/button";

import * as styles from "./__style__/list-wrapper.css";

export type ListWrapperStyle = Partial<typeof styles>;

export interface ListWrapperProps {
    addItemHandler?: () => void;
    canChangeMode?: boolean;
    hideAddItemHandler?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    mode?: "list" | "mosaic";
    mosaicWidth?: number;
    mosaicHeight?: number;
    theme?: ListWrapperStyle;
}

@themr("listWrapper", styles)
@autobind
@observer
export class ListWrapper extends React.Component<ListWrapperProps, void> {

    static childContextTypes = {
        listWrapper: React.PropTypes.object
    };

    @observable childContext = {
        addItemHandler: observable.ref(this.props.addItemHandler),
        mosaic: {
            width: this.props.mosaicWidth || 200,
            height: this.props.mosaicHeight || 200
        },
        mode: this.props.mode || "list"
    };

    @action
    componentWillReceiveProps({addItemHandler, mode, mosaicHeight, mosaicWidth}: ListWrapperProps) {
        if (this.props.addItemHandler !== addItemHandler) {
            this.childContext.addItemHandler = addItemHandler;
        }
        if (mode && this.props.mode !== mode) {
            this.childContext.mode = mode;
        }
        if (mosaicWidth && this.props.mosaicWidth !== mosaicWidth) {
            this.childContext.mosaic.width = mosaicWidth;
        }
        if (mosaicHeight && this.props.mosaicHeight !== mosaicHeight) {
            this.childContext.mosaic.height = mosaicHeight;
        }
    }

    getChildContext() {
        return {listWrapper: this.childContext};
    }

    render() {
        const {theme, children, canChangeMode, hideAddItemHandler, i18nPrefix = "focus"} = this.props;
        const {mode, addItemHandler} = this.childContext;
        return (
            <div className={theme!.wrapper!}>
                <div className={theme!.bar!}>
                    {canChangeMode ?
                        <Button
                            color={mode === "list" ? "accent" : undefined}
                            onClick={() => this.childContext.mode = "list"}
                            icon="list"
                            shape="icon"
                            label={`${i18nPrefix}.list.mode.list`}
                        />
                    : null}
                    {canChangeMode ?
                        <Button
                            color={mode === "mosaic" ? "accent" : undefined}
                            onClick={() => this.childContext.mode = "mosaic"}
                            icon="apps"
                            shape="icon"
                            label={`${i18nPrefix}.list.mode.mosaic`}
                        />
                    : null}
                    {!hideAddItemHandler && addItemHandler && mode === "list" ?
                        <Button
                            onClick={addItemHandler}
                            icon="add"
                            label={`${i18nPrefix}.list.add`}
                            shape={null}
                        />
                    : null}
                </div>
                {children}
            </div>
        );
    }
}
