/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { pure, compose, withProps, withState, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import { cloneSubgraphs } from '../../lib/clone_subgraphs';
import * as customElementService from '../../lib/custom_element_service';
import { elementsRegistry } from '../../lib/elements_registry';
import { notify } from '../../lib/notify';
import { selectElement } from '../../state/actions/transient';
import { insertNodes, removeElements } from '../../state/actions/elements';
import { getSelectedPage } from '../../state/selectors/workpad';
import { ElementTypes as Component } from './element_types';

const elementTypesState = withState('search', 'setSearch');
const customElementsState = withState('customElements', 'setCustomElements', []);
const elementTypeProps = withProps(() => ({ elements: elementsRegistry.toJS() }));

const mapStateToProps = state => ({ selectedPage: getSelectedPage(state) });

const mapDispatchToProps = dispatch => ({
  selectElement: selectedElement => dispatch(selectElement(selectedElement)),
  insertNodes: pageId => selectedElements => dispatch(insertNodes(selectedElements, pageId)),
  removeElements: pageId => elementIds => dispatch(removeElements(elementIds, pageId)),
});

export const ElementTypes = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  pure,
  elementTypesState,
  elementTypeProps,
  customElementsState,
  withHandlers({
    // add custom element to the page
    addCustomElement: ({ insertNodes, selectElement, selectedPage }) => customElement => {
      const { selectedElements, rootShapes } = JSON.parse(customElement.content) || {
        selectedElements: [],
        rootShapes: [],
      };

      const clonedElements = selectedElements && cloneSubgraphs(selectedElements);

      if (clonedElements) {
        // first clone and persist the new node(s)
        insertNodes(selectedPage)(clonedElements);
        // then select the cloned node
        if (rootShapes.length) {
          if (selectedElements.length > 1) {
            // adHocGroup branch (currently, pasting will leave only the 1st element selected, rather than forming a
            // new adHocGroup - todo)
            selectElement(clonedElements[0].id);
          } else {
            // single element or single persistentGroup branch
            selectElement(
              clonedElements[selectedElements.findIndex(s => s.id === rootShapes[0])].id
            );
          }
        }
      }
    },
    // custom element search
    findCustomElements: ({ setCustomElements }) => async text => {
      try {
        const { customElements } = await customElementService.find(text);
        setCustomElements(customElements);
      } catch (err) {
        notify.error(err, { title: `Couldn't find custom elements` });
      }
    },
  })
)(Component);
