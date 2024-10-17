import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {layoutCss, LayoutCss} from "./layout";

/**
 * Le `Content` est un conteneur simple, permettant de poser les marges par défaut pour le contenu (`--content-padding-top` et `--content-padding-side`).
 *
 * Ce sont les mêmes marges que celles posées par le [`ScrollspyContainer`](/docs/mise-en-page-scrollspycontainer--docs) et l'[`AdvancedSearch`](/docs/listes-composants-de-recherche-advancedsearch--docs).
 */
export function Content(props: {children?: ReactNode; theme?: CSSProp<LayoutCss>}) {
    const theme = useTheme("layout", layoutCss, props.theme);
    return <div className={theme.content()}>{props.children}</div>;
}
