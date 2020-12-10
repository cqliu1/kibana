/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import './panel_toolbar.scss';
import React, { FC, useState } from 'react';
import {
  EuiButton,
  EuiButtonGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiContextMenu,
  IconType,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui';
import { EmbeddableStart, IContainer, EmbeddableInput } from '../../../../embeddable/public';
import { ComponentStrings } from '../../i18n/components';

const { PanelToolbar: strings } = ComponentStrings;
interface Props {
  /** The label for the primary action button */
  primaryActionButton: JSX.Element;
  /** Array of buttons for quick actions */
  quickButtons?: QuickButtons[];
  /** Handler for the Add from Library button */
  onLibraryClick: () => void;
  /** The Embeddable Container where embeddables should be added */
  container?: IContainer;
  /** Embeddable service */
  embeddable?: EmbeddableStart;
}

interface QuickButtons {
  iconType: IconType;
  tooltip: string;
  action: () => void;
}

export const PanelToolbar: FC<Props> = ({
  primaryActionButton,
  quickButtons = [],
  container,
  embeddable,
  onLibraryClick,
}) => {
  const [isEditorMenuOpen, setEditorMenuOpen] = useState(false);
  const toggleEditorMenu = () => setEditorMenuOpen(!isEditorMenuOpen);
  const closeEditorMenu = () => setEditorMenuOpen(false);

  const factories = embeddable
    ? Array.from(embeddable.getEmbeddableFactories()).filter(
        ({ isEditable, canCreateNew, isContainerType }) =>
          isEditable() && !isContainerType && canCreateNew()
      )
    : [];

  const panels = [
    {
      id: 0,
      items: [
        ...factories.map((factory) => {
          const onClick = async () => {
            await factory.create({} as EmbeddableInput, container);
          };

          return {
            name: factory.getDisplayName(),
            icon: 'empty',
            onClick,
          };
        }),
      ],
    },
  ];

  const editorMenuButton = (
    <EuiButton
      size="s"
      color="text"
      className="panelToolbarButton"
      iconType="visualizeApp"
      onClick={toggleEditorMenu}
    >
      {strings.getEditorMenuButtonLabel()}
    </EuiButton>
  );

  const buttonGroupOptions = quickButtons.map(
    ({ iconType, tooltip, action }: QuickButtons, index) => ({
      iconType,
      action,
      id: `${htmlIdGenerator()()}${index}`,
      label: tooltip,
      'aria-label': `Create new ${tooltip}`,
    })
  );

  const onChangeIconsMulti = (optionId: string) => {
    buttonGroupOptions.find((x) => x.id === optionId)?.action();
  };

  return (
    <EuiFlexGroup className="panelToolbar" id="kbnPresentationToolbar__panelToolbar" gutterSize="s">
      <EuiFlexItem grow={false}>{primaryActionButton}</EuiFlexItem>
      {quickButtons.length ? (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="none">
            <EuiButtonGroup
              className="panelToolbar__quickButtonGroup"
              legend="Quick buttons"
              options={buttonGroupOptions}
              onChange={onChangeIconsMulti}
              type="multi"
              isIconOnly
            />
          </EuiFlexGroup>
        </EuiFlexItem>
      ) : null}
      {factories.length ? (
        <EuiFlexItem grow={false}>
          <EuiPopover
            ownFocus
            button={editorMenuButton}
            isOpen={isEditorMenuOpen}
            closePopover={closeEditorMenu}
            panelPaddingSize="none"
            anchorPosition="downLeft"
          >
            <EuiContextMenu initialPanelId={0} panels={panels} />
          </EuiPopover>
        </EuiFlexItem>
      ) : null}
      <EuiFlexItem grow={false}>
        <EuiButton
          size="s"
          color="text"
          className="panelToolbarButton"
          iconType="folderOpen"
          onClick={onLibraryClick}
        >
          {strings.getLibraryButtonLabel()}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
