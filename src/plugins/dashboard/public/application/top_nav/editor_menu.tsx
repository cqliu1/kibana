/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useCallback } from 'react';
import { EuiContextMenu, EuiContextMenuPanelItemDescriptor } from '@elastic/eui';
import { METRIC_TYPE } from '@kbn/analytics';
import { i18n } from '@kbn/i18n';
import { IconType } from '@elastic/eui/src/components/icon/icon';
import { EuiContextMenuItemIcon } from '@elastic/eui/src/components/context_menu/context_menu_item';
import { SolutionToolbarPopover } from '../../../../presentation_util/public';
import { EmbeddableFactoryDefinition, EmbeddableInput } from '../../services/embeddable';
import { BaseVisType, VisGroups, VisTypeAlias } from '../../../../visualizations/public';
import { useKibana } from '../../services/kibana_react';
import { DashboardAppServices } from '../types';
import { DashboardContainer } from '..';
import { DashboardConstants } from '../../dashboard_constants';

interface Props {
  /** Dashboard container */
  dashboardContainer: DashboardContainer;
  /** Handler for creating new visualization of a specified type */
  createNewVisType: (visType: BaseVisType | VisTypeAlias) => () => void;
}

interface FactoryGroup {
  id: string;
  appName: string;
  icon: IconType;
  panelId: number;
  factories: EmbeddableFactoryDefinition[];
}

export const EditorMenu = ({ dashboardContainer, createNewVisType }: Props) => {
  const {
    embeddable,
    visualizations,
    usageCollection,
  } = useKibana<DashboardAppServices>().services;

  const trackUiMetric = usageCollection?.reportUiCounter.bind(
    usageCollection,
    DashboardConstants.DASHBOARDS_ID
  );

  const createNewAggsBasedVis = useCallback(
    async () =>
      visualizations.showNewVisModal({
        originatingApp: DashboardConstants.DASHBOARDS_ID,
        outsideVisualizeApp: true,
        showAggsSelection: true,
      }),
    [visualizations]
  );

  const getVisTypesByGroup = (group: VisGroups) =>
    visualizations
      .getByGroup(group)
      .sort(({ name: a }: BaseVisType | VisTypeAlias, { name: b }: BaseVisType | VisTypeAlias) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      })
      .filter(({ hidden }: BaseVisType) => !hidden);

  const promotedVisTypes = getVisTypesByGroup(VisGroups.PROMOTED);
  const visTypeAliases = visualizations
    .getAliases()
    .sort(({ promotion: a = false }: VisTypeAlias, { promotion: b = false }: VisTypeAlias) =>
      a === b ? 0 : a ? -1 : 1
    );

  const factories = embeddable
    ? Array.from(embeddable.getEmbeddableFactories()).filter(
        ({ type, isEditable, canCreateNew, isContainerType }) =>
          isEditable() && !isContainerType && canCreateNew() && type !== 'visualization'
      )
    : [];

  const factoryGroupMap: Record<string, FactoryGroup> = {};
  const ungroupedFactories: EmbeddableFactoryDefinition[] = [];
  let panelCount = 1;

  factories.forEach((factory: EmbeddableFactoryDefinition, index) => {
    const { grouping } = factory;

    if (grouping) {
      grouping.forEach((group) => {
        if (factoryGroupMap[group.id]) {
          factoryGroupMap[group.id].factories.push(factory);
        } else {
          factoryGroupMap[group.id] = {
            id: group.id,
            appName: group.getDisplayName ? group.getDisplayName({ embeddable }) : group.id,
            icon: (group.getIconType ? group.getIconType({ embeddable }) : 'empty') as IconType,
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
    const { name, title, titleInWizard, description, icon = 'empty' } = visType;

    return {
      name: titleInWizard || title,
      icon: icon as string,
      onClick: createNewVisType(visType),
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
  ): EuiContextMenuPanelItemDescriptor => ({
    name: factory.getDisplayName(),
    icon: 'empty',
    onClick: async () => {
      if (trackUiMetric) {
        trackUiMetric(METRIC_TYPE.CLICK, factory.type);
      }
      if (factory.getExplicitInput) {
        const explicitInput = await factory.getExplicitInput();
        await dashboardContainer.addNewEmbeddable(factory.type, explicitInput);
      } else {
        await factory.create({} as EmbeddableInput, dashboardContainer);
      }
    },
    'data-test-subj': `createNew-${factory.type}`,
  });

  const editorMenuPanels = [
    {
      id: 0,
      items: [
        ...visTypeAliases.map(getVisTypeAliasMenuItem),
        ...Object.values(factoryGroupMap).map(({ id, appName, icon, panelId }) => ({
          name: appName,
          icon: icon as EuiContextMenuItemIcon,
          panel: panelId,
          'data-test-subj': `dashboardEditor-${id}Group`,
        })),
        ...ungroupedFactories.map(getEmbeddableFactoryMenuItem),
        ...promotedVisTypes.map(getVisTypeMenuItem),
        {
          name: i18n.translate('dashboard.editorMenu.aggBasedGroupTitle', {
            defaultMessage: 'Aggregation based',
          }),
          icon: 'visualizeApp',
          onClick: createNewAggsBasedVis,
          'data-test-subj': `dashboardEditorAggBasedMenuItem`,
        },
      ],
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
        defaultMessage: 'All editors',
      })}
      iconType="visualizeApp"
      panelPaddingSize="none"
      data-test-subj="dashboardEditorMenuButton"
    >
      <EuiContextMenu
        initialPanelId={0}
        panels={editorMenuPanels}
        data-test-subj="dashboardEditorContextMenu"
      />
    </SolutionToolbarPopover>
  );
};
