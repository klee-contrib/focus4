import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

import {topRow, item, left, middle, right} from "./style/header.css";

export const HeaderTopRow = observer(() => {
    const {barLeft, barRight, summary} = applicationStore;
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
});
