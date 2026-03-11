import {snakeCase} from "es-toolkit";
import {motion} from "motion/react";
import {ComponentType, PropsWithChildren, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";

import {CSSProp, getDefaultTransition, useTheme} from "@focus4/styling";
import {FontIcon, Icon, IconButton, LinearProgressIndicator} from "@focus4/toolbox";

import {ScrollspyContext} from "../utils";

import {PanelButtons, PanelButtonsProps} from "./panel-buttons";

import panelCss, {PanelCss} from "./__style__/panel.css";

export {panelCss};
export type {PanelCss};

/** Props du panel. */
export interface PanelProps extends PanelButtonsProps {
    /** Boutons à afficher dans le Panel. Par défaut : les boutons de formulaire (edit / save / cancel). */
    Buttons?: ComponentType<PanelButtonsProps>;
    /** Position des boutons. Par défaut : "top". */
    buttonsPosition?: "both" | "bottom" | "none" | "top";
    /** Si renseigné, le panel pourra être replié. Le panel doit avoir un titre et/ou les boutons en haut pour être repliable. */
    collapsible?: boolean;
    /** Masque le panel dans le ScrollspyContainer. */
    hideOnScrollspy?: boolean;
    /** Masque la progress bar lors du chargement/sauvegarde. */
    hideProgressBar?: boolean;
    /** Affiche une icône devant le titre. */
    icon?: Icon;
    /** Si le panel est initialement replié (le panel doit être repliable). */
    initiallyCollapsed?: boolean;
    /** Identifiant du panel. Par défaut : premier mot du titre, si renseigné. */
    name?: string;
    /** CSS. */
    theme?: CSSProp<PanelCss>;
    /** Titre du panel. */
    title?: string;
}

/**
 * Le Panel est le composant standard pour afficher un bloc.
 *
 * Il peut avoir un titre, des actions (en haut et/ou en bas) et un contenu.
 *
 * Il s'interface nativement avec les actions de formulaire et le [`ScrollspyContainer`](/docs/mise-en-page-scrollspycontainer--docs).
 */
export function Panel({
    Buttons = PanelButtons,
    buttonsPosition = "top",
    collapsible = false,
    children,
    editing,
    i18nPrefix = "focus",
    hideOnScrollspy,
    hideProgressBar,
    icon,
    initiallyCollapsed = false,
    loading,
    name,
    onClickCancel,
    onClickEdit,
    save,
    title,
    theme: pTheme
}: PropsWithChildren<PanelProps>) {
    const areButtonsTop = !!["top", "both"].some(i => i === buttonsPosition);
    const areButtonsDown = !!["bottom", "both"].some(i => i === buttonsPosition);

    const {t} = useTranslation();
    const [collapsed, setCollapsed] = useState(initiallyCollapsed && collapsible && (areButtonsTop || !!title));

    if (!name && title) {
        name = snakeCase(t(title)).split("_")[0];
    }

    const ref = useRef<HTMLDivElement>(null);
    const theme = useTheme("panel", panelCss, pTheme);

    /** On récupère le contexte posé par le scrollspy parent. */
    const scrollSpyContext = useContext(ScrollspyContext);

    /** On s'enregistre dans le scrollspy. */
    useEffect(() => {
        if (!hideOnScrollspy && name) {
            return scrollSpyContext.registerPanel(name, {title, node: ref.current!, icon});
        }
    }, [hideOnScrollspy, title, icon]);

    const buttons = (
        <div className={theme.actions()}>
            <Buttons
                collapsible={collapsible && areButtonsTop}
                editing={editing}
                i18nPrefix={i18nPrefix}
                loading={loading}
                onClickCancel={onClickCancel}
                onClickEdit={onClickEdit}
                save={save}
            />
            {areButtonsTop && collapsible ? (
                <motion.div
                    initial={false}
                    transition={getDefaultTransition()}
                    variants={{opened: {rotate: 0}, closed: {rotate: -180}}}
                >
                    <IconButton
                        icon={{i18nKey: `${i18nPrefix}.icons.button.collapse`}}
                        onClick={() => setCollapsed(c => !c)}
                    />
                </motion.div>
            ) : null}
        </div>
    );

    // La taille du panel replié doit être égale à la hauteur de son titre, donc on récupère sa hauteur dans un `useState`.
    // Par conséquent, on ne l'a pas au premier rendu, et pour éviter une animation initale vers la valeur récupérée avec `initiallyCollapsed: true`,
    // On a besoin de forcer la durée des animations à 0 tant qu'on a pas rendu 2 fois...
    const [titleTop, setTitleTop] = useState<HTMLDivElement | null>(null);
    const titleHeight = titleTop?.clientHeight ?? 0;
    const [renderedOnce, setRenderedOnce] = useState(false);
    const [renderedTwice, setRenderedTwice] = useState(false);
    useLayoutEffect(() => setRenderedOnce(true), []);
    useLayoutEffect(() => {
        if (renderedOnce) {
            setRenderedTwice(true);
        }
    }, [renderedOnce]);

    return (
        <motion.div
            ref={ref}
            animate={collapsed ? "closed" : "opened"}
            initial={false}
            className={theme.panel({loading})}
            id={name ? `panel-${name}` : undefined}
            transition={!renderedTwice ? {duration: 0} : getDefaultTransition()}
            variants={
                collapsible
                    ? {
                          opened: {height: "auto", transitionEnd: {overflow: "visible"}},
                          closed: {height: titleHeight, overflow: "hidden"}
                      }
                    : {}
            }
        >
            {!!title || areButtonsTop ? (
                <div ref={setTitleTop} className={theme.title({top: true})}>
                    {title ? (
                        <h3>
                            {icon ? <FontIcon className={theme.icon()} icon={icon} /> : null}
                            {t(title)}
                        </h3>
                    ) : null}
                    {areButtonsTop ? buttons : null}
                </div>
            ) : null}
            <motion.div
                className={theme.content()}
                initial={false}
                variants={collapsible ? {opened: {opacity: 1}, closed: {opacity: 0}} : {}}
            >
                {!hideProgressBar && loading ? (
                    <LinearProgressIndicator
                        indeterminate
                        theme={{linear: theme.progress({bottom: !areButtonsTop && areButtonsDown})}}
                    />
                ) : null}
                {children}
            </motion.div>
            {areButtonsDown ? <div className={theme.title({bottom: true})}>{buttons}</div> : null}
        </motion.div>
    );
}
