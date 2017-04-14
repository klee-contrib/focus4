import focusComponents from "focus-components/translation/resources/fr-FR";

/** Objet contenant les traductions i18n en français par défaut, à intégrer si besoin dans un projet. */
export const fr = {
    focus: {
        components: focusComponents.focus.components,
        detail: {
            deleted: "Élement supprimé avec succès",
            saved: "Élement enregistré avec succès"
        },
        list: {
            add: "Ajouter",
            mode: {
                list: "Liste",
                mosaic: "Mosaïque"
            },
            show: {
                all: "Voir tout",
                displayed: "élements affichés",
                less: "Voir moins",
                more: "Voir plus"
            }
        },
        search: {
            action: {
                filter: "Filtrer",
                group: "Grouper",
                selectedItem: "élement sélectionné",
                selectedItems: "élements sélectionnés",
                sort: "Trier",
                sortBy: "Trié par"
            },
            bar: {
                close: "Fermer",
                error: "Les critères suivants sont en erreur",
                query: "Contient les mots",
                reset: "Réinitialiser"
            },
            empty: "Aucun résultat",
            facets: {
                title: "Filtrer"
            },
            loading: "Chargement...",
            summary: {
                by: "par",
                export: "Exporter",
                for: "pour",
                group: "groupé par",
                groups: "groupés par",
                result: "résultat",
                results: "résultats"
            }
        },
        validation: {
            date: "La date saisie est invalide",
            email: "L'email saisi est invalide.",
            function: "La valeur saisie est invalide",
            montant: "Le montant saisi est invalide",
            number: "Le nombre saisi est invalide",
            pourcentage: "Le pourcentage saisi est invalide",
            regex: "La valeur saisie est invalide",
            required: "Le champ est obligatoire"
        }
    },
    select: {
        unSelected: ""
    }
};
