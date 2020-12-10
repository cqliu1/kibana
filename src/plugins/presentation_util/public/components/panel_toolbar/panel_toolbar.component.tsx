/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import './panel_toolbar.scss';
import React, { FC, useState } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPopover, EuiContextMenu } from '@elastic/eui';
import {
  Embeddable,
  EmbeddableInput,
  ErrorEmbeddable,
  EmbeddableFactory,
} from 'src/plugins/embeddable/public';

interface Props {
  /** The label for the primary action button */
  primaryActionButton: JSX.Element;
  /** Click handler for the library button */
  onLibraryClick: () => void;
  /** Handler for creating new embeddables */
  addNewEmbeddable: (
    type: string,
    explicitInput: Partial<EmbeddableInput>
  ) => Promise<Embeddable | ErrorEmbeddable>;
  /** Array of embeddable factories used to populate the editor menu */
  factories: EmbeddableFactory[];
}

export const PanelToolbar: FC<Props> = ({
  primaryActionButton,
  onLibraryClick,
  addNewEmbeddable,
  factories,
}) => {
  const [isEditorMenuOpen, setEditorMenuOpen] = useState(false);
  const toggleEditorMenu = () => setEditorMenuOpen(!isEditorMenuOpen);
  const closeEditorMenu = () => setEditorMenuOpen(false);

  const editorMenuButtonLabel = i18n.translate('dashboard.panelToolbar.editorMenuButtonLabel', {
    defaultMessage: 'All editors',
  });

  const panels = [
    {
      id: 0,
      title: editorMenuButtonLabel,
      items: [
        ...factories.map((factory) => {
          const onClick = async () => {
            const explicitInput = await factory.getExplicitInput();
            await addNewEmbeddable(factory.type, explicitInput);
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
      {editorMenuButtonLabel}
    </EuiButton>
  );

  return (
    <EuiFlexGroup className="panelToolbar" id="kbnDashboard__panelToolbar" gutterSize="s">
      <EuiFlexItem grow={false}>{primaryActionButton}</EuiFlexItem>
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
      <EuiFlexItem grow={false}>
        <EuiButton
          size="s"
          color="text"
          className="panelToolbarButton"
          iconType="folderOpen"
          onClick={onLibraryClick}
        >
          {i18n.translate('dashboard.panelToolbar.libraryButtonLabel', {
            defaultMessage: 'Add from library',
          })}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
