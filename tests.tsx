/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/

import * as React from "react";
import {test, dum} from "./src/testing/base-test";

import {ActionBar} from "./src/search/component/advanced-search/action-bar";
import {AdvancedSearch} from "./src/search/component/advanced-search";
import {Facet} from "./src/search/component/advanced-search/facet-box/facet";
import {FacetBox} from "./src/search/component/advanced-search/facet-box";
import {FacetData} from "./src/search/component/advanced-search/facet-box/facet-data";
import {GroupComponent} from "./src/search/component/advanced-search/group";
import {GroupWrapper} from "./src/search/component/group-wrapper";
import {ListSelection} from "./src/list/component/list-selection";
import {ListSummary} from "./src/search/component/advanced-search/list-summary";
import {ListTable} from "./src/list/component/list-table";
import {MemoryList} from "./src/list/component/memory-list";
import {Results} from "./src/search/component/results";
import {SearchHeader} from "./src/search/component/search-header";

test("ActionBar", <ActionBar action={{search: dum.function, updateProperties: dum.function}} />);
test("AdvancedSearch", <AdvancedSearch lineComponentMapper={dum.function} service={{scoped: dum.function, unscoped: dum.function}} />);
test("Facet", <Facet expandHandler={dum.function} facet={{code: dum.string, label: dum.string, values: dum.array}} facetKey={dum.string} isExpanded={dum.any} nbDefaultDataList={dum.number} selectHandler={dum.function} selectedDataKey={dum.string} />);
test("FacetBox", <FacetBox action={{search: dum.function, updateProperties: dum.function}} facetList={dum.array} openedFacetList={{}} scopesConfig={{}} selectedFacetList={{}} />);
test("FacetData", <FacetData data={{code: dum.string, label: dum.string, count: dum.number}} dataKey={dum.string} selectHandler={dum.function} />);
test("GroupComponent", <GroupComponent canShowMore={dum.any} count={dum.number} groupKey={dum.string} groupLabel={dum.string} showMoreHandler={dum.function} />);
test("GroupWrapper", <GroupWrapper count={dum.number} groupComponent={dum.any} groupKey={dum.string} initialRowsCount={dum.number} list={dum.array} renderResultsList={dum.function} />);
test("ListSelection", <ListSelection LineComponent={dum.component} />);
test("ListSummary", <ListSummary action={{updateProperties: dum.function}} query={dum.string} scope={dum.string} scopeLock={dum.any} totalCount={dum.number} />);
test("ListTable", <ListTable LineComponent={dum.component} columns={dum.array} />);
test("MemoryList", <MemoryList ListComponent={dum.any} />);
test("Results", <Results action={{search: dum.function, updateProperties: dum.function}} groupComponent={dum.any} isSelection={dum.any} lineComponentMapper={dum.function} renderSingleGroupDecoration={dum.any} store={dum.any} totalCount={dum.number} />);
test("SearchHeader", <SearchHeader service={{scoped: dum.function, unscoped: dum.function}} />);
