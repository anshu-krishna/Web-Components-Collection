# Form-Wizard WebComponent

### Attributes:

- `combined-formdata` : When present `submit` event combines data from all ***valid*** `form`(s) into a single `FormData` as event `detail`.

### Events:

- `ready` : Dispatched after the children `form`(s) are loaded.
- `submit` : Dispatched on clicking the `Finish` (last `Next`) button.

### Methods:

- `show()` : Opens the wizard.
- `hide()` : Hides the wizard

### Special `data-attributes` for children `form`(s):

- `data-back-text` : Use for setting the `Back` button's text for the `form`.
- `data-next-text` : Use for setting the `Next` button's text for the `form`.
- `data-cancel-text` : Use for setting the `Cancel` button's text for the `form`.
- `data-back-disabled="true"` : Use for disabling the `Back` button for the `form`.
- `data-next-disabled="true"` : Use for disabling the `Next` button for the `form`.
- `data-cancel-disabled="true"` : Use for disabling the `Cancel` button for the `form`.
- `data-skippable="true"` : If value is `true` then the `form` can be skipped without validation.

### Component Parts:

- `button` : Use for styling `Back`, `Next` and `Cancel` buttons.
- `dot` : Use for styling the `form` state indicator `dot` at the top.
- `dot-ok` : Use for styling the `dot` part for a ***valid*** `form`.
- `dot-error` : Use for styling the `dot` part for a ***invalid*** `form`.
- `dot-spacer` : Use for styling the `spacer` between the `dot` parts.
- `overlay` : Use for styling the background overlay. ***Use carefully or it can break the component***.
- `form-container` : Use for styling the internal container for `form`. ***Use carefully or it can break the component***.
- `button-container` : Use for styling the internal container for action button(s). ***Use carefully or it can break the component***.

### Additional helper module exports:

- `combineFormData(...form)` : Helper function for merging multiple `form`'s data into a single `FormData`.