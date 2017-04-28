import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderActions} from "./actions";
import {HeaderContent} from "./content";
import {HeaderScrolling} from "./scrolling";
import {HeaderTopRow} from "./top-row";

import styles from "./__style__/header.css";
export type HeaderStyle = Partial<typeof styles>;

/** Le header, posé par défaut par le Layout. */
export const Header = themr("header", styles)(({theme}: {theme?: HeaderStyle}) => (
    <HeaderScrolling theme={{
        deployed: theme!.deployed!,
        scrolling: theme!.scrolling!,
        undeployed: theme!.undeployed!
    }}>
        <HeaderTopRow theme={{
            item: theme!.item!,
            left: theme!.left!,
            middle: theme!.middle!,
            right: theme!.right!,
            topRow: theme!.topRow!
        }} />
        <HeaderContent className={theme!.content!} />
        <HeaderActions className={theme!.actions!} />
    </HeaderScrolling>
));
