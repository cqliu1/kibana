/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { calcFieldCounts } from './calc_field_counts';
import { buildDataTableRecord } from './build_data_record';

describe('calcFieldCounts', () => {
  test('returns valid field count data', async () => {
    const rows = [
      { _id: '1', _index: 'test', _source: { message: 'test1', bytes: 20 } },
      { _id: '2', _index: 'test', _source: { name: 'test2', extension: 'jpg' } },
    ].map((row) => buildDataTableRecord(row));
    const result = calcFieldCounts(rows);
    expect(result).toMatchInlineSnapshot(`
      Object {
        "bytes": 1,
        "extension": 1,
        "message": 1,
        "name": 1,
      }
    `);
  });
  test('updates field count data', async () => {
    const rows = [
      { _id: '1', _index: 'test', _source: { message: 'test1', bytes: 20 } },
      { _id: '2', _index: 'test', _source: { name: 'test2', extension: 'jpg' } },
    ].map((row) => buildDataTableRecord(row));
    const result = calcFieldCounts(rows);
    expect(result).toMatchInlineSnapshot(`
      Object {
        "bytes": 1,
        "extension": 1,
        "message": 1,
        "name": 1,
      }
    `);
  });
});
