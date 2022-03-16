/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function roundWithPrecision(
  value: number,
  decimalPlaces: number,
  roundFunction: (n: number) => number
) {
  if (decimalPlaces <= 0) {
    return roundFunction(value);
  }

  let results = value;
  results = results * Math.pow(10, decimalPlaces);
  results = roundFunction(results);
  results = results / Math.pow(10, decimalPlaces);
  return results;
}

export function ceilWithPrecision(value: number, decimalPlaces: number) {
  return roundWithPrecision(value, decimalPlaces, Math.ceil);
}

export function floorWithPrecision(value: number, decimalPlaces: number) {
  return roundWithPrecision(value, decimalPlaces, Math.floor);
}
