import * as React from "react";
import {test, dum} from "./src/testing/base-test";

import ActionBar from "./src/component/search/advanced-search/action-bar";
import AdvancedSearch from "./src/component/search/advanced-search";
import FacetBox from "./src/component/search/advanced-search/facet-box";
import {GroupComponent} from "./src/component/search/advanced-search/group";
import GroupWrapper from "./src/component/search/group-wrapper";
import {ListSelection} from "./src/component/list/list-selection";
import ListSummary from "./src/component/search/advanced-search/list-summary";
import {ListTable} from "./src/component/list/list-table";
import {MemoryList} from "./src/component/list/memory-list";
import Results from "./src/component/search/results";
import SearchHeader from "./src/component/search/search-header";

test("ActionBar", <ActionBar action={{search: dum.function, updateProperties: dum.function}} />);
test("AdvancedSearch", <AdvancedSearch lineComponentMapper={dum.function} service={{scoped: dum.function, unscoped: dum.function}} />);
test("FacetBox", <FacetBox action={{search: dum.function, updateProperties: dum.function}} facetConfig={{}} openedFacetList={{}} scopesConfig={{}} />);
test("GroupComponent", <GroupComponent canShowMore={dum.boolean} count={dum.number} groupKey={dum.string} groupLabel={dum.string} showMoreHandler={dum.function} />);
test("GroupWrapper", <GroupWrapper count={dum.number} groupComponent={dum.component} groupKey={dum.string} initialRowsCount={dum.number} list={dum.array} renderResultsList={dum.function} />);
test("ListSelection", <ListSelection LineComponent={dum.component} />);
test("ListSummary", <ListSummary action={{updateProperties: dum.function}} onScopeChange={dum.function} query={dum.string} scope={dum.string} scopeLock={dum.boolean} totalCount={dum.number} />);
test("ListTable", <ListTable LineComponent={dum.component} columns={dum.array} />);
test("MemoryList", <MemoryList ListComponent={dum.component} />);
test("Results", <Results action={{search: dum.function, updateProperties: dum.function}} groupComponent={dum.component} isSelection={dum.boolean} lineComponentMapper={dum.function} renderSingleGroupDecoration={dum.boolean} store={dum.any} totalCount={dum.number} />);
test("SearchHeader", <SearchHeader service={{scoped: dum.function, unscoped: dum.function}} />);
