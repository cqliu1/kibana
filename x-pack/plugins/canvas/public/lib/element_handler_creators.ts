/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Http2ServerResponse } from 'http2';
import { camelCase } from 'lodash';
// @ts-ignore
import { getClipboardData, setClipboardData } from './clipboard';
// @ts-ignore
import { cloneSubgraphs } from './clone_subgraphs';
// @ts-ignore
import { notify } from './notify';
// @ts-ignore
import * as customElementService from './custom_element_service';
// @ts-ignore
import { getId } from './get_id';

const extractId = (node: { id: string }): string => node.id;

interface Element {
  /**
   * a Canvas element used to populate config forms
   */
  id: string;
  /**
   * layout engine settings
   */
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    parent: number | null;
  };
  /**
   * Canvas expression used to generate the element
   */
  expression: string;
  /**
   * AST of the Canvas expression for the element
   */
  ast: any;
}

export interface Props {
  /**
   * ID of the active page
   */
  pageId: string;
  /**
   * array of selected Element objects
   */
  selectedNodes: Element[];
  /**
   * adds elements to the page
   */
  insertNodes: (pageId: string, elements: Element[]) => void;
  /**
   * changes the layer position of an element
   */
  elementLayer: (pageId: string, elementId: string, movement: number) => void;
  /**
   * selects elements on the page
   */
  selectToplevelNodes: (elements: Element) => void;
  /**
   * deletes elements from the page
   */
  removeNodes: (pageId: string, elementIds: string[]) => void;
  /**
   * commits events to layout engine
   */
  commit: (eventType: string, config: { event: string }) => void;
}

// handlers for clone and delete
export const basicHandlerCreators = {
  cloneNodes: ({ insertNodes, pageId, selectToplevelNodes, selectedNodes }: Props) => (): void => {
    // TODO: This is slightly different from the duplicateNodes function in sidebar/index.js. Should they be doing the same thing?
    // This should also be abstracted.
    const clonedNodes = selectedNodes && cloneSubgraphs(selectedNodes);
    if (clonedNodes) {
      insertNodes(pageId, clonedNodes);
      selectToplevelNodes(clonedNodes);
    }
  },
  deleteNodes: ({ pageId, removeNodes, selectedNodes }: Props) => (): void => {
    // currently, handle the removal of one node, exploiting multiselect subsequently
    if (selectedNodes.length) {
      removeNodes(pageId, selectedNodes.map(extractId));
    }
  },
  createCustomElement: ({ selectedNodes }: Props) => (
    name = '',
    description = '',
    image = ''
  ): void => {
    if (selectedNodes.length) {
      const content = JSON.stringify({ selectedNodes });
      const customElement = {
        id: getId('custom-element'),
        name: camelCase(name),
        displayName: name,
        help: description,
        image, // TODO: store a snapshot of the rendered element (how?...)
        content,
      };
      customElementService
        .create(customElement)
        .then(() =>
          notify.success(
            `Custom element '${customElement.displayName || customElement.id}' was saved`
          )
        )
        .catch((result: Http2ServerResponse) =>
          notify.warning(result, {
            title: `Custom element '${customElement.displayName ||
              customElement.id}' was not saved`,
          })
        );
    }
  },
};

// handlers for group and ungroup
export const groupHandlerCreators = {
  groupNodes: ({ commit }: Props): any => (): void => {
    commit('actionEvent', { event: 'group' });
  },
  ungroupNodes: ({ commit }: Props): any => (): void => {
    commit('actionEvent', { event: 'ungroup' });
  },
};

// handlers for cut/copy/paste
export const clipboardHandlerCreators = {
  cutNodes: ({ pageId, removeNodes, selectedNodes }: Props) => (): void => {
    if (selectedNodes.length) {
      setClipboardData({ selectedNodes });
      removeNodes(pageId, selectedNodes.map(extractId));
      notify.success('Cut element to clipboard');
    }
  },
  copyNodes: ({ selectedNodes }: Props): any => (): void => {
    if (selectedNodes.length) {
      setClipboardData({ selectedNodes });
      notify.success('Copied element to clipboard');
    }
  },
  pasteNodes: ({ insertNodes, pageId, selectToplevelNodes }: Props) => (): void => {
    const { selectedNodes = [] } = JSON.parse(getClipboardData()) || {};
    const clonedNodes = selectedNodes && cloneSubgraphs(selectedNodes);
    if (clonedNodes) {
      insertNodes(pageId, clonedNodes); // first clone and persist the new node(s)
      selectToplevelNodes(clonedNodes); // then select the cloned node(s)
    }
  },
};

// handlers for changing element layer position
// TODO: support relayering multiple elements
export const layerHandlerCreators = {
  bringToFront: ({ elementLayer, pageId, selectedNodes }: Props) => (): void => {
    if (selectedNodes.length === 1) {
      elementLayer(pageId, selectedNodes[0].id, Infinity);
    }
  },
  bringForward: ({ elementLayer, pageId, selectedNodes }: Props) => (): void => {
    if (selectedNodes.length === 1) {
      elementLayer(pageId, selectedNodes[0].id, 1);
    }
  },
  sendBackward: ({ elementLayer, pageId, selectedNodes }: Props) => (): void => {
    if (selectedNodes.length === 1) {
      elementLayer(pageId, selectedNodes[0].id, -1);
    }
  },
  sendToBack: ({ elementLayer, pageId, selectedNodes }: Props) => (): void => {
    if (selectedNodes.length === 1) {
      elementLayer(pageId, selectedNodes[0].id, -Infinity);
    }
  },
};
