/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ExpressionsSetup } from '@kbn/expressions-plugin/public';

import { FilesClient } from '@kbn/files-plugin/public';
import { FileImageMetadata } from '@kbn/shared-ux-file-types';
import { getDatatable } from '../common/expressions/datatable/datatable';
import { datatableColumn } from '../common/expressions/datatable/datatable_column';
import { mapToColumns } from '../common/expressions/map_to_columns/map_to_columns';
import { formatColumn } from '../common/expressions/format_column';
import { counterRate } from '../common/expressions/counter_rate';
import { getTimeScale } from '../common/expressions/time_scale/time_scale';
import { collapse } from '../common/expressions/collapse';
import { getImage } from '../common/expressions/get_image';

type TimeScaleArguments = Parameters<typeof getTimeScale>;

export const setupExpressions = (
  expressions: ExpressionsSetup,
  formatFactory: Parameters<typeof getDatatable>[0],
  getDatatableUtilities: TimeScaleArguments[0],
  getTimeZone: TimeScaleArguments[1],
  getForceNow: TimeScaleArguments[2],
  files: Parameters<typeof getImage>[0]
) => {
  [
    collapse,
    counterRate,
    formatColumn,
    mapToColumns,
    datatableColumn,
    getDatatable(formatFactory),
    getTimeScale(getDatatableUtilities, getTimeZone, getForceNow),
    getImage(files),
  ].forEach((expressionFn) => expressions.registerFunction(expressionFn));
};
