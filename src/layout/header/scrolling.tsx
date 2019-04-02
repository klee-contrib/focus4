import {action, computed, observable} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import * as React from "react";

import {ScrollableContext, Sticky} from "../../components";
import {themr} from "../../theme";

import * as styles from "./__style__/header.css";
export type HeaderStyle = Partial<typeof styles>;
const Theme = themr("header", styles);

/** Props du conteneur de header. */
export interface HeaderScrollingProps {
    /** Précise si le header peut se déployer ou non. */
    canDeploy?: boolean;
    /** Classes CSS. */
    theme?: {
        deployed?: string;
        scrolling?: string;
        undeployed?: string;
    };
}

/** Conteneur du header, gérant en particulier le dépliement et le repliement. */
@observer
export class HeaderScrolling extends React.Component<HeaderScrollingProps> {
    static contextType = ScrollableContext;
    context!: React.ContextType<typeof ScrollableContext>;

    /** Seuil de déploiement, calculé à partir de la hauteur du header. */
    @observable deployThreshold = 1000;
    /** Header déployé. */
    @observable shouldDeploy = true;
    /** Hauteur du div vide à placer sous le header en mode replié, pour conserver la continuité. */
    @observable placeholderHeight = 1000;

    @computed
    get isDeployed() {
        return this.props.canDeploy ? this.shouldDeploy : false;
    }

    /** Header dans le DOM. */
    protected header?: Element | null;

    componentDidMount() {
        const marginBottom = window.getComputedStyle(this.header!).marginBottom;
        this.context.header.marginBottom =
            (marginBottom && marginBottom.endsWith("px") && +marginBottom.replace("px", "")) || 0;
    }

    /** Recalcule l'état du header, appelé à chaque scroll, resize ou changement de `canDeploy`. */
    @disposeOnUnmount
    scrollListener = this.context.registerScroll(
        action((top: number) => {
            // Si on est déployé, on recalcule le seuil de déploiement.
            if (this.isDeployed && this.props.canDeploy) {
                this.deployThreshold = this.header ? this.header.clientHeight - this.context.header.topRowHeight : 1000;
                this.placeholderHeight = this.header ? this.header.clientHeight : 1000;
            }

            // On détermine si on a dépassé le seuil.
            this.shouldDeploy = top <= this.deployThreshold;
        })
    );

    render() {
        return (
            <Sticky
                condition={!this.isDeployed}
                placeholder={
                    <div
                        style={{
                            height:
                                (this.props.canDeploy ? this.placeholderHeight : this.context.header.topRowHeight) +
                                this.context.header.marginBottom,
                            width: "100%"
                        }}
                    />
                }
            >
                <Theme theme={this.props.theme}>
                    {theme => (
                        <header
                            ref={h => (this.header = h)}
                            className={`${theme.scrolling} ${this.isDeployed ? theme.deployed : theme.undeployed}`}
                        >
                            {this.props.children}
                        </header>
                    )}
                </Theme>
            </Sticky>
        );
    }
}
