import {autobind} from "core-decorators";
import i18n from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";

import * as styles from "./__style__/popin.css";
export {styles};

export type PopinStyle = Partial<typeof styles>;

/** Props de la popin. */
export interface PopinProps {
    /** Handler de fermeture de la popin. */
    closePopin: () => void;
    /** Préfixe i18n pour l'icône de fermeture. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Niveau de la popin, pour savoir dans combien d'autres popins elle se trouve. Par défaut : 0 */
    level?: number;
    /** Popin ouverte (ou fermée). */
    opened: boolean;
    /** CSS. */
    theme?: PopinStyle;
    /** Type de popin. Par défaut : "from-right" */
    type?: "from-right" | "from-left" | "center";
}

/** Affiche son contenu dans une popin, dont l'ouverture est contrôlée par ses props. */
@themr("popin", styles)
@autobind
@observer
export class Popin extends React.Component<PopinProps, {}> {

    /** ID du timeout d'ouverture/fermeture en cours. */
    private openTimeoutID: any;

    /** Popin ouverte. N'est pas directement lié à `this.props.opened` à cause des états intermédiaires. */
    @observable opened = false;
    /** Popin en cours d'ouverture. */
    @observable willOpen = false;
    /** Popin en cours de fermeture. */
    @observable willClose = false;

    componentWillUnmount() {
        window.clearTimeout(this.openTimeoutID);
        if (this.opened || this.willOpen) {
            this.restoreBodyOverflow();
        }
    }

    componentWillMount() {
        if (this.props.opened) {
            this.toggleOpen(this.props.opened);
        }
    }

    componentWillReceiveProps({opened}: PopinProps) {
        if (opened !== this.props.opened) {
            this.toggleOpen(opened);
        }
    }

    /**
     * Ouvre ou ferme la popin.
     * @param opened Nouvel état de la popin.
     */
    private toggleOpen(opened: boolean) {
        if (opened) {
            this.willOpen = true;
            this.openTimeoutID = setTimeout(() => this.willOpen = false, 200); // La popin s'ouvre en 200ms.
            this.opened = true;
            this.hideBodyOverflow();
        } else {
            this.willClose = true;
            this.restoreBodyOverflow();
            this.openTimeoutID = setTimeout(() => {
                this.opened = false;
                this.willClose = false;
            }, 200);
        }
    }

    /** Masque l'overflow (selon l'axe Y) du body et de l'éventuelle popin parente. */
    private hideBodyOverflow() {
        // Si level > 0, alors on a une popin parente et on va la chercher.
        if (this.props.level) {
            let parentPopin = findDOMNode(this) as HTMLElement | null;
            // La popin qu'on cherche est celle de niveau n - 1.
            while (parentPopin && parentPopin.getAttribute("data-level") !== `${this.props.level - 1}`) {
                parentPopin = parentPopin.parentElement;
            }
            // Si on l'a trouvée, alors on masque son overflow.
            if (parentPopin) {
                parentPopin.style.overflowY = "hidden";
                return;
            }
        }

        document.body.style.overflowY = "hidden";
    }

    /** Restore l'overflow (selon l'axe Y) du body et de l'éventuelle popin parente */
    private restoreBodyOverflow() {
        if (this.props.level) {
            let parentPopin = findDOMNode(this) as HTMLElement | null;
            while (parentPopin && parentPopin.getAttribute("data-level") !== `${this.props.level - 1}`) {
                parentPopin = parentPopin.parentElement;
            }
            if (parentPopin) {
                parentPopin.style.overflowY = "auto";
                return;
            }
        }

        document.body.style.overflowY = "auto";
    }

    /** Récupère les deux animations d'ouverture et de fermeture selon le type de popin. */
    private get animations() {
        const {type = "from-right"} = this.props;
        switch (type) {
            case "from-right":
                return {
                    open: "slideInRight",
                    close: "slideOutRight"
                };
            case "from-left":
                return {
                    open: "slideInLeft",
                    close: "slideOutLeft"
                };
            case "center":
                return {
                    open: "zoomIn",
                    close: "zoomOut"
                };
            default:
                return {open: "", close: ""};
        }
    }

    render() {
        const {i18nPrefix = "focus", level = 0, children, closePopin, theme, type = "from-right"} = this.props;
        const {open, close} = this.animations;
        return this.opened ?
            <div>
                <div
                    className={`${theme!.overlay!} animated ${this.willClose ? "fadeOut" : this.willOpen ? "fadeIn" : ""}`}
                    onClick={closePopin}
                    style={level > 0 ? {background: "none"} : {}}
                />
                <div
                    data-level={level}
                    className={`${theme!.popin!} ${type === "from-right" ? theme!.right! : type === "from-left" ? theme!.left! : type === "center" ? theme!.center! : ""} animated ${this.willClose ? close : this.willOpen ? open : ""}`}
                    onClick={e => e.stopPropagation()}
                >
                    {type !== "center" ? <Button icon={i18n.t(`${i18nPrefix}.icons.popin.close.name`)} iconLibrary={i18n.t(`${i18nPrefix}.icons.popin.close.library`)} shape="mini-fab" type="button" onClick={closePopin} /> : null}
                    <div>{children}</div>
                </div>
            </div>
        : <div />;
    }
}
