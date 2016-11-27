/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/
/* tslint:disable */

import {test, dum, dumClass} from "../testing";
import * as React from "react";

import {ActionBar} from "../list/components/action-bar";
import {AdvancedSearch} from "../search/components/advanced-search";
import {ContextualActions} from "../list/components/contextual-actions";
import {ErrorCenter} from "../application/layout/error-center";
import {Facet} from "../search/components/advanced-search/facet-box/facet";
import {FacetBox} from "../search/components/advanced-search/facet-box";
import {FacetData} from "../search/components/advanced-search/facet-box/facet-data";
import {Field} from "../entity/field";
import {GroupComponent} from "../search/components/advanced-search/group-component";
import {GroupWrapper} from "../search/components/group-wrapper";
import {HeaderScrolling} from "../application/layout/header/scrolling";
import {Layout} from "../application/layout";
import {ListSelection} from "../list/components/list-selection";
import {ListSummary} from "../search/components/advanced-search/list-summary";
import {ListTable} from "../list/components/list-table";
import {ListTimeline} from "../list/components/list-timeline";
import {MemoryList} from "../list/components/memory-list";
import {MessageCenter} from "../message/message-center";
import {Results} from "../search/components/results";
import {ScopeSelect} from "../search/components/search-bar/scope-select";
import {SearchActionBar} from "../search/components/advanced-search/search-action-bar";
import {SearchBar} from "../search/components/search-bar";
import {StyleProvider} from "../theming/style-provider";

test("ActionBar", <ActionBar  />);
test("AdvancedSearch", <AdvancedSearch lineComponentMapper={dum.function} scopes={dum.array} store={dumClass.SearchStore} />);
test("ContextualActions", <ContextualActions operationList={dum.array} />);
test("ErrorCenter", <ErrorCenter  />);
test("Facet", <Facet expandHandler={dum.function} facet={{code: dum.string, label: dum.string, values: dum.array}} facetKey={dum.string} isExpanded={true} nbDefaultDataList={dum.number} selectHandler={dum.function} selectedDataKey={dum.string} />);
test("FacetBox", <FacetBox openedFacetList={{}} scopesConfig={{}} store={dumClass.SearchStore} />);
test("FacetData", <FacetData data={{code: dum.string, label: dum.string, count: dum.number}} dataKey={dum.string} selectHandler={dum.function} />);
test("Field", <Field  />);
test("GroupComponent", <GroupComponent canShowMore={true} count={dum.number} groupKey={dum.string} groupLabel={dum.string} showMoreHandler={dum.function} />);
test("GroupWrapper", <GroupWrapper count={dum.number} groupComponent={dum.any} groupKey={dum.string} initialRowsCount={dum.number} list={dum.array} renderResultsList={dum.function} />);
test("HeaderScrolling", <HeaderScrolling classNames={{scrolling: dum.string, deployed: dum.string, undeployed: dum.string}} />);
test("Layout", <Layout  />);
test("ListSelection", ListSelection.create({LineComponent: dum.component, data: dum.array}));
test("ListSummary", <ListSummary scopeLock={true} scopes={dum.array} store={dumClass.SearchStore} />);
test("ListTable", ListTable.create({LineComponent: dum.component, data: dum.array, columns: dum.array}));
test("ListTimeline", ListTimeline.create({LineComponent: dum.component, data: dum.array}));
test("MemoryList", MemoryList.create({ListComponent: dum.any, data: dum.array, listProps: dum.any}));
test("MessageCenter", <MessageCenter  />);
test("Results", <Results groupComponent={dum.any} isSelection={true} lineComponentMapper={dum.function} renderSingleGroupDecoration={true} store={dumClass.SearchStore} />);
test("ScopeSelect", <ScopeSelect list={dum.array} value={dum.string} />);
test("SearchActionBar", <SearchActionBar store={dumClass.SearchStore} />);
test("SearchBar", <SearchBar scopes={dum.array} store={dumClass.SearchStore} />);
test("StyleProvider", <StyleProvider  />);
