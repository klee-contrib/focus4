import i18n from "i18next";
import * as React from "react";

import Button from "focus-components/button";

import {injectStyle} from "../../../theming";

import * as styles from "./style/group.css";
export type GroupComponentStyle = typeof styles;

export interface GroupComponentProps {
    canShowMore: boolean;
    classNames?: GroupComponentStyle;
    count: number;
    groupKey: string;
    groupLabel: string;
    showAllHandler?: (groupKey: string) => void;
    showMoreHandler: () => void;
    children?: React.ClassicElement<any>[];
};

export const GroupComponent = injectStyle("groupComponent", ({
    canShowMore, classNames, count, children, groupKey, groupLabel, showAllHandler, showMoreHandler
}: GroupComponentProps) => (
    <div className={`${styles.container} ${classNames!.container || ""}`}>
        <h3>{`${groupLabel} (${count || 0})`}</h3>
        <div>
            {children}
        </div>
        <div className={`${styles.actions} ${classNames!.actions || ""}`}>
            {canShowMore ?
                <Button icon="add" handleOnClick={showMoreHandler} label={i18n.t("show.more")} />
            : null}
            {showAllHandler ?
                <Button icon="arrow_forward" handleOnClick={() => showAllHandler && showAllHandler(groupKey)} label={i18n.t("show.all")} />
            : null}
        </div>
    </div>
));
