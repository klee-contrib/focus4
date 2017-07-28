import * as React from "react";
import {themr} from "react-css-themr";

import {applicationStore} from "../../store";
import {HeaderActions} from "./actions";
import {HeaderContent} from "./content";
import {HeaderScrolling} from "./scrolling";
import {HeaderTopRow} from "./top-row";

import styles from "./__style__/header.css";
export type HeaderStyle = Partial<typeof styles>;

/** Le header, posé par défaut par le Layout. */
export const Header = ({i18nPrefix, marginLeft, theme}: {i18nPrefix?: string, marginLeft: number, theme?: HeaderStyle}) => (
    <HeaderScrolling
        canDeploy={applicationStore.canDeploy}
        theme={{
            deployed: theme!.deployed!,
            scrolling: theme!.scrolling!,
            undeployed: theme!.undeployed!
        }}
    >
        <HeaderTopRow
            barLeft={applicationStore.barLeft}
            barRight={applicationStore.barRight}
            marginLeft={marginLeft}
            summary={applicationStore.summary}
            theme={{
                item: theme!.item!,
                left: theme!.left!,
                middle: theme!.middle!,
                right: theme!.right!,
                topRow: theme!.topRow!
            }}
        />
        <HeaderContent
            cartridge={applicationStore.cartridge}
            className={theme!.content!}
            marginLeft={marginLeft}
        />
        <HeaderActions
            className={theme!.actions!}
            i18nPrefix={i18nPrefix}
            primary={applicationStore.actions.primary}
            secondary={applicationStore.actions.secondary}
        />
    </HeaderScrolling>
);

export default themr("header", styles)(Header);
