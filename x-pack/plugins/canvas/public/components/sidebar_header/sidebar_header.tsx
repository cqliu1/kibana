/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent, Fragment, MouseEvent } from 'react';
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

export interface Props {
  title: string;
  showLayerControls?: boolean;
  cutNodes: () => void;
  copyNodes: () => void;
  pasteNodes: () => void;
  cloneNodes: () => void;
  deleteNodes: () => void;
  bringToFront: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  sendToBack: () => void;
  createCustomElement: () => void;
  // TODO: restore when group and ungroup can be triggered outside of workpad_page
  // groupIsSelected,
  // groupNodes,
  // ungroupNodes,
}
const contextMenuButton = (handleClick: (event: MouseEvent) => void) => (
  <EuiButtonIcon
    color="text"
    iconType="boxesVertical"
    onClick={handleClick}
    aria-label="Element options"
  />
);

export class SidebarHeader extends PureComponent<Props> {
  public static propTypes = {
    title: PropTypes.string.isRequired,
    showLayerControls: PropTypes.bool, // TODO: remove when we support relayering multiple elements
    cutNodes: PropTypes.func.isRequired,
    copyNodes: PropTypes.func.isRequired,
    pasteNodes: PropTypes.func.isRequired,
    cloneNodes: PropTypes.func.isRequired,
    deleteNodes: PropTypes.func.isRequired,
    bringToFront: PropTypes.func.isRequired,
    bringForward: PropTypes.func.isRequired,
    sendBackward: PropTypes.func.isRequired,
    sendToBack: PropTypes.func.isRequired,
    createCustomElement: PropTypes.func.isRequired,
    // TODO: restore when group and ungroup can be triggered outside of workpad_page
    // groupIsSelected: PropTypes.bool,
    // groupNodes: PropTypes.func.isRequired,
    // ungroupNodes: PropTypes.func.isRequired,
  };

  public static defaultProps = {
    // TODO: restore when group and ungroup can be triggered outside of workpad_page
    // groupIsSelected: false,
    showLayerControls: true,
  };

  public state = {
    isModalVisible: false,
  };

  private _isMounted = false;
  private _showModal = () => this._isMounted && this.setState({ isModalVisible: true });
  private _hideModal = () => this._isMounted && this.setState({ isModalVisible: false });

  public componentDidMount() {
    this._isMounted = true;
  }

  public componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      title,
      showLayerControls,
      cutNodes,
      copyNodes,
      pasteNodes,
      deleteNodes,
      cloneNodes,
      bringToFront,
      bringForward,
      sendBackward,
      sendToBack,
      createCustomElement,
      // TODO: restore when group and ungroup can be triggered outside of workpad_page
      // groupIsSelected,
      // groupNodes,
      // ungroupNodes,
    } = this.props;

    const topBorderClassName = 'canvasContextMenu--topBorder';

    // TODO: restore when group and ungroup can be triggered outside of workpad_page
    // const groupMenuItem = groupIsSelected
    //   ? {
    //       name: 'Ungroup',
    //       className: topBorderClassName,
    //       onClick: () => {
    //         ungroupNodes();
    //       },
    //     }
    //   : {
    //       name: 'Group',
    //       className: topBorderClassName,
    //       onClick: () => {
    //         groupNodes();
    //       },
    //     };

    // TODO: add keyboard shortcuts to each menu item
    const renderPanelTree = (closePopover: () => void) => {
      const items = [
        {
          name: 'Cut',
          icon: 'cut',
          onClick: () => {
            cutNodes();
            closePopover();
          },
        },
        {
          name: 'Copy',
          icon: 'copy',
          onClick: () => copyNodes(),
        },
        {
          name: 'Paste', // TODO: can this be disabled if clipboard is empty?
          icon: 'copyClipboard',
          onClick: () => {
            pasteNodes();
            closePopover();
          },
        },
        {
          name: 'Delete',
          icon: 'trash',
          onClick: () => {
            deleteNodes();
            closePopover();
          },
        },
        {
          name: 'Clone',
          onClick: () => {
            cloneNodes();
            closePopover();
          },
        },
        // TODO: restore when group and ungroup can be triggered outside of workpad_page
        // groupMenuItem,
      ];

      const layerControls = {
        name: 'Order',
        className: topBorderClassName,
        panel: {
          id: 1,
          title: 'Order',
          items: [
            {
              name: 'Bring to front', // TODO: check against current element position and disable if already top layer
              icon: 'sortUp',
              onClick: () => bringToFront(),
            },
            {
              name: 'Bring forward', // TODO: same as above
              icon: 'arrowUp',
              onClick: () => bringForward(),
            },
            {
              name: 'Send backward', // TODO: check against current element position and disable if already bottom layer
              icon: 'arrowDown',
              onClick: () => sendBackward(),
            },
            {
              name: 'Send to back', // TODO: same as above
              icon: 'sortDown',
              onClick: () => sendToBack(),
            },
          ],
        },
      };

      if (showLayerControls) {
        // @ts-ignore - this is the right shape of an EUI panel tree
        items.push(layerControls);
      }

      items.push({
        name: 'Save as new element',
        icon: 'indexOpen',
        // @ts-ignore - this is a valid prop
        className: topBorderClassName,
        onClick: this._showModal,
      });

      return {
        id: 0,
        title: 'Element options',
        items,
      };
    };

    const contextMenu = (
      <Popover
        id="sidebar-context-menu-popover"
        className="canvasContextMenu"
        button={contextMenuButton}
        panelPaddingSize="none"
        tooltip="Element options"
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
              <h3>{title}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="none">
              {showLayerControls && (
                <Fragment>
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="bottom" content="Move element to top layer">
                      <EuiButtonIcon
                        color="text"
                        iconType="sortUp"
                        onClick={bringToFront}
                        aria-label="Move element to top layer"
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="bottom" content="Move element up one layer">
                      <EuiButtonIcon
                        color="text"
                        iconType="arrowUp"
                        onClick={bringForward}
                        aria-label="Move element up one layer"
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="bottom" content="Move element down one layer">
                      <EuiButtonIcon
                        color="text"
                        iconType="arrowDown"
                        onClick={sendBackward}
                        aria-label="Move element down one layer"
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="bottom" content="Move element to bottom layer">
                      <EuiButtonIcon
                        color="text"
                        iconType="sortDown"
                        onClick={sendToBack}
                        aria-label="Move element to bottom layer"
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                </Fragment>
              )}
              <EuiFlexItem grow={false}>
                <EuiToolTip position="bottom" content="Save as new element">
                  <EuiButtonIcon
                    color="text"
                    iconType="indexOpen"
                    onClick={this._showModal}
                    aria-label="Save as new element"
                  />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{contextMenu}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        {this.state.isModalVisible && (
          <CustomElementModal
            title="Create new element"
            onSave={createCustomElement}
            onCancel={this._hideModal}
          />
        )}
      </Fragment>
    );
  }
}
