/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as rt from 'io-ts';

export const getMetricsExplorerViewRequestParamsRT = rt.type({
  metricsExplorerViewId: rt.string,
});

export type GetMetricsExplorerViewRequestParams = rt.TypeOf<
  typeof getMetricsExplorerViewRequestParamsRT
>;
