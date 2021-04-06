/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { connect } from 'react-redux';

import { getElements } from '../../state/selectors/workpad';

import { Element as Component } from './element.component';

import { State } from '../../../types';
import { TransformMatrix3d } from '../../lib/aeroelastic';

export interface Props {
  id: string;
  transformMatrix: TransformMatrix3d;
}

export const Element = connect((state: State, ownProps: Props) => ({
  expression: getElements(state).find((el) => el.id === ownProps.id)?.expression,
  ...ownProps,
}))(Component);
