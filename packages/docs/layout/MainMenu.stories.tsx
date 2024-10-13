import {useState} from "react";

import {MainMenu, MainMenuItem} from "@focus4/layout";

import {MainMenuMeta} from "./metas/main-menu";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...MainMenuMeta,
    title: "Mise en page/MainMenu"
} as Meta<typeof MainMenu>;

export const Showcase: StoryObj<typeof MainMenu> = {
    render(props) {
        const [activeRoute, setActiveRoute] = useState("home");
        return (
            <div style={{width: 90}}>
                <MainMenu {...props} activeRoute={activeRoute}>
                    <MainMenuItem icon="home" label="Accueil" onClick={() => setActiveRoute("home")} route="home" />
                    <MainMenuItem
                        icon="group"
                        label="Utilisateurs"
                        onClick={() => setActiveRoute("group")}
                        route="group"
                    />
                    <MainMenuItem
                        icon="business"
                        label="Clients"
                        onClick={() => setActiveRoute("business")}
                        route="business"
                    />
                    <MainMenuItem
                        icon="settings"
                        label="Paramètres"
                        onClick={() => setActiveRoute("settings")}
                        route="settings"
                    />
                </MainMenu>
            </div>
        );
    }
};
