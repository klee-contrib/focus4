import {action, observable} from "mobx";
import PropTypes from "prop-types";
import * as React from "react";
import {themr} from "../../theme";

import * as styles from "./__style__/header.css";
export type HeaderStyle = Partial<typeof styles>;
const Theme = themr("header", styles);

/** Props du conteneur de header. */
export interface HeaderScrollingProps {
    /** Précise si le header peut se déployer ou non. */
    canDeploy?: boolean;
    /** Handler qui sera appelé à chaque dépliement/repliement. */
    notifySizeChange?: (isDeployed?: boolean) => void;
    /** Sélecteur de l'élément de DOM sur lequel on écoute le scroll (par défaut : window) */
    scrollTargetSelector?: string;
    /** Classes CSS. */
    theme?: {
        deployed?: string;
        scrolling?: string;
        undeployed?: string;
    };
}

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
export class HeaderScrolling extends React.Component<HeaderScrollingProps> {

    static contextTypes = {
        header: PropTypes.object
    };

    context!: {
        header: {
            marginBottom: number,
            topRowHeight: number
        }
    };

    /** Seuil de déploiement, calculé à partir de la hauteur du header. */
    @observable deployThreshold = 1000;
    /** Header déployé. */
    @observable isDeployed = true;
    /** Hauteur du div vide à placer sous le header en mode replié, pour conserver la continuité. */
    @observable placeholderHeight = 1000;

    /** Header dans le DOM. */
    private header?: Element | null;
    /** Elément de DOM sur lequel on écoute le scroll */
    private readonly scrollTargetNode = this.props.scrollTargetSelector ? document.querySelector(this.props.scrollTargetSelector)! : window;

    componentWillMount() {
        this.handleScroll();
    }

    componentDidMount() {
        this.scrollTargetNode.addEventListener("scroll", this.handleScroll);
        this.scrollTargetNode.addEventListener("resize", this.handleScroll);

        const marginBottom = window.getComputedStyle(this.header!).marginBottom;
        this.context.header.marginBottom = marginBottom && marginBottom.endsWith("px") && +marginBottom.replace("px", "") || 0;
    }

    componentWillReceiveProps({canDeploy}: HeaderScrollingProps) {
        if (this.props.canDeploy !== canDeploy) {
            this.handleScroll(canDeploy);
        }
    }

    componentWillUnmount() {
        this.scrollTargetNode.removeEventListener("scroll", this.handleScroll);
        this.scrollTargetNode.removeEventListener("resize", this.handleScroll);
    }

    /** Recalcule l'état du header, appelé à chaque scroll, resize ou changement de `canDeploy`. */
    @action.bound
    handleScroll(canDeploy?: boolean | Event) {
        if (canDeploy !== true && canDeploy !== false) {
            canDeploy = undefined;
        }

        // Si on est déployé, on recalcule le seuil de déploiement.
        if (this.isDeployed) {
            this.deployThreshold = this.header ? this.header.clientHeight - this.context.header.topRowHeight : 1000;
            this.placeholderHeight = this.header ? this.header.clientHeight : 1000;
        }

        // On détermine si on a dépassé le seuil.
        const top = window.pageYOffset || document.documentElement.scrollTop;
        const isDeployed = (canDeploy !== undefined ? canDeploy : this.props.canDeploy) ? top <= this.deployThreshold : false;

        // Et on se met à jour.
        if (isDeployed !== this.isDeployed) {
            this.isDeployed = isDeployed;
            const {notifySizeChange} = this.props;
            if (notifySizeChange) {
                notifySizeChange(this.isDeployed);
            }
        }
    }

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme =>
                    <header ref={header => this.header = header} className={`${theme.scrolling} ${this.isDeployed ? theme.deployed : theme.undeployed}`}>
                        {this.props.children}
                        {!this.isDeployed ? <div style={{height: this.props.canDeploy ? this.placeholderHeight : this.context.header.topRowHeight, width: "100%"}} /> : null}
                    </header>
                }
            </Theme>
        );
    }
}
