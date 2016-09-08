/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/

import {test, dum, dumClass} from "../testing";
import * as React from "react";

import {ActionBar} from "../search/component/advanced-search/action-bar";
import {AdvancedSearch} from "../search/component/advanced-search";
import {Facet} from "../search/component/advanced-search/facet-box/facet";
import {FacetBox} from "../search/component/advanced-search/facet-box";
import {FacetData} from "../search/component/advanced-search/facet-box/facet-data";
import {GroupComponent} from "../search/component/advanced-search/group";
import {GroupWrapper} from "../search/component/group-wrapper";
import {ListSelection} from "../list/list-selection";
import {ListSummary} from "../search/component/advanced-search/list-summary";
import {ListTable} from "../list/list-table";
import {MemoryList} from "../list/memory-list";
import {Results} from "../search/component/results";
import {SearchBar} from "../search/component/search-bar";

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
