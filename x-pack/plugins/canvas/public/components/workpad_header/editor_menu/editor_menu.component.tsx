/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { FC } from 'react';
import {
  EuiContextMenu,
  EuiContextMenuPanelItemDescriptor,
  EuiContextMenuItemIcon,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { EmbeddableFactoryDefinition } from '../../../../../../../src/plugins/embeddable/public';
import {
  BaseVisType,
  VisGroups,
  VisTypeAlias,
} from '../../../../../../../src/plugins/visualizations/public';
import { SolutionToolbarPopover } from '../../../../../../../src/plugins/presentation_util/public';

interface FactoryGroup {
  id: string;
  appName: string;
  icon: EuiContextMenuItemIcon;
  panelId: number;
  factories: EmbeddableFactoryDefinition[];
}

interface Props {
  factories: EmbeddableFactoryDefinition[];
  isDarkThemeEnabled: boolean;
  visTypeAliases: VisTypeAlias[];
  createNewAggsBasedVis: (visType?: BaseVisType) => () => void;
  createNewVisType: (visType?: BaseVisType | VisTypeAlias) => () => void;
  createNewEmbeddable: (factory: EmbeddableFactoryDefinition) => () => void;
  getVisTypesByGroup: (group: VisGroups) => BaseVisType[];
}

export const EditorMenu: FC<Props> = ({
  factories,
  isDarkThemeEnabled,
  visTypeAliases,
  createNewAggsBasedVis,
  createNewVisType,
  createNewEmbeddable,
  getVisTypesByGroup,
}: Props) => {
  const promotedVisTypes = getVisTypesByGroup(VisGroups.PROMOTED);
  const aggsBasedVisTypes = getVisTypesByGroup(VisGroups.AGGBASED);
  const toolVisTypes = getVisTypesByGroup(VisGroups.TOOLS);

  const factoryGroupMap: Record<string, FactoryGroup> = {};
  const ungroupedFactories: EmbeddableFactoryDefinition[] = [];
  const aggBasedPanelID = 1;

  let panelCount = 1 + aggBasedPanelID;

  factories.forEach((factory: EmbeddableFactoryDefinition, index) => {
    const { grouping } = factory;

    if (grouping) {
      grouping.forEach((group) => {
        if (factoryGroupMap[group.id]) {
          factoryGroupMap[group.id].factories.push(factory);
        } else {
          factoryGroupMap[group.id] = {
            id: group.id,
            appName: group.getDisplayName ? group.getDisplayName({}) : group.id,
            icon: (group.getIconType ? group.getIconType({}) : 'empty') as EuiContextMenuItemIcon,
            factories: [factory],
            panelId: panelCount,
          };

          panelCount++;
        }
      });
    } else {
      ungroupedFactories.push(factory);
    }
  });

  const getVisTypeMenuItem = (visType: BaseVisType): EuiContextMenuPanelItemDescriptor => {
    const { name, title, titleInWizard, description, icon = 'empty', group } = visType;
    return {
      name: titleInWizard || title,
      icon: icon as string,
      onClick:
        group === VisGroups.AGGBASED ? createNewAggsBasedVis(visType) : createNewVisType(visType),
      'data-test-subj': `visType-${name}`,
      toolTipContent: description,
    };
  };

  const getVisTypeAliasMenuItem = (
    visTypeAlias: VisTypeAlias
  ): EuiContextMenuPanelItemDescriptor => {
    const { name, title, description, icon = 'empty' } = visTypeAlias;

    return {
      name: title,
      icon,
      onClick: createNewVisType(visTypeAlias),
      'data-test-subj': `visType-${name}`,
      toolTipContent: description,
    };
  };

  const getEmbeddableFactoryMenuItem = (
    factory: EmbeddableFactoryDefinition
  ): EuiContextMenuPanelItemDescriptor => {
    const icon = factory?.getIconType ? factory.getIconType() : 'empty';

    const toolTipContent = factory?.getDescription ? factory.getDescription() : undefined;

    return {
      name: factory.getDisplayName(),
      icon,
      toolTipContent,
      onClick: createNewEmbeddable(factory),
      'data-test-subj': `createNew-${factory.type}`,
    };
  };

  const aggsPanelTitle = i18n.translate('dashboard.editorMenu.aggBasedGroupTitle', {
    defaultMessage: 'Aggregation based',
  });

  const editorMenuPanels = [
    {
      id: 0,
      items: [
        ...visTypeAliases.map(getVisTypeAliasMenuItem),
        ...Object.values(factoryGroupMap).map(({ id, appName, icon, panelId }) => ({
          name: appName,
          icon,
          panel: panelId,
          'data-test-subj': `dashboardEditorMenu-${id}Group`,
        })),
        ...ungroupedFactories.map(getEmbeddableFactoryMenuItem),
        ...promotedVisTypes.map(getVisTypeMenuItem),
        {
          name: aggsPanelTitle,
          icon: 'visualizeApp',
          panel: aggBasedPanelID,
          'data-test-subj': `dashboardEditorAggBasedMenuItem`,
        },
        ...toolVisTypes.map(getVisTypeMenuItem),
      ],
    },
    {
      id: aggBasedPanelID,
      title: aggsPanelTitle,
      items: aggsBasedVisTypes.map(getVisTypeMenuItem),
    },
    ...Object.values(factoryGroupMap).map(
      ({ appName, panelId, factories: groupFactories }: FactoryGroup) => ({
        id: panelId,
        title: appName,
        items: groupFactories.map(getEmbeddableFactoryMenuItem),
      })
    ),
  ];

  return (
    <SolutionToolbarPopover
      ownFocus
      label={i18n.translate('dashboard.solutionToolbar.editorMenuButtonLabel', {
        defaultMessage: 'All types',
      })}
      iconType="arrowDown"
      iconSide="right"
      panelPaddingSize="none"
      data-test-subj="dashboardEditorMenuButton"
    >
      {() => (
        <EuiContextMenu
          initialPanelId={0}
          panels={editorMenuPanels}
          className={`dshSolutionToolbar__editorContextMenu ${
            isDarkThemeEnabled
              ? 'dshSolutionToolbar__editorContextMenu--dark'
              : 'dshSolutionToolbar__editorContextMenu--light'
          }`}
          data-test-subj="dashboardEditorContextMenu"
        />
      )}
    </SolutionToolbarPopover>
  );
};
