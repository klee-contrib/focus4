/*
    Ce fichier à été généré automatiquement.
    Toute modification sera perdue.
*/
/* tslint:disable */

import * as React from "react";
import {dum, dumClass, test} from "../testing";

import {ActionBar} from "../search/components/action-bar";
import {AdvancedSearch} from "../search/components/advanced-search";
import {ContextualActions} from "../list/components/contextual-actions";
import {ErrorCenter} from "../application/layout/error-center";
import {Facet} from "../search/components/facet-box/facet";
import {FacetBox} from "../search/components/facet-box";
import {Field} from "../entity/field";
import {Group} from "../search/components/results/group";
import {HeaderScrolling} from "../application/layout/header/scrolling";
import {Layout} from "../application/layout";
import {LineWrapper} from "../list/components/line";
import {ListWrapper} from "../list/components/list-wrapper";
import {MenuList} from "../application/layout/menu/list";
import {MessageCenter} from "../message/message-center";
import {Popin} from "../application/layout/popin";
import {Results} from "../search/components/results";
import {SearchBar} from "../search/components/search-bar";
import {Summary} from "../search/components/summary";

test("ActionBar", <ActionBar store={dumClass.MiniListStore} />);
test("AdvancedSearch", <AdvancedSearch scopes={[]} store={dumClass.SearchStore} />);
test("ContextualActions", <ContextualActions operationList={[]} operationParam={{}} />);
test("ErrorCenter", <ErrorCenter  />);
test("Facet", <Facet facet={{code: dum.string, label: dum.string, values: []}} nbDefaultDataList={dum.number} selectHandler={dum.function} selectedDataKey={dum.string} />);
test("FacetBox", <FacetBox store={dumClass.SearchStore} />);
test("Field", <Field name={dum.string} value={dum.any} />);
test("Group", <Group group={{list: []}} perPage={dum.number} store={dumClass.SearchStore} />);
test("HeaderScrolling", <HeaderScrolling theme={{scrolling: dum.string, deployed: dum.string, undeployed: dum.string}} />);
test("Layout", <Layout  />);
test("LineWrapper", <LineWrapper LineComponent={dum.component} data={dum.any} />);
test("ListWrapper", <ListWrapper  />);
test("MenuList", <MenuList menus={[]} />);
test("MessageCenter", <MessageCenter  />);
test("Popin", <Popin closePopin={dum.function} opened={true} />);
test("Results", <Results hasSelection={true} store={dumClass.SearchStore} />);
test("SearchBar", <SearchBar store={dumClass.SearchStore} />);
test("Summary", <Summary scopes={[]} store={dumClass.SearchStore} />);
