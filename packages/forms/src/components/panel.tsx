import i18next from "i18next";
import {snakeCase} from "lodash";
import * as React from "react";

import {CSSProp, ScrollspyContext, useTheme} from "@focus4/styling";
import {ProgressBar} from "@focus4/toolbox";

import {ButtonHelp} from "./button-help";
import {PanelButtons, PanelButtonsProps} from "./panel-buttons";

import panelCss, {PanelCss} from "./__style__/panel.css";
export {panelCss, PanelCss};

/** Props du panel. */
export interface PanelProps extends PanelButtonsProps {
    /** Boutons à afficher dans le Panel. Par défaut : les boutons de formulaire (edit / save / cancel). */
    Buttons?: React.ComponentType<PanelButtonsProps>;
    /** Position des boutons. Par défaut : "top". */
    buttonsPosition?: "both" | "bottom" | "top" | "none";
    /** Masque le panel dans le ScrollspyContainer. */
    hideOnScrollspy?: boolean;
    /** Masque la progress bar lors du chargement/sauvegarde. */
    hideProgressBar?: boolean;
    /** Identifiant du panel. Par défaut : premier mot du titre, si renseigné. */
    name?: string;
    /** Affiche le bouton d'aide. */
    showHelp?: boolean;
    /** CSS. */
    theme?: CSSProp<PanelCss>;
    /** Titre du panel. */
    title?: string;
}

/** Construit un Panel avec un titre et des actions. */
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
    showHelp,
    title,
    theme: pTheme
}: React.PropsWithChildren<PanelProps>) {
    if (!name && title) {
        name = snakeCase(i18next.t(title)).split("_")[0];
    }

    const [isInForm, setIsInForm] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const theme = useTheme("panel", panelCss, pTheme);

    /** On récupère le contexte posé par le scrollspy parent. */
    const scrollSpyContext = React.useContext(ScrollspyContext);

    /** On s'enregistre dans le scrollspy. */
    React.useEffect(() => {
        if (!hideOnScrollspy && name) {
            return scrollSpyContext.registerPanel(name, {title, node: ref.current!});
        }
    }, [hideOnScrollspy, title]);

    /* On essaie de savoir si ce panel est inclus dans un formulaire. */
    React.useEffect(() => {
        let parentNode: HTMLElement | null = ref.current;
        while (parentNode && parentNode.tagName !== "FORM") {
            parentNode = parentNode.parentElement;
        }
        if (parentNode) {
            setIsInForm(true);
        }
    }, []);

    const buttons = (
        <div className={theme.actions()}>
            <Buttons
                editing={editing}
                i18nPrefix={i18nPrefix}
                loading={loading}
                onClickCancel={onClickCancel}
                onClickEdit={onClickEdit}
                save={!isInForm ? save : undefined}
            />
        </div>
    );

    const areButtonsTop = ["top", "both"].find(i => i === buttonsPosition);
    const areButtonsDown = ["bottom", "both"].find(i => i === buttonsPosition);

    return (
        <div ref={ref} id={name ? `panel-${name}` : undefined} className={theme.panel({loading, editing})}>
            {!hideProgressBar && loading ? (
                <ProgressBar mode="indeterminate" theme={{indeterminate: theme.progress()}} />
            ) : null}
            {title || areButtonsTop ? (
                <div className={theme.title({top: true})}>
                    {title ? (
                        <h3>
                            <span>{i18next.t(title)}</span>
                            {showHelp && name ? <ButtonHelp blockName={name} i18nPrefix={i18nPrefix} /> : null}
                        </h3>
                    ) : null}
                    {areButtonsTop ? buttons : null}
                </div>
            ) : null}
            <div className={theme.content()}>{children}</div>
            {areButtonsDown ? <div className={theme.title({bottom: true})}>{buttons}</div> : null}
        </div>
    );
}
