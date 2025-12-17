import type {Meta} from "@storybook/react";
import type {StoryObj} from "@storybook/react-vite";
import {observer} from "mobx-react";
import z from "zod";

import {e, entity} from "@focus4/entities";
import {domain} from "@focus4/form-toolbox";
import {fieldFor, useFormNode} from "@focus4/forms";
import {makeEntityStore} from "@focus4/stores";

const LIBELLE = domain(z.string());

// Entity pour la story par défaut
const simpleStore = makeEntityStore({
    simple: entity({
        name: e.field(LIBELLE, f => f.label("Nom").defaultValue("Georges"))
    })
});

// ============================================
// Composants pour les stories
// ============================================

const SimpleField = observer(() => {
    const formNode = useFormNode(simpleStore.simple, f => f.edit(true));
    return fieldFor(formNode.name);
});

const meta = {
    title: "Modèle métier/Créer un formulaire",
    component: SimpleField
} satisfies Meta<typeof SimpleField>;

export default meta;

type Story = StoryObj<typeof meta>;

// ============================================
// Stories
// ============================================

/**
 * Exemple par défaut d'un champ texte simple en mode édition.
 */
export const Default: Story = {
    tags: ["autodocs"],
    render: () => {
        const formNode = useFormNode(simpleStore.simple, f => f.edit(true));
        return fieldFor(formNode.name);
    }
};

