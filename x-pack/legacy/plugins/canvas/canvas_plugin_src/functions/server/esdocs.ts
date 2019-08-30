/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sqlstring from 'sqlstring';
import { ExpressionFunctionDefinition } from 'src/plugins/expressions';
// @ts-ignore untyped local
import { queryEsSQL } from '../../../server/lib/query_es_sql';
import { Filter } from '../../../types';
import { getFunctionHelp } from '../../../i18n';

interface Arguments {
  index: string;
  query: string;
  sort: string;
  fields: string;
  metaFields: string;
  count: number;
}

const quoteString = (str: string): string => `"${str}"`;

export function esdocs(): ExpressionFunctionDefinition<'esdocs', Filter, Arguments, any> {
  const { help, args: argHelp } = getFunctionHelp().esdocs;

  return {
    name: 'esdocs',
    type: 'datatable',
    context: {
      types: ['filter'],
    },
    help,
    args: {
      query: {
        types: ['string'],
        aliases: ['_', 'q'],
        help: argHelp.query,
        default: '-_index:.kibana',
      },
      count: {
        types: ['number'],
        default: 1000,
        help: argHelp.count,
      },
      fields: {
        help: argHelp.fields,
        types: ['string'],
      },
      index: {
        types: ['string'],
        default: '_all',
        help: argHelp.index,
      },
      // TODO: This arg isn't being used in the function.
      // We need to restore this functionality or remove it as an arg.
      metaFields: {
        help: argHelp.metaFields,
        types: ['string'],
      },
      sort: {
        types: ['string'],
        help: argHelp.sort,
      },
    },
    fn: (input, args, context) => {
      const { count, index, fields, sort } = args;

      input.and = input.and.concat([
        {
          type: 'luceneQueryString',
          query: args.query,
          and: [],
        },
      ]);

      const columns = fields
        ? fields
            .split(',')
            .map((field: string) => quoteString(field.trim()))
            .join(', ')
        : '*';

      let query = `SELECT ${columns} FROM ${quoteString(index)}`;

      if (sort) {
        const [sortField, sortOrder] = sort.split(',').map(str => str.trim());

        if (sortField) {
          query = query.concat(`ORDER BY ${sortField} ${sortOrder.toUpperCase()}`);
        }
      }

      query = sqlstring.escape(query);

      return queryEsSQL(((context as any) as { elasticsearchClient: any }).elasticsearchClient, {
        count,
        query,
        filter: input.and,
      });
    },
  };
}
