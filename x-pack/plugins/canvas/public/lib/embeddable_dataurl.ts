/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EmbeddableInput } from 'src/plugins/embeddable/public';

export const encode = (input: EmbeddableInput) => btoa(JSON.stringify(input));
export const decode = (serializedInput: string) => JSON.parse(atob(serializedInput));
