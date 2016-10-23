import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

import {content} from "./style/header.css";

export const HeaderContent = observer(() => {
    return (
        <div className={content}>
            {applicationStore.cartridge}
        </div>
    );
});
