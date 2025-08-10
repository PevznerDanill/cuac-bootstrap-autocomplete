// Utility helpers for CUAC Bootstrap Autocomplete

export function debounce(functionToDebounce, waitMilliseconds) {
  let timeoutIdentifier = null;
  return function debouncedFunction(...invokeArguments) {
    const context = this;
    window.clearTimeout(timeoutIdentifier);
    timeoutIdentifier = window.setTimeout(() => {
      functionToDebounce.apply(context, invokeArguments);
    }, waitMilliseconds);
  };
}

export function normalizeItems(items, itemTitleKey, itemValueKey) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === 'string') {
      return { title: item, value: item, raw: item };
    }
    if (item && typeof item === 'object') {
      const hasTitle = Object.prototype.hasOwnProperty.call(item, itemTitleKey);
      const hasValue = Object.prototype.hasOwnProperty.call(item, itemValueKey);
      const rawTitle = hasTitle ? item[itemTitleKey] : (hasValue ? String(item[itemValueKey]) : '');
      const rawValue = hasValue ? item[itemValueKey] : rawTitle;
      return { title: String(rawTitle), value: rawValue, raw: item };
    }
    return { title: String(item), value: item, raw: item };
  });
}

export function extractArrayFromResponse(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.items)) return response.items;
  if (response && Array.isArray(response.data)) return response.data;
  if (response && Array.isArray(response.results)) return response.results;
  if (response && typeof response === 'object') {
    const firstArray = Object.values(response).find((value) => Array.isArray(value));
    if (firstArray) return firstArray;
  }
  return [];
}

export function createListItemElement(documentRef, optionLiClass, item, isActive) {
  const liElement = documentRef.createElement('li');
  liElement.className = optionLiClass + (isActive ? ' active' : '');
  liElement.setAttribute('role', 'option');
  liElement.setAttribute('data-value', String(item.value));
  liElement.textContent = item.title;
  return liElement;
}

export function fetchRemoteOptions($, url, queryParamName, term, additionalParams, currentRequestRef) {
  if (!$ || typeof $.ajax !== 'function') {
    return Promise.reject(new Error('jQuery is required'));
  }

  if (currentRequestRef.current && typeof currentRequestRef.current.abort === 'function') {
    try { currentRequestRef.current.abort(); } catch (_) { /* no-op */ }
  }

  const queryParameters = Object.assign({}, additionalParams || {});
  queryParameters[queryParamName] = term;

  const jqXhr = $.ajax({
    url: url,
    method: 'GET',
    data: queryParameters,
    dataType: 'json',
    cache: true
  });
  currentRequestRef.current = jqXhr;

  return new Promise((resolve, reject) => {
    jqXhr.done((data) => resolve(data));
    jqXhr.fail((_jqXhr, textStatus, errorThrown) => {
      // If request was aborted, resolve to empty to avoid error UI flickers
      if (textStatus === 'abort') return resolve([]);
      reject(errorThrown || new Error('Request failed'));
    });
  });
}

export function matchLocalItems(allItems, searchTerm) {
  if (!searchTerm) return allItems;
  const lowered = String(searchTerm).toLowerCase();
  return allItems.filter((option) => String(option.title).toLowerCase().includes(lowered));
}

