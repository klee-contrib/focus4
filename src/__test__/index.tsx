/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/

import {test, dum, dumClass} from "../testing";
import * as React from "react";

import {ActionBar} from "../search/components/advanced-search/action-bar";
import {AdvancedSearch} from "../search/components/advanced-search";
import {ErrorCenter} from "../application/layout/error-center";
import {Facet} from "../search/components/advanced-search/facet-box/facet";
import {FacetBox} from "../search/components/advanced-search/facet-box";
import {FacetData} from "../search/components/advanced-search/facet-box/facet-data";
import {Field} from "../entity/field";
import {GroupComponent} from "../search/components/advanced-search/group";
import {GroupWrapper} from "../search/components/group-wrapper";
import {HeaderScrolling} from "../application/layout/header/scrolling";
import {Layout} from "../application/layout";
import {ListPage} from "../list/page";
import {ListSelection} from "../list/components/list-selection";
import {ListSummary} from "../search/components/advanced-search/list-summary";
import {ListTable} from "../list/components/list-table";
import {MemoryList} from "../list/components/memory-list";
import {MessageCenter} from "../message/message-center";
import {Results} from "../search/components/results";
import {SearchBar} from "../search/components/search-bar";

test("ActionBar", <ActionBar store={dumClass.SearchStore} />);
test("AdvancedSearch", <AdvancedSearch lineComponentMapper={dum.function} scopes={dum.array} store={dumClass.SearchStore} />);
test("ErrorCenter", <ErrorCenter  />);
test("Facet", <Facet expandHandler={dum.function} facet={{code: dum.string, label: dum.string, values: dum.array}} facetKey={dum.string} isExpanded={true} nbDefaultDataList={dum.number} selectHandler={dum.function} selectedDataKey={dum.string} />);
test("FacetBox", <FacetBox openedFacetList={{}} scopesConfig={{}} store={dumClass.SearchStore} />);
test("FacetData", <FacetData data={{code: dum.string, label: dum.string, count: dum.number}} dataKey={dum.string} selectHandler={dum.function} />);
test("Field", <Field  />);
test("GroupComponent", <GroupComponent canShowMore={true} count={dum.number} groupKey={dum.string} groupLabel={dum.string} showMoreHandler={dum.function} />);
test("GroupWrapper", <GroupWrapper count={dum.number} groupComponent={dum.component} groupKey={dum.string} initialRowsCount={dum.number} list={dum.array} renderResultsList={dum.function} />);
test("HeaderScrolling", <HeaderScrolling  />);
test("Layout", <Layout  />);
test("ListPage", <ListPage store={dumClass.ListStore} />);
test("ListSelection", <ListSelection LineComponent={dum.component} />);
test("ListSummary", <ListSummary scopeLock={true} scopes={dum.array} store={dumClass.SearchStore} />);
test("ListTable", <ListTable LineComponent={dum.component} columns={dum.array} />);
test("MemoryList", <MemoryList ListComponent={dum.component} />);
test("MessageCenter", <MessageCenter  />);
test("Results", <Results groupComponent={dum.component} isSelection={true} lineComponentMapper={dum.function} renderSingleGroupDecoration={true} store={dumClass.SearchStore} />);
test("SearchBar", <SearchBar scopes={dum.array} store={dumClass.SearchStore} />);
