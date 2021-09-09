/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { compose, withProps } from 'recompose';
import { Dispatch } from 'redux';
import { trackCanvasUiMetric, METRIC_TYPE } from '../../../../public/lib/ui_metric';
import { CANVAS_APP } from '../../../../common/lib';
import { State, ElementSpec } from '../../../../types';
// @ts-expect-error untyped local
import { elementsRegistry } from '../../../lib/elements_registry';
import { ElementMenu as Component, Props as ComponentProps } from './element_menu.component';
// @ts-expect-error untyped local
import { addElement } from '../../../state/actions/elements';
import { getSelectedPage } from '../../../state/selectors/workpad';
import { AddEmbeddablePanel } from '../../embeddable_flyout';
import { useEmbeddablesService } from '../../../services';

interface StateProps {
  pageId: string;
}

interface DispatchProps {
  addElement: (pageId: string) => (partialElement: ElementSpec) => void;
}

const mapStateToProps = (state: State) => ({
  pageId: getSelectedPage(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addElement: (pageId: string) => (element: ElementSpec) => dispatch(addElement(pageId, element)),
});

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  addElement: dispatchProps.addElement(stateProps.pageId),
  // Moved this section out of the main component to enable stories
  renderEmbedPanel: (onClose: () => void) => <AddEmbeddablePanel onClose={onClose} />,
});

const ElementMenuComponent = (props: ComponentProps) => {
  const embeddablesService = useEmbeddablesService();
  const stateTransferService = embeddablesService.getStateTransfer();
  const { pathname, search } = useLocation();

  const createNewEmbeddable = useCallback(() => {
    const path = '#/';
    const appId = 'lens';

    if (trackCanvasUiMetric) {
      trackCanvasUiMetric(METRIC_TYPE.CLICK, `${appId}:create`);
    }

    stateTransferService.navigateToEditor(appId, {
      path,
      state: {
        originatingApp: CANVAS_APP,
        originatingPath: `#/${pathname}${search}`,
      },
    });
  }, [pathname, search, stateTransferService]);

  return <Component {...props} createNewEmbeddable={createNewEmbeddable} />;
};

export const ElementMenu = compose<ComponentProps, {}>(
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
  withProps(() => ({ elements: elementsRegistry.toJS() }))
)(ElementMenuComponent);
