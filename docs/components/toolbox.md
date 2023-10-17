# Composants de `@focus4/toolbox` <!-- {docsify-ignore-all} -->

`@focus4/toolbox` est une réimplémentation en React moderne de [React Toolbox](https://react-toolbox.io/#/components), une librairie qui implémentait Material Design pour le web. Cette librairie avait été choisie au lancement de la v4 de Focus (en 2016), mais son développement a été malheureusement abandonné 2 ans plus tard... Sans autre alternative viable, elle a fini par être intégralement intégrée dans Focus.

## `Autocomplete`

Champ de saisie en autocomplétion à partir d'une **liste de valeurs possibles en entrée**.

### Props

| Nom                     | Obligatoire | Type                                                                                                                   | Description                                                                                                                                                                                                                                                              |
| ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `additionalSuggestions` | Non         | <code>{ key: string; content: ReactNode; onClick: () =&gt; void; }[]</code>                                            | Suggestions supplémentaires à afficher en plus des suggestions issues de `values`, pour effectuer des actions différentes.                                                                                                                                               |
| `allowUnmatched`        | Non         | <code>boolean</code>                                                                                                   | Autorise la sélection d'une valeur qui n'existe pas dans `values` (le contenu de la `query` sera retourné en tant que valeur).                                                                                                                                           |
| `className`             | Non         | <code>string</code>                                                                                                    | Classe CSS pour le composant racine.                                                                                                                                                                                                                                     |
| `clearQueryOnChange`    | Non         | <code>boolean</code>                                                                                                   | Vide la query à la sélection d'une valeur.                                                                                                                                                                                                                               |
| `direction`             | Non         | <code>"auto" &#124; "up" &#124; "down"</code>                                                                          | Précise dans quel sens les suggestions doivent s'afficher. Par défaut : "auto".                                                                                                                                                                                          |
| `disabled`              | Non         | <code>boolean</code>                                                                                                   | Désactive le champ texte.                                                                                                                                                                                                                                                |
| `error`                 | Non         | <code>boolean</code>                                                                                                   | Affiche le champ texte en erreur.                                                                                                                                                                                                                                        |
| `fieldRef`              | Non         | <code>RefObject&lt;HTMLDivElement&gt;</code>                                                                           | Ref vers le champ (pour ancrer un Menu dessus par exemple).                                                                                                                                                                                                              |
| `getKey`                | Non         | <code>(item: TSource) =&gt; string</code>                                                                              | Détermine la propriété de l'objet a utiliser comme clé. *<br />Par défaut : `item => item.key`                                                                                                                                                                           |
| `getLabel`              | Non         | <code>(item: TSource) =&gt; string</code>                                                                              | Détermine la propriété de l'objet à utiliser comme libellé.<br />Le libellé de l'objet est le texte utilisé pour chercher la correspondance avec le texte saisi dans le champ.<br />Par défaut : `item => item.label`                                                    |
| `hint`                  | Non         | <code>string</code>                                                                                                    | Placeholder pour le champ texte.                                                                                                                                                                                                                                         |
| `icon`                  | Non         | <code>ReactNode</code>                                                                                                 | Icône à poser devant le texte.                                                                                                                                                                                                                                           |
| `id`                    | Non         | <code>string</code>                                                                                                    | `id` pour l'input HTML.                                                                                                                                                                                                                                                  |
| `label`                 | Non         | <code>string</code>                                                                                                    | Libellé du champ, sera affiché à la place du `hint` et se déplacera sur le dessus lorsque le champ est utilisé.                                                                                                                                                          |
| `LineComponent`         | Non         | <code>(props: { item: TSource; }) =&gt; ReactElement&lt;any, string &#124; JSXElementConstructor&lt;any&gt;&gt;</code> | Composant personnalisé pour afficher les suggestions.                                                                                                                                                                                                                    |
| `loading`               | Non         | <code>boolean</code>                                                                                                   | Affiche un indicateur de chargement dans le champ texte.                                                                                                                                                                                                                 |
| `multiline`             | Non         | <code>boolean</code>                                                                                                   | Si renseigné, affiche un <textarea> à la place de l'<input>.                                                                                                                                                                                                             |
| `name`                  | Non         | <code>string</code>                                                                                                    | `name` pour l'input HTML.                                                                                                                                                                                                                                                |
| `onBlur`                | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                      | Au blur du champ texte.                                                                                                                                                                                                                                                  |
| `onChange`              | Non         | <code>(value?: string) =&gt; void</code>                                                                               | Appelé avec la clé correspondante lors de la sélection d'une valeur.<br /><br />Sera appelé avec `undefined` (si `allowUnmatched = false`) si aucune suggestion n'est disponible lors de la confirmation de la saisie<br />(au blur du champ ou en appuyant sur Entrée). |
| `onClick`               | Non         | <code>MouseEventHandler&lt;HTMLDivElement&gt;</code>                                                                   | Au clic sur le champ texte.                                                                                                                                                                                                                                              |
| `onContextMenu`         | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                      | Au clic-droit dans le champ texte.                                                                                                                                                                                                                                       |
| `onFocus`               | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                      | Au focus du champ texte.                                                                                                                                                                                                                                                 |
| `onKeyDown`             | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                   | Au `keydown` du champ.                                                                                                                                                                                                                                                   |
| `onKeyPress`            | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                   | Au `keypress` du champ.                                                                                                                                                                                                                                                  |
| `onKeyUp`               | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                   | Au `keyup` du champ.                                                                                                                                                                                                                                                     |
| `onPaste`               | Non         | <code>ClipboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                  | Au collage de texte dans le champ.                                                                                                                                                                                                                                       |
| `onPointerDown`         | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                           | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)                                                                                                                                                                                    |
| `onPointerEnter`        | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                           | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)                                                                                                                                                                                   |
| `onPointerLeave`        | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                           | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)                                                                                                                                                                                   |
| `onPointerUp`           | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                           | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)                                                                                                                                                                                      |
| `onQueryChange`         | Non         | <code>(query: string) =&gt; void</code>                                                                                | Handler appelé lorsque la query (= contenu du champ texte) change.                                                                                                                                                                                                       |
| `prefix`                | Non         | <code>string</code>                                                                                                    | Préfixe à poser devant le texte.                                                                                                                                                                                                                                         |
| `query`                 | Non         | <code>string</code>                                                                                                    | Permet de surcharger la query (= contenu du champ texte). A utiliser avec `onQueryChange`.                                                                                                                                                                               |
| `readOnly`              | Non         | <code>boolean</code>                                                                                                   | Valeur de `readonly` sur l'input HTML.                                                                                                                                                                                                                                   |
| `required`              | Non         | <code>boolean</code>                                                                                                   | Valeur de `required` sur l'input HTML.                                                                                                                                                                                                                                   |
| `rows`                  | Non         | <code>number</code>                                                                                                    | Nombre de lignes pour le <textarea> (si `multiline`).                                                                                                                                                                                                                    |
| `showSupportingText`    | Non         | <code>"always" &#124; "auto" &#124; "never"</code>                                                                     | Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "auto".                                                                                                                                       |
| `suffix`                | Non         | <code>string</code>                                                                                                    | Préfixe à poser après le texte.                                                                                                                                                                                                                                          |
| `suggestionMatch`       | Non         | <code>"disabled" &#124; "anywhere" &#124; "start" &#124; "word"</code>                                                 | Précise le mode de correspondance utilisé entre la query et le libellé. Par défaut : "start".                                                                                                                                                                            |
| `supportingText`        | Non         | <code>string</code>                                                                                                    | Texte à afficher en dessous du champ. Sera affiché en rouge si `error`.                                                                                                                                                                                                  |
| `tabIndex`              | Non         | <code>number</code>                                                                                                    | `tabindex` pour l'input HTML.                                                                                                                                                                                                                                            |
| `theme`                 | Non         | <code>CSSProp&lt;AutocompleteCss & TextFieldCss&gt;</code>                                                             | CSS.                                                                                                                                                                                                                                                                     |
| `trailing`              | Non         | <code>TrailingIcon &#124; TrailingIcon[]</code>                                                                        | Définition des icônes à poser après le texte dans le champ.                                                                                                                                                                                                              |
| `value`                 | Non         | <code>string</code>                                                                                                    | Valeur du champ.                                                                                                                                                                                                                                                         |
| `values`                | Non         | <code>TSource[]</code>                                                                                                 | Valeurs disponibles pour la sélection.                                                                                                                                                                                                                                   |

## `Button`

Bouton standard.

### Props

| Nom              | Obligatoire | Type                                                                                      | Description                                                                            |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                                                       | Classe CSS a ajouter au composant racine.                                              |
| `color`          | Non         | <code>"accent" &#124; "primary"</code>                                                    | Couleur du bouton.                                                                     |
| `disabled`       | Non         | <code>boolean</code>                                                                      | Désactive le bouton.                                                                   |
| `href`           | Non         | <code>string</code>                                                                       | Si renseigné, pose une balise <a> à la place du <button>.                              |
| `icon`           | Non         | <code>ReactNode</code>                                                                    | Icône a afficher dans le bouton.                                                       |
| `iconPosition`   | Non         | <code>"left" &#124; "right"</code>                                                        | Position de l'icône dans le bouton. Par défaut : "left".                               |
| `label`          | Non         | <code>string</code>                                                                       | Libellé du bouton.                                                                     |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au blur du bouton.                                                                     |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au clic sur le bouton.                                                                 |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au focus du bouton.                                                                    |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `style`          | Non         | <code>CSSProperties</code>                                                                | CSS inline pour l'élément racine.                                                      |
| `target`         | Non         | <code>string</code>                                                                       | "target" pour le <a>, si `href` est rensigné.                                          |
| `theme`          | Non         | <code>CSSProp&lt;ButtonCss&gt;</code>                                                     | CSS.                                                                                   |
| `type`           | Non         | <code>string</code>                                                                       | Type de bouton HTML (ignoré si `href` est renseigné).                                  |
| `variant`        | Non         | <code>"filled" &#124; "elevated" &#124; "outlined" &#124; "elevated-filled"</code>        | Variante du bouton .                                                                   |

## `Calendar`

Affiche un calendrier. Utilisé par l'[`InputDate`](components/forms.md#inputdate).

### Props

| Nom                    | Obligatoire | Type                                                    | Description |
| ---------------------- | ----------- | ------------------------------------------------------- | ----------- |
| `disabledDates`        | Non         | <code>Date[]</code>                                     |             |
| `display`              | Non         | <code>"months" &#124; "years"</code>                    |             |
| `enabledDates`         | Non         | <code>Date[]</code>                                     |             |
| `handleSelect`         | Non         | <code>() =&gt; void</code>                              |             |
| `maxDate`              | Non         | <code>Date</code>                                       |             |
| `minDate`              | Non         | <code>Date</code>                                       |             |
| `onChange`             | **Oui**     | <code>(date: Date, dayClick: boolean) =&gt; void</code> |             |
| `selectedDate`         | Non         | <code>Date</code>                                       |             |
| `sundayFirstDayOfWeek` | Non         | <code>boolean</code>                                    |             |
| `theme`                | Non         | <code>CSSProp&lt;CalendarCss&gt;</code>                 |             |

## `Checkbox`

Une checkbox.

### Props

| Nom              | Obligatoire | Type                                                                                             | Description                                                                            |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                                                              | Classe CSS a ajouter au composant racine.                                              |
| `disabled`       | Non         | <code>boolean</code>                                                                             | Désactive la Checkbox.                                                                 |
| `error`          | Non         | <code>string</code>                                                                              | Si renseigné, la Checkbox sera affichée en rouge.                                      |
| `id`             | Non         | <code>string</code>                                                                              | Id pour l'input[type=checkbox] posé par la Checkbox.                                   |
| `indeterminate`  | Non         | <code>boolean</code>                                                                             | Affiche une icône "indéterminée" à la place du "check"                                 |
| `label`          | Non         | <code>ReactNode</code>                                                                           | Libellé à poser à côté de la Checkbox.                                                 |
| `name`           | Non         | <code>string</code>                                                                              | Name pour l'input[type=checkbox] posé par la Checkbox.                                 |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLInputElement&gt;</code>                                           | Au blur de la Checkbox.                                                                |
| `onChange`       | Non         | <code>(value: boolean, event?: MouseEvent&lt;HTMLInputElement, MouseEvent&gt;) =&gt; void</code> | Handler appelé au clic sur la Checkbox.                                                |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLInputElement&gt;</code>                                           | Au focus de la Checkbox.                                                               |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;CheckboxCss&gt;</code>                                                          | CSS.                                                                                   |
| `value`          | Non         | <code>boolean</code>                                                                             | Valeur (correspond à 'checked' sur l'input).                                           |

## `Chip`



### Props

| Nom              | Obligatoire | Type                                                                                                             | Description                                                                            |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                                                                              | Classe CSS a ajouter au composant racine.                                              |
| `color`          | Non         | <code>"accent" &#124; "primary"</code>                                                                           | Couleur du Chip.                                                                       |
| `disabled`       | Non         | <code>boolean</code>                                                                                             | Désactive le Chip.                                                                     |
| `elevated`       | Non         | <code>boolean</code>                                                                                             | Si renseigné, le Chip est affiché avec une élévation.                                  |
| `href`           | Non         | <code>string</code>                                                                                              | Si renseigné, pose une balise <a> à la place du <button> ou <span>.                    |
| `icon`           | Non         | <code>ReactNode</code>                                                                                           | Icône a afficher dans le Chip (à gauche).                                              |
| `label`          | **Oui**     | <code>string</code>                                                                                              | Libellé du chip.                                                                       |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>                                   | Au blur du Chip (si actionnable).                                                      |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLButtonElement&gt;</code>                                                          | Au click sur le Chip. Pose un <button> au lieu d'un <span> si rensgeiné.               |
| `onDeleteClick`  | Non         | <code>MouseEventHandler&lt;HTMLSpanElement&gt;</code>                                                            | Si renseigné, le Chip a une action de suppression via un bouton icône (à droite).      |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>                                   | Au focus du Chip (si actionnable).                                                     |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement &#124; HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement &#124; HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement &#124; HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement &#124; HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `target`         | Non         | <code>string</code>                                                                                              | "target" pour le <a>, si `href` est rensigné.                                          |
| `theme`          | Non         | <code>CSSProp&lt;ChipCss&gt;</code>                                                                              | CSS.                                                                                   |

## `Clock`

Affiche une horloge. Utilisé par l'[`InputTime`](components/forms.md#inputdate).

### Props

| Nom           | Obligatoire | Type                                  | Description |
| ------------- | ----------- | ------------------------------------- | ----------- |
| `display`     | Non         | <code>"hours" &#124; "minutes"</code> |             |
| `format`      | Non         | <code>"24hr" &#124; "ampm"</code>     |             |
| `onChange`    | Non         | <code>(date: Date) =&gt; void</code>  |             |
| `onHandMoved` | Non         | <code>() =&gt; void</code>            |             |
| `theme`       | Non         | <code>CSSProp&lt;ClockCss&gt;</code>  |             |
| `time`        | Non         | <code>Date</code>                     |             |

## `Dropdown`

Composant de sélection avec personnalisation de l'affichage des éléments (à l'inverse du [`Select`](components/forms.md#select) qui est un simple `<select>`).

### Props

| Nom          | Obligatoire | Type                                                                                                                                                                             | Description                                                                                                   |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `allowBlank` | Non         | <code>boolean</code>                                                                                                                                                             | If true the dropdown will preselect the first item if the supplied value matches none of the options' values. |
| `auto`       | Non         | <code>boolean</code>                                                                                                                                                             | If true, the dropdown will open up or down depending on the position in the screen.                           |
| `className`  | Non         | <code>string</code>                                                                                                                                                              | CSS class for the root component.                                                                             |
| `disabled`   | Non         | <code>boolean</code>                                                                                                                                                             | If true, component will be disabled.                                                                          |
| `error`      | Non         | <code>string</code>                                                                                                                                                              | Give an error node to display under the field.                                                                |
| `id`         | Non         | <code>string</code>                                                                                                                                                              | Id for the input field.                                                                                       |
| `label`      | Non         | <code>ReactNode</code>                                                                                                                                                           | The text string to use for the floating label element.                                                        |
| `labelKey`   | Non         | <code>string</code>                                                                                                                                                              | Used for setting the label from source                                                                        |
| `name`       | Non         | <code>string</code>                                                                                                                                                              | Name for the input field.                                                                                     |
| `onBlur`     | Non         | <code>(event: FocusEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement &#124; HTMLDivElement, Element&gt; &#124; MouseEvent&lt;HTMLLIElement, MouseEvent&gt;) =&gt; void</code> |                                                                                                               |
| `onChange`   | Non         | <code>(value: T, event: MouseEvent&lt;HTMLLIElement, MouseEvent&gt;) =&gt; void</code>                                                                                           |                                                                                                               |
| `onClick`    | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement &#124; HTMLDivElement&gt;</code>                                                                          |                                                                                                               |
| `onFocus`    | Non         | <code>FocusEventHandler&lt;HTMLDivElement&gt;</code>                                                                                                                             |                                                                                                               |
| `required`   | Non         | <code>boolean</code>                                                                                                                                                             | If true, the html input has a required attribute.                                                             |
| `source`     | **Oui**     | <code>S[]</code>                                                                                                                                                                 | Array of data objects with the data to represent in the dropdown.                                             |
| `template`   | Non         | <code>(item: S) =&gt; Element</code>                                                                                                                                             | Callback function that returns a JSX template to represent the element.                                       |
| `theme`      | Non         | <code>CSSProp&lt;DropdownCss&gt;</code>                                                                                                                                          | Classnames object defining the component style.                                                               |
| `value`      | Non         | <code>T</code>                                                                                                                                                                   | Current value of the dropdown element.                                                                        |
| `valueKey`   | Non         | <code>string</code>                                                                                                                                                              | Used for setting the value from source                                                                        |

## `FloatingActionButton`

Bouton action flottant.

### Props

| Nom              | Obligatoire | Type                                                                                      | Description                                                                            |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                                                       | Classe CSS a ajouter au composant racine.                                              |
| `color`          | Non         | <code>"accent" &#124; "primary"</code>                                                    | Couleur du bouton.                                                                     |
| `disabled`       | Non         | <code>boolean</code>                                                                      | Désactive le bouton.                                                                   |
| `extended`       | Non         | <code>boolean</code>                                                                      | Affiche le libellé du bouton dans le bouton.                                           |
| `href`           | Non         | <code>string</code>                                                                       | Si renseigné, pose une balise <a> à la place du <button>.                              |
| `icon`           | Non         | <code>ReactNode</code>                                                                    | Icône a afficher dans le bouton.                                                       |
| `label`          | Non         | <code>string</code>                                                                       | Libellé du bouton.                                                                     |
| `lowered`        | Non         | <code>boolean</code>                                                                      | Variation du bouton avec moins d'élévation (ombre moins marquée).                      |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au blur du bouton.                                                                     |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au clic sur le bouton.                                                                 |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au focus du bouton.                                                                    |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `size`           | Non         | <code>"large" &#124; "small"</code>                                                       | Taille du bouton.                                                                      |
| `style`          | Non         | <code>CSSProperties</code>                                                                | CSS inline pour l'élément racine.                                                      |
| `target`         | Non         | <code>string</code>                                                                       | "target" pour le <a>, si `href` est rensigné.                                          |
| `theme`          | Non         | <code>CSSProp&lt;FloatingActionButtonCss&gt;</code>                                       | CSS.                                                                                   |
| `type`           | Non         | <code>string</code>                                                                       | Type de bouton HTML (ignoré si `href` est renseigné).                                  |

## `FontIcon`

Affiche une icône. Prend directement un nom d'icône Material en enfant, ou bien une icône personnalisée avec `getIcon`.

### Props

| Nom              | Obligatoire | Type                                                             | Description                                                                            |
| ---------------- | ----------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `alt`            | Non         | <code>string</code>                                              | Texte alternatif pour l'icône.                                                         |
| `children`       | Non         | <code>ReactNode</code>                                           | Icône à afficher.                                                                      |
| `className`      | Non         | <code>string</code>                                              | Classe CSS à poser sur le composant racine.                                            |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `style`          | Non         | <code>CSSProperties</code>                                       | Styles inline                                                                          |

## `IconButton`

Bouton simple avec une icône.

### Props

| Nom              | Obligatoire | Type                                                                                      | Description                                                                            |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                                                       | Classe CSS a ajouter au composant racine.                                              |
| `color`          | Non         | <code>"accent" &#124; "primary"</code>                                                    | Couleur du bouton.                                                                     |
| `disabled`       | Non         | <code>boolean</code>                                                                      | Désactive le bouton.                                                                   |
| `href`           | Non         | <code>string</code>                                                                       | Si renseigné, pose une balise <a> à la place du <button>.                              |
| `icon`           | **Oui**     | <code>ReactNode</code>                                                                    | Icône a afficher dans le bouton.                                                       |
| `label`          | Non         | <code>string</code>                                                                       | Libellé du bouton.                                                                     |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au blur du bouton.                                                                     |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au clic sur le bouton.                                                                 |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            | Au focus du bouton.                                                                    |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `style`          | Non         | <code>CSSProperties</code>                                                                | CSS inline pour l'élément racine.                                                      |
| `target`         | Non         | <code>string</code>                                                                       | "target" pour le <a>, si `href` est rensigné.                                          |
| `theme`          | Non         | <code>CSSProp&lt;IconButtonCss&gt;</code>                                                 | CSS.                                                                                   |
| `type`           | Non         | <code>string</code>                                                                       | Type de bouton HTML (ignoré si `href` est renseigné).                                  |
| `variant`        | Non         | <code>"filled" &#124; "outlined"</code>                                                   | Variante du bouton .                                                                   |

## `Menu`

Menu déroulant. Peut s'attacher à un élément parent. A utiliser avec `useMenu()`.

Exemple :
 ```tsx
 const menu = useMenu();

 // Remarque : L'élément conteneur impérativement avoir "position: relative".
 return (
     <span ref={menu.anchor} style={{position: "relative", display: "inline-block"}}>
         <IconButton icon="more_vert" onClick={menu.toggle}>
         <Menu {...menu}>
             <MenuItem
                 caption={mode.dark ? "Mode clair" : "Mode sombre"}
                 icon={mode.dark ? "light_mode" : "dark_mode"}
                 onClick={() => (mode.dark = !mode.dark)}
             />
             <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
         </Menu>
     </span>
 );
 ```

### Props

| Nom                           | Obligatoire | Type                                                                                                                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `active`                      | **Oui**     | <code>boolean</code>                                                                                                                            | Affiche le menu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `anchor`                      | **Oui**     | <code>RefObject&lt;HTMLDivElement&gt;</code>                                                                                                    | Element HTML parent du menu sur lequel le menu s'attachera (au dessus ou en dessous, selon la position).                                                                                                                                                                                                                                                                                                                                                                                                          |
| `children`                    | Non         | <code>ReactNode</code>                                                                                                                          | Eléments enfants à afficher dans le menu.<br />Ces éléments seront sélectionnables au clavier par le Menu, qui appelera leur `onClick` (si défini) lorsqu'on appuie sur Entrée.                                                                                                                                                                                                                                                                                                                                   |
| `className`                   | Non         | <code>string</code>                                                                                                                             | Classe CSS pour le composant racine du Menu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `close`                       | **Oui**     | <code>() =&gt; void</code>                                                                                                                      | Ferme le menu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `keepSelectionOnPointerLeave` | Non         | <code>boolean</code>                                                                                                                            | Ne vide pas l'élément du Menu sélectionné lorsque la souris sort du Menu<br />(pour pouvoir toujours cliquer sur cet élément en appuyant sur Entrée par exemple).                                                                                                                                                                                                                                                                                                                                                 |
| `noBlurOnArrowPress`          | Non         | <code>boolean</code>                                                                                                                            | Si renseigné, la navigation clavier dans le Menu n'appelera pas le `blur` de l'élément courant actif (pour un input par exemple).                                                                                                                                                                                                                                                                                                                                                                                 |
| `noRing`                      | Non         | <code>boolean</code>                                                                                                                            | N'affiche pas le focus ring lors de la navigation clavier dans le Menu.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `onItemClick`                 | Non         | <code>(key?: string) =&gt; void</code>                                                                                                          | Handler optionel appelé au clic (y compris au clavier) d'un élément du Menu. La `key` de l'enfant sera passée en paramètre.                                                                                                                                                                                                                                                                                                                                                                                       |
| `onSelectedChange`            | Non         | <code>(key?: string) =&gt; void</code>                                                                                                          | Handler appelé lorsque l'élément sélectionné par le Menu change (au hover ou au clavier).                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `open`                        | **Oui**     | <code>() =&gt; void</code>                                                                                                                      | Ouvre le menu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `position`                    | Non         | <code>"bottom" &#124; "top" &#124; "auto" &#124; "bottomLeft" &#124; "bottomRight" &#124; "full-auto" &#124; "topLeft" &#124; "topRight"</code> | Détermine la position du Menu par rapport à son élément ancre.<br /><br />Le Menu peut être placé en haut ou en bas, et optionnellement sur la gauche ou à droite (au lieu de prendre toute la largeur de l'ancre).<br /><br />La position peut être également définie en `auto` (choisie entre `topLeft`, `topRight`, `bottomLeft` et `bottomRight`) ou `full-auto`<br />(choisie entre `top` et `bottom`), selon la position de l'ancre sur la page au moment de son ouverture.<br /><br />Par défaut : `auto`. |
| `selected`                    | Non         | <code>string</code>                                                                                                                             | Permet de surcharger l'élement sélectionné du Menu, au lieu de le laisser utiliser son état interne. A utiliser avec `onSelectedChange`.                                                                                                                                                                                                                                                                                                                                                                          |
| `theme`                       | Non         | <code>CSSProp&lt;MenuCss&gt;</code>                                                                                                             | CSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `toggle`                      | **Oui**     | <code>() =&gt; void</code>                                                                                                                      | Ouvre ou ferme le menu, selon son état.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## `useMenu`

Hook pour attacher un menu à un élément et des fonctions pour l'ouvrir et le fermer.

### Props

| Nom | Obligatoire | Type | Description |
| --- | ----------- | ---- | ----------- |

## `MenuItem`

Item de Menu a utiliser dans un `Menu`.

### Props

| Nom              | Obligatoire | Type                                                           | Description                                                                            |
| ---------------- | ----------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `caption`        | **Oui**     | <code>string</code>                                            | Le libellé de l'item de Menu.                                                          |
| `className`      | Non         | <code>string</code>                                            | Classe CSS pour le composant racine.                                                   |
| `disabled`       | Non         | <code>boolean</code>                                           | Désactive l'élément de Menu, qui ne pourra plus être sélectionné.                      |
| `iconLeft`       | Non         | <code>ReactNode</code>                                         | Icône à poser devant l'item de Menu.                                                   |
| `iconRight`      | Non         | <code>ReactNode</code>                                         | Icône à poser derrière l'item de Menu.                                                 |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLLIElement&gt;</code>            | Handler de clic sur l'item de Menu.                                                    |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;MenuCss&gt;</code>                            | CSS.                                                                                   |

## `LinearProgressIndicator`

Indicateur de progression linéaire.

### Props

| Nom              | Obligatoire | Type                                                            | Description                                                                            |
| ---------------- | ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                             | Classe CSS pour l'élément racine.                                                      |
| `indeterminate`  | Non         | <code>boolean</code>                                            | Progression indéterminée                                                               |
| `max`            | Non         | <code>number</code>                                             | Valeur maximum. Par défaut: 100.                                                       |
| `min`            | Non         | <code>number</code>                                             | Valeur minimum. Par défaut: 0.                                                         |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;ProgressIndicatorCss&gt;</code>                | CSS.                                                                                   |
| `value`          | Non         | <code>number</code>                                             | Valeur courante (entre `min` et `max`). Par défaut : 0.                                |

## `CircularProgressIndicator`

Indicateur de progression circulaire.

### Props

| Nom              | Obligatoire | Type                                                            | Description                                                                            |
| ---------------- | ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                             | Classe CSS pour l'élément racine.                                                      |
| `indeterminate`  | Non         | <code>boolean</code>                                            | Progression indéterminée                                                               |
| `max`            | Non         | <code>number</code>                                             | Valeur maximum. Par défaut: 100.                                                       |
| `min`            | Non         | <code>number</code>                                             | Valeur minimum. Par défaut: 0.                                                         |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;ProgressIndicatorCss&gt;</code>                | CSS.                                                                                   |
| `value`          | Non         | <code>number</code>                                             | Valeur courante (entre `min` et `max`). Par défaut : 0.                                |

## `RadioGroup`

A utiliser avec RadioButton pour faire des radios. Les composants [`BooleanRadio`](components/forms.md#booleanradio) et [`SelectRadio`](components/forms.md#selectradio) en sont des implémentations pour les usages les plus courants.

### Props

| Nom         | Obligatoire | Type                                    | Description                                                                 |
| ----------- | ----------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `children`  | Non         | <code>ReactNode</code>                  | Les RadioButtons passés en enfant de ce composant seront ajoutés au groupe. |
| `className` | Non         | <code>string</code>                     | Classe CSS a ajouter au composant racine.                                   |
| `disabled`  | Non         | <code>boolean</code>                    | Désactive les RadioButtons.                                                 |
| `onChange`  | Non         | <code>(value: string) =&gt; void</code> | Handler appelé au clic sur un RadioButton.                                  |
| `value`     | Non         | <code>string</code>                     | Valeur séléctionnée parmis les RadioButtons.                                |

## `RadioButton`

A utiliser dans un RadioGroup.

### Props

| Nom              | Obligatoire | Type                                                              | Description                                                                            |
| ---------------- | ----------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                               | Classe CSS a ajouter au composant racine.                                              |
| `disabled`       | Non         | <code>boolean</code>                                              | Désactive le RadioButton.                                                              |
| `id`             | Non         | <code>string</code>                                               | Id pour l'input[type=radio] posé par le RadioButton.                                   |
| `label`          | Non         | <code>ReactNode</code>                                            | Libellé à poser à côté de la Checkbox.                                                 |
| `name`           | Non         | <code>string</code>                                               | Name pour l'input[type=radio] posé par le RadioButton.                                 |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLInputElement&gt;</code>            | Au blur du Radio.                                                                      |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLInputElement&gt;</code>            | Au focus du Radio.                                                                     |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;RadioCss&gt;</code>                              | CSS.                                                                                   |
| `value`          | **Oui**     | <code>string</code>                                               | Valeur du RadioGroup quand ce RadioButton est sélectionné.                             |

## `Ripple`

Pose un Ripple au clic sur le composant/élément enfant.

### Props

| Nom              | Obligatoire | Type                                                                                 | Description                                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `centered`       | Non         | <code>boolean</code>                                                                 | Centre le ripple sur la cible au lieu de l'endroit cliqué.                                  |
| `children`       | **Oui**     | <code>ReactElement&lt;any, string &#124; JSXElementConstructor&lt;any&gt;&gt;</code> | Composant enfant dans lequel poser le ripple.                                               |
| `className`      | Non         | <code>string</code>                                                                  | Classe CSS à passer au Ripple                                                               |
| `disabled`       | Non         | <code>boolean</code>                                                                 | Force la désactivation du ripple.                                                           |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;T&gt;) =&gt; void</code>                                   | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)       |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;T&gt;) =&gt; void</code>                                   | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)      |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;T&gt;) =&gt; void</code>                                   | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)      |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;T&gt;) =&gt; void</code>                                   | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)         |
| `rippleTarget`   | Non         | <code>string</code>                                                                  | Classe CSS de l'élément HTML dans lequel poser le ripple, si ce n'est pas l'élément racine. |

## `Slider`

Slider.

### Props

| Nom              | Obligatoire | Type                                                            | Description                                                                            |
| ---------------- | ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                             | Classe CSS pour le composant racine.                                                   |
| `disabled`       | Non         | <code>boolean</code>                                            | Désactive le Slider.                                                                   |
| `labeled`        | Non         | <code>boolean</code>                                            | Affiche un libellé au dessus de la poignée au survol avec la valeur exacte du Slider.  |
| `max`            | Non         | <code>number</code>                                             | Valeur maximale du Slider. Par défaut : 100.                                           |
| `min`            | Non         | <code>number</code>                                             | Valeur minimale du Slider. Par défaut : 0.                                             |
| `onChange`       | Non         | <code>(value: number) =&gt; void</code>                         | Handler appelé au changement de la valeur du Slider.                                   |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `step`           | Non         | <code>number</code>                                             | Valeur minimale par incrément du Slider. Par défaut : 1.                               |
| `theme`          | Non         | <code>CSSProp&lt;SliderCss&gt;</code>                           | CSS.                                                                                   |
| `ticks`          | Non         | <code>boolean</code>                                            | Affiche des indicateurs pour chaque valeur de `step` sur le Slider.                    |
| `value`          | **Oui**     | <code>number</code>                                             | Valeur du Slider.                                                                      |

## `Snackbar`

Le composant pour afficher des toasts utilisé par le [`MessageCenter`](basics/messages.md).

### Props

| Nom         | Obligatoire | Type                                                                           | Description                                                                                                     |
| ----------- | ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `action`    | Non         | <code>string</code>                                                            | Label for the action component inside the Snackbar.                                                             |
| `active`    | **Oui**     | <code>boolean</code>                                                           | If true, the snackbar will be active.                                                                           |
| `children`  | Non         | <code>ReactNode</code>                                                         | Children to pass through the component.                                                                         |
| `className` | Non         | <code>string</code>                                                            |                                                                                                                 |
| `label`     | Non         | <code>string &#124; Element</code>                                             | Text to display in the content.                                                                                 |
| `onClick`   | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code> | Callback function that will be called when the action button is clicked.                                        |
| `onTimeout` | **Oui**     | <code>() =&gt; void</code>                                                     | Callback function that will be called once the set timeout is finished.                                         |
| `theme`     | Non         | <code>CSSProp&lt;SnackbarCss&gt;</code>                                        | Classnames object defining the component style.                                                                 |
| `timeout`   | Non         | <code>number</code>                                                            | Amount of time in milliseconds after which the `onTimeout` callback will be called after `active` becomes true. |
| `type`      | Non         | <code>"accept" &#124; "cancel" &#124; "warning"</code>                         | Indicates the action type. Can be accept, warning or cancel                                                     |

## `Switch`

Un switch, fonctionnellement identique à la [`Checkbox`](#checkbox).

### Props

| Nom              | Obligatoire | Type                                                                                             | Description                                                                            |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `className`      | Non         | <code>string</code>                                                                              | Classe CSS a ajouter au composant racine.                                              |
| `disabled`       | Non         | <code>boolean</code>                                                                             | Désactive le Switch.                                                                   |
| `iconOff`        | Non         | <code>ReactNode</code>                                                                           | Icône a afficher dans le Switch quand il est "off".                                    |
| `iconOn`         | Non         | <code>ReactNode</code>                                                                           | Icône a afficher dans le Switch quand il est "on".                                     |
| `id`             | Non         | <code>string</code>                                                                              | Id pour l'input[type=checkbox] posé par le Switch.                                     |
| `label`          | Non         | <code>ReactNode</code>                                                                           | Libellé à poser à côté du Switch.                                                      |
| `name`           | Non         | <code>string</code>                                                                              | Name pour l'input[type=checkbox] posé par le Switch.                                   |
| `onBlur`         | Non         | <code>FocusEventHandler&lt;HTMLInputElement&gt;</code>                                           | Au blur du Switch.                                                                     |
| `onChange`       | Non         | <code>(value: boolean, event?: MouseEvent&lt;HTMLInputElement, MouseEvent&gt;) =&gt; void</code> | Handler appelé au clic sur le Switch.                                                  |
| `onFocus`        | Non         | <code>FocusEventHandler&lt;HTMLInputElement&gt;</code>                                           | Au focus du Switch.                                                                    |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;SwitchCss&gt;</code>                                                            | CSS.                                                                                   |
| `value`          | Non         | <code>boolean</code>                                                                             | Valeur (correspond à 'checked' sur l'input).                                           |

## `Tabs`

Permet de poser un système de tabs avec Tab et TabContent.

### Props

| Nom         | Obligatoire | Type                                      | Description                                                                                                                                                                                                    |
| ----------- | ----------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`  | Non         | <code>ReactNode</code>                    | Children to pass through the component.                                                                                                                                                                        |
| `className` | Non         | <code>string</code>                       |                                                                                                                                                                                                                |
| `fixed`     | Non         | <code>boolean</code>                      | If True, the tabs will be fixed, covering the whole width.                                                                                                                                                     |
| `hideMode`  | Non         | <code>"display" &#124; "unmounted"</code> | `unmounted` mode will not mount the tab content of inactive tabs.<br />`display` mode will mount but hide inactive tabs.<br />Consider holding state outside of the Tabs component before using `display` mode |
| `index`     | Non         | <code>number</code>                       | Current                                                                                                                                                                                                        |
| `inverse`   | Non         | <code>boolean</code>                      | If True, the tabs will have an inverse style.                                                                                                                                                                  |
| `onChange`  | Non         | <code>(idx: number) =&gt; void</code>     | Callback function that is fired when the tab changes.                                                                                                                                                          |
| `theme`     | Non         | <code>CSSProp&lt;TabsCss&gt;</code>       | Classnames object defining the component style.                                                                                                                                                                |

## `Tab`

Un Tab, à utiliser dans Tabs.

### Props

| Nom              | Obligatoire | Type                                                                                         | Description                                                                            |
| ---------------- | ----------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `active`         | Non         | <code>boolean</code>                                                                         | If true, the current component is visible.                                             |
| `className`      | Non         | <code>string</code>                                                                          |                                                                                        |
| `disabled`       | Non         | <code>boolean</code>                                                                         | If true, the current component is not clickable.                                       |
| `hidden`         | Non         | <code>boolean</code>                                                                         | If true, the current component is not visible.                                         |
| `icon`           | Non         | <code>ReactNode</code>                                                                       | Icon to be used in inner FontIcon.                                                     |
| `index`          | Non         | <code>number</code>                                                                          |                                                                                        |
| `label`          | Non         | <code>string</code>                                                                          | Label text for navigation header.                                                      |
| `onActive`       | Non         | <code>() =&gt; void</code>                                                                   | Callback function that is fired when the tab is activated.                             |
| `onClick`        | Non         | <code>(event: MouseEvent&lt;HTMLDivElement, MouseEvent&gt;, index: number) =&gt; void</code> | Called on click on the tab.                                                            |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code>                              | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code>                              | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code>                              | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code>                              | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;TabsCss&gt;</code>                                                          | Classnames object defining the component style.                                        |

## `TabContent`

Contenu d'un Tab, à utiliser dans Tabs.

### Props

| Nom         | Obligatoire | Type                                | Description |
| ----------- | ----------- | ----------------------------------- | ----------- |
| `active`    | Non         | <code>boolean</code>                |             |
| `className` | Non         | <code>string</code>                 |             |
| `hidden`    | Non         | <code>boolean</code>                |             |
| `tabIndex`  | Non         | <code>number</code>                 | @internal   |
| `theme`     | Non         | <code>CSSProp&lt;TabsCss&gt;</code> |             |

## `TextField`



### Props

| Nom                  | Obligatoire | Type                                                                                                         | Description                                                                                                                        |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `autoComplete`       | Non         | <code>string</code>                                                                                          | Valeur de `autocomplete` sur l'input HTML.                                                                                         |
| `className`          | Non         | <code>string</code>                                                                                          | Classe CSS pour le composant racine.                                                                                               |
| `disabled`           | Non         | <code>boolean</code>                                                                                         | Désactive le champ texte.                                                                                                          |
| `error`              | Non         | <code>boolean</code>                                                                                         | Affiche le champ texte en erreur.                                                                                                  |
| `fieldRef`           | Non         | <code>RefObject&lt;HTMLDivElement&gt;</code>                                                                 | Ref vers le champ (pour ancrer un Menu dessus par exemple).                                                                        |
| `hint`               | Non         | <code>string</code>                                                                                          | Placeholder pour le champ texte.                                                                                                   |
| `icon`               | Non         | <code>ReactNode</code>                                                                                       | Icône à poser devant le texte.                                                                                                     |
| `id`                 | Non         | <code>string</code>                                                                                          | `id` pour l'input HTML.                                                                                                            |
| `key`                | Non         | <code>Key</code>                                                                                             |                                                                                                                                    |
| `label`              | Non         | <code>string</code>                                                                                          | Libellé du champ, sera affiché à la place du `hint` et se déplacera sur le dessus lorsque le champ est utilisé.                    |
| `loading`            | Non         | <code>boolean</code>                                                                                         | Affiche un indicateur de chargement dans le champ texte.                                                                           |
| `maxLength`          | Non         | <code>number</code>                                                                                          | Taille maximum du champ. Sera affiché en dessous du champ à côté de `supportingText`.                                              |
| `multiline`          | Non         | <code>boolean</code>                                                                                         | Si renseigné, affiche un <textarea> à la place de l'<input>.                                                                       |
| `name`               | Non         | <code>string</code>                                                                                          | `name` pour l'input HTML.                                                                                                          |
| `onBlur`             | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            | Au blur du champ texte.                                                                                                            |
| `onChange`           | Non         | <code>(value: string, event: FormEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code> | Handler appelé à chaque modification du texte dans le champ.                                                                       |
| `onClick`            | Non         | <code>MouseEventHandler&lt;HTMLDivElement&gt;</code>                                                         | Au clic sur le champ texte.                                                                                                        |
| `onContextMenu`      | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            | Au clic-droit dans le champ texte.                                                                                                 |
| `onFocus`            | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            | Au focus du champ texte.                                                                                                           |
| `onKeyDown`          | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                         | Au `keydown` du champ.                                                                                                             |
| `onKeyPress`         | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                         | Au `keypress` du champ.                                                                                                            |
| `onKeyUp`            | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                         | Au `keyup` du champ.                                                                                                               |
| `onPaste`            | Non         | <code>ClipboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                        | Au collage de texte dans le champ.                                                                                                 |
| `onPointerDown`      | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)                                              |
| `onPointerEnter`     | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)                                             |
| `onPointerLeave`     | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)                                             |
| `onPointerUp`        | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)                                                |
| `prefix`             | Non         | <code>string</code>                                                                                          | Préfixe à poser devant le texte.                                                                                                   |
| `readOnly`           | Non         | <code>boolean</code>                                                                                         | Valeur de `readonly` sur l'input HTML.                                                                                             |
| `required`           | Non         | <code>boolean</code>                                                                                         | Valeur de `required` sur l'input HTML.                                                                                             |
| `rows`               | Non         | <code>number</code>                                                                                          | Nombre de lignes pour le <textarea> (si `multiline`).                                                                              |
| `showSupportingText` | Non         | <code>"always" &#124; "auto" &#124; "never"</code>                                                           | Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "auto". |
| `suffix`             | Non         | <code>string</code>                                                                                          | Préfixe à poser après le texte.                                                                                                    |
| `supportingText`     | Non         | <code>string</code>                                                                                          | Texte à afficher en dessous du champ. Sera affiché en rouge si `error`.                                                            |
| `tabIndex`           | Non         | <code>number</code>                                                                                          | `tabindex` pour l'input HTML.                                                                                                      |
| `theme`              | Non         | <code>CSSProp&lt;TextFieldCss&gt;</code>                                                                     | CSS.                                                                                                                               |
| `trailing`           | Non         | <code>TrailingIcon &#124; TrailingIcon[]</code>                                                              | Définition des icônes à poser après le texte dans le champ.                                                                        |
| `type`               | Non         | <code>string</code>                                                                                          | `type` pour l'input HTML.                                                                                                          |
| `value`              | Non         | <code>string</code>                                                                                          | Valeur du champ.                                                                                                                   |

## `Tooltip`

Pose une tooltip autour de l'élement enfant qui s'activera au survol.

### Props

| Nom              | Obligatoire | Type                                                                                                  | Description                                                                                                        |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `children`       | **Oui**     | <code>ReactElement&lt;any, string &#124; JSXElementConstructor&lt;any&gt;&gt;</code>                  | Composant enfant autour duquel poser la tooltip.                                                                   |
| `clickBehavior`  | Non         | <code>"hide" &#124; "none" &#124; "show"</code>                                                       | Comportement de la tooltip au clic. Par défaut : "hide".                                                           |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLElement&gt;) =&gt; void</code>                                          | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)                              |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLElement&gt;) =&gt; void</code>                                          | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)                             |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLElement&gt;) =&gt; void</code>                                          | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)                             |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLElement&gt;) =&gt; void</code>                                          | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)                                |
| `position`       | Non         | <code>"bottom" &#124; "horizontal" &#124; "left" &#124; "right" &#124; "top" &#124; "vertical"</code> | Position de la tooltip ("vertical" = "top" ou "bottom", "horizontal" = "left" ou "right"). Par défaut : "vertical" |
| `theme`          | Non         | <code>CSSProp&lt;TooltipCss&gt;</code>                                                                | CSS.                                                                                                               |
| `tooltip`        | **Oui**     | <code>ReactNode</code>                                                                                | Contenu de la tooltip.                                                                                             |
