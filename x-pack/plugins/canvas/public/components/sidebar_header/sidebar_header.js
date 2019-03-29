/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButtonIcon,
  EuiContextMenu,
  EuiToolTip,
} from '@elastic/eui';
import { flattenPanelTree } from '../../lib/flatten_panel_tree';
import { Popover } from '../popover';

const contextMenuButton = handleClick => (
  <EuiButtonIcon
    color="text"
    iconType="boxesVertical"
    onClick={handleClick}
    aria-label="Move element to top layer"
  />
);

export const SidebarHeader = ({
  duplicateElement,
  groupIsSelected,
  groupElements,
  ungroupElements,
  copyElements,
  cutElements,
  pasteElements,
  removeElements,
  bringToFront,
  bringForward,
  sendBackward,
  sendToBack,
  saveCustomElement,
}) => {
  const groupMenuItem = groupIsSelected
    ? {
        name: 'Ungroup',
        icon: 'empty', // TODO: need group icons
        onClick: () => {
          ungroupElements();
        },
      }
    : {
        name: 'Group',
        icon: 'empty', // TODO: need ungroup icons
        onClick: () => {
          groupElements();
        },
      };

  // TODO: add keyboard shortcuts to each menu item
  const renderPanelTree = closePopover => ({
    id: 0,
    title: 'Element options',
    items: [
      {
        name: 'Copy',
        icon: 'copy',
        onClick: () => {
          copyElements();
        },
      },
      {
        name: 'Cut',
        icon: 'empty', // TODO: need a cut icon
        onClick: () => {
          closePopover();
          cutElements();
        },
      },
      {
        name: 'Paste', // TODO: can this be disabled if clipboard is empty?
        icon: 'copyClipboard',
        onClick: () => {
          closePopover();
          pasteElements();
        },
      },
      {
        name: 'Delete',
        icon: 'trash',
        onClick: () => {
          closePopover();
          removeElements();
        },
      },
      {
        name: 'Duplicate',
        icon: 'copy',
        onClick: () => {
          closePopover();
          duplicateElement();
        },
      },
      groupMenuItem,
      {
        name: 'Bring to front', // TODO: check against current element position and disable if already top layer
        icon: 'sortUp',
        onClick: () => {
          bringToFront();
        },
      },
      {
        name: 'Bring forward', // TODO: check against current element position and disable if already top layer
        icon: 'arrowUp',
        onClick: () => {
          bringForward();
        },
      },
      {
        name: 'Send backward', // TODO: check against current element position and disable if already bottom layer
        icon: 'arrowDown',
        onClick: () => {
          sendBackward();
        },
      },
      {
        name: 'Send to back', // TODO: check against current element position and disable if already bottom layer
        icon: 'sortDown',
        onClick: () => {
          sendToBack();
        },
      },
      {
        name: 'Save as custom element',
        icon: 'save',
        onClick: () => {
          saveCustomElement();
        },
      },
    ],
  });

  const contextMenu = (
    <Popover
      id="sidebar-context-menu-popover"
      className="canvasSidebarContextMenu"
      anchorClassName="canvasSidebarContextMenu__anchor" // TODO: remove if we don't actually need this selector
      button={contextMenuButton}
      panelPaddingSize="none"
      tooltip="Element menu" // TODO: what should this tooltip say?
      tooltipPosition="bottom"
    >
      {({ closePopover }) => (
        <EuiContextMenu
          initialPanelId={0}
          panels={flattenPanelTree(renderPanelTree(closePopover))}
        />
      )}
    </Popover>
  );

  return (
    <EuiFlexGroup gutterSize="none" alignItems="center" justifyContent="spaceBetween">
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h3>Selected layer</h3>
        </EuiTitle>
      </EuiFlexItem>
      {/* <EuiFlexItem grow={false}>
        <EuiFlexGroup alignItems="center" gutterSize="none"> */}
      <EuiFlexItem grow={false}>{contextMenu}</EuiFlexItem>
      {/* <EuiFlexItem grow={false}>
            <EuiToolTip position="bottom" content="Move element to top layer">
              <EuiButtonIcon
                color="text"
                iconType="sortUp"
                onClick={() => elementLayer(Infinity)}
                aria-label="Move element to top layer"
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip position="bottom" content="Move element up one layer">
              <EuiButtonIcon
                color="text"
                iconType="arrowUp"
                onClick={() => elementLayer(1)}
                aria-label="Move element up one layer"
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip position="bottom" content="Move element down one layer">
              <EuiButtonIcon
                color="text"
                iconType="arrowDown"
                onClick={() => elementLayer(-1)}
                aria-label="Move element down one layer"
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip position="bottom" content="Move element to bottom layer">
              <EuiButtonIcon
                color="text"
                iconType="sortDown"
                onClick={() => elementLayer(-Infinity)}
                aria-label="Move element to bottom layer"
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip position="bottom" content="Clone the selected element">
              <EuiButtonIcon
                color="text"
                iconType="copy"
                onClick={() => duplicateElement()}
                aria-label="Clone the selected element"
              />
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem> */}
    </EuiFlexGroup>
  );
};

SidebarHeader.propTypes = {
  groupIsSelected: PropTypes.bool.isRequired,
  duplicateElement: PropTypes.func.isRequired,
  groupElements: PropTypes.func.isRequired,
  ungroupElements: PropTypes.func.isRequired,
  copyElements: PropTypes.func.isRequired,
  cutElements: PropTypes.func.isRequired,
  pasteElements: PropTypes.func.isRequired,
  removeElements: PropTypes.func.isRequired,
  bringToFront: PropTypes.func.isRequired,
  bringForward: PropTypes.func.isRequired,
  sendBackward: PropTypes.func.isRequired,
  sendToBack: PropTypes.func.isRequired,
  saveCustomElement: PropTypes.func.isRequired,
};
