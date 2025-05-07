import {Table} from "@focus4/collections";
import {CollectionStore} from "@focus4/stores";

import {TableMeta} from "../metas/table";

import type {Meta, StoryObj} from "@storybook/react";

const {data, hasSelection, hasSelectAll, isLoading, store, ...argTypes} = TableMeta.argTypes;

export default {
    ...TableMeta,
    argTypes,
    title: "Listes/Composants de listes/tableFor",
    args: {}
} as Meta<typeof Table>;

const list = [
    {id: 1, label: "Gestionnaire", count: 55},
    {id: 2, label: "Administrateur", count: 34},
    {id: 3, label: "Superviseur", count: 55},
    {id: 4, label: "Auditeur", count: 4},
    {id: 5, label: "Consultant", count: 55},
    {id: 6, label: "Externe", count: 34}
];

export const Data: StoryObj<typeof Table<{id: number; label: string; count: number}>> = {
    name: "tableFor avec une liste simple",
    parameters: {
        docs: {
            description: {
                story: `Tableau avec une liste passée dans la prop \`data\`.

Cet exemple est assez minimaliste, mais montre quand même l'usage de \`onLineClick\` pour ajouter une action au clic sur un élément.`
            }
        }
    },
    argTypes: {data, isLoading},
    args: {
        data: list,
        columns: [
            {
                title: "Id",
                content: item => item.id
            },
            {
                title: "Libellé",
                content: item => item.label
            },
            {
                title: "Nombre",
                content: item => item.count
            }
        ],
        itemKey: item => item.id,
        onLineClick: () => {
            /* */
        }
    }
};

const collectionStore = new CollectionStore<{id: number; label: string; count: number}>();
collectionStore.list = list;
collectionStore.sort = [{fieldName: "id"}];

export const Store: StoryObj<typeof Table<{id: number; label: string; count: number}>> = {
    name: "tableFor avec un store",
    parameters: {
        docs: {
            description: {
                story: `Tableau avec un \`CollectionStore\` passé dans la prop \`store\`.

Cet exemple utilise les fonctionnalités suivantes :
- Tri
- Sélection
- Actions par ligne et globales
- Pagination manuelle`
            }
        }
    },
    argTypes: {store, hasSelection, hasSelectAll},
    args: {
        store: collectionStore,
        hasSelection: true,
        hasSelectAll: true,
        operationList: [
            {
                action: () => {
                    /* */
                },
                type: "secondary",
                label: "Exporter",
                icon: "download"
            },
            {
                action: () => {
                    /* */
                },
                icon: "delete",
                label: "Supprimer",
                type: "icon-tooltip"
            }
        ],
        lineOperationList: () => [
            {
                action: () => {
                    /* */
                },
                icon: "delete",
                label: "Supprimer",
                type: "icon-tooltip"
            }
        ],
        columns: [
            {
                title: "Id",
                content: item => item.id,
                sortKey: "id"
            },
            {
                title: "Libellé",
                content: item => item.label,
                sortKey: "label"
            },
            {
                title: "Nombre",
                content: item => item.count,
                sortKey: "count"
            }
        ],
        itemKey: item => item.id,
        perPage: 4,
        isManualFetch: true,
        maxSort: 2
    }
};
