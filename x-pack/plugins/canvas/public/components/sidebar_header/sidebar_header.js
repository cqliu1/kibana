/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent, Fragment } from 'react';
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
import { CustomElementModal } from './custom_element_modal';

const contextMenuButton = handleClick => (
  <EuiButtonIcon
    color="text"
    iconType="boxesVertical"
    onClick={handleClick}
    aria-label="Move element to top layer"
  />
);

export class SidebarHeader extends PureComponent {
  state = {
    isModalVisible: false,
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  showModal = () => this._isMounted && this.setState({ isModalVisible: true });
  closeModal = () => this._isMounted && this.setState({ isModalVisible: false });

  render() {
    const {
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
    } = this.props;

    const topBorderClassName = 'canvasContextMenu--topBorder';

    const groupMenuItem = groupIsSelected
      ? {
          name: 'Ungroup',
          className: topBorderClassName,
          onClick: () => {
            ungroupElements();
          },
        }
      : {
          name: 'Group',
          className: topBorderClassName,
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
          name: 'Cut',
          icon: 'empty', // TODO: need a cut icon
          onClick: () => {
            closePopover();
            cutElements();
          },
        },
        {
          name: 'Copy',
          icon: 'copy',
          onClick: () => {
            copyElements();
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
          name: 'Clone',
          onClick: () => {
            closePopover();
            duplicateElement();
          },
        },
        groupMenuItem,
        // TODO: how do we add a <hr> between EUI context menu items in this panel tree?
        {
          name: 'Order',
          panel: {
            id: 1,
            title: 'Order',
            items: [
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
            ],
          },
        },
        {
          name: 'Save as custom element',
          icon: 'save',
          className: topBorderClassName,
          onClick: () => {
            this.showModal();
          },
        },
      ],
    });

    const contextMenu = (
      <Popover
        id="sidebar-context-menu-popover"
        className="canvasContextMenu"
        button={contextMenuButton}
        panelPaddingSize="none"
        tooltip="Element options" // TODO: what should this tooltip say?
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
      <Fragment>
        <EuiFlexGroup gutterSize="none" alignItems="center" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>Selected layer</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="none">
              <EuiFlexItem grow={false}>
                <EuiToolTip position="bottom" content="Save as custom element">
                  <EuiButtonIcon
                    color="text"
                    iconType="save"
                    onClick={this.showModal}
                    aria-label="Save as custom element"
                  />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{contextMenu}</EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip position="bottom" content="Move element to top layer">
                  <EuiButtonIcon
                    color="text"
                    iconType="sortUp"
                    onClick={() => bringToFront()}
                    aria-label="Move element to top layer"
                  />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip position="bottom" content="Move element up one layer">
                  <EuiButtonIcon
                    color="text"
                    iconType="arrowUp"
                    onClick={() => bringForward()}
                    aria-label="Move element up one layer"
                  />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip position="bottom" content="Move element down one layer">
                  <EuiButtonIcon
                    color="text"
                    iconType="arrowDown"
                    onClick={() => sendBackward()}
                    aria-label="Move element down one layer"
                  />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip position="bottom" content="Move element to bottom layer">
                  <EuiButtonIcon
                    color="text"
                    iconType="sortDown"
                    onClick={() => sendToBack()}
                    aria-label="Move element to bottom layer"
                  />
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        {this.state.isModalVisible && (
          <CustomElementModal onSave={saveCustomElement} onClose={this.closeModal} />
        )}
      </Fragment>
    );
  }
}

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
