import i18next from "i18next";
import {snakeCase} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {ProgressBar} from "react-toolbox/lib/progress_bar";

import {themr} from "../../theme";

import {ButtonHelp} from "../button-help";
import {ScrollspyContext} from "../scroll-contexts";
import {PanelButtons, PanelButtonsProps} from "./buttons";
export {PanelButtons};

import * as styles from "../__style__/panel.css";
export type PanelStyle = Partial<typeof styles>;
const Theme = themr("panel", styles);

/** Props du panel. */
export interface PanelProps extends PanelButtonsProps {
    /** Nom du bloc pour le bouton d'aide. Par défaut : premier mot du titre. */
    blockName?: string;
    /** Boutons à afficher dans le Panel. Par défaut : les boutons de formulaire (edit / save / cancel). */
    Buttons?: React.ComponentType<PanelButtonsProps>;
    /** Position des boutons. Par défaut : "top". */
    buttonsPosition?: "both" | "bottom" | "top" | "none";
    /** Masque le panel dans le ScrollspyContainer. */
    hideOnScrollspy?: boolean;
    /** Masque la progress bar lors du chargement/sauvegarde. */
    hideProgressBar?: boolean;
    /** Affiche le bouton d'aide. */
    showHelp?: boolean;
    /** Id du panel dans le scrollspy, si besoin de l'identfier. */
    sscId?: string;
    /** CSS. */
    theme?: PanelStyle;
    /** Titre du panel. */
    title?: string;
}

export interface PanelDescriptor {
    node: HTMLDivElement;
    title?: string;
}

/** Construit un Panel avec un titre et des actions. */
@observer
export class Panel extends React.Component<PanelProps> {
    protected id = this.props.sscId;

    @observable protected isInForm = false;

    /** On récupère le contexte posé par le scrollspy parent. */
    static contextType = ScrollspyContext;
    context!: React.ContextType<typeof ScrollspyContext>;

    /** On s'enregistre dans le scrollspy. */
    componentDidMount() {
        const {hideOnScrollspy, title} = this.props;
        if (!hideOnScrollspy) {
            this.id = this.context.registerPanel({title, node: findDOMNode(this) as HTMLDivElement}, this.id);
        }

        // On essaie de savoir si ce panel est inclus dans un formulaire.
        let parentNode = findDOMNode(this) as HTMLElement | null;
        while (parentNode && parentNode.tagName !== "FORM") {
            parentNode = parentNode.parentElement;
        }
        if (parentNode) {
            this.isInForm = true;
        }
    }

    /** On se met à jour dans le scrollspy. */
    componentWillReceiveProps({hideOnScrollspy, title}: PanelProps) {
        if (!hideOnScrollspy && title !== this.props.title && this.id) {
            this.context.updatePanel(this.id, {title, node: findDOMNode(this) as HTMLDivElement});
        }
    }

    /** On se retire du scrollspy. */
    componentWillUnmount() {
        if (!this.props.hideOnScrollspy && this.id) {
            this.context.removePanel(this.id);
        }
    }

    render() {
        const {
            blockName,
            Buttons = PanelButtons,
            buttonsPosition = "top",
            children,
            i18nPrefix,
            loading,
            title,
            showHelp,
            editing,
            onClickCancel,
            onClickEdit,
            save,
            hideProgressBar
        } = this.props;

        const buttons = (theme: PanelStyle) => (
            <div className={theme.actions}>
                <Buttons
                    editing={editing}
                    i18nPrefix={i18nPrefix}
                    loading={loading}
                    onClickCancel={onClickCancel}
                    onClickEdit={onClickEdit}
                    save={!this.isInForm ? save : undefined}
                />
            </div>
        );

        const areButtonsTop = ["top", "both"].find(i => i === buttonsPosition);
        const areButtonsDown = ["bottom", "both"].find(i => i === buttonsPosition);

        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={`${theme.panel} ${loading ? theme.busy : ""} ${editing ? theme.edit : ""}`}>
                        {!hideProgressBar && loading ? (
                            <ProgressBar mode="indeterminate" theme={{indeterminate: theme.progress}} />
                        ) : null}
                        {title || areButtonsTop ? (
                            <div className={`${theme.title} ${theme.top}`}>
                                {title ? (
                                    <h3>
                                        <span data-spy-title>{i18next.t(title)}</span>
                                        {showHelp ? (
                                            <ButtonHelp
                                                blockName={blockName || snakeCase(i18next.t(title)).split("_")[0]}
                                                i18nPrefix={i18nPrefix}
                                            />
                                        ) : null}
                                    </h3>
                                ) : null}
                                {areButtonsTop ? buttons(theme) : null}
                            </div>
                        ) : null}
                        <div className={theme.content}>{children}</div>
                        {areButtonsDown ? (
                            <div className={`${theme.title} ${theme.bottom}`}>{buttons(theme)}</div>
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
}
