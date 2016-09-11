import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

export const HeaderTopRow = observer(() => {
    const {barLeft, barRight, summary} = applicationStore;
    return (
        <div data-focus="header-top-row">
            <div>
                <div data-focus="header-top-row-left">
                    {barLeft}
                </div>
                <div data-focus="header-top-row-right">
                    {barRight}
                </div>
                <div data-focus="header-top-row-middle">
                    {summary}
                </div>
            </div>
        </div>
    );
});
