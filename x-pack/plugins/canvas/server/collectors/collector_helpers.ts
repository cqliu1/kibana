/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * @param ast: an ast that includes functions to track
 * @param cb: callback to do something with a function that has been found
 */

import {
  ExpressionAstExpression,
  ExpressionAstNode,
} from '../../../../../src/plugins/expressions/common';

function isExpression(
  maybeExpression: ExpressionAstNode
): maybeExpression is ExpressionAstExpression {
  return typeof maybeExpression === 'object' && maybeExpression.type === 'expression';
}

export function collectFns(ast: ExpressionAstNode, cb: (functionName: string) => void) {
  if (!isExpression(ast)) return;

  ast.chain.forEach(({ function: cFunction, arguments: cArguments }) => {
    cb(cFunction);

    // recurse the arguments and update the set along the way
    Object.keys(cArguments).forEach((argName) => {
      cArguments[argName].forEach((subAst) => {
        if (subAst != null) {
          collectFns(subAst, cb);
        }
      });
    });
  });
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * @param ast: an ast that includes functions to track
 * @param cb: callback to do something with a function that has been found
 */

import {fromExpression} from '@kbn/interpreter'
import { ISavedObjectsRepository, SavedObjectAttributes } from 'kibana/server';
import {
  ExpressionAstExpression,
  ExpressionAstNode,
} from '../../../../../src/plugins/expressions/common';
import { CANVAS_TYPE } from '../../common/lib'
import { CanvasWorkpad} from '../../types'
import { decode } from '../../common/lib/embeddable_dataurl';

function isExpression(
  maybeExpression: ExpressionAstNode
): maybeExpression is ExpressionAstExpression {
  return typeof maybeExpression === 'object' && maybeExpression.type === 'expression';
}

export function collectFns(ast: ExpressionAstNode, cb: (functionName: string) => void) {
  if (!isExpression(ast)) return;

  ast.chain.forEach(({ function: cFunction, arguments: cArguments }) => {
    cb(cFunction);

    // recurse the arguments and update the set along the way
    Object.keys(cArguments).forEach((argName) => {
      cArguments[argName].forEach((subAst) => {
        if (subAst != null) {
          collectFns(subAst, cb);
        }
      });
    });
  });
}

export const findByValueEmbeddables = async (
  savedObjectClient: Pick<ISavedObjectsRepository, 'find'>,
  embeddableType: string
) => {
  const workpads = await savedObjectClient.find<SavedObjectAttributes>({
    type: CANVAS_TYPE,
  });

  return workpads.saved_objects
    .map((workpad: CanvasWorkpad) => {
      try {
        return workpad.pages.map((page)=>page.elements)
      } catch (exception) {
        return [];
      }
    })
    .flat()
    .filter((element) => {}
    .filter((panel) => panel.type === embeddableType)
    .map((panel) => panel.embeddableConfig);
};
