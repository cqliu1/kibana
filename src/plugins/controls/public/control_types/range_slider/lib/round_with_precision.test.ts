/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ceilWithPrecision, floorWithPrecision } from './round_with_precision';

describe('round with precision', () => {
  describe('ceilWithPrecision', () => {
    it('rounds up to 0 decimal places', () => {
      expect(ceilWithPrecision(999.133, 0)).toBe(1000);
    });
    it('rounds up to 2 decimal places', () => {
      expect(ceilWithPrecision(999.133, 2)).toBe(999.14);
    });
  });

  describe('floorWithPrecision', () => {
    it('rounds down to 0 decimal places', () => {
      expect(floorWithPrecision(100.777, 0)).toBe(100);
    });
    it('rounds down to 2 decimal places', () => {
      expect(floorWithPrecision(100.777, 2)).toBe(100.77);
    });
  });
});
