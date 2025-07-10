import {snakeCase} from "es-toolkit";
import {ComponentType, PropsWithChildren, useContext, useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";

import {CSSProp, useTheme} from "@focus4/styling";
import {FontIcon, Icon, LinearProgressIndicator} from "@focus4/toolbox";

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
    /** Masque le panel dans le ScrollspyContainer. */
    hideOnScrollspy?: boolean;
    /** Masque la progress bar lors du chargement/sauvegarde. */
    hideProgressBar?: boolean;
    /** Affiche une icône devant le titre. */
    icon?: Icon;
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
    children,
    editing,
    i18nPrefix,
    hideOnScrollspy,
    hideProgressBar,
    icon,
    loading,
    name,
    onClickCancel,
    onClickEdit,
    save,
    title,
    theme: pTheme
}: PropsWithChildren<PanelProps>) {
    const {t} = useTranslation();

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
                editing={editing}
                i18nPrefix={i18nPrefix}
                loading={loading}
                onClickCancel={onClickCancel}
                onClickEdit={onClickEdit}
                save={save}
            />
        </div>
    );

    const areButtonsTop = !!["top", "both"].some(i => i === buttonsPosition);
    const areButtonsDown = !!["bottom", "both"].some(i => i === buttonsPosition);

    return (
        <div ref={ref} className={theme.panel({loading, editing})} id={name ? `panel-${name}` : undefined}>
            {!!title || areButtonsTop ? (
                <div className={theme.title({top: true})}>
                    {title ? (
                        <h3>
                            {icon ? <FontIcon className={theme.icon()} icon={icon} /> : null}
                            {t(title)}
                        </h3>
                    ) : null}
                    {areButtonsTop ? buttons : null}
                </div>
            ) : null}
            <div className={theme.content()}>
                {!hideProgressBar && loading ? (
                    <LinearProgressIndicator
                        indeterminate
                        theme={{linear: theme.progress({bottom: !areButtonsTop && areButtonsDown})}}
                    />
                ) : null}
                {children}
            </div>
            {areButtonsDown ? <div className={theme.title({bottom: true})}>{buttons}</div> : null}
        </div>
    );
}
