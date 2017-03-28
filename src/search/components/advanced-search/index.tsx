import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import BackToTop from "focus-components/button-back-to-top";
import {DropdownItem} from "focus-components/dropdown";

import {ActionBar} from "../../../list";
import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Results} from "../results";
import {FacetBox, FacetBoxStyle, FacetStyle} from "./facet-box";
import {GroupComponent, GroupComponentStyle} from "./group-component";
import {ListSummary, ListSummaryStyle} from "./list-summary";
export {FacetBoxStyle, FacetStyle, GroupComponentStyle, ListSummaryStyle};

import * as styles from "./style/advanced-search.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps {
    classNames?: AdvancedSearchStyle;
    /** Par défault: true */
    hasBackToTop?: boolean;
    hasSelection?: boolean;
    isSingleScope?: boolean;
    lineComponentMapper: (...args: any[]) => ReactComponent<any>;
    lineOperationList?: DropdownItem[];
    onLineClick?: (...args: any[]) => void;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    openedFacetList?: {};
    scopes: {code: string, label?: string}[];
    scopesConfig?: {[key: string]: string};
    store: SearchStore;
}

@injectStyle("advancedSearch")
@autobind
@observer
export class AdvancedSearch extends React.Component<AdvancedSearchProps, void> {

    componentWillMount() {
        this.props.store.search();
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
        const {isSingleScope, scopes, store} = this.props;
        return (
            <ListSummary
                isSingleScope={!!isSingleScope}
                scopes={scopes}
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
            <ActionBar
                groupableColumnList={groupableColumnList}
                groupLabelPrefix="live.filter.facets."
                hasSelection={hasSelection}
                operationList={store.totalCount > 0 ? lineOperationList : []}
                orderableColumnList={orderableColumnList}
                store={store}
            />
        );
    }

    private renderResults() {
        const {hasSelection, onLineClick, lineComponentMapper, lineOperationList, store} = this.props;
        return (
            <Results
                groupComponent={GroupComponent}
                hasSelection={!!hasSelection}
                lineClickHandler={onLineClick}
                lineComponentMapper={lineComponentMapper}
                lineOperationList={lineOperationList}
                renderSingleGroupDecoration={false}
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
