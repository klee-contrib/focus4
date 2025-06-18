import {useObserver} from "mobx-react";
import {PropsWithChildren, useContext} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {Overlay} from "../presentation/overlay";
import {OverlayContext} from "../utils/contexts";

import {MainMenuItem} from "./item";
import {MainMenuList} from "./list";

import mainMenuCss, {MainMenuCss} from "./__style__/main-menu.css";

export {mainMenuCss, MainMenuItem};
export type {MainMenuCss};

/** Props du Menu. */
export interface MainMenuProps {
    /** Précise à la route active, à comparer avec la `route` déclarée dans chaque `MainMenuItem` pour savoir s'il doit être affiché comme actif ou non. */
    activeRoute?: string;
    /** Si renseigné, affiche également l'overlay des `Popin` et des `Dialog` au dessus du `MainMenu`. */
    showOverlay?: boolean;
    /** CSS. */
    theme?: CSSProp<MainMenuCss>;
}

/**
 * Le composant `MainMenu` permet d'afficher un menu vertical. En général, il se pose via la propriété `menu` du composant de [`Layout`](/docs/mise-en-page-layout--docs).
 *
 * Ce composant s'attend à ce qu'on lui pose des `MainMenuItem` comme enfants pour gérer les différents liens du menu, mais il est également possible de passer d'autres enfants pour qu'ils soient également affichés dans le menu (par exemple un logo).
 *
 * Chaque `MainMenuItem` doit être rattaché à une route, qui sera comparé à la valeur de la prop `activeRoute` qui est passée au `MainMenu`. Si `route === activeRoute`, alors l'item sera affiché comme "actif" dans le menu.
 *
 * Il est possible de gérer des sous menus : pour se faire, il suffit de passer d'autres `MainMenuItem` en enfants d'un `MainMenuItem`. Comme pour le `MainMenu`, il est possible également de passer d'autres éléments en enfant d'un `MainMenuItem`.
 */
export function MainMenu({
    activeRoute,
    children,
    showOverlay = false,
    theme: pTheme
}: PropsWithChildren<MainMenuProps>) {
    const theme = useTheme<MainMenuCss>("mainMenu", mainMenuCss, pTheme);
    const overlay = useContext(OverlayContext);
    return useObserver(() => (
        <nav className={theme.menu()}>
            <MainMenuList activeRoute={activeRoute} theme={theme}>
                {children}
            </MainMenuList>
            {showOverlay ? <Overlay active={overlay.activeLevel >= 0} close={overlay.close} /> : null}
        </nav>
    ));
}
