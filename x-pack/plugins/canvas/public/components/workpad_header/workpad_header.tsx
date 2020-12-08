/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { compose, withProps } from 'recompose';
import { canUserWrite } from '../../state/selectors/app';
import { getSelectedPage, isWriteable } from '../../state/selectors/workpad';
import { setWriteable } from '../../state/actions/workpad';
import { State } from '../../../types';
import { WorkpadHeader as Component, Props as ComponentProps } from './workpad_header.component';
import { withServices, WithServicesProps } from '../../services';

const mapStateToProps = (state: State) => ({
  isWriteable: isWriteable(state) && canUserWrite(state),
  canUserWrite: canUserWrite(state),
  selectedPage: getSelectedPage(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSetWriteable: (isWorkpadWriteable: boolean) => dispatch(setWriteable(isWorkpadWriteable)),
});

export const WorkpadHeader = compose<ComponentProps, {}>(
  connect(mapStateToProps, mapDispatchToProps),
  withServices,
  withProps(({ services }: WithServicesProps) => ({
    navigation: services.navigation,
  }))
)(Component);
