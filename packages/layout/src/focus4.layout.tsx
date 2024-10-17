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
export {LayoutBase};

export type {HeaderCss} from "./header";
export type {MainMenuProps, MainMenuCss} from "./menu";
export type {PanelButtonsProps, PanelCss, PanelProps, ScrollspyContainerProps, ScrollspyContainerRef} from "./panels";
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
