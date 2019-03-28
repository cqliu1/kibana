/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import chrome from 'ui/chrome';
import { API_ROUTE_CUSTOM_ELEMENT } from '../../common/lib/constants';
import { fetch } from '../../common/lib/fetch';

const basePath = chrome.getBasePath();
const apiPath = `${basePath}${API_ROUTE_CUSTOM_ELEMENT}`;

export const create = customElement => fetch.post(apiPath, customElement);

export const get = customElementId =>
  fetch.get(`${apiPath}/${customElementId}`).then(({ data: element }) => element);

export const update = (id, workpad) => fetch.put(`${apiPath}/${id}`, workpad);

export const remove = id => fetch.delete(`${apiPath}/${id}`);

export const find = searchTerm => {
  const validSearchTerm = typeof searchTerm === 'string' && searchTerm.length > 0;

  return fetch
    .get(`${apiPath}/find?name=${validSearchTerm ? searchTerm : ''}&perPage=10000`)
    .then(({ data: workpads }) => workpads);
};
