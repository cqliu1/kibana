/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// @ts-ignore
import { getElementById, getSelectedPage } from '../../../state/selectors/workpad';
import { ElementSettings as Component, Element } from './element_settings';

export interface State {
  persistent: { workpad: { pages: Array<{ elements: Element[] }> } };
}

export interface Props {
  selectedElementId: string;
}

const mapStateToProps = (state: State, { selectedElementId }: Props) => ({
  element: getElementById(state, selectedElementId, getSelectedPage(state)),
});

export const ElementSettings = connect(mapStateToProps)(Component);

ElementSettings.propTypes = {
  selectedElementId: PropTypes.string.isRequired,
};
