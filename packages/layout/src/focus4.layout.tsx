import {FocusCSSContext, ThemeProvider} from "@focus4/styling";

import {LayoutBase, LayoutProps} from "./presentation";

export {HeaderActions, HeaderContent, HeaderItem, HeaderScrolling, HeaderTopRow, headerCss} from "./header";
export {MainMenu, MainMenuItem, mainMenuCss} from "./menu";
export {
    Content,
    Dialog,
    LayoutBase,
    Popin,
    ScrollspyContainer,
    dialogCss,
    layoutCss,
    overlayCss,
    popinCss,
    scrollspyCss,
    useActiveTransition
} from "./presentation";
export {Scrollable, buttonBttCss, scrollableCss} from "./scrollable";
export {translation} from "./translation";
export {MessageCenter} from "./utils";

export type {HeaderCss} from "./header";
export type {MainMenuProps, MainMenuCss} from "./menu";
export type {DialogCss, LayoutProps, LayoutCss, OverlayCss, PopinCss, ScrollspyCss} from "./presentation";
export type {ButtonBttCss, ScrollableProps, ScrollableCss} from "./scrollable";
export type {MessageCenterProps} from "./utils";

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `appTheme` (il pose un `ThemeProvider`).
 */
export function Layout(
    props: LayoutProps & {
        /** Objet faisant correspondre à un identifiant de composant son objet de classes CSS associé.  */
        appTheme?: Partial<FocusCSSContext>;
    }
) {
    const {appTheme = {}, ...layoutProps} = props;
    return (
        <ThemeProvider appTheme={appTheme}>
            <LayoutBase {...layoutProps} />
        </ThemeProvider>
    );
}
