import {autobind} from "core-decorators";
import i18n from "i18next";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";
import {spring, Style, TransitionMotion} from "react-motion";

import Button from "focus-components/button";
import Icon from "focus-components/icon";

import {classAutorun, classReaction} from "../../util";

import {LineOperationListItem} from "./contextual-actions";
import LineWrapper, {LineWrapperProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

/** Props du composant de liste standard. */
export interface ListProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: T) => boolean;
    /** La liste. */
    data?: T[];
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: React.ComponentClass<{data: T}> | React.SFC<{data: T}>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. Par défaut () => <div>{i18n.t("focus.list.empty")}</div> */
    EmptyComponent?: React.ComponentClass<{addItemHandler?: () => void}> | React.SFC<{addItemHandler?: () => void}>;
    /** Cache le bouton "Ajouter" dans la mosaïque et le composant vide. */
    hideAdditionalItems?: boolean;
    /** Composant de ligne. */
    LineComponent?: React.ComponentClass<P> | React.SFC<P>;
    /** Mode des listes dans le wrapper. Par défaut : celui du composant fourni, ou "list". */
    mode?: "list" | "mosaic";
    /** Taille de la mosaïque. */
    mosaic?: {width: number, height: number};
    /** Composant de mosaïque. */
    MosaicComponent?: React.ComponentClass<P> | React.SFC<P>;
    /** La liste des actions sur chaque élément de la liste. */
    operationList?: (data: T) => LineOperationListItem<T>[];
}

/** Description d'un élément de liste, pour react-motion. */
export interface LineItem<P> {
    /** Clé React. */
    key: string;
    /** Description du composant, avec ses props. */
    data: {
        Component: React.ComponentClass<P> | React.SFC<P>,
        props?: P
    };
    /** Style interpolé (ou pas) par react-motion. */
    style: Style;
}

/** Composant de liste standard */
@autobind
@observer
export class List<T, P extends {data?: T}, AP> extends ListBase<T, ListProps<T, P> & AP> {

    // On récupère les infos du ListWrapper dans le contexte.
    static contextTypes = {
        listWrapper: React.PropTypes.object
    };

    context: {
        listWrapper?: {
            addItemHandler: () => void;
            mosaic: {
                width: number;
                height: number;
            },
            mode: "list" | "mosaic";
        }
    };

    /** Nombre de mosaïque par ligne, déterminé à la volée. */
    @observable private byLine: number;
    /** Index de l'item sur lequel on doit afficher le détail. */
    @observable private displayedIdx?: number;

    // Tuyauterie pour maintenir `byLine` à jour.
    componentDidMount() {
        super.componentDidMount();
        window.addEventListener("resize", this.updateByLine);
        this.updateByLine();
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        this.updateByLine();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener("resize", this.updateByLine);
    }

    /** Met à jour `byLine`. */
    @classAutorun
    private updateByLine() {
        const node = findDOMNode(this);
        if (node) {
            this.byLine = this.mode === "mosaic" ? Math.floor(node.clientWidth / (this.mosaic.width + 10)) : 1;
        }
    }

    /** Réaction pour fermer le détail si la liste change. */
    @classReaction((that: List<any, any, any>) => () => that.displayedData.length)
    protected closeDetail() {
        this.displayedIdx = undefined;
    }

    /** Handler d'ajout d'élément (fusion contexte / props). */
    @computed
    protected get addItemHandler() {
        const {listWrapper} = this.context;
        return this.props.addItemHandler || listWrapper && listWrapper.addItemHandler;
    }

    /** Mode (fusion contexte / props). */
    @computed
    protected get mode() {
        const {mode, MosaicComponent, LineComponent} = this.props;
        const {listWrapper} = this.context;
        return mode || listWrapper && listWrapper.mode || MosaicComponent && !LineComponent && "mosaic" || "list";
    }

    /** Taille de la mosaïque (fusion contexte / props). */
    @computed
    protected get mosaic() {
        const {listWrapper} = this.context;
        return this.props.mosaic || listWrapper && listWrapper.mosaic || {width: 200, height: 200};
    }

    /** Les données. */
    protected get data() {
        return this.props.data || [];
    }

    /** Affiche ou non l'ajout d'élément dans la liste (en mosaïque). */
    @computed
    private get isAddItemShown() {
        return !!(!this.props.hideAdditionalItems && this.addItemHandler && this.mode === "mosaic");
    }

    /**
     * Transforme les données en éléments de liste.
     * @param Component Le composant de ligne.
     */
    protected getItems(Component: React.ComponentClass<P> | React.SFC<P>): LineItem<LineWrapperProps<T, P>>[] {
        const {canOpenDetail = () => true, i18nPrefix, itemKey, lineTheme, lineProps, operationList} = this.props;

        return this.displayedData.map((item, idx) => ({
            // On essaie de couvrir toutes les possibilités pour la clé, en tenant compte du faite qu'on a potentiellement une liste de StoreNode.
            key: `${itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}`,
            data: {
                Component: LineWrapper,
                props: {
                    data: item,
                    i18nPrefix,
                    mosaic: this.mode === "mosaic" ? this.mosaic : undefined,
                    LineComponent: Component,
                    lineProps,
                    operationList,
                    onLineClick: canOpenDetail(item) ? () => this.onLineClick(idx) : undefined,
                    theme: lineTheme
                }
            },
            style: {}
        }));
    }

    /**
     * Ouvre le détail au clic sur un élément.
     * @param idx L'index de l'élément cliqué.
     */
    @action
    protected onLineClick(idx: number) {
        this.displayedIdx = this.displayedIdx !== idx ? idx : undefined;
    }

    /** Construit les lignes de la liste à partir des données, en tenant compte du mode, de l'affichage du détail et du bouton d'ajout. */
    @computed
    private get lines() {
        const {theme, i18nPrefix = "focus", LineComponent, MosaicComponent, DetailComponent, detailHeight = 200} = this.props;

        /* On détermine quel composant on utilise. */
        let Component;
        if (this.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (this.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        /* On récupère les items de la liste. */
        const items: LineItem<any>[] = this.getItems(Component);

        /* On regarde si le composant de détail doit être ajouté. */
        if (DetailComponent && this.displayedIdx !== undefined) {
            // On détermine son index.
            let idx = this.displayedIdx + (this.isAddItemShown || this.mode === "list" ? 1 : 0);

            // En mosaïque, on affiche le détail juste après une fin de ligne au lieu de juste après l'élément cliqué.
            if (this.mode === "mosaic") {
                idx += this.byLine - idx % this.byLine - (this.isAddItemShown ? 1 : 0);
            }
            const item = this.displayedData[this.displayedIdx];

            // Puis on ajoute l'élément à sa place dans la liste.
            items.splice(idx, 0, {
                key: `detail-${idx}`,
                data: {
                    Component: ({style: {height}}: {style: {height: number}}) => (
                        <li
                            className={theme!.detailWrapper!}
                            style={{
                                width: height < 1 ? 0 : undefined, // react-motion prend un moment avant que la hauteur atteigne bien 0, donc on essaie de masquer le composant en avance.
                                height: Math.round(height)
                            }}
                        >
                            {/* Le calcul de la position du triangle en mosaïque n'est pas forcément évident... et il suppose qu'on ne touche pas au marges par défaut entre les mosaïques. */}
                            <div className={theme!.triangle!} style={this.displayedIdx === undefined && this.mode === "mosaic" ? {left: -1000} : this.mode === "mosaic" ? {left: this.mosaic.width / 2 - 8.25 + ((this.displayedIdx! + (this.isAddItemShown ? 1 : 0)) % this.byLine) * (this.mosaic.width + 10)} : {}} />
                            <div className={theme!.detail}>
                                <Button icon="clear" onClick={() => this.displayedIdx = undefined} shape="icon" />
                                <DetailComponent data={item} />
                            </div>
                        </li>
                    )
                },
                style: {height: spring((typeof detailHeight === "number" ? detailHeight : detailHeight(item)) + 40)} // On indique l'animation d'ouverture. Le +40 permet de prendre en compte les marges de 20px en haut et en bas.
            });
        }

        /* On regarde si on doit ajouter l'élément d'ajout. */
        if (this.isAddItemShown) {
            items.splice(0, 0, {
                key: "mosaic-add",
                data: {
                    Component: () => (
                        <div
                            className={theme!.mosaicAdd!}
                            style={{width: this.mosaic.width, height: this.mosaic.height}}
                            onClick={this.addItemHandler}
                        >
                            <Icon name={i18n.t(`${i18nPrefix}.icons.list.add.name`)} library={i18n.t(`${i18nPrefix}.icons.list.add.library` as "material")} />
                            {i18n.t(`${i18nPrefix}.list.add`)}
                        </div>
                    )
                },
                style: {}
            });
        }

        return items;
    }

    render() {
        const {EmptyComponent, hideAdditionalItems, i18nPrefix = "focus", theme} = this.props;
        return !hideAdditionalItems && !this.displayedData.length && EmptyComponent ?
            <EmptyComponent addItemHandler={this.addItemHandler} />
        : !hideAdditionalItems && !this.displayedData.length ?
            <div>{i18n.t(`${i18nPrefix}.list.empty`)}</div>
        : (
            <div>
                <TransitionMotion
                    willEnter={() => ({height: 0})}
                    willLeave={({style}: {style: Style}) => {
                        // Est appelé au retrait d'un élément de la liste.
                        if (style.height) { // `height` n'existe que pour le détail
                            return {height: spring(0)}; // On ajoute l'animation de fermeture.
                        }
                        return undefined; // Pour les autres éléments, on les retire immédiatement.
                    }}
                    styles={this.lines.slice()}
                >
                    {(items: LineItem<any>[]) => (
                        <ul className={this.mode === "list" ? theme!.list! : theme!.mosaic!}>
                            {items.map(({key, style, data: {Component, props}}) => <Component key={key} style={style} {...props} />)}
                        </ul>
                    )}
                </TransitionMotion>
                {this.renderBottomRow()}
            </div>
        );
    }
}

export default themr("list", styles)(List);

/**
 * Crée un composant de liste standard.
 * @param props Les props de la liste.
 */
export function listFor<T, P extends {data?: T}>(props: ListProps<T, P>) {
    const List2 = themr("list", styles)(List) as any;
    return <List2 {...props} />;
}
