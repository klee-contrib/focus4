import {setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";

import {i18nCollections} from "./src/translation";

export function setupCollectionsTest() {
    setupComponentTest({focus: {...i18nCollections.fr, icons: i18nCollections.icons}});
}
