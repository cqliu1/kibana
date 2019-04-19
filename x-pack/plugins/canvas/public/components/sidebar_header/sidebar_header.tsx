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
// @ts-ignore
import { flattenPanelTree } from '../../lib/flatten_panel_tree';
// @ts-ignore
import { Popover } from '../popover';
import { CustomElementModal } from './custom_element_modal';

const topBorderClassName = 'canvasContextMenu--topBorder';

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

  private _renderLayoutControls = () => {
    const { bringToFront, bringForward, sendBackward, sendToBack } = this.props;
    return (
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
    );
  };

  private _getLayerMenuItems = () => {
    const { bringToFront, bringForward, sendBackward, sendToBack } = this.props;

    return {
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
  };

  // TODO: restore when group and ungroup can be triggered outside of workpad_page
  // private _getGroupMenuItem = () => {
  //   const { groupIsSelected, ungroupNodes, groupNodes } = this.props;
  //   return groupIsSelected
  //     ? {
  //         name: 'Ungroup',
  //         className: topBorderClassName,
  //         onClick: () => {
  //           ungroupNodes();
  //         },
  //       }
  //     : {
  //         name: 'Group',
  //         className: topBorderClassName,
  //         onClick: () => {
  //           groupNodes();
  //         },
  //       };
  // };

  private _renderPanelTree = (closePopover: () => void) => {
    const {
      showLayerControls,
      cutNodes,
      copyNodes,
      pasteNodes,
      deleteNodes,
      cloneNodes,
    } = this.props;

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
      // this._getGroupMenuItem(),
    ];

    if (showLayerControls) {
      // @ts-ignore - this is the right shape of an EUI panel tree
      items.push(this._getLayerMenuItems());
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

  private _renderContextMenu = () => (
    <Popover
      id="sidebar-context-menu-popover"
      className="canvasContextMenu"
      button={contextMenuButton}
      panelPaddingSize="none"
      tooltip="Element options"
      tooltipPosition="bottom"
    >
      {({ closePopover }: { closePopover: () => void }) => (
        <EuiContextMenu
          initialPanelId={0}
          panels={flattenPanelTree(this._renderPanelTree(closePopover))}
        />
      )}
    </Popover>
  );

  render() {
    const { title, showLayerControls, createCustomElement } = this.props;

    return (
      <Fragment>
        <EuiFlexGroup
          className="canvasLayout__sidebarHeader"
          gutterSize="none"
          alignItems="center"
          justifyContent="spaceBetween"
        >
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h3>{title}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="none">
              {showLayerControls && this._renderLayoutControls()}
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
              <EuiFlexItem grow={false}>{this._renderContextMenu()}</EuiFlexItem>
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
