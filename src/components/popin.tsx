import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "./icon";

import * as styles from "./__style__/popin.css";

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
    /** Supprime le clic sur l'overlay pour fermer la popin. */
    preventOverlayClick?: boolean;
    /** CSS. */
    theme?: PopinStyle;
    /** Type de popin. Par défaut : "from-right" */
    type?: "from-right" | "from-left";
}

/** Affiche son contenu dans une popin, dont l'ouverture est contrôlée par ses props. */
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
        const {type = "from-right", theme} = this.props;
        switch (type) {
            case "from-right":
                return {
                    open: theme!.slideInRight!,
                    close: theme!.slideOutRight!
                };
            case "from-left":
                return {
                    open: theme!.slideInLeft!,
                    close: theme!.slideOutLeft!
                };
            default:
                return {open: "", close: ""};
        }
    }

    render() {
        const {i18nPrefix = "focus", level = 0, children, closePopin, theme, type = "from-right", preventOverlayClick} = this.props;
        const {open, close} = this.animations;
        return this.opened ?
            <div>
                <div
                    className={`${theme!.overlay!} ${this.willClose ? theme!.fadeOut! : this.willOpen ? theme!.fadeIn! : ""}`}
                    onClick={!preventOverlayClick && closePopin || undefined}
                    style={level > 0 ? {background: "none"} : {}}
                />
                <div
                    data-level={level}
                    className={`${theme!.popin!} ${type === "from-right" ? theme!.right! : type === "from-left" ? theme!.left! : ""} ${this.willClose ? close : this.willOpen ? open : ""}`}
                    onClick={e => e.stopPropagation()}
                >
                    {!this.willOpen ?
                        <IconButton
                            icon={getIcon(`${i18nPrefix}.icons.popin.close`)}
                            onClick={closePopin}
                        />
                    : null}
                    <div>{children}</div>
                </div>
            </div>
        : <div />;
    }
}

export default themr("popin", styles)(Popin);
