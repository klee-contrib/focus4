import * as React from "react";

import {translate} from "../../..";
import * as defaults from "../../../defaults";

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
    const {Button} = defaults;
    if (!Button) {
        throw new Error("Le composant Button n'ont pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
    }

    return (
        <div data-focus="group-container">
            <h3>{`${groupLabel} (${count || 0})`}</h3>
            <div data-focus="group-container-results">
                {children}
            </div>
            <div data-focus="group-container-actions">
                {canShowMore ?
                    <Button icon="add" handleOnClick={showMoreHandler} label={translate("show.more")} />
                : null}
                {showAllHandler ?
                    <Button icon="arrow_forward" handleOnClick={() => showAllHandler && showAllHandler(groupKey)} label={translate("show.all")} />
                : null}
            </div>
        </div>
    );
}
