/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CANVAS_TYPE, CUSTOM_ELEMENT_TYPE } from '../common/lib/constants';

export const mappings = {
  [CANVAS_TYPE]: {
    dynamic: false,
    properties: {
      name: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
      },
      '@timestamp': { type: 'date' },
      '@created': { type: 'date' },
    },
  },
  [CUSTOM_ELEMENT_TYPE]: {
    dynamic: false,
    properties: {
      name: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
          },
        },
      },
      content: { type: 'text' },
      image: { type: 'text' },
      '@timestamp': { type: 'date' },
      '@created': { type: 'date' },
    },
  },
};
