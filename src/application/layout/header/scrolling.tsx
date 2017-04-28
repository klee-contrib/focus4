import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {classReaction} from "../../../util";

import {applicationStore} from "../../store";

export interface HeaderScrollingProps {
    /** Handler qui sera appelé à chaque dépliement/repliement. */
    notifySizeChange?: (isDeployed?: boolean) => void;
    /** Sélecteur de l'élément de DOM sur lequel on écoute le scroll (par défaut : window) */
    scrollTargetSelector?: string;
    /** Classes CSS. */
    theme: {scrolling: string; deployed: string; undeployed: string};
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
    private header?: Element;
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

    componentWillUnmount() {
        this.scrollTargetNode.removeEventListener("scroll", this.listener);
        this.scrollTargetNode.removeEventListener("resize", this.listener);
    }

    listener() {
        this.handleScroll();
    }

    /** Recalcule l'état du header, appelé à chaque scroll, resize ou changement de `canDeploy`. */
    @classReaction(() => applicationStore.canDeploy)
    handleScroll(canDeploy?: boolean) {

        // Si on est déployé, on recalcule le seuil de déploiement.
        if (this.isDeployed) {
            this.deployThreshold = this.header ? this.header.clientHeight - 60 : 1000;
            this.placeholderHeight = this.header ? this.header.clientHeight : 1000;
        }

        // On détermine si on a dépassé le seuil.
        const top = window.pageYOffset || document.documentElement.scrollTop;
        const isDeployed = (canDeploy !== undefined ? canDeploy : applicationStore.canDeploy) ? top <= this.deployThreshold : false;

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
        const {isDeployed, placeholderHeight} = this;
        const {canDeploy} = applicationStore;
        const {scrolling, deployed, undeployed} = this.props.theme;
        return (
            <header ref={header => this.header = header} className={`${scrolling} ${isDeployed ? deployed : undeployed}`}>
                {this.props.children}
                {!isDeployed ? <div style={{height: canDeploy ? placeholderHeight : 60, width: "100%"}} /> : null}
            </header>
        );
    }
}
