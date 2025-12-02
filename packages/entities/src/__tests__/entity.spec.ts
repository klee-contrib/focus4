import {describe, expect, test} from "vitest";
import {z} from "zod";

import {e, entity, stringToSchemaOutput} from "../focus4.entities";

const LIBELLE = {
    schema: z.string()
} as Domain;
const CODE = {
    schema: z.string().max(3).min(3)
} as Domain;
const NUMBER = {
    schema: z.number()
} as Domain;
const BOOLEAN = {
    schema: z.boolean()
} as Domain;

describe("entity", () => {
    test("devrait auto-assigner le nom des champs field à partir de la clé de l'objet", () => {
        const myEntity = entity({
            code: e.field(CODE),
            libelle: e.field(LIBELLE)
        });

        expect(myEntity.code.name).toBe("code");
        expect(myEntity.libelle.name).toBe("libelle");
    });

    test("ne devrait pas écraser un nom déjà défini", () => {
        const myEntity = entity({
            code: e.field(CODE, f => f.name("customName"))
        });

        expect(myEntity.code.name).toBe("customName");
    });

    test("devrait fonctionner avec des entrées mixtes", () => {
        const subEntity = entity({
            subField: e.field(LIBELLE)
        });

        const myEntity = entity({
            code: e.field(CODE),
            sub: e.object(subEntity)
        });

        expect(myEntity.code.name).toBe("code");
        expect(myEntity.sub.type).toBe("object");
    });
});

describe("e.field", () => {
    test("devrait créer un champ field avec les valeurs par défaut", () => {
        const field = e.field(LIBELLE);

        expect(field.type).toBe("field");
        expect(field.domain).toBe(LIBELLE);
        expect(field.isRequired).toBe(true);
        expect(field.label).toBe("");
        expect(field.name).toBe("");
    });

    test("devrait créer un champ field avec un builder", () => {
        const field = e.field(LIBELLE, f =>
            f.label("Libellé").optional().comment("Un commentaire").defaultValue("valeur par défaut")
        );

        expect(field.type).toBe("field");
        expect(field.domain).toBe(LIBELLE);
        expect(field.isRequired).toBe(false);
        expect(field.label).toBe("Libellé");
        expect(field.comment).toBe("Un commentaire");
        expect(field.defaultValue).toBe("valeur par défaut");
    });

    test("devrait permettre de définir un nom personnalisé", () => {
        const field = e.field(CODE, f => f.name("codeCustom"));

        expect(field.name).toBe("codeCustom");
    });

    test("devrait fonctionner avec différents types de domaines", () => {
        const stringField = e.field(LIBELLE);
        const numberField = e.field(NUMBER);
        const booleanField = e.field(BOOLEAN);

        expect(stringField.domain.schema).toBe(LIBELLE.schema);
        expect(numberField.domain.schema).toBe(NUMBER.schema);
        expect(booleanField.domain.schema).toBe(BOOLEAN.schema);
    });
});

describe("e.object", () => {
    test("devrait créer une entrée object avec les valeurs par défaut", () => {
        const subEntity = entity({
            subField: e.field(LIBELLE)
        });

        const objectEntry = e.object(subEntity);

        expect(objectEntry.type).toBe("object");
        expect(objectEntry.entity).toBe(subEntity);
        expect(objectEntry.isRequired).toBe(true);
        expect(objectEntry.label).toBe("");
    });

    test("devrait créer une entrée object avec un builder", () => {
        const subEntity = entity({
            subField: e.field(LIBELLE)
        });

        const objectEntry = e.object(subEntity, o => o.label("Sous-objet").optional().comment("Un commentaire"));

        expect(objectEntry.type).toBe("object");
        expect(objectEntry.entity).toBe(subEntity);
        expect(objectEntry.isRequired).toBe(false);
        expect(objectEntry.label).toBe("Sous-objet");
        expect(objectEntry.comment).toBe("Un commentaire");
    });

    test("devrait fonctionner avec des entités imbriquées", () => {
        const deepEntity = entity({
            deepField: e.field(LIBELLE)
        });

        const subEntity = entity({
            subField: e.field(CODE),
            deep: e.object(deepEntity)
        });

        const objectEntry = e.object(subEntity);

        expect(objectEntry.type).toBe("object");
        expect(objectEntry.entity).toBe(subEntity);
    });
});

describe("e.list", () => {
    test("devrait créer une entrée list avec les valeurs par défaut", () => {
        const itemEntity = entity({
            itemField: e.field(LIBELLE)
        });

        const listEntry = e.list(itemEntity);

        expect(listEntry.type).toBe("list");
        expect(listEntry.entity).toBe(itemEntity);
        expect(listEntry.isRequired).toBe(true);
        expect(listEntry.label).toBe("");
    });

    test("devrait créer une entrée list avec un builder", () => {
        const itemEntity = entity({
            itemField: e.field(LIBELLE)
        });

        const listEntry = e.list(itemEntity, l => l.label("Liste").optional().comment("Une liste"));

        expect(listEntry.type).toBe("list");
        expect(listEntry.entity).toBe(itemEntity);
        expect(listEntry.isRequired).toBe(false);
        expect(listEntry.label).toBe("Liste");
        expect(listEntry.comment).toBe("Une liste");
    });
});

describe("e.recursiveList", () => {
    test("devrait créer une entrée recursive-list avec les valeurs par défaut", () => {
        const recursiveEntry = e.recursiveList();

        expect(recursiveEntry.type).toBe("recursive-list");
        expect(recursiveEntry.isRequired).toBe(true);
        expect(recursiveEntry.label).toBe("");
    });

    test("devrait créer une entrée recursive-list avec un builder", () => {
        const recursiveEntry = e.recursiveList(r => r.label("Liste récursive").optional().comment("Récursif"));

        expect(recursiveEntry.type).toBe("recursive-list");
        expect(recursiveEntry.isRequired).toBe(false);
        expect(recursiveEntry.label).toBe("Liste récursive");
        expect(recursiveEntry.comment).toBe("Récursif");
    });
});

describe("Entry Builders", () => {
    describe("FieldEntryBuilder", () => {
        test("devrait permettre de rendre un champ optionnel", () => {
            const field = e.field(LIBELLE, f => f.optional());

            expect(field.isRequired).toBe(false);
        });

        test("devrait permettre de définir un libellé", () => {
            const field = e.field(LIBELLE, f => f.label("Mon libellé"));

            expect(field.label).toBe("Mon libellé");
        });

        test("devrait permettre de définir un commentaire", () => {
            const field = e.field(LIBELLE, f => f.comment("Un commentaire utile"));

            expect(field.comment).toBe("Un commentaire utile");
        });

        test("devrait permettre de définir une valeur par défaut", () => {
            const field = e.field(LIBELLE, f => f.defaultValue("défaut"));

            expect(field.defaultValue).toBe("défaut");
        });

        test("devrait permettre de chaîner plusieurs méthodes", () => {
            const field = e.field(LIBELLE, f =>
                f.label("Libellé").optional().comment("Commentaire").defaultValue("défaut")
            );

            expect(field.label).toBe("Libellé");
            expect(field.isRequired).toBe(false);
            expect(field.comment).toBe("Commentaire");
            expect(field.defaultValue).toBe("défaut");
        });

        test("devrait permettre de préciser le type avec type()", () => {
            const field = e.field(LIBELLE, f => f.type<string>());

            expect(field.type).toBe("field");
            expect(field.domain).toBe(LIBELLE);
        });
    });

    describe("ObjectEntryBuilder", () => {
        test("devrait permettre de rendre un objet optionnel", () => {
            const subEntity = entity({
                subField: e.field(LIBELLE)
            });

            const objectEntry = e.object(subEntity, o => o.optional());

            expect(objectEntry.isRequired).toBe(false);
        });

        test("devrait permettre de définir un libellé et un commentaire", () => {
            const subEntity = entity({
                subField: e.field(LIBELLE)
            });

            const objectEntry = e.object(subEntity, o => o.label("Objet").comment("Commentaire"));

            expect(objectEntry.label).toBe("Objet");
            expect(objectEntry.comment).toBe("Commentaire");
        });
    });

    describe("ListEntryBuilder", () => {
        test("devrait permettre de rendre une liste optionnelle", () => {
            const itemEntity = entity({
                itemField: e.field(LIBELLE)
            });

            const listEntry = e.list(itemEntity, l => l.optional());

            expect(listEntry.isRequired).toBe(false);
        });

        test("devrait permettre de définir un libellé et un commentaire", () => {
            const itemEntity = entity({
                itemField: e.field(LIBELLE)
            });

            const listEntry = e.list(itemEntity, l => l.label("Liste").comment("Commentaire"));

            expect(listEntry.label).toBe("Liste");
            expect(listEntry.comment).toBe("Commentaire");
        });
    });

    describe("RecursiveListEntryBuilder", () => {
        test("devrait permettre de rendre une liste récursive optionnelle", () => {
            const recursiveEntry = e.recursiveList(r => r.optional());

            expect(recursiveEntry.isRequired).toBe(false);
        });

        test("devrait permettre de définir un libellé et un commentaire", () => {
            const recursiveEntry = e.recursiveList(r => r.label("Récursif").comment("Commentaire"));

            expect(recursiveEntry.label).toBe("Récursif");
            expect(recursiveEntry.comment).toBe("Commentaire");
        });
    });
});

describe("stringToSchemaOutput", () => {
    test("devrait convertir une string en string pour un schéma string", () => {
        const result = stringToSchemaOutput("test", z.string());

        expect(result).toBe("test");
    });

    test("devrait retourner undefined si la valeur est undefined pour un schéma string", () => {
        const result = stringToSchemaOutput(undefined, z.string());

        expect(result).toBeUndefined();
    });

    test("devrait convertir une string en number pour un schéma number", () => {
        const result = stringToSchemaOutput("123.45", z.number());

        expect(result).toBe(123.45);
    });

    test("devrait convertir une string en number entier", () => {
        const result = stringToSchemaOutput("42", z.number());

        expect(result).toBe(42);
    });

    test("devrait retourner undefined si la valeur est undefined pour un schéma number", () => {
        const result = stringToSchemaOutput(undefined, z.number());

        expect(result).toBeUndefined();
    });

    test("devrait convertir 'true' en boolean true", () => {
        const result = stringToSchemaOutput("true", z.boolean());

        expect(result).toBe(true);
    });

    test("devrait convertir 'false' en boolean false", () => {
        const result = stringToSchemaOutput("false", z.boolean());

        expect(result).toBe(false);
    });

    test("devrait retourner undefined pour une valeur non 'true' ou 'false' avec un schéma boolean", () => {
        const result = stringToSchemaOutput("maybe", z.boolean());

        expect(result).toBeUndefined();
    });

    test("devrait retourner undefined pour undefined avec un schéma boolean", () => {
        const result = stringToSchemaOutput(undefined, z.boolean());

        expect(result).toBeUndefined();
    });
});

describe("Entités complexes", () => {
    test("devrait créer une entité avec tous les types d'entrées", () => {
        const subEntity = entity({
            subField: e.field(LIBELLE)
        });

        const complexEntity = entity({
            code: e.field(CODE, f => f.label("Code").optional()),
            libelle: e.field(LIBELLE, f => f.label("Libellé")),
            sub: e.object(subEntity, o => o.label("Sous-objet")),
            items: e.list(subEntity, l => l.label("Liste")),
            children: e.recursiveList(r => r.label("Enfants"))
        });

        expect(complexEntity.code.type).toBe("field");
        expect(complexEntity.code.isRequired).toBe(false);
        expect(complexEntity.libelle.type).toBe("field");
        expect(complexEntity.libelle.isRequired).toBe(true);
        expect(complexEntity.sub.type).toBe("object");
        expect(complexEntity.items.type).toBe("list");
        expect(complexEntity.children.type).toBe("recursive-list");
    });

    test("devrait créer une entité imbriquée", () => {
        const deepEntity = entity({
            deepField: e.field(LIBELLE)
        });

        const middleEntity = entity({
            middleField: e.field(CODE),
            deep: e.object(deepEntity)
        });

        const topEntity = entity({
            topField: e.field(LIBELLE),
            middle: e.object(middleEntity)
        });

        expect(topEntity.topField.type).toBe("field");
        expect(topEntity.middle.type).toBe("object");
        expect(topEntity.middle.entity.middleField.type).toBe("field");
        expect(topEntity.middle.entity.deep.type).toBe("object");
    });
});
