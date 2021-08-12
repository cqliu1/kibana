/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { PaletteRegistry } from 'src/plugins/charts/public';
import { EmbeddableInput } from '../../../functions/external/embeddable';
import { encode } from '../../../../public/lib/embeddable_dataurl';

export function toExpression(
  input: EmbeddableInput,
  embeddableType: string,
  palettes: PaletteRegistry
): string {
  const expressionParts = [] as string[];

  expressionParts.push('embeddable');

  expressionParts.push(`input="${encode(input)}"`);

  expressionParts.push(`type="${embeddableType}"`);

  return expressionParts.join(' ');
}
