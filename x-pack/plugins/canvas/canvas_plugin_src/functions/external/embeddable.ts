/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ExpressionFunctionDefinition } from 'src/plugins/expressions/common';
import { TimeRange } from 'src/plugins/data/public';
import { Filter } from '@kbn/es-query';
import { ExpressionValueFilter } from '../../../types';
import {
  EmbeddableExpressionType,
  EmbeddableExpression,
  EmbeddableInput as Input,
} from '../../expression_types';
import { getFunctionHelp } from '../../../i18n';
import { SavedObjectReference } from '../../../../../../src/core/types';
import { getQueryFilters } from '../../../common/lib/build_embeddable_filters';
import { decode } from '../../../public/lib/embeddable_dataurl';

interface Arguments {
  config: string;
  type: string;
}

const defaultTimeRange = {
  from: 'now-15m',
  to: 'now',
};

export type EmbeddableInput = Input & {
  timeRange?: TimeRange;
  filters?: Filter[];
  savedObjectId: string;
};

const baseEmbeddableInput = {
  timeRange: defaultTimeRange,
  disableTriggers: true,
  renderMode: 'noInteractivity',
};

type Return = EmbeddableExpression<EmbeddableInput>;

export function embeddable(): ExpressionFunctionDefinition<
  'embeddable',
  ExpressionValueFilter | null,
  Arguments,
  Return
> {
  const { help, args: argHelp } = getFunctionHelp().embeddable;

  return {
    name: 'embeddable',
    help,
    args: {
      config: {
        aliases: ['_'],
        types: ['string'],
        required: true,
        help: argHelp.config,
      },
      type: {
        types: ['string'],
        required: true,
        help: argHelp.type,
      },
    },
    context: {
      types: ['filter'],
    },
    type: EmbeddableExpressionType,
    fn: (input, args) => {
      const filters = input ? input.and : [];

      const embeddableInput = decode(args.config) as EmbeddableInput;

      return {
        type: EmbeddableExpressionType,
        input: {
          ...baseEmbeddableInput,
          ...embeddableInput,
          filters: getQueryFilters(filters),
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
