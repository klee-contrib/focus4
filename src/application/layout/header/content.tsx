import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

export const HeaderContent = observer(() => {
    return (
        <div data-focus="header-content">
            {applicationStore.cartridge}
        </div>
    );
});
