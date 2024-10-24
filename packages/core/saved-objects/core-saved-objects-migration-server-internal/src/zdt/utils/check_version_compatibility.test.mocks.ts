/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const getModelVersionsFromMappingsMock = jest.fn();
export const compareModelVersionsMock = jest.fn();
export const getModelVersionMapForTypesMock = jest.fn();

jest.doMock('@kbn/core-saved-objects-base-server-internal', () => {
  const actual = jest.requireActual('@kbn/core-saved-objects-base-server-internal');
  return {
    ...actual,
    getModelVersionsFromMappings: getModelVersionsFromMappingsMock,
    compareModelVersions: compareModelVersionsMock,
    getModelVersionMapForTypes: getModelVersionMapForTypesMock,
  };
});
