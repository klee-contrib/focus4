import * as React from "react";

import {MessageCenterProps} from "../message";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;
export {styles};

export interface LayoutProps extends MessageCenterProps {
    children?: React.ReactNode;
    theme?: LayoutStyle;
}

/** Valeur par défaut du contexte du layout. */
export const layoutContextInit = {
    header: {
        marginBottom: 50,
        topRowHeight: 60
    },
    layout: {
        contentPaddingTop: 10,
        menuWidth: undefined as number | undefined
    }
};

export const LayoutContext = React.createContext(layoutContextInit);
