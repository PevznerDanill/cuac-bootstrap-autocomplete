## CUAC Bootstrap Autocomplete (jQuery + Bootstrap 5)

An easy-to-use jQuery autocomplete component styled for Bootstrap 5, inspired by Vuetify's `v-autocomplete`.

- Works with plain jQuery (no frameworks required)
- Supports both static items and remote AJAX data
- Keyboard navigation, optional clear button, configurable classes

### Installation

```bash
npm install cuac-bootstrap-autocomplete
```

Or include via a `<script>` tag from a CDN once published (see `PUBLISH.md`).

### Usage

HTML:

```html
<input class="form-control" type="text" id="cuac-bootstrap-autocomplete" autocomplete="off">
```

Initialization:

```javascript
const $input = $('#cuac-bootstrap-autocomplete');
$input.createAutocomplete({ dataUrl: 'https://example.com/search' });
```

Static items:

```javascript
$input.createAutocomplete({
  items: [
    { title: 'Apple', value: 'apple' },
    { title: 'Banana', value: 'banana' },
    'Cherry'
  ]
});
```

### Options

- **dataUrl** (string): URL for AJAX GET requests when typing. Required if `items` not provided.
- **items** (array): Static list (strings or objects). If provided, filtering is performed locally.
- **itemTitle** (string, default: `"title"`): Field for display text in item objects.
- **itemValue** (string, default: `"value"`): Field for value in item objects.
- **autoSelectFirst** (boolean, default: `false`): Highlight and select the first option on blur.
- **dropdownUlClass** (string): CSS class for the dropdown `<ul>`. Defaults to Bootstrap 5 classes.
- **optionLiClass** (string): CSS class for option `<li>` elements. Defaults to Bootstrap 5 classes.
- **clearable** (boolean, default: `true`): Show a clear icon.
- **clearIcon** (string, default: `"bi bi-x-square"`): Icon classes for the clear button.
- **hideNoData** (boolean, default: `true`): Hide dropdown when there are no results.
- **minChars** (number, default: `0`): Minimum characters before search. `0` shows on focus.
- **debounceMs** (number, default: `200`): Debounce delay for requests.
- **requestParam** (string, default: `"q"`): Query parameter name for remote requests.
- **extraAjaxParams** (object): Extra query params for remote requests.

### Events

- `autocomplete:select` — fired on the input when an item is selected. Payload: `(event, item)`.
- `autocomplete:clear` — fired when the clear button is pressed.

### CDN / Browser Usage

Include Bootstrap 5 CSS and jQuery. If you use the default `clearIcon` (Bootstrap Icons), also include Bootstrap Icons CSS. Then include the minified JS and CSS from `dist/`.

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/dist/cuac-bootstrap-autocomplete.min.js"></script>
<link href="/dist/cuac-bootstrap-autocomplete.min.css" rel="stylesheet">
```

See `examples/` for demos.

### License

MIT


