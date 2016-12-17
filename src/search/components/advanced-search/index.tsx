import {autobind} from "core-decorators";
import {forEach} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import BackToTop from "focus-components/button-back-to-top";
import {DropdownItem} from "focus-components/dropdown";

import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Results} from "../results";
import {FacetBox, FacetBoxStyle, FacetStyle} from "./facet-box";
import {GroupComponent, GroupComponentStyle} from "./group-component";
import {ListSummary, ListSummaryStyle} from "./list-summary";
import {SearchActionBar} from "./search-action-bar";
export {FacetBoxStyle, FacetStyle, GroupComponentStyle, ListSummaryStyle};

import * as styles from "./style/index.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps {
    classNames?: AdvancedSearchStyle;
    /** Par défault: true */
    hasBackToTop?: boolean;
    hasSelection?: boolean;
    lineComponentMapper: (...args: any[]) => ReactComponent<any>;
    lineOperationList?: DropdownItem[];
    onLineClick?: (...args: any[]) => void;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    openedFacetList?: {};
    scopes: {code: string, label: string}[];
    scopesConfig?: {[key: string]: string};
    scrollParentSelector?: string;
    scopeLock?: boolean;
    selectItem?: (data?: any, isSelected?: boolean) => void;
    selectionAction?: (status: string) => void;
    store: SearchStore;
}

@injectStyle("advancedSearch")
@autobind
@observer
export class AdvancedSearch extends React.Component<AdvancedSearchProps, void> {

    results?: Results;

    componentWillMount() {
        this.props.store.search();
    }

    getSelectedItems() {
        const selectedItems: {}[] = [];
        if (this.results) {
            const {lists} = this.results;
            if (lists) {
                forEach(lists, list => {
                    if (list) {
                        selectedItems.push(...list.getSelectedItems());
                    }
                });
            }
        }
        return selectedItems;
    }

    private renderFacetBox() {
        const {scopesConfig = {}, openedFacetList = {}, store} = this.props;
        return (
            <FacetBox
                openedFacetList={openedFacetList}
                scopesConfig={scopesConfig}
                store={store}
            />
        );
    }

    private renderListSummary() {
        const {scopes, scopeLock, store} = this.props;
        return (
            <ListSummary
                scopes={scopes}
                scopeLock={!!scopeLock}
                store={store}
            />
        );
    }

    private renderActionBar() {
        const {hasSelection, lineOperationList, orderableColumnList, store} = this.props;
        const groupableColumnList = store.facets && store.scope !== "ALL" ? store.facets.reduce((result, facet) => {
            if (facet.values.length > 1) {
                result[facet.code] = facet.label;
            }
            return result;
        }, {} as {[facet: string]: string}) : {};

        return (
            <SearchActionBar
                groupableColumnList={groupableColumnList}
                hasSelection={hasSelection}
                operationList={store.totalCount > 0 ? lineOperationList : []}
                orderableColumnList={orderableColumnList}
                store={store}
            />
        );
    }

    private renderResults() {
        const {hasSelection, onLineClick, lineComponentMapper, lineOperationList, scrollParentSelector, selectItem, store} = this.props;
        return (
            <Results
                groupComponent={GroupComponent}
                hasSelection={!!hasSelection}
                lineClickHandler={onLineClick}
                lineComponentMapper={lineComponentMapper}
                lineOperationList={lineOperationList}
                lineSelectionHandler={selectItem}
                ref={results => this.results = results}
                renderSingleGroupDecoration={false}
                scrollParentSelector={scrollParentSelector}
                store={store}
            />
        );
    }

    render() {
        const {store, hasBackToTop = true, classNames} = this.props;
        return (
            <div>
                {store.scope !== "ALL" ?
                    <div className={`${styles.facetContainer} ${classNames!.facetContainer || ""}`}>
                        {this.renderFacetBox()}
                    </div>
                : null}
                <div className={`${styles.resultContainer} ${classNames!.resultContainer || ""}`}>
                    {this.renderListSummary()}
                    {this.renderActionBar()}
                    {this.renderResults()}
                </div>
                {hasBackToTop ? <BackToTop /> : null}
            </div>
        );
    }
}
