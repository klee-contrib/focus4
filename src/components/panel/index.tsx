import i18n from "i18next";
import {snakeCase, uniqueId} from "lodash";
import * as React from "react";
import {themr} from "react-css-themr";

import {ProgressBar} from "react-toolbox/lib/progress_bar";
import ButtonHelp from "../button-help";
import {PanelButtons, PanelButtonsProps} from "./buttons";
export {PanelButtons};

import * as styles from "../__style__/panel.css";

export type PanelStyle = Partial<typeof styles>;

export interface PanelProps extends PanelButtonsProps {
    blockName?: string;
    buttonsPosition?: "both" | "bottom" | "top" | "none";
    hideOnScrollspy?: boolean;
    hideProgressBar?: boolean;
    loading?: boolean;
    showHelp?: boolean;
    theme?: PanelStyle;
    title?: string;
}

export class Panel extends React.Component<PanelProps, void> {

    spyId = uniqueId("panel_");

    render() {
        const {blockName, buttonsPosition = "top", children, loading, saving, title, showHelp, editing, toggleEdit, save, hideOnScrollspy, hideProgressBar, theme} = this.props;

        const buttons = (
            <div className={theme!.actions!}>
                <PanelButtons saving={saving} editing={editing} toggleEdit={toggleEdit} save={save}/>
            </div>
        );

        const areButtonsTop = ["top", "both"].find(i => i === buttonsPosition);
        const areButtonsDown = ["bottom", "both"].find(i => i === buttonsPosition);

        const spy = hideOnScrollspy ? {} : {"data-spy": this.spyId};

        return (
            <div className={`${theme!.panel!} ${loading || saving ? theme!.busy! : ""}`} {...spy}>
                {!hideProgressBar && (loading || saving) ? <ProgressBar mode="indeterminate" theme={{indeterminate: theme!.progress!}} /> : null}
                {title || areButtonsTop ?
                    <div className={`${theme!.title!} ${theme!.top!}`}>
                        {title ?
                            <h3 data-spy-title>
                                {i18n.t(title)}
                                {showHelp ?
                                    <ButtonHelp blockName={blockName || snakeCase(i18n.t(title)).split("_")[0]} />
                                : null}
                            </h3>
                        : null}
                        {areButtonsTop ? buttons : null}
                    </div>
                : null}
                <div className={theme!.content!}>
                    {children}
                </div>
                {areButtonsDown ?
                    <div className={`${theme!.title!} ${theme!.bottom!}`}>
                        {buttons}
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("panel", styles)(Panel);
