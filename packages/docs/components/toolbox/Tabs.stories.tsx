import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";

import {Tab, Tabs} from "@focus4/toolbox";

import {TabsMeta} from "./metas/tabs";

export default {
    ...TabsMeta,
    title: "Composants/@focus4∕toolbox/Tabs"
} as Meta<typeof Tabs>;

export const Showcase: StoryObj<typeof Tabs> = {
    render(props) {
        const [tab1, setTab1] = useState(0);
        const [tab2, setTab2] = useState(0);

        return (
            <div className="stack">
                <Tabs {...props} index={tab1} onChange={setTab1}>
                    <Tab icon="home" label="Accueil" />
                    <Tab icon="group" label="Utilisateurs" />
                    <Tab icon="settings" label="Profils" />
                </Tabs>
                <Tabs {...props} index={tab2} onChange={setTab2} secondary>
                    <Tab icon="home" label="Accueil">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                            voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                            cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </Tab>
                    <Tab icon="group" label="Utilisateurs">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                        </p>
                    </Tab>
                    <Tab icon="settings" label="Profils">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        </p>
                    </Tab>
                </Tabs>
            </div>
        );
    }
};
