import {FocusCSSContext, ThemeProvider} from "@focus4/styling";

import {LayoutBase, LayoutProps} from "./presentation";

export {HeaderActions, HeaderContent, HeaderItem, HeaderScrolling, HeaderTopRow, headerCss} from "./header";
export {MainMenu, MainMenuItem, mainMenuCss} from "./menu";
export {Panel, PanelButtons, ScrollspyContainer, ScrollspyMenu, panelCss, scrollspyCss} from "./panels";
export {
    Content,
    Dialog,
    LateralMenu,
    Popin,
    Scrollable,
    dialogCss,
    lateralMenuCss,
    layoutCss,
    overlayCss,
    popinCss,
    scrollableCss,
    useActiveTransition,
    useStickyClip
} from "./presentation";
export {translation} from "./translation";
export {MessageCenter, HeaderContext, ScrollableContext, ScrollspyContext} from "./utils";

export type {HeaderCss} from "./header";
export type {MainMenuProps, MainMenuCss} from "./menu";
export type {PanelButtonsProps, PanelCss, PanelProps, ScrollspyContainerProps} from "./panels";
export type {
    DialogCss,
    LateralMenuCss,
    LateralMenuProps,
    LayoutCss,
    OverlayCss,
    PopinCss,
    ScrollableCss,
    ScrollableProps
} from "./presentation";
export type {MessageCenterProps, PanelDescriptor} from "./utils";

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
