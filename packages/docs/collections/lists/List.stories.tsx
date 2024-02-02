import {LineProps, List} from "@focus4/collections";
import {CollectionStore} from "@focus4/stores";

import {ListMeta} from "../metas/list";

import type {Meta, StoryObj} from "@storybook/react";

const {data, hasSelection, isLoading, store, ...argTypes} = ListMeta.argTypes;

export default {
    ...ListMeta,
    argTypes,
    title: "Listes/Composants de listes/listFor",
    args: {}
} as Meta<typeof List>;

const list = [
    {id: 1, label: "Gestionnaire", count: 35},
    {id: 2, label: "Administrateur", count: 3},
    {id: 3, label: "Superviseur", count: 13},
    {id: 4, label: "Auditeur", count: 4},
    {id: 5, label: "Consultant", count: 65},
    {id: 6, label: "Externe", count: 143}
];

function LineComponent({
    data: {id, label, count},
    hasCheckbox
}: LineProps<{id: number; label: string; count: number}> & {hasCheckbox?: boolean}) {
    return (
        <div
            style={{
                height: 20,
                lineHeight: "20px",
                backgroundColor: "rgb(var(--color-white))",
                padding: hasCheckbox ? "20px 60px" : "20px 20px",
                borderRadius: "var(--table-border-radius)",
                boxShadow: "var(--table-box-shadow)",
                marginBottom: "10px"
            }}
        >
            {id} - {label} - {count}
        </div>
    );
}

export const Data: StoryObj<typeof List<{id: number; label: string; count: number}>> = {
    name: "listFor avec une liste simple",
    parameters: {
        docs: {
            description: {
                story: `Liste avec une liste passée dans la prop \`data\`.

Il faudra construire un \`LineComponent\` adapté au contenu que vous voulez afficher.`
            }
        }
    },
    argTypes: {data, isLoading},
    args: {
        data: list,
        LineComponent,
        itemKey: item => item.id
    }
};

const collectionStore = new CollectionStore<{id: number; label: string; count: number}>();
collectionStore.list = list;
collectionStore.sortBy = "id";

export const Store: StoryObj<typeof List<{id: number; label: string; count: number}>> = {
    name: "listFor avec un store",
    parameters: {
        docs: {
            description: {
                story: `Liste avec un \`CollectionStore\` passé dans la prop \`store\`.

Cet exemple utilise le même \`LineComponent\` que l'exemple précédent (avec un padding à gauche plus grand pour accomoder la checkbox) et les
fonctionnalités suivantes :
- Sélection
- Actions par ligne
- Pagination manuelle`
            }
        }
    },
    argTypes: {store, hasSelection},
    args: {
        store: collectionStore,
        hasSelection: true,
        operationList: () => [
            {
                action: () => {
                    /* */
                },
                icon: "delete",
                label: "Supprimer"
            }
        ],
        LineComponent: p => <LineComponent {...p} hasCheckbox />,
        itemKey: item => item.id,
        perPage: 4,
        isManualFetch: true
    }
};
