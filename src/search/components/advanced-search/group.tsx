import i18n = require("i18next");
import * as React from "react";

import Button from "focus-components/button";

import {actions, container} from "./style/group.css";

export interface Props {
    canShowMore: boolean;
    count: number;
    groupKey: string;
    groupLabel: string;
    showAllHandler?: (groupKey: string) => void;
    showMoreHandler: () => void;
    children?: React.ClassicElement<any>[];
};

export function GroupComponent({canShowMore, count, children, groupKey, groupLabel, showAllHandler, showMoreHandler}: Props) {
    return (
        <div className={container}>
            <h3>{`${groupLabel} (${count || 0})`}</h3>
            <div>
                {children}
            </div>
            <div className={actions}>
                {canShowMore ?
                    <Button icon="add" handleOnClick={showMoreHandler} label={i18n.t("show.more")} />
                : null}
                {showAllHandler ?
                    <Button icon="arrow_forward" handleOnClick={() => showAllHandler && showAllHandler(groupKey)} label={i18n.t("show.all")} />
                : null}
            </div>
        </div>
    );
}
