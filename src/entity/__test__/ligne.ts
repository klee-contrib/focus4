export interface Ligne {
    id?: number;
}

export const LigneEntity = {
    name: "ligne",
    fields: {
        id: {
            type: "field" as "field",
            domain: {},
            isRequired: true,
            name: "id",
            label: "ligne.id"
        }
    }
};
