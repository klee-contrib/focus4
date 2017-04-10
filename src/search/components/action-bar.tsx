import {autobind} from "core-decorators";
import i18n from "i18next";
import {isEmpty, reduce} from "lodash";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";
import InputText from "focus-components/input-text";

import {ContextualActions, GroupOperationListItem, ListStoreBase} from "../../list";
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
    store: ListStoreBase<any>;
}

@injectStyle("actionBar")
@observer
@autobind
export class ActionBar extends React.Component<ActionBarProps, {}> {

    private facetBox?: StyleInjector<FacetBox>;

    state = {facetBoxDisplay: false};

    @computed.struct
    private get selectedList() {
        const {group, store} = this.props;
        if (!group || !isSearch(store)) {
            return store.selectedList;
        } else {
            const list = store.getListByGroupCode(group.code);
            return list.filter(item => store.selectedItems.has(item));
        }
    }

    @computed
    private get selectionIcon() {
        switch (this.selectionStatus) {
            case "none": return "check_box_outline_blank";
            case "selected": return "check_box";
            default: return "indeterminate_check_box";
        }
    }

    @computed
    private get selectionStatus() {
        const {group, store} = this.props;
        if (!group) {
            return store.selectionStatus;
        } else {
            if (this.selectedList.length === 0) {
                return "none";
            } else if (this.selectedList.length === group.totalCount) {
                return "selected";
            } else {
                return "partial";
            }
        }
    }

    @computed
    private get selectionButton() {
        const {group, hasSelection, store} = this.props;
        if (hasSelection) {
            return (
                <Button
                    shape="icon"
                    icon={this.selectionIcon}
                    onClick={() => isSearch(store) && store.groupingKey && group ? store.toggleMany(store.getListByGroupCode(group!.code)) : store.toggleAll()}
                />
            );
        } else {
            return null;
        }
    }

    private get filterButton() {
        const {hasFacetBox, store} = this.props;
        if (hasFacetBox && isSearch(store)) {
            return (
                <Button
                    color={this.state.facetBoxDisplay ? "colored" : undefined}
                    onClick={() => this.setState({facetBoxDisplay: !this.state.facetBoxDisplay})}
                    label="list.actionBar.filter"
                    shape={null}
                />
            );
        } else {
            return null;
        }
    }

    @computed
    private get sortButton() {
        const {orderableColumnList, store} = this.props;

        if (!store.selectedItems.size && !(isSearch(store) && store.groupingKey) && orderableColumnList) {
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

        if (isSearch(store) && !store.selectedItems.size && !store.groupingKey && !this.state.facetBoxDisplay) {
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
                return <Dropdown button={{label: "list.actionBar.group", shape: null}} operations={groupOperationList} />;
            }
        }

        return null;
    }

    @computed
    private get searchBar() {
        const {classNames, hasSearchBar, searchBarPlaceholder, store} = this.props;

        if (!store.selectedItems.size && hasSearchBar) {
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
            this.facetBox.instance.div.style.marginTop = `${this.state.facetBoxDisplay ? 0 : -this.facetBox.instance.div.clientHeight}px`;
        }
    }

    render() {
        const {classNames, group, hasFacetBox, nbDefaultDataListFacet = 6, operationList, scopeFacetKey = "FCT_SCOPE", store} = this.props;
        return (
            <div className={`${styles.container} ${classNames!.container || ""}`}>
                <div className={`${styles.bar} ${classNames!.bar || ""} ${this.selectedList.length ? `${styles.selection} ${classNames!.selection || ""}` : ""}`}>
                    <div className={`${styles.buttons} ${classNames!.buttons || ""}`}>
                        {this.selectionButton}
                        {this.filterButton}
                        {this.sortButton}
                        {this.groupButton}
                        {group ?
                            <strong>{`${group.label} (${group.totalCount})`}</strong>
                        : null}
                        {this.selectedList.length ?
                            <strong>{`${this.selectedList.length} ${i18n.t(`list.actionBar.selectedItem${this.selectedList.length > 1 ? "s" : ""}`)}`}</strong>
                        : null}
                        {this.searchBar}
                    </div>
                    {this.selectedList.length && operationList && operationList.length ?
                        <ContextualActions operationList={operationList} operationParam={this.selectedList} />
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

function isSearch(store: ListStoreBase<any>): store is SearchStore {
    return (store as SearchStore).hasOwnProperty("groupingKey");
}
