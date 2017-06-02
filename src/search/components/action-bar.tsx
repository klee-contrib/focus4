import {autobind} from "core-decorators";
import i18n from "i18next";
import {isEmpty, reduce} from "lodash";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";
import InputText from "focus-components/input-text";

import {ContextualActions, GroupOperationListItem, ListStore, MiniListStore} from "../../list";
import {classReaction} from "../../util";

import {SearchStore} from "../store";
import {FacetBox, shouldDisplayFacet} from "./facet-box";

import * as styles from "./__style__/action-bar.css";

export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps {
    group?: {code: string, label: string, totalCount: number};
    hasFacetBox?: boolean;
    hasGrouping?: boolean;
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    /** Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    operationList?: GroupOperationListItem<{}>[];
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    searchBarPlaceholder?: string;
    showSingleValuedFacets?: boolean;
    store: MiniListStore<any>;
    theme?: ActionBarStyle;
}

@themr("actionBar", styles)
@observer
@autobind
export class ActionBar extends React.Component<ActionBarProps, {}> {

    private facetBox?: FacetBox;

    state = {facetBoxDisplay: false};

    @classReaction<ActionBar>(that => () => {
        const {hasFacetBox, store} = that.props;
        return hasFacetBox && isSearch(store) && store.facets.length && store.facets[0] || false;
    })
    protected closeFacetBox() {
        const {store, showSingleValuedFacets} = this.props;
        if (this.state.facetBoxDisplay && isSearch(store) && store.facets.every(facet => !shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets))) {
            this.setState({facetBoxDisplay: false});
        }
    }

    @computed
    private get selectionButton() {
        const {hasSelection, i18nPrefix = "focus", store} = this.props;
        if (hasSelection) {
            return (
                <Button
                    shape="icon"
                    icon={i18n.t(`${i18nPrefix}.icons.actionBar.${store.selectionStatus}.name`)}
                    iconLibrary={i18n.t(`${i18nPrefix}.icons.actionBar.${store.selectionStatus}.library`)}
                    onClick={store.toggleAll}
                    type="button"
                />
            );
        } else {
            return null;
        }
    }

    private get filterButton() {
        const {theme, hasFacetBox, showSingleValuedFacets, i18nPrefix = "focus", store} = this.props;
        if (hasFacetBox && isSearch(store) && store.facets.some(facet => shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets))) {
            return (
                <div style={{position: "relative"}}>
                    <Button
                        onClick={() => this.setState({facetBoxDisplay: !this.state.facetBoxDisplay})}
                        icon={i18n.t(`${i18nPrefix}.icons.actionBar.drop${this.state.facetBoxDisplay ? "up" : "down"}.name`)}
                        iconLibrary={i18n.t(`${i18nPrefix}.icons.actionBar.drop${this.state.facetBoxDisplay ? "up" : "down"}.library`)}
                        iconPosition="right"
                        label={`${i18nPrefix}.search.action.filter`}
                        shape={null}
                        type="button"
                    />
                    {this.state.facetBoxDisplay ? <div className={theme!.triangle!} /> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    @computed
    private get sortButton() {
        const {i18nPrefix = "focus", orderableColumnList, store} = this.props;

        if (store.totalCount > 1 && !store.selectedItems.size && (isSearch(store) || isList(store)) && orderableColumnList) {
            const orderOperationList: DropdownItem[] = [];
            orderableColumnList.forEach(description => {
                orderOperationList.push({
                    action: action(() => {
                        store.sortBy = description.key;
                        store.sortAsc = description.order;
                    }),
                    label: description.label
                });
            });

            return (
                <Dropdown
                    button={{
                        label: `${i18nPrefix}.search.action.sort`,
                        icon: i18n.t(`${i18nPrefix}.icons.actionBar.dropdown.name`),
                        iconLibrary: i18n.t(`${i18nPrefix}.icons.actionBar.dropdown.library`),
                        iconPosition: "right",
                        shape: null
                    }}
                    operations={orderOperationList}
                />
            );
        }

        return null;
    }

    @computed
    private get groupButton() {
        const {hasGrouping, i18nPrefix = "focus", store} = this.props;

        if (hasGrouping && isSearch(store) && !store.selectedItems.size && !store.groupingKey) {
            const groupableColumnList = store.facets && store.scope !== "ALL" ? store.facets.reduce((result, facet) => {
                if (facet.values.length > 1) {
                    result[facet.code] = facet.label;
                }
                return result;
            }, {} as {[facet: string]: string}) : {};

            const groupOperationList = reduce(groupableColumnList, (operationList, label, key) => {
                operationList.push({
                    action: () => store.groupingKey = key,
                    label: i18n.t(label)
                });
                return operationList;
            }, [] as DropdownItem[]);

            if (!isEmpty(groupOperationList)) {
                const button = {
                    label: `${i18nPrefix}.search.action.group`,
                    icon: i18n.t(`${i18nPrefix}.icons.actionBar.dropdown.name`),
                    iconLibrary: i18n.t(`${i18nPrefix}.icons.actionBar.dropdown.library`),
                    iconPosition: "right" as "right",
                    shape: null
                }
                if (!this.state.facetBoxDisplay) {
                    return (
                        <Dropdown
                            button={button}
                            operations={groupOperationList}
                        />
                    );
                } else {
                    return (
                        <Button
                            disabled={true}
                            type="button"
                            {...button}
                        />
                    );
                }
            }
        }

        return null;
    }

    @computed
    private get searchBar() {
        const {theme, hasSearchBar, searchBarPlaceholder, store} = this.props;

        if (!store.selectedItems.size && hasSearchBar && (isList(store) || isSearch(store))) {
            return (
                <div className={theme!.searchBar!}>
                    <InputText
                        name="search-bar"
                        rawInputValue={store.query}
                        onChange={text => store.query = text}
                        placeholder={searchBarPlaceholder}
                    />
                </div>
            );
        }

        return null;
    }

    componentDidMount() {
        this.toggleFacetBox(false);
    }

    componentDidUpdate(_: {}, {facetBoxDisplay}: ActionBar["state"]) {
        this.toggleFacetBox(facetBoxDisplay);
    }

    private toggleFacetBox(facetBoxDisplayPrev: boolean) {
        if (this.facetBox && this.facetBox.div) {
            if (facetBoxDisplayPrev !== this.state.facetBoxDisplay) {
                this.facetBox.div.style.transition = "margin 0.15s ease-out";
            } else {
                this.facetBox.div.style.transition = null;
            }
            this.facetBox.div.style.marginTop = `${this.state.facetBoxDisplay ? 5 : -this.facetBox.div.clientHeight}px`;
        }
    }

    render() {
        const {theme, group, hasFacetBox, i18nPrefix = "focus", nbDefaultDataListFacet = 6, operationList, scopeFacetKey = "FCT_SCOPE", showSingleValuedFacets, store} = this.props;
        return (
            <div className={theme!.container!}>
                <div className={`${theme!.bar!} ${store.selectedItems.size ? theme!.selection! : ""}`}>
                    <div className={theme!.buttons!}>
                        {this.selectionButton}
                        {group ?
                            <strong>{`${i18n.t(group.label)} (${group.totalCount})`}</strong>
                        : null}
                        {store.selectedItems.size ?
                            <strong>{`${store.selectedItems.size} ${i18n.t(`${i18nPrefix}.search.action.selectedItem${store.selectedItems.size > 1 ? "s" : ""}`)}`}</strong>
                        : null}
                        {this.filterButton}
                        {this.sortButton}
                        {this.groupButton}
                        {this.searchBar}
                    </div>
                    {store.selectedItems.size && operationList && operationList.length ?
                        <ContextualActions operationList={operationList} operationParam={Array.from(store.selectedItems)} />
                    : null}
                </div>
                {hasFacetBox && isSearch(store) ?
                    <div style={{overflow: "hidden", position: "relative"}}>
                        <Button
                            style={{position: "absolute", right: "5px", top: "10px", zIndex: 1}}
                            icon={i18n.t(`${i18nPrefix}.icons.actionBar.close.name`)}
                            iconLibrary={i18n.t(`${i18nPrefix}.icons.actionBar.close.library`)}
                            shape="icon"
                            onClick={() => this.setState({facetBoxDisplay: false})}
                        />
                        <FacetBox
                            innerRef={i => this.facetBox = i}
                            theme={{facetBox: theme!.facetBox!}}
                            nbDefaultDataList={nbDefaultDataListFacet}
                            scopeFacetKey={scopeFacetKey}
                            showSingleValuedFacets={showSingleValuedFacets}
                            store={store}
                        />
                    </div>
                : null}
            </div>
        );
    }
}

function isSearch(store: any): store is SearchStore<any> {
    return store.hasOwnProperty("groupingKey");
}

function isList(store: any): store is ListStore<any> {
    return store.hasOwnProperty("dataList");
}
