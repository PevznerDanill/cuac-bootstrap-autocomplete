/* CUAC Bootstrap Autocomplete - jQuery plugin (Bootstrap 5)
 * Works with global jQuery. Bundle builds an IIFE usable via <script>.
 */

import { debounce, normalizeItems, extractArrayFromResponse, createListItemElement, fetchRemoteOptions, matchLocalItems } from './utils.js';

(function initPlugin(global) {
  const $ = global.jQuery || global.$;
  if (!$) {
    // Defer plugin registration until jQuery appears
    return;
  }

  const DEFAULT_OPTIONS = {
    dataUrl: null,
    items: null,
    itemTitle: 'title',
    itemValue: 'value',
    autoSelectFirst: false,
    dropdownUlClass: 'dropdown-menu cuac-autocomplete-dropdown show',
    optionLiClass: 'dropdown-item',
    clearable: true,
    clearIcon: 'bi bi-x-square',
    hideNoData: true,
    minChars: 0,
    debounceMs: 200,
    requestParam: 'q',
    extraAjaxParams: {},
  };

  function buildWrapper($input) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cuac-autocomplete-wrapper';
    $input.wrap(wrapper);
    return $input.parent();
  }

  function buildClearButton(options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cuac-autocomplete-clear-btn';
    btn.setAttribute('aria-label', 'Clear');
    const icon = document.createElement('i');
    icon.className = options.clearIcon;
    btn.appendChild(icon);
    return $(btn);
  }

  function buildDropdown(options) {
    const ul = document.createElement('ul');
    ul.className = options.dropdownUlClass;
    ul.setAttribute('role', 'listbox');
    return $(ul);
  }

  function setInputValue($input, item) {
    $input.val(item ? item.title : '');
    $input.data('cuac-selected', item || null);
    $input.trigger('autocomplete:select', [item || null]);
    $input.trigger('change');
  }

  function renderOptions(documentRef, $dropdown, optionsList, optionLiClass, highlightedIndex) {
    $dropdown.empty();
    optionsList.forEach((item, index) => {
      const li = createListItemElement(documentRef, optionLiClass, item, index === highlightedIndex);
      $dropdown.append(li);
    });
  }

  function ensureVisible($dropdown, index) {
    const $children = $dropdown.children();
    if (index < 0 || index >= $children.length) return;
    const li = $children.get(index);
    const parent = $dropdown.get(0);
    const liTop = li.offsetTop;
    const liBottom = liTop + li.offsetHeight;
    const viewTop = parent.scrollTop;
    const viewBottom = viewTop + parent.clientHeight;
    if (liTop < viewTop) parent.scrollTop = liTop;
    else if (liBottom > viewBottom) parent.scrollTop = liBottom - parent.clientHeight;
  }

  function attachPlugin($input, userOptions) {
    const options = Object.assign({}, DEFAULT_OPTIONS, userOptions || {});
    const $wrapper = buildWrapper($input);
    const $dropdown = buildDropdown(options).appendTo($wrapper);
    const $clearBtn = options.clearable ? buildClearButton(options).appendTo($wrapper) : null;

    let allLocalOptions = normalizeItems(options.items || [], options.itemTitle, options.itemValue);
    let visibleOptions = [];
    let highlightedIndex = options.autoSelectFirst ? 0 : -1;
    let isDropdownOpen = false;
    const currentRequestRef = { current: null };

    function openDropdown() {
      if (!isDropdownOpen) {
        $dropdown.addClass('show');
        isDropdownOpen = true;
      }
    }

    function closeDropdown() {
      if (isDropdownOpen) {
        $dropdown.removeClass('show');
        isDropdownOpen = false;
      }
    }

    function updateDropdown(term) {
      if (options.items && Array.isArray(options.items)) {
        visibleOptions = matchLocalItems(allLocalOptions, term);
        highlightedIndex = options.autoSelectFirst && visibleOptions.length > 0 ? 0 : -1;
        if (visibleOptions.length === 0) {
          if (options.hideNoData) {
            closeDropdown();
          } else {
            $dropdown.empty();
            const noLi = document.createElement('li');
            noLi.className = options.optionLiClass + ' cuac-autocomplete-no-data';
            noLi.textContent = 'No results';
            $dropdown.append(noLi);
            openDropdown();
          }
          return;
        }
        renderOptions(document, $dropdown, visibleOptions, options.optionLiClass, highlightedIndex);
        openDropdown();
        return;
      }

      if (typeof options.dataUrl === 'string' && options.dataUrl.length > 0) {
        fetchRemoteOptions($, options.dataUrl, options.requestParam, term, options.extraAjaxParams, currentRequestRef)
          .then((data) => {
            const rawArray = extractArrayFromResponse(data);
            allLocalOptions = normalizeItems(rawArray, options.itemTitle, options.itemValue);
            visibleOptions = matchLocalItems(allLocalOptions, term);
            highlightedIndex = options.autoSelectFirst && visibleOptions.length > 0 ? 0 : -1;
            if (visibleOptions.length === 0) {
              if (options.hideNoData) {
                closeDropdown();
              } else {
                $dropdown.empty();
                const noLi = document.createElement('li');
                noLi.className = options.optionLiClass + ' cuac-autocomplete-no-data';
                noLi.textContent = 'No results';
                $dropdown.append(noLi);
                openDropdown();
              }
              return;
            }
            renderOptions(document, $dropdown, visibleOptions, options.optionLiClass, highlightedIndex);
            openDropdown();
          })
          .catch(() => {
            if (options.hideNoData) {
              closeDropdown();
            } else {
              $dropdown.empty();
              const li = document.createElement('li');
              li.className = options.optionLiClass + ' cuac-autocomplete-no-data';
              li.textContent = 'Failed to load';
              $dropdown.append(li);
              openDropdown();
            }
          });
      }
    }

    const debouncedSearch = debounce((term) => updateDropdown(term), options.debounceMs);

    // Events
    $input.on('input', function onInputChange() {
      const term = $(this).val();
      if ((term && String(term).length) || options.minChars === 0) {
        debouncedSearch(term);
      } else {
        closeDropdown();
      }
    });

    $input.on('focus', function onFocus() {
      const current = $(this).val();
      if (options.minChars === 0) {
        updateDropdown(current);
      }
    });

    $input.on('blur', function onBlur() {
      window.setTimeout(() => {
        if (options.autoSelectFirst && visibleOptions.length > 0 && !$input.data('cuac-selected')) {
          setInputValue($input, visibleOptions[0]);
        }
        closeDropdown();
      }, 120);
    });

    $dropdown.on('mousedown', 'li', function onMouseDown(e) {
      e.preventDefault();
      const index = $(this).index();
      const selected = visibleOptions[index];
      if (selected) {
        setInputValue($input, selected);
        closeDropdown();
      }
    });

    $input.on('keydown', function onKeyDown(e) {
      if (!isDropdownOpen) return;
      const KEY = { UP: 38, DOWN: 40, ENTER: 13, ESC: 27 };
      switch (e.which) {
        case KEY.DOWN:
          e.preventDefault();
          if (visibleOptions.length === 0) return;
          highlightedIndex = Math.min(visibleOptions.length - 1, highlightedIndex + 1);
          renderOptions(document, $dropdown, visibleOptions, options.optionLiClass, highlightedIndex);
          ensureVisible($dropdown, highlightedIndex);
          break;
        case KEY.UP:
          e.preventDefault();
          if (visibleOptions.length === 0) return;
          highlightedIndex = Math.max(0, highlightedIndex - 1);
          renderOptions(document, $dropdown, visibleOptions, options.optionLiClass, highlightedIndex);
          ensureVisible($dropdown, highlightedIndex);
          break;
        case KEY.ENTER:
          if (highlightedIndex >= 0 && highlightedIndex < visibleOptions.length) {
            e.preventDefault();
            setInputValue($input, visibleOptions[highlightedIndex]);
            closeDropdown();
          }
          break;
        case KEY.ESC:
          closeDropdown();
          break;
        default:
          break;
      }
    });

    if ($clearBtn) {
      $clearBtn.on('click', function onClearClick() {
        setInputValue($input, null);
        closeDropdown();
        $input.trigger('autocomplete:clear');
        $input.focus();
      });
    }

    // API: expose a tiny control surface
    const api = {
      open: () => {
        updateDropdown($input.val());
      },
      close: () => closeDropdown(),
      destroy: () => {
        if (currentRequestRef.current && typeof currentRequestRef.current.abort === 'function') {
          try { currentRequestRef.current.abort(); } catch (_) { /* no-op */ }
        }
        if ($clearBtn) $clearBtn.remove();
        $dropdown.remove();
        // unwrap only if wrapper is ours
        if ($input.parent().hasClass('cuac-autocomplete-wrapper')) {
          $input.unwrap();
        }
        $input.removeData('cuacAutocomplete');
      },
      getSelected: () => $input.data('cuac-selected') || null,
    };

    $input.data('cuacAutocomplete', api);
  }

  $.fn.createAutocomplete = function createAutocomplete(userOptions) {
    return this.each(function eachInit() {
      const $input = $(this);
      attachPlugin($input, userOptions);
    });
  };

})(typeof window !== 'undefined' ? window : globalThis);


