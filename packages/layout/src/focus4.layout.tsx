import {FocusCSSContext, ThemeProvider} from "@focus4/styling";

import {LayoutBase, LayoutProps} from "./presentation";

export {HeaderActions, HeaderContent, headerCss, HeaderItem, HeaderScrolling, HeaderTopRow} from "./header";
export {MainMenu, mainMenuCss, MainMenuItem} from "./menu";
export {Panel, PanelButtons, panelCss, ScrollspyContainer, scrollspyCss, ScrollspyMenu} from "./panels";
export {
    Content,
    Dialog,
    dialogCss,
    FilAriane,
    filArianeCss,
    LateralMenu,
    lateralMenuCss,
    layoutCss,
    Overlay,
    overlayCss,
    Popin,
    popinCss,
    Scrollable,
    scrollableCss,
    useActiveTransition,
    useOverlay,
    useStickyClip
} from "./presentation";
export {i18nLayout} from "./translation";
export {HeaderContext, MessageCenter, OverlayContext, ScrollableContext, ScrollspyContext} from "./utils";
export {LayoutBase};

export type {HeaderCss} from "./header";
export type {MainMenuCss, MainMenuProps} from "./menu";
export type {PanelButtonsProps, PanelCss, PanelProps, ScrollspyContainerProps, ScrollspyContainerRef} from "./panels";
export type {
    DialogCss,
    FilArianeCss,
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
 * Le `Layout` est le composant racine d'une application Focus. Tous vos composants seront à priori posé dans le `Layout`.
 *
 * Le `Layout` :
 * - Pose un [`Scrollable`](/docs/mise-en-page-scrollable--docs), qui prend tout l'écran (100wh x 100vh) et "remplace" la scrollbar native de la page.
 * - Pose le `MessageCenter`, qui est le composant qui permet d'afficher les [messages](/docs/les-bases-gestion-des-messages--docs).
 * - Pose un  [`ThemeProvider`](/docs/css-le-css-de-focus--docs#surcharge-globale), pour gérer les surcharges de CSS Focus.
 * - Optionnellement, peut poser un `menu` fixe, à gauche, dans lequel vous pourrez y passer une instance de [`MainMenu`](/docs/mise-en-page-menu-principal--docs) par exemple.
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
