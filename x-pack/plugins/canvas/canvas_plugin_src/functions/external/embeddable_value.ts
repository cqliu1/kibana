/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ExpressionFunctionDefinition } from 'src/plugins/expressions/common';
import { EmbeddableInput } from 'src/plugins/embeddable/public';
import { getQueryFilters } from '../../../public/lib/build_embeddable_filters';
import { ExpressionValueFilter, TimeRange as TimeRangeArg } from '../../../types';
import { EmbeddableExpressionType, EmbeddableExpression } from '../../expression_types';
import { getFunctionHelp } from '../../../i18n';
import { SavedObjectReference } from '../../../../../../src/core/types';

interface Arguments {
  input: string;
}

const defaultTimeRange = {
  from: 'now-15m',
  to: 'now',
};

type Return = EmbeddableExpression<EmbeddableInput>;

export function embeddable(): ExpressionFunctionDefinition<
  'embeddable',
  ExpressionValueFilter | null,
  Arguments,
  Return
> {
  // TODO: write help text
  const { help, args: argHelp } = getFunctionHelp().embeddable;

  return {
    name: 'embeddable',
    help,
    args: {
      value: {
        types: ['string'],
        required: false,
        help: argHelp.id,
      },
    },
    type: EmbeddableExpressionType,
    fn: (input, args) => {
      const filters = input ? input.and : [];

      return {
        type: EmbeddableExpressionType,
        input: {
          id: args.id,
          filters: getQueryFilters(filters),
          timeRange: args.timerange || defaultTimeRange,
          title: args.title === null ? undefined : args.title,
          hidePanelTitles: args.hideTitle,
          disableTriggers: true,
          palette: args.palette,
          renderMode: 'noInteractivity',
        },
        generatedAt: Date.now(),
        embeddableType: args.type,
      };
    },

    extract(state) {
      const refName = 'embeddable.id';
      const refType = 'embeddable.embeddableType';
      const references: SavedObjectReference[] = [
        {
          name: refName,
          type: refType,
          id: state.id[0] as string,
        },
      ];
      return {
        state: {
          ...state,
          id: [refName],
        },
        references,
      };
    },

    inject(state, references) {
      const reference = references.find((ref) => ref.name === 'embeddable.id');
      if (reference) {
        state.id[0] = reference.id;
      }
      return state;
    },
  };
}
