/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/

import {test, dum, dumClass} from "./src/testing";
import * as React from "react";

import {ActionBar} from "./src/search/component/advanced-search/action-bar";
import {AdvancedSearch} from "./src/search/component/advanced-search";
import {Facet} from "./src/search/component/advanced-search/facet-box/facet";
import {FacetBox} from "./src/search/component/advanced-search/facet-box";
import {FacetData} from "./src/search/component/advanced-search/facet-box/facet-data";
import {GroupComponent} from "./src/search/component/advanced-search/group";
import {GroupWrapper} from "./src/search/component/group-wrapper";
import {ListSelection} from "./src/list/list-selection";
import {ListSummary} from "./src/search/component/advanced-search/list-summary";
import {ListTable} from "./src/list/list-table";
import {MemoryList} from "./src/list/memory-list";
import {Results} from "./src/search/component/results";
import {SearchBar} from "./src/search/component/search-bar";

test("ActionBar", <ActionBar store={dumClass.SearchStore} />);
test("AdvancedSearch", <AdvancedSearch lineComponentMapper={dum.function} scopes={dum.array} store={dumClass.SearchStore} />);
test("Facet", <Facet expandHandler={dum.function} facet={{code: dum.string, label: dum.string, values: dum.array}} facetKey={dum.string} isExpanded={true} nbDefaultDataList={dum.number} selectHandler={dum.function} selectedDataKey={dum.string} />);
test("FacetBox", <FacetBox openedFacetList={{}} scopesConfig={{}} store={dumClass.SearchStore} />);
test("FacetData", <FacetData data={{code: dum.string, label: dum.string, count: dum.number}} dataKey={dum.string} selectHandler={dum.function} />);
test("GroupComponent", <GroupComponent canShowMore={true} count={dum.number} groupKey={dum.string} groupLabel={dum.string} showMoreHandler={dum.function} />);
test("GroupWrapper", <GroupWrapper count={dum.number} groupComponent={dum.component} groupKey={dum.string} initialRowsCount={dum.number} list={dum.array} renderResultsList={dum.function} />);
test("ListSelection", <ListSelection LineComponent={dum.component} />);
test("ListSummary", <ListSummary scopeLock={true} scopes={dum.array} store={dumClass.SearchStore} />);
test("ListTable", <ListTable LineComponent={dum.component} columns={dum.array} />);
test("MemoryList", <MemoryList ListComponent={dum.component} />);
test("Results", <Results groupComponent={dum.component} isSelection={true} lineComponentMapper={dum.function} renderSingleGroupDecoration={true} store={dumClass.SearchStore} />);
test("SearchBar", <SearchBar scopes={dum.array} store={dumClass.SearchStore} />);
