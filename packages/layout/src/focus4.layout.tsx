import {FocusCSSContext, ThemeProvider} from "@focus4/styling";

import {LayoutBase, LayoutProps} from "./presentation";

export {HeaderActions, HeaderContent, HeaderCss, HeaderItem, HeaderScrolling, HeaderTopRow, headerCss} from "./header";
export {MainMenu, MainMenuItem, MainMenuProps, MainMenuCss, mainMenuCss} from "./menu";
export {
    Content,
    Dialog,
    DialogCss,
    LayoutBase,
    LayoutProps,
    LayoutCss,
    OverlayCss,
    Popin,
    PopinCss,
    ScrollspyContainer,
    ScrollspyCss,
    dialogCss,
    layoutCss,
    overlayCss,
    popinCss,
    scrollspyCss
} from "./presentation";
export {ButtonBttCss, Scrollable, ScrollableProps, ScrollableCss, buttonBttCss, scrollableCss} from "./scrollable";
export {translation} from "./translation";
export {MessageCenter, MessageCenterProps} from "./utils";

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
