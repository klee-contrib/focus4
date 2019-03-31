import * as React from "react";

import * as styles from "./__style__/layout.css";
export type LayoutStyle = Partial<typeof styles>;
export {styles};

/** Valeur par défaut du contexte du layout. */
export const layoutContextInit = {
    header: {
        marginBottom: 50,
        topRowHeight: 60
    },
    layout: {
        contentPaddingTop: 10
    }
};

export const LayoutContext = React.createContext(layoutContextInit);
