# Composants de `@focus4/toolbox` <!-- {docsify-ignore-all} -->

`@focus4/toolbox` est une réimplémentation en React moderne de [React Toolbox](https://react-toolbox.io/#/components), une librairie qui implémentait Material Design pour le web. Cette librairie avait été choisie au lancement de la v4 de Focus (en 2016), mais son développement a été malheureusement abandonné 2 ans plus tard... Sans autre alternative viable, elle a fini par être intégralement intégrée dans Focus.

## `Autocomplete`

**_A ne pas confondre avec le composant du même nom `Autocomplete` dans le module `@focus4/forms` !_**

Champ de saisie en autocomplétion à partir d'une **liste de valeurs possibles en entrée**.

### Props

| Nom                             | Obligatoire | Type                                                                                                                              | Description                                                                                                         |
| ------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `allowCreate`                   | Non         | <code>boolean</code>                                                                                                              | Determines if user can create a new option with the current typed value.                                            |
| `children`                      | Non         | <code>ReactNode</code>                                                                                                            | Children to pass through the component.                                                                             |
| `className`                     | Non         | <code>string</code>                                                                                                               |                                                                                                                     |
| `direction`                     | Non         | <code>"auto" &#124; "up" &#124; "down"</code>                                                                                     | Determines the opening direction. It can be auto, up or down.                                                       |
| `disabled`                      | Non         | <code>boolean</code>                                                                                                              | If true, component will be disabled.                                                                                |
| `error`                         | Non         | <code>ReactNode</code>                                                                                                            | Give an error node to display under the field.                                                                      |
| `finalSuggestion`               | Non         | <code>ReactNode</code>                                                                                                            | React Node to display as the last suggestion.                                                                       |
| `floating`                      | Non         | <code>boolean</code>                                                                                                              | Indicates if the label is floating in the input field or not.                                                       |
| `getLabel`                      | Non         | <code>(x: TSource) =&gt; string</code>                                                                                            | Gets the label from a source item. Defaults to returning the item (works if the item is a regular string).          |
| `hint`                          | Non         | <code>string</code>                                                                                                               | The text string to use for hint text element.                                                                       |
| `icon`                          | Non         | <code>ReactNode</code>                                                                                                            | Name of an icon to use as a label for the input.                                                                    |
| `id`                            | Non         | <code>string</code>                                                                                                               | Id for the input field.                                                                                             |
| `keepFocusOnChange`             | Non         | <code>boolean</code>                                                                                                              | Whether component should keep focus after value change.                                                             |
| `label`                         | Non         | <code>ReactNode</code>                                                                                                            | The text string to use for the floating label element.                                                              |
| `LineComponent`                 | Non         | <code>(props: { item: TSource; }) =&gt; ReactElement&lt;any, string &#124; JSXElementConstructor&lt;any&gt;&gt;</code>            | Custom component for rendering suggestions.                                                                         |
| `loading`                       | Non         | <code>boolean</code>                                                                                                              | Displays an indeteminate progress bar below the input field.                                                        |
| `maxLength`                     | Non         | <code>number</code>                                                                                                               | Specifies the maximum number of characters allowed in the component.                                                |
| `multiline`                     | Non         | <code>boolean</code>                                                                                                              | If true, a textarea element will be rendered. The textarea also grows and shrinks according to the number of lines. |
| `multiple`                      | Non         | <code>boolean</code>                                                                                                              | If true, component can hold multiple values.                                                                        |
| `name`                          | Non         | <code>string</code>                                                                                                               | Name for the input field.                                                                                           |
| `noMaxLengthOnElement`          | Non         | <code>boolean</code>                                                                                                              | If true, does not add the "maxLength" attribute to the HTML input element.                                          |
| `onBlur`                        | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onChange`                      | Non         | <code>(value: TValue, event: FormEvent&lt;HTMLInputElement &#124; HTMLLIElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code> |                                                                                                                     |
| `onClick`                       | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onContextMenu`                 | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onDoubleClick`                 | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onFocus`                       | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onKeyDown`                     | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                              |                                                                                                                     |
| `onKeyPress`                    | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                              |                                                                                                                     |
| `onKeyUp`                       | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                              |                                                                                                                     |
| `onMouseDown`                   | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onMouseEnter`                  | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onMouseLeave`                  | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onMouseMove`                   | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onMouseOut`                    | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onMouseOver`                   | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onMouseUp`                     | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                 |                                                                                                                     |
| `onPaste`                       | Non         | <code>ClipboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                             |                                                                                                                     |
| `onPointerDown`                 | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                                      | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)                               |
| `onPointerEnter`                | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                                      | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)                              |
| `onPointerLeave`                | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                                      | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)                              |
| `onPointerUp`                   | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                                      | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)                                 |
| `onQueryChange`                 | Non         | <code>(text: string) =&gt; void</code>                                                                                            | Callback function that is fired when the components's query value changes.                                          |
| `query`                         | Non         | <code>string</code>                                                                                                               | Overrides the inner query.                                                                                          |
| `readOnly`                      | Non         | <code>boolean</code>                                                                                                              | If true, input is readonly.                                                                                         |
| `required`                      | Non         | <code>boolean</code>                                                                                                              | If true, the html input has a required attribute.                                                                   |
| `ripple`                        | Non         | <code>boolean</code>                                                                                                              | If set to false, disable the rippling effect on suggestions.                                                        |
| `rows`                          | Non         | <code>number</code>                                                                                                               | The number of rows the multiline input field has.                                                                   |
| `selectedPosition`              | Non         | <code>"above" &#124; "below" &#124; "none"</code>                                                                                 | Determines if the selected list is shown above or below input. It can be above or below.                            |
| `showSuggestionsWhenValueIsSet` | Non         | <code>boolean</code>                                                                                                              | If true, the list of suggestions will not be filtered when a value is selected.                                     |
| `source`                        | Non         | <code>Record&lt;string, TSource&gt;</code>                                                                                        | Object of key/values representing all items suggested.                                                              |
| `style`                         | Non         | <code>CSSProperties</code>                                                                                                        |                                                                                                                     |
| `suggestionMatch`               | Non         | <code>"disabled" &#124; "anywhere" &#124; "start" &#124; "word"</code>                                                            | Determines how suggestions are supplied.                                                                            |
| `suggestionSort`                | Non         | <code>"label" &#124; "key"</code>                                                                                                 | If set, sorts the suggestions by key or label ascending.                                                            |
| `tabIndex`                      | Non         | <code>number</code>                                                                                                               | TabIndex.                                                                                                           |
| `theme`                         | Non         | <code>CSSProp&lt;AutocompleteCss & InputCss&gt;</code>                                                                            |                                                                                                                     |
| `value`                         | Non         | <code>string &#124; string[]</code>                                                                                               |                                                                                                                     |

## `Button`

Le bouton standard, qui peut être sous plusieurs formats (`raised`, `floating`) et de plusieurs couleurs (`primary`, `accent`), avoir une icône... Un bouton avec juste une icône est un [`IconButton`](#iconbutton)

### Props

| Nom              | Obligatoire | Type                                                                                      | Description                                                                              |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `accent`         | Non         | <code>boolean</code>                                                                      | Indicates if the button should have accent color.                                        |
| `children`       | Non         | <code>ReactNode</code>                                                                    | Children to pass through the component.                                                  |
| `className`      | Non         | <code>string</code>                                                                       |                                                                                          |
| `disabled`       | Non         | <code>boolean</code>                                                                      | If true, component will be disabled.                                                     |
| `floating`       | Non         | <code>boolean</code>                                                                      | If true, the button will have a floating look.                                           |
| `href`           | Non         | <code>string</code>                                                                       | Creates a link for the button.                                                           |
| `icon`           | Non         | <code>ReactNode</code>                                                                    | Value of the icon (See Font Icon Component).                                             |
| `inverse`        | Non         | <code>boolean</code>                                                                      | If true, the neutral colors are inverted. Useful to put a button over a dark background. |
| `label`          | Non         | <code>string</code>                                                                       | The text string to use for the name of the button.                                       |
| `mini`           | Non         | <code>boolean</code>                                                                      | To be used with floating button. If true, the button will be smaller.                    |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            |                                                                                          |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)    |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)   |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)   |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)      |
| `primary`        | Non         | <code>boolean</code>                                                                      | Indicates if the button should have primary color.                                       |
| `raised`         | Non         | <code>boolean</code>                                                                      | If true, the button will have a raised look.                                             |
| `style`          | Non         | <code>CSSProperties</code>                                                                |                                                                                          |
| `target`         | Non         | <code>string</code>                                                                       | Passed down to the root element                                                          |
| `theme`          | Non         | <code>CSSProp&lt;ButtonCss&gt;</code>                                                     | Classnames object defining the component style.                                          |
| `type`           | Non         | <code>string</code>                                                                       | Component root container type.                                                           |

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
| `error`          | Non         | <code>ReactNode</code>                                                                           | Si renseigné, la Checkbox sera affichée en rouge.                                      |
| `id`             | Non         | <code>string</code>                                                                              | Id pour l'input[type=checkbox] posé par la Checkbox.                                   |
| `indeterminate`  | Non         | <code>boolean</code>                                                                             | Affiche une icône "indéterminée" à la place du "check"                                 |
| `label`          | Non         | <code>ReactNode</code>                                                                           | Libellé à poser à côté de la Checkbox.                                                 |
| `name`           | Non         | <code>string</code>                                                                              | Name pour l'input[type=checkbox] posé par la Checkbox.                                 |
| `onChange`       | Non         | <code>(value: boolean, event?: MouseEvent&lt;HTMLInputElement, MouseEvent&gt;) =&gt; void</code> | Handler appelé au clic sur la Checkbox.                                                |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                                | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;CheckboxCss&gt;</code>                                                          | CSS.                                                                                   |
| `value`          | Non         | <code>boolean</code>                                                                             | Valeur (correspond à 'checked' sur l'input).                                           |

## `Chip`

Affiche un chip pour représenter un élément sélectionné, qui peut avoir une action de suppression.

### Props

| Nom              | Obligatoire | Type                                                             | Description                                                                            |
| ---------------- | ----------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `children`       | Non         | <code>ReactNode</code>                                           | Children to pass through the component.                                                |
| `className`      | Non         | <code>string</code>                                              |                                                                                        |
| `deletable`      | Non         | <code>boolean</code>                                             | If true, the chip will be rendered with a delete icon.                                 |
| `onDeleteClick`  | Non         | <code>MouseEventHandler&lt;HTMLSpanElement&gt;</code>            | Callback to be invoked when the delete icon is clicked.                                |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;ChipCss&gt;</code>                              | Classnames object defining the component style.                                        |

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
| `error`      | Non         | <code>ReactNode</code>                                                                                                                                                           | Give an error node to display under the field.                                                                |
| `id`         | Non         | <code>string</code>                                                                                                                                                              | Id for the input field.                                                                                       |
| `label`      | Non         | <code>ReactNode</code>                                                                                                                                                           | The text string to use for the floating label element.                                                        |
| `labelKey`   | Non         | <code>string</code>                                                                                                                                                              | Used for setting the label from source                                                                        |
| `name`       | Non         | <code>string</code>                                                                                                                                                              | Name for the input field.                                                                                     |
| `onBlur`     | Non         | <code>(event: FocusEvent&lt;HTMLDivElement &#124; HTMLInputElement &#124; HTMLTextAreaElement, Element&gt; &#124; MouseEvent&lt;HTMLLIElement, MouseEvent&gt;) =&gt; void</code> |                                                                                                               |
| `onChange`   | Non         | <code>(value: T, event: MouseEvent&lt;HTMLLIElement, MouseEvent&gt;) =&gt; void</code>                                                                                           |                                                                                                               |
| `onClick`    | Non         | <code>MouseEventHandler&lt;HTMLDivElement &#124; HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                                                                          |                                                                                                               |
| `onFocus`    | Non         | <code>FocusEventHandler&lt;HTMLDivElement&gt;</code>                                                                                                                             |                                                                                                               |
| `required`   | Non         | <code>boolean</code>                                                                                                                                                             | If true, the html input has a required attribute.                                                             |
| `source`     | **Oui**     | <code>S[]</code>                                                                                                                                                                 | Array of data objects with the data to represent in the dropdown.                                             |
| `template`   | Non         | <code>(item: S) =&gt; Element</code>                                                                                                                                             | Callback function that returns a JSX template to represent the element.                                       |
| `theme`      | Non         | <code>CSSProp&lt;DropdownCss&gt;</code>                                                                                                                                          | Classnames object defining the component style.                                                               |
| `value`      | Non         | <code>T</code>                                                                                                                                                                   | Current value of the dropdown element.                                                                        |
| `valueKey`   | Non         | <code>string</code>                                                                                                                                                              | Used for setting the value from source                                                                        |

## `FontIcon`

Affiche une icône. Prend directement un nom d'icône Material en enfant, ou bien une icône personnalisée avec `getIcon`.

### Props

| Nom              | Obligatoire | Type                                                             | Description                                                                            |
| ---------------- | ----------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `alt`            | Non         | <code>string</code>                                              | Alt text for the icon.                                                                 |
| `children`       | Non         | <code>ReactNode</code>                                           | Children to pass through the component.                                                |
| `className`      | Non         | <code>string</code>                                              |                                                                                        |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLSpanElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `style`          | Non         | <code>CSSProperties</code>                                       | Inline styles.                                                                         |
| `value`          | Non         | <code>ReactNode</code>                                           | The key string for the icon you want be displayed.                                     |

## `IconButton`

Un bouton avec juste une icône. Les autres types de boutons sont réalisés avec le [`Button`](#button).

### Props

| Nom              | Obligatoire | Type                                                                                      | Description                                                                              |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `accent`         | Non         | <code>boolean</code>                                                                      | Indicates if the button should have accent color.                                        |
| `className`      | Non         | <code>string</code>                                                                       |                                                                                          |
| `disabled`       | Non         | <code>boolean</code>                                                                      | If true, component will be disabled.                                                     |
| `href`           | Non         | <code>string</code>                                                                       |                                                                                          |
| `icon`           | **Oui**     | <code>ReactNode</code>                                                                    | Value of the icon (See Font Icon Component).                                             |
| `inverse`        | Non         | <code>boolean</code>                                                                      | If true, the neutral colors are inverted. Useful to put a button over a dark background. |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>            |                                                                                          |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)    |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)   |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)   |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)      |
| `primary`        | Non         | <code>boolean</code>                                                                      | Indicates if the button should have primary color.                                       |
| `style`          | Non         | <code>CSSProperties</code>                                                                |                                                                                          |
| `target`         | Non         | <code>string</code>                                                                       |                                                                                          |
| `theme`          | Non         | <code>CSSProp&lt;IconButtonCss&gt;</code>                                                 |                                                                                          |
| `type`           | Non         | <code>string</code>                                                                       | Component root container type.                                                           |

## `Input`

**_A ne pas confondre avec le composant du même nom `Input` dans le module `@focus4/forms` !_**

Champ de saisie texte standard. A priori à ne jamais utiliser directement et utiliser celui de `@focus4/forms` qui contient plus de fonctionnalités.

### Props

| Nom                    | Obligatoire | Type                                                                                                         | Description                                                                                                         |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `autoComplete`         | Non         | <code>string</code>                                                                                          |                                                                                                                     |
| `children`             | Non         | <code>ReactNode</code>                                                                                       | Children to pass through the component.                                                                             |
| `className`            | Non         | <code>string</code>                                                                                          |                                                                                                                     |
| `disabled`             | Non         | <code>boolean</code>                                                                                         | If true, component will be disabled.                                                                                |
| `error`                | Non         | <code>ReactNode</code>                                                                                       | Give an error node to display under the field.                                                                      |
| `floating`             | Non         | <code>boolean</code>                                                                                         | Indicates if the label is floating in the input field or not.                                                       |
| `hint`                 | Non         | <code>string</code>                                                                                          | The text string to use for hint text element.                                                                       |
| `icon`                 | Non         | <code>ReactNode</code>                                                                                       | Name of an icon to use as a label for the input.                                                                    |
| `id`                   | Non         | <code>string</code>                                                                                          | Id for the input field.                                                                                             |
| `key`                  | Non         | <code>Key</code>                                                                                             |                                                                                                                     |
| `label`                | Non         | <code>ReactNode</code>                                                                                       | The text string to use for the floating label element.                                                              |
| `maxLength`            | Non         | <code>number</code>                                                                                          | Specifies the maximum number of characters allowed in the component.                                                |
| `multiline`            | Non         | <code>boolean</code>                                                                                         | If true, a textarea element will be rendered. The textarea also grows and shrinks according to the number of lines. |
| `name`                 | Non         | <code>string</code>                                                                                          | Name for the input field.                                                                                           |
| `noMaxLengthOnElement` | Non         | <code>boolean</code>                                                                                         | If true, does not add the "maxLength" attribute to the HTML input element.                                          |
| `onBlur`               | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onChange`             | Non         | <code>(value: string, event: FormEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code> |                                                                                                                     |
| `onClick`              | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onContextMenu`        | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onDoubleClick`        | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onFocus`              | Non         | <code>FocusEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onKeyDown`            | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                         |                                                                                                                     |
| `onKeyPress`           | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                         |                                                                                                                     |
| `onKeyUp`              | Non         | <code>KeyboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                         |                                                                                                                     |
| `onMouseDown`          | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onMouseEnter`         | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onMouseLeave`         | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onMouseMove`          | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onMouseOut`           | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onMouseOver`          | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onMouseUp`            | Non         | <code>MouseEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                            |                                                                                                                     |
| `onPaste`              | Non         | <code>ClipboardEventHandler&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;</code>                        |                                                                                                                     |
| `onPointerDown`        | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)                               |
| `onPointerEnter`       | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)                              |
| `onPointerLeave`       | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)                              |
| `onPointerUp`          | Non         | <code>(e: PointerEvent&lt;HTMLInputElement &#124; HTMLTextAreaElement&gt;) =&gt; void</code>                 | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)                                 |
| `readOnly`             | Non         | <code>boolean</code>                                                                                         | If true, input is readonly.                                                                                         |
| `required`             | Non         | <code>boolean</code>                                                                                         | If true, the html input has a required attribute.                                                                   |
| `rows`                 | Non         | <code>number</code>                                                                                          | The number of rows the multiline input field has.                                                                   |
| `style`                | Non         | <code>CSSProperties</code>                                                                                   |                                                                                                                     |
| `tabIndex`             | Non         | <code>number</code>                                                                                          | TabIndex.                                                                                                           |
| `theme`                | Non         | <code>CSSProp&lt;InputCss&gt;</code>                                                                         | Classnames object defining the component style.                                                                     |
| `type`                 | Non         | <code>string</code>                                                                                          | Type of the input element. It can be a valid HTML5 input type.                                                      |
| `value`                | Non         | <code>string</code>                                                                                          | Current value of the input element.                                                                                 |

## `ButtonMenu`

Crée un menu à partir d'un `Button`.

Exemple :

 ```tsx
 <ButtonMenu
     button={{
         label: userStore.userName,
         icon: "more_vert"
     }}
     position="topRight"
 >
     <MenuItem
         caption={mode.dark ? "Mode clair" : "Mode sombre"}
         icon={mode.dark ? "light_mode" : "dark_mode"}
         onClick={() => (mode.dark = !mode.dark)}
     />
     <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
 </ButtonMenu>
 ```

### Props

| Nom          | Obligatoire | Type                                                                                                            | Description                                                                                                                                                                                                                                      |
| ------------ | ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `active`     | Non         | <code>boolean</code>                                                                                            | If true, the menu will be displayed as opened by default.                                                                                                                                                                                        |
| `button`     | **Oui**     | <code>ButtonProps & TooltipProps & { openedIcon?: ReactNode; }</code>                                           | Les props du bouton.                                                                                                                                                                                                                             |
| `children`   | Non         | <code>ReactNode</code>                                                                                          | Children to pass through the component.                                                                                                                                                                                                          |
| `className`  | Non         | <code>string</code>                                                                                             |                                                                                                                                                                                                                                                  |
| `onClick`    | Non         | <code>MouseEventHandler&lt;HTMLButtonElement&gt;</code>                                                         |                                                                                                                                                                                                                                                  |
| `onHide`     | Non         | <code>() =&gt; void</code>                                                                                      | Callback that will be called when the menu is being hidden.                                                                                                                                                                                      |
| `onSelect`   | Non         | <code>(value?: string) =&gt; void</code>                                                                        | Callback that will be invoked when a menu item is selected.                                                                                                                                                                                      |
| `onShow`     | Non         | <code>() =&gt; void</code>                                                                                      | Callback that will be invoked when the menu is being shown.                                                                                                                                                                                      |
| `outline`    | Non         | <code>boolean</code>                                                                                            | If true the menu wrapper will show an outline with a soft shadow.                                                                                                                                                                                |
| `position`   | Non         | <code>"bottomLeft" &#124; "bottomRight" &#124; "static" &#124; "topLeft" &#124; "topRight" &#124; "auto"</code> | Determine the position of the menu. With static value the menu will be always shown, auto means that the it will decide the opening direction based on the current position. To force a position use topLeft, topRight, bottomLeft, bottomRight. |
| `selectable` | Non         | <code>boolean</code>                                                                                            | If true, the menu will keep a value to highlight the active child item.                                                                                                                                                                          |
| `selected`   | Non         | <code>string</code>                                                                                             | Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted.                                                                                                                            |
| `theme`      | Non         | <code>CSSProp&lt;MenuCss&gt;</code>                                                                             | Classnames object defining the component style.                                                                                                                                                                                                  |

## `IconMenu`

Crée un menu à partir d'un `IconButton`.

Exemple :
 ```tsx
 <IconMenu icon="more_vert" position="topRight">
     <MenuItem
         caption={mode.dark ? "Mode clair" : "Mode sombre"}
         icon={mode.dark ? "light_mode" : "dark_mode"}
         onClick={() => (mode.dark = !mode.dark)}
     />
     <MenuItem caption="Se déconnecter" icon="login" onClick={signOut} />
 </IconMenu>
 ```

### Props

| Nom          | Obligatoire | Type                                                                                                            | Description                                                                                                           |
| ------------ | ----------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `active`     | Non         | <code>boolean</code>                                                                                            | If true, the inner Menu component will be active.                                                                     |
| `children`   | Non         | <code>ReactNode</code>                                                                                          | Children to pass through the component.                                                                               |
| `className`  | Non         | <code>string</code>                                                                                             | Class for the root node.                                                                                              |
| `icon`       | Non         | <code>ReactNode</code>                                                                                          | Icon font key string or Element to display the opener icon.                                                           |
| `inverse`    | Non         | <code>boolean</code>                                                                                            | If true, the neutral colors are inverted. Useful if the icon is over a dark background.                               |
| `onClick`    | Non         | <code>MouseEventHandler&lt;HTMLButtonElement &#124; HTMLLinkElement&gt;</code>                                  | Callback that will be called when the menu is being clicked.                                                          |
| `onHide`     | Non         | <code>() =&gt; void</code>                                                                                      | Callback that will be called when the menu is being hidden.                                                           |
| `onSelect`   | Non         | <code>(value: any) =&gt; void</code>                                                                            | Callback that will be invoked when a menu item is selected.                                                           |
| `onShow`     | Non         | <code>() =&gt; void</code>                                                                                      | Callback that will be invoked when the menu is being shown.                                                           |
| `position`   | Non         | <code>"bottomLeft" &#124; "bottomRight" &#124; "static" &#124; "topLeft" &#124; "topRight" &#124; "auto"</code> | Determines the position of the menu. This property is transferred to the inner Menu component.                        |
| `selectable` | Non         | <code>boolean</code>                                                                                            | If true, the menu will keep a value to highlight the active child item.                                               |
| `selected`   | Non         | <code>any</code>                                                                                                | Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted. |
| `theme`      | Non         | <code>CSSProp&lt;MenuCss&gt;</code>                                                                             | Classnames object defining the component style.                                                                       |

## `MenuItem`

Item de Menu a utiliser dans un `ButtonMenu`, `IconMenu` ou `Menu`.

### Props

| Nom              | Obligatoire | Type                                                           | Description                                                                            |
| ---------------- | ----------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `caption`        | **Oui**     | <code>string</code>                                            | The text to include in the menu item. Required.                                        |
| `children`       | Non         | <code>ReactNode</code>                                         | Children to pass through the component.                                                |
| `className`      | Non         | <code>string</code>                                            |                                                                                        |
| `disabled`       | Non         | <code>boolean</code>                                           | If true, the item will be displayed as disabled and is not selectable.                 |
| `icon`           | Non         | <code>ReactNode</code>                                         | Icon font key string or Element to display in the right side of the option.            |
| `onClick`        | Non         | <code>MouseEventHandler&lt;HTMLLIElement&gt;</code>            |                                                                                        |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLIElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `selected`       | Non         | <code>boolean</code>                                           | @internal                                                                              |
| `shortcut`       | Non         | <code>string</code>                                            | Displays shortcut text on the right side of the caption attribute.                     |
| `theme`          | Non         | <code>CSSProp&lt;MenuCss&gt;</code>                            | Classnames object defining the component style.                                        |
| `value`          | Non         | <code>string</code>                                            | Passed down to the root element.                                                       |

## `Menu`

Affiche un menu, utilisé par ButtonMenu et IconMenu.

### Props

| Nom          | Obligatoire | Type                                                                                                            | Description                                                                                                                                                                                                                                      |
| ------------ | ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `active`     | Non         | <code>boolean</code>                                                                                            | If true, the menu will be displayed as opened by default.                                                                                                                                                                                        |
| `children`   | Non         | <code>ReactNode</code>                                                                                          | Children to pass through the component.                                                                                                                                                                                                          |
| `className`  | Non         | <code>string</code>                                                                                             |                                                                                                                                                                                                                                                  |
| `onHide`     | Non         | <code>() =&gt; void</code>                                                                                      | Callback that will be called when the menu is being hidden.                                                                                                                                                                                      |
| `onSelect`   | Non         | <code>(value?: string) =&gt; void</code>                                                                        | Callback that will be invoked when a menu item is selected.                                                                                                                                                                                      |
| `onShow`     | Non         | <code>() =&gt; void</code>                                                                                      | Callback that will be invoked when the menu is being shown.                                                                                                                                                                                      |
| `outline`    | Non         | <code>boolean</code>                                                                                            | If true the menu wrapper will show an outline with a soft shadow.                                                                                                                                                                                |
| `position`   | Non         | <code>"bottomLeft" &#124; "bottomRight" &#124; "static" &#124; "topLeft" &#124; "topRight" &#124; "auto"</code> | Determine the position of the menu. With static value the menu will be always shown, auto means that the it will decide the opening direction based on the current position. To force a position use topLeft, topRight, bottomLeft, bottomRight. |
| `selectable` | Non         | <code>boolean</code>                                                                                            | If true, the menu will keep a value to highlight the active child item.                                                                                                                                                                          |
| `selected`   | Non         | <code>string</code>                                                                                             | Used for selectable menus. Indicates the current selected value so the child item with this value can be highlighted.                                                                                                                            |
| `theme`      | Non         | <code>CSSProp&lt;MenuCss&gt;</code>                                                                             | Classnames object defining the component style.                                                                                                                                                                                                  |

## `MenuDivider`

Séparateur dans un Menu, entre des MenuItems.

### Props

| Nom     | Obligatoire | Type                                | Description                                     |
| ------- | ----------- | ----------------------------------- | ----------------------------------------------- |
| `theme` | **Oui**     | <code>CSSProp&lt;MenuCss&gt;</code> | Classnames object defining the component style. |

## `ProgressBar`

Une barre de chargement ou un spinner (`linear` ou `circular`). Peut être utilisé de façon déterminée ou indéterminée.

### Props

| Nom              | Obligatoire | Type                                                            | Description                                                                            |
| ---------------- | ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `buffer`         | Non         | <code>number</code>                                             | Value of a secondary progress bar useful for buffering.                                |
| `className`      | Non         | <code>string</code>                                             |                                                                                        |
| `key`            | Non         | <code>Key</code>                                                |                                                                                        |
| `max`            | Non         | <code>number</code>                                             | Maximum value permitted.                                                               |
| `min`            | Non         | <code>number</code>                                             | Minimum value permitted.                                                               |
| `mode`           | Non         | <code>"indeterminate" &#124; "determinate"</code>               | Mode of the progress bar, it can be determinate or indeterminate.                      |
| `multicolor`     | Non         | <code>boolean</code>                                            | If true, the circular progress bar will be changing its color.                         |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;ProgressBarCss&gt;</code>                      | Classnames object defining the component style.                                        |
| `type`           | Non         | <code>"circular" &#124; "linear"</code>                         | Type of the progress bar, it can be circular or linear.                                |
| `value`          | Non         | <code>number</code>                                             | Value of the current progress.                                                         |

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

| Nom              | Obligatoire | Type                                                                                            | Description                                                                            |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `checked`        | Non         | <code>boolean</code>                                                                            | @internal                                                                              |
| `className`      | Non         | <code>string</code>                                                                             | Classe CSS a ajouter au composant racine.                                              |
| `disabled`       | Non         | <code>boolean</code>                                                                            | Désactive le RadioButton.                                                              |
| `id`             | Non         | <code>string</code>                                                                             | Id pour l'input[type=radio] posé par le RadioButton.                                   |
| `label`          | Non         | <code>ReactNode</code>                                                                          | Libellé à poser à côté de la Checkbox.                                                 |
| `name`           | Non         | <code>string</code>                                                                             | Name pour l'input[type=radio] posé par le RadioButton.                                 |
| `onChange`       | Non         | <code>(value: boolean, event: MouseEvent&lt;HTMLInputElement, MouseEvent&gt;) =&gt; void</code> | @internal                                                                              |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                               | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)  |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                               | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                               | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLLabelElement&gt;) =&gt; void</code>                               | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)    |
| `theme`          | Non         | <code>CSSProp&lt;RadioCss&gt;</code>                                                            | CSS.                                                                                   |
| `value`          | **Oui**     | <code>string</code>                                                                             | Valeur du RadioGroup quand ce RadioButton est sélectionné.                             |

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

Un composant de saisie pour saisir un nombre avec un slider.

### Props

| Nom              | Obligatoire | Type                                                            | Description                                                                                                                                                      |
| ---------------- | ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buffer`         | Non         | <code>number</code>                                             | Used to style the ProgressBar element                                                                                                                            |
| `className`      | Non         | <code>string</code>                                             | CSS class for the root component.                                                                                                                                |
| `disabled`       | Non         | <code>boolean</code>                                            | If true, component will be disabled.                                                                                                                             |
| `editable`       | Non         | <code>boolean</code>                                            | If true, an input is shown and the user can set the slider from keyboard value.                                                                                  |
| `max`            | Non         | <code>number</code>                                             | Maximum value permitted.                                                                                                                                         |
| `min`            | Non         | <code>number</code>                                             | Minimum value permitted.                                                                                                                                         |
| `onChange`       | Non         | <code>(value: number) =&gt; void</code>                         | Callback function that will be invoked when the slider value changes.                                                                                            |
| `onPointerDown`  | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)                                                                            |
| `onPointerEnter` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event)                                                                           |
| `onPointerLeave` | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event)                                                                           |
| `onPointerUp`    | Non         | <code>(e: PointerEvent&lt;HTMLDivElement&gt;) =&gt; void</code> | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event)                                                                              |
| `pinned`         | Non         | <code>boolean</code>                                            | If true, a pin with numeric value label is shown when the slider thumb is pressed. Use for settings for which users need to know the exact value of the setting. |
| `snaps`          | Non         | <code>boolean</code>                                            | If true, the slider thumb snaps to tick marks evenly spaced based on the step property value.                                                                    |
| `step`           | Non         | <code>number</code>                                             | Amount to vary the value when the knob is moved or increase/decrease is called.                                                                                  |
| `theme`          | Non         | <code>CSSProp&lt;SliderCss&gt;</code>                           | Classnames object defining the component style.                                                                                                                  |
| `value`          | Non         | <code>number</code>                                             | Current value of the slider.                                                                                                                                     |

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
| `onChange`       | Non         | <code>(value: boolean, event?: MouseEvent&lt;HTMLInputElement, MouseEvent&gt;) =&gt; void</code> | Handler appelé au clic sur le Switch.                                                  |
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

## `tooltipFactory`

Une factory pour ajouter une tooltip à un composant ou un élément HTML. Cela permet de créer une version du même composant/élément avec une tooltip de la façon suivante :

 ```tsx
 const TooltippedButton = tooltipFactory()(Button);

 <TooltippedButton label="Click" tooltip="Click me" />; // Les props de la tooltip sont ajoutées aux props existantes du composant.
 ```

### Props

| Nom                  | Obligatoire | Type                                                                                                  | Description |
| -------------------- | ----------- | ----------------------------------------------------------------------------------------------------- | ----------- |
| `theme`              | Non         | <code>CSSProp&lt;TooltipCss&gt;</code>                                                                |             |
| `tooltipDelay`       | Non         | <code>number</code>                                                                                   |             |
| `tooltipHideOnClick` | Non         | <code>boolean</code>                                                                                  |             |
| `tooltipPassthrough` | Non         | <code>boolean</code>                                                                                  |             |
| `tooltipPosition`    | Non         | <code>"bottom" &#124; "horizontal" &#124; "left" &#124; "right" &#124; "top" &#124; "vertical"</code> |             |
| `tooltipShowOnClick` | Non         | <code>boolean</code>                                                                                  |             |
