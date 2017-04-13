import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

/** Barre du haut dans le header. Affiche `barLeft`, `barRight` et `summary` (si replié). */
export const HeaderTopRow = observer<{classNames: {topRow: string; item: string; left: string; middle: string; right: string}}>(
    ({classNames}) => {
        const {barLeft, barRight, summary} = applicationStore;
        const {item, left, middle, right, topRow} = classNames;
        return (
            <div className={topRow}>
                <div>
                    <div className={`${item} ${left}`}>
                        {barLeft}
                    </div>
                    <div className={`${item} ${right}`}>
                        {barRight}
                    </div>
                    <div className={`${item} ${middle}`}>
                        {summary}
                    </div>
                </div>
            </div>
        );
    }
);
