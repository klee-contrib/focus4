import type {Meta, StoryObj} from "@storybook/react";
import {DateTime} from "luxon";

import {LineProps, Timeline} from "@focus4/collections";
import {domain} from "@focus4/form-toolbox";
import {CollectionStore, makeField} from "@focus4/stores";

import {TimelineMeta} from "../metas/timeline";

const {data, isLoading, store, ...argTypes} = TimelineMeta.argTypes;

export default {
    ...TimelineMeta,
    argTypes,
    title: "Listes/Composants de listes/timelineFor",
    args: {
        dateSelector: item =>
            makeField(
                item.date,
                domain({
                    type: "string",
                    displayFormatter: v =>
                        v ? DateTime.fromISO(v).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) : ""
                })
            )
    }
} as Meta<typeof Timeline<{id: number; label: string; date: string}>>;

const list = [
    {id: 6, label: "Suppression", date: "2024-01-06T14:25:43"},
    {id: 5, label: "Modification", date: "2024-01-05T17:14:45"},
    {id: 4, label: "Modification", date: "2024-01-05T16:09:00"},
    {id: 3, label: "Modification", date: "2024-01-04T09:46:05"},
    {id: 2, label: "Modification", date: "2024-01-01T12:04:12"},
    {id: 1, label: "Création", date: "2024-01-01T12:00:34"}
];

function TimelineComponent({data: {id, label}}: LineProps<{id: number; label: string; date: string}>) {
    return (
        <div
            style={{
                height: 20,
                lineHeight: "20px",
                backgroundColor: "rgb(var(--color-white))",
                padding: 20,
                borderRadius: "0 var(--table-border-radius) var(--table-border-radius) 0",
                boxShadow: "var(--table-box-shadow)",
                marginBottom: "10px"
            }}
        >
            {id} - {label}
        </div>
    );
}

export const Data: StoryObj<typeof Timeline<{id: number; label: string; date: string}>> = {
    name: "timelineFor avec une timeline simple",
    parameters: {
        docs: {
            description: {
                story: `Timeline avec une timeline passée dans la prop \`data\`.

Il faudra construire un \`TimelineComponent\` adapté au contenu que vous voulez afficher.`
            }
        }
    },
    argTypes: {data, isLoading},
    args: {
        data: list,
        TimelineComponent,
        itemKey: item => item.id
    }
};

const collectionStore = new CollectionStore<{id: number; label: string; date: string}>();
collectionStore.list = list;
collectionStore.sortBy = "date";
collectionStore.sortAsc = false;

export const Store: StoryObj<typeof Timeline<{id: number; label: string; date: string}>> = {
    name: "timelineFor avec un store",
    parameters: {
        docs: {
            description: {
                story: `Timeline avec un \`CollectionStore\` passé dans la prop \`store\`.

Hormis la pagination serveur apportée par le \`CollectionStore\` (qui est ici réalisée côté client d'ailleurs), il n'y a pas de nouvelle fonctionnalité dans ce mode.`
            }
        }
    },
    argTypes: {store},
    args: {
        store: collectionStore,
        TimelineComponent,
        itemKey: item => item.id,
        perPage: 4,
        isManualFetch: true
    }
};
