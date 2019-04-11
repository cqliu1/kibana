/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import { compose, withHandlers, withProps, withState } from 'recompose';
import { aeroelastic } from '../../lib/aeroelastic_kibana';
import { cloneSubgraphs } from '../../lib/clone_subgraphs';
import { insertNodes, elementLayer, removeElements } from '../../state/actions/elements';
import { getSelectedPage, getSelectedElement, getNodes } from '../../state/selectors/workpad';
import { flatten } from '../../lib/aeroelastic/functional';
import { getClipboardData, setClipboardData } from '../../lib/clipboard';
import { notify } from '../../lib/notify';
import * as customElementService from '../../lib/custom_element_service';
import { selectElement } from './../../state/actions/transient';
import { SidebarHeader as Component } from './sidebar_header';

/*
 * TODO: this is all copied from workpad_page and workpad_shortcuts, needs refactoring
 */
const mapStateToProps = state => {
  const selectedPage = getSelectedPage(state);
  return {
    selectedPage,
    selectedElement: getSelectedElement(state),
    elements: getNodes(state, selectedPage),
  };
};

const mapDispatchToProps = dispatch => ({
  elementLayer: (pageId, selectedElement, movement) => {
    dispatch(
      elementLayer({
        pageId,
        elementId: selectedElement.id,
        movement,
      })
    );
  },
  selectElement: selectedElement => dispatch(selectElement(selectedElement)),
  insertNodes: pageId => selectedElements => dispatch(insertNodes(selectedElements, pageId)),
  removeElements: pageId => elementIds => dispatch(removeElements(elementIds, pageId)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    groupIsSelected: false, // determine if selected elements is a group or not
  };
};

const layoutProps = ({ forceUpdate, selectedPage, elements: pageElements }) => {
  const { shapes, selectedPrimaryShapes = [], cursor } = aeroelastic.getStore(
    selectedPage
  ).currentScene;
  const elementLookup = new Map(pageElements.map(element => [element.id, element]));
  const recurseGroupTree = shapeId => {
    return [
      shapeId,
      ...flatten(
        shapes
          .filter(s => s.parent === shapeId && s.type !== 'annotation')
          .map(s => s.id)
          .map(recurseGroupTree)
      ),
    ];
  };

  const selectedPrimaryShapeObjects = selectedPrimaryShapes
    .map(id => shapes.find(s => s.id === id))
    .filter(shape => shape);

  const selectedPersistentPrimaryShapes = flatten(
    selectedPrimaryShapeObjects.map(shape =>
      shape.subtype === 'adHocGroup'
        ? shapes.filter(s => s.parent === shape.id && s.type !== 'annotation').map(s => s.id)
        : [shape.id]
    )
  );
  const selectedElementIds = flatten(selectedPersistentPrimaryShapes.map(recurseGroupTree));
  const selectedElements = [];
  const elements = shapes.map(shape => {
    let element = null;
    if (elementLookup.has(shape.id)) {
      element = elementLookup.get(shape.id);
      if (selectedElementIds.indexOf(shape.id) > -1) {
        selectedElements.push({ ...element, id: shape.id });
      }
    }
    // instead of just combining `element` with `shape`, we make property transfer explicit
    return element ? { ...shape, filter: element.filter } : shape;
  });
  return {
    elements,
    cursor,
    selectedElementIds,
    selectedElements,
    selectedPrimaryShapes,
    commit: (...args) => {
      aeroelastic.commit(selectedPage, ...args);
      forceUpdate();
    },
  };
};

const elementHandlers = {
  duplicateElement: ({
    insertNodes,
    selectedPage,
    selectElement,
    selectedElements,
    selectedPrimaryShapes,
  }) => () => {
    const clonedElements = selectedElements && cloneSubgraphs(selectedElements);

    if (clonedElements) {
      insertNodes(selectedPage)(clonedElements);
      if (selectedPrimaryShapes.length) {
        if (selectedElements.length > 1) {
          // adHocGroup branch (currently, pasting will leave only the 1st element selected, rather than forming a
          // new adHocGroup - todo)
          selectElement(clonedElements[0].id);
        } else {
          // single element or single persistentGroup branch
          selectElement(
            clonedElements[selectedElements.findIndex(s => s.id === selectedPrimaryShapes[0])].id
          );
        }
      }
    }
  },
  removeElements: ({ selectedPage, removeElements, selectedElementIds }) => () => {
    // currently, handle the removal of one element, exploiting multiselect subsequently
    if (selectedElementIds.length) {
      removeElements(selectedPage)(selectedElementIds);
    }
  },
  saveCustomElement: ({ selectedElements, selectedPrimaryShapes }) => (name = '', help) => {
    if (selectedElements.length) {
      const content = JSON.stringify({ selectedElements, rootShapes: selectedPrimaryShapes });
      const customElement = {
        name: name
          .toLowerCase()
          .split(' ')
          .join('-'),
        displayName: name,
        help,
        image: 'image-preview', // TODO: store a snapshot of the rendered element (how?...)
        content,
      };
      customElementService
        .create(customElement)
        .then(() =>
          notify.success(`Custom element '${customElement.name || customElement.id}' was saved`)
        )
        .catch(result =>
          notify.warning(result, {
            title: `Custom element '${customElement.name || customElement.id}' was not saved`,
          })
        );
    }
  },
};

const clipboardHandlers = {
  copyElements: ({ selectedElements, selectedPrimaryShapes }) => () => {
    if (selectedElements.length) {
      setClipboardData({ selectedElements, rootShapes: selectedPrimaryShapes });
      notify.success('Copied element to clipboard');
    }
  },
  cutElements: ({
    selectedPage,
    removeElements,
    selectedElements,
    selectedElementIds,
    selectedPrimaryShapes,
  }) => () => {
    if (selectedElements.length) {
      setClipboardData({ selectedElements, rootShapes: selectedPrimaryShapes });
      removeElements(selectedPage)(selectedElementIds);
      notify.success('Copied element to clipboard');
    }
  },
  pasteElements: ({ insertNodes, selectedPage, selectElement }) => () => {
    const { selectedElements, rootShapes } = JSON.parse(getClipboardData()) || {
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
          selectElement(clonedElements[selectedElements.findIndex(s => s.id === rootShapes[0])].id);
        }
      }
    }
  },
};

const groupHandlers = {
  groupElements: ({ commit }) => () =>
    commit('actionEvent', {
      event: 'group',
    }),
  ungroupElements: ({ commit }) => () =>
    commit('actionEvent', {
      event: 'ungroup',
    }),
};

const layerHandlers = {
  bringToFront: ({ elementLayer, selectedPage, selectedElements }) => () => {
    if (selectedElements.length === 1) {
      elementLayer(selectedPage, selectedElements[0], Infinity);
    }
  },
  bringForward: ({ elementLayer, selectedPage, selectedElements }) => () => {
    if (selectedElements.length === 1) {
      elementLayer(selectedPage, selectedElements[0], 1);
    }
  },
  sendBackward: ({ elementLayer, selectedPage, selectedElements }) => () => {
    if (selectedElements.length === 1) {
      elementLayer(selectedPage, selectedElements[0], -1);
    }
  },
  sendToBack: ({ elementLayer, selectedPage, selectedElements }) => () => {
    if (selectedElements.length === 1) {
      elementLayer(selectedPage, selectedElements[0], -Infinity);
    }
  },
};

export const SidebarHeader = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  ),
  withState('_forceUpdate', 'forceUpdate'), // TODO: phase out this solution
  withProps(layoutProps),
  withHandlers(elementHandlers),
  withHandlers(clipboardHandlers),
  withHandlers(groupHandlers),
  withHandlers(layerHandlers)
)(Component);
