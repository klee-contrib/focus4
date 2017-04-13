import {autobind} from "core-decorators";
import i18n from "i18next";
import {isEmpty, reduce} from "lodash";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";
import InputText from "focus-components/input-text";

import {ContextualActions, GroupOperationListItem, ListStore, MiniListStore} from "../../list";
import {injectStyle, StyleInjector} from "../../theming";

import {SearchStore} from "../store";
import {FacetBox} from "./facet-box";

import * as styles from "./__style__/action-bar.css";

export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps {
    classNames?: ActionBarStyle;
    group?: {code: string, label: string, totalCount: number};
    hasFacetBox?: boolean;
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    /** Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    operationList?: GroupOperationListItem<{}>[];
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    searchBarPlaceholder?: string;
    store: MiniListStore<any>;
}

@injectStyle("actionBar")
@observer
@autobind
export class ActionBar extends React.Component<ActionBarProps, {}> {

    private facetBox?: StyleInjector<FacetBox>;

    state = {facetBoxDisplay: false};

    @computed
    private get selectionIcon() {
        switch (this.props.store.selectionStatus) {
            case "none": return "check_box_outline_blank";
            case "selected": return "check_box";
            default: return "indeterminate_check_box";
        }
    }

    @computed
    private get selectionButton() {
        const {hasSelection, store} = this.props;
        if (hasSelection) {
            return (
                <Button
                    shape="icon"
                    icon={this.selectionIcon}
                    onClick={store.toggleAll}
                />
            );
        } else {
            return null;
        }
    }

    private get filterButton() {
        const {classNames, hasFacetBox, store} = this.props;
        if (hasFacetBox && isSearch(store)) {
            return (
                <div style={{position: "relative"}}>
                    <Button
                        onClick={() => this.setState({facetBoxDisplay: !this.state.facetBoxDisplay})}
                        label="list.actionBar.filter"
                        shape={null}
                    />
                    {this.state.facetBoxDisplay ? <div className={`${styles.triangle} ${classNames!.triangle || ""}`} /> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    @computed
    private get sortButton() {
        const {orderableColumnList, store} = this.props;

        if (!store.selectedItems.size && (isSearch(store) || isList(store)) && orderableColumnList) {
            const orderOperationList: DropdownItem[] = [];
            for (const key in orderableColumnList) {
                const description = orderableColumnList[key];
                orderOperationList.push({
                    action: action(() => {
                        store.sortBy = description.key;
                        store.sortAsc = description.order;
                    }),
                    label: description.label
                });
            }

            const currentItem = orderableColumnList.find(o => o.key === store.sortBy && o.order === store.sortAsc);
            return (
                <Dropdown
                    button={{
                        label: currentItem ? `${i18n.t("list.actionBar.sortBy")} ${currentItem.label}` : "list.actionBar.sort",
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
        const {store} = this.props;

        if (isSearch(store) && !store.selectedItems.size && !store.groupingKey) {
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
                if (!this.state.facetBoxDisplay) {
                    return <Dropdown button={{label: "list.actionBar.group", shape: null}} operations={groupOperationList} />;
                } else {
                    return <Button disabled={true} label="list.actionBar.group" />;
                }
            }
        }

        return null;
    }

    @computed
    private get searchBar() {
        const {classNames, hasSearchBar, searchBarPlaceholder, store} = this.props;

        if (!store.selectedItems.size && hasSearchBar && (isList(store) || isSearch(store))) {
            return (
                <div className={`${styles.searchBar} ${classNames!.searchBar || ""}`}>
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
        if (this.facetBox && this.facetBox.instance.div) {
            if (facetBoxDisplayPrev !== this.state.facetBoxDisplay) {
                this.facetBox.instance.div.style.transition = "margin 0.15s ease-out";
            } else {
                this.facetBox.instance.div.style.transition = null;
            }
            this.facetBox.instance.div.style.marginTop = `${this.state.facetBoxDisplay ? 5 : -this.facetBox.instance.div.clientHeight}px`;
        }
    }

    render() {
        const {classNames, group, hasFacetBox, nbDefaultDataListFacet = 6, operationList, scopeFacetKey = "FCT_SCOPE", store} = this.props;
        return (
            <div className={`${styles.container} ${classNames!.container || ""}`}>
                <div className={`${styles.bar} ${classNames!.bar || ""} ${store.selectedItems.size ? `${styles.selection} ${classNames!.selection || ""}` : ""}`}>
                    <div className={`${styles.buttons} ${classNames!.buttons || ""}`}>
                        {this.selectionButton}
                        {group ?
                            <strong>{`${group.label} (${group.totalCount})`}</strong>
                        : null}
                        {store.selectedItems.size ?
                            <strong>{`${store.selectedItems.size} ${i18n.t(`list.actionBar.selectedItem${store.selectedItems.size > 1 ? "s" : ""}`)}`}</strong>
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
                    <div style={{overflow: "hidden"}}>
                        <FacetBox
                            ref={(i: any) => this.facetBox = i}
                            classNames={{facetBox: `${styles.facetBox} ${classNames!.facetBox || ""}`}}
                            nbDefaultDataList={nbDefaultDataListFacet}
                            scopeFacetKey={scopeFacetKey}
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
