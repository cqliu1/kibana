/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { getSelectedElement } from '../../state/selectors/workpad';
import { Sidebar as Component } from './sidebar';

const mapStateToProps = state => ({
  selectedElement: getSelectedElement(state),
});

export const Sidebar = connect(mapStateToProps)(Component);
