/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/
/* tslint:disable */

import * as React from "react";
import {dum, dumClass, test} from "../testing";

import {ActionBar} from "../list/components/action-bar";
import {AdvancedSearch} from "../search/components/advanced-search";
import {ContextualActions} from "../list/components/contextual-actions";
import {ErrorCenter} from "../application/layout/error-center";
import {Facet} from "../search/components/advanced-search/facet-box/facet";
import {FacetBox} from "../search/components/advanced-search/facet-box";
import {FacetData} from "../search/components/advanced-search/facet-box/facet-data";
import {Field} from "../entity/field";
import {GroupWrapper} from "../search/components/group-wrapper";
import {HeaderScrolling} from "../application/layout/header/scrolling";
import {Layout} from "../application/layout";
import {ListSummary} from "../search/components/advanced-search/list-summary";
import {MessageCenter} from "../message/message-center";
import {Results} from "../search/components/results";
import {ScopeSelect} from "../search/components/search-bar/scope-select";
import {SearchActionBar} from "../search/components/advanced-search/search-action-bar";
import {SearchBar} from "../search/components/search-bar";
import {StyleProvider} from "../theming/style-provider";

test("ActionBar", <ActionBar store={dumClass.ListStoreBase} />);
test("AdvancedSearch", <AdvancedSearch lineComponentMapper={dum.function} scopes={dum.array} store={dumClass.SearchStore} />);
test("ContextualActions", <ContextualActions operationList={dum.array} />);
test("ErrorCenter", <ErrorCenter  />);
test("Facet", <Facet expandHandler={dum.function} facet={{code: dum.string, label: dum.string, values: dum.array}} facetKey={dum.string} isExpanded={true} nbDefaultDataList={dum.number} selectHandler={dum.function} selectedDataKey={dum.string} />);
test("FacetBox", <FacetBox openedFacetList={{}} scopesConfig={{}} store={dumClass.SearchStore} />);
test("FacetData", <FacetData data={{code: dum.string, label: dum.string, count: dum.number}} dataKey={dum.string} selectHandler={dum.function} />);
test("Field", <Field ref={dum.function} />);
test("GroupWrapper", <GroupWrapper count={dum.number} groupComponent={dum.any} groupKey={dum.string} initialRowsCount={dum.number} list={dum.array} renderResultsList={dum.function} />);
test("HeaderScrolling", <HeaderScrolling classNames={{scrolling: dum.string, deployed: dum.string, undeployed: dum.string}} />);
test("Layout", <Layout  />);
test("ListSummary", <ListSummary scopeLock={true} scopes={dum.array} store={dumClass.SearchStore} />);
test("MessageCenter", <MessageCenter  />);
test("Results", <Results groupComponent={dum.any} hasSelection={true} lineComponentMapper={dum.function} renderSingleGroupDecoration={true} store={dumClass.SearchStore} />);
test("ScopeSelect", <ScopeSelect list={dum.array} value={dum.string} />);
test("SearchActionBar", <SearchActionBar store={dumClass.SearchStore} />);
test("SearchBar", <SearchBar scopes={dum.array} store={dumClass.SearchStore} />);
test("StyleProvider", <StyleProvider  />);
