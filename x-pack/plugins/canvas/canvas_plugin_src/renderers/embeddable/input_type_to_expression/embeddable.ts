/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { encode } from '../../../../public/lib/embeddable_dataurl';
import { EmbeddableInput } from '../../../expression_types';

export function toExpression(input: EmbeddableInput, embeddableType: string): string {
  const expressionParts = [] as string[];

  expressionParts.push('embeddable');

  expressionParts.push(`config="${encode(input)}"`);

  expressionParts.push(`type="${embeddableType}"`);

  return expressionParts.join(' ');
}
