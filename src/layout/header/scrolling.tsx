import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderStyle, styles} from "./types";

/** Props du conteneur de header. */
export interface HeaderScrollingProps {
    /** Précise si le header peut se déployer ou non. */
    canDeploy?: boolean;
    /** Handler qui sera appelé à chaque dépliement/repliement. */
    notifySizeChange?: (isDeployed?: boolean) => void;
    /** Sélecteur de l'élément de DOM sur lequel on écoute le scroll (par défaut : window) */
    scrollTargetSelector?: string;
    /** Classes CSS. */
    theme?: HeaderStyle;
}

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
@autobind
@observer
export class HeaderScrolling extends React.Component<HeaderScrollingProps, void> {

    /** Seuil de déploiement, calculé à partir de la hauteur du header. */
    @observable deployThreshold: number;
    /** Header déployé. */
    @observable isDeployed = true;
    /** Hauteur du div vide à placer sous le header en mode replié, pour conserver la continuité. */
    @observable placeholderHeight: number;

    /** Header dans le DOM. */
    private header?: Element | null;
    /** Elément de DOM sur lequel on écoute le scroll */
    private scrollTargetNode: Element | Window;

    componentWillMount() {
        this.handleScroll();
        const {scrollTargetSelector} = this.props;
        this.scrollTargetNode = (scrollTargetSelector && scrollTargetSelector !== "") ? document.querySelector(scrollTargetSelector)! : window;
    }

    componentDidMount() {
        this.scrollTargetNode.addEventListener("scroll", this.listener);
        this.scrollTargetNode.addEventListener("resize", this.listener);
    }

    componentWillReceiveProps({canDeploy}: HeaderScrollingProps) {
        if (this.props.canDeploy !== canDeploy) {
            this.handleScroll(canDeploy);
        }
    }

    componentWillUnmount() {
        this.scrollTargetNode.removeEventListener("scroll", this.listener);
        this.scrollTargetNode.removeEventListener("resize", this.listener);
    }

    listener() {
        this.handleScroll();
    }

    /** Recalcule l'état du header, appelé à chaque scroll, resize ou changement de `canDeploy`. */
    handleScroll(canDeploy?: boolean) {

        // Si on est déployé, on recalcule le seuil de déploiement.
        if (this.isDeployed) {
            this.deployThreshold = this.header ? this.header.clientHeight - 60 : 1000;
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
        const {canDeploy, theme} = this.props;
        return (
            <header ref={header => this.header = header} className={`${theme!.scrolling} ${this.isDeployed ? theme!.deployed : theme!.undeployed}`}>
                {this.props.children}
                {!this.isDeployed ? <div style={{height: canDeploy ? this.placeholderHeight : 60, width: "100%"}} /> : null}
            </header>
        );
    }
}

export default themr("header", styles)(HeaderScrolling);
