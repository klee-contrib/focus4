import i18next from "i18next";
import * as React from "react";

import {getIcon, ToBem} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {TimelineCss} from "../__style__/timeline.css";

/** Composant pour le bouton d'ajout sur une timeline. */
export function TimelineAddItem({
    addItemHandler,
    i18nPrefix,
    theme
}: {
    addItemHandler: () => void;
    i18nPrefix: string;
    theme: ToBem<TimelineCss>;
}) {
    return (
        <li className={theme.add()}>
            <div className={theme.badge()} />
            <div className={theme.panel()}>
                <Button
                    primary
                    icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                    label={i18next.t(`${i18nPrefix}.list.add`)}
                    onClick={addItemHandler}
                />
            </div>
        </li>
    );
}
