import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {IconButton} from "react-toolbox/lib/button";
import Portal from "react-toolbox/lib/hoc/Portal";

import {themr} from "../theme";

import {getIcon} from "./icon";
import {Scrollable} from "./scrollable";

import * as styles from "./__style__/popin.css";
export type PopinStyle = Partial<typeof styles>;
const Theme = themr("popin", styles);

/** Props de la popin. */
export interface PopinProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 200. */
    backToTopOffset?: number;
    /** Handler de fermeture de la popin. */
    closePopin: () => void;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** N'affiche pas l'overlay (utile si la popin est dans une autre popin). */
    hideOverlay?: boolean;
    /** Préfixe i18n pour l'icône de fermeture. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Popin ouverte (ou fermée). */
    opened: boolean;
    /** Supprime le clic sur l'overlay pour fermer la popin. */
    preventOverlayClick?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: PopinStyle;
    /** Type de popin. Par défaut : "from-right" */
    type?: "from-right" | "from-left";
}

/** Affiche son contenu dans une popin, dont l'ouverture est contrôlée par ses props. */
@observer
export class Popin extends React.Component<PopinProps> {
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
    @action.bound
    private toggleOpen(opened: boolean) {
        if (opened) {
            this.willOpen = true;
            this.openTimeoutID = setTimeout(() => (this.willOpen = false), 200); // La popin s'ouvre en 200ms.
            this.opened = true;
        } else {
            this.willClose = true;
            this.openTimeoutID = setTimeout(() => {
                this.opened = false;
                this.willClose = false;
            }, 200);
        }
    }

    /** Récupère les deux animations d'ouverture et de fermeture selon le type de popin. */
    private animation(theme: PopinStyle) {
        const {type = "from-right"} = this.props;
        let open;
        let close;
        switch (type) {
            case "from-right":
                open = theme.slideInRight;
                close = theme.slideOutRight;
                break;
            case "from-left":
                open = theme.slideInLeft;
                close = theme.slideOutLeft;
                break;
        }

        if (this.willClose) {
            return close;
        } else if (this.willOpen) {
            return open;
        } else {
            return "";
        }
    }

    render() {
        const {
            backToTopOffset,
            children,
            closePopin,
            hideBackToTop,
            hideOverlay,
            i18nPrefix = "focus",
            preventOverlayClick,
            scrollBehaviour,
            type = "from-right"
        } = this.props;
        return this.opened ? (
            <Portal>
                <Theme theme={this.props.theme}>
                    {theme => (
                        <>
                            <div
                                className={`${theme.overlay} ${
                                    this.willClose ? theme.fadeOut : this.willOpen ? theme.fadeIn : ""
                                }`}
                                onClick={(!preventOverlayClick && closePopin) || undefined}
                                style={hideOverlay ? {background: "none"} : {}}
                            >
                                {!this.willOpen ? (
                                    <IconButton
                                        icon={getIcon(`${i18nPrefix}.icons.popin.close`)}
                                        onClick={closePopin}
                                    />
                                ) : null}
                            </div>
                            <Scrollable
                                backToTopOffset={backToTopOffset}
                                className={`${theme.popin} ${
                                    type === "from-right" ? theme.right : type === "from-left" ? theme.left : ""
                                } ${this.animation(theme) || ""}`}
                                hideBackToTop={hideBackToTop}
                                scrollBehaviour={scrollBehaviour}
                            >
                                {children}
                            </Scrollable>
                        </>
                    )}
                </Theme>
            </Portal>
        ) : (
            <div />
        );
    }
}
