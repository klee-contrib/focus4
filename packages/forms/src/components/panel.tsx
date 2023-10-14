import i18next from "i18next";
import {snakeCase} from "lodash";
import {ComponentType, PropsWithChildren, useContext, useEffect, useRef} from "react";

import {CSSProp, ScrollspyContext, useTheme} from "@focus4/styling";
import {LinearProgressIndicator} from "@focus4/toolbox";

import {PanelButtons, PanelButtonsProps} from "./panel-buttons";

import panelCss, {PanelCss} from "./__style__/panel.css";
export {panelCss, PanelCss};

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
    /** Identifiant du panel. Par défaut : premier mot du titre, si renseigné. */
    name?: string;
    /** CSS. */
    theme?: CSSProp<PanelCss>;
    /** Titre du panel. */
    title?: string;
}

/** Le composant standard pour afficher un bloc avec un titre, des actions et un contenu. Utilisé largement par les formulaires. */
export function Panel({
    Buttons = PanelButtons,
    buttonsPosition = "top",
    children,
    editing,
    i18nPrefix,
    hideOnScrollspy,
    hideProgressBar,
    loading,
    name,
    onClickCancel,
    onClickEdit,
    save,
    title,
    theme: pTheme
}: PropsWithChildren<PanelProps>) {
    if (!name && title) {
        name = snakeCase(i18next.t(title)).split("_")[0];
    }

    const ref = useRef<HTMLDivElement>(null);
    const theme = useTheme("panel", panelCss, pTheme);

    /** On récupère le contexte posé par le scrollspy parent. */
    const scrollSpyContext = useContext(ScrollspyContext);

    /** On s'enregistre dans le scrollspy. */
    useEffect(() => {
        if (!hideOnScrollspy && name) {
            return scrollSpyContext.registerPanel(name, {title, node: ref.current!});
        }
    }, [hideOnScrollspy, title]);

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

    const areButtonsTop = ["top", "both"].find(i => i === buttonsPosition);
    const areButtonsDown = ["bottom", "both"].find(i => i === buttonsPosition);

    return (
        <div ref={ref} className={theme.panel({loading, editing})} id={name ? `panel-${name}` : undefined}>
            {!!title || areButtonsTop ? (
                <div className={theme.title({top: true})}>
                    {title ? <h3>{i18next.t(title)}</h3> : null}
                    {areButtonsTop ? buttons : null}
                </div>
            ) : null}
            <div className={theme.content()}>
                {!hideProgressBar && loading ? (
                    <LinearProgressIndicator indeterminate theme={{linear: theme.progress()}} />
                ) : null}
                {children}
            </div>
            {areButtonsDown ? <div className={theme.title({bottom: true})}>{buttons}</div> : null}
        </div>
    );
}
