import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

export const HeaderContent = observer<{className: string}>(
    ({className}) => {
        return (
            <div className={className}>
                {applicationStore.cartridge}
            </div>
        );
    }
);
