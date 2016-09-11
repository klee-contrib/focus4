import * as React from "react";

import {HeaderActions} from "./actions";
import {HeaderContent} from "./content";
import {HeaderScrolling} from "./scrolling";
import {HeaderTopRow} from "./top-row";

export function Header() {
    return (
        <HeaderScrolling>
            <HeaderTopRow />
            <HeaderContent />
            <HeaderActions />
        </HeaderScrolling>
    );
}
