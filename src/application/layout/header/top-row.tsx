import {observer} from "mobx-react";
import * as React from "react";

/** Props du HeaderTopRow. */
export interface HeaderTopRowProps {
    /** Composant de header gauche. */
    barLeft: React.ReactElement<any>;
    /** Composant de header droit. */
    barRight: React.ReactElement<any>;
    /** Marge à gauche calculée par la taille du menu. */
    marginLeft: number;
    /** Composant de résumé. */
    summary: React.ReactElement<any>;
    /** CSS. */
    theme: {
        topRow: string;
        item: string;
        left: string;
        middle: string;
        right: string;
    };
}

/** Barre du haut dans le header. Affiche `barLeft`, `barRight` et `summary` (si replié). */
export const HeaderTopRow = observer<HeaderTopRowProps>(
    ({barLeft, barRight, summary, marginLeft, theme}) => {
        const {item, left, middle, right, topRow} = theme;
        return (
            <div className={topRow}>
                <div style={{marginLeft}}>
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
