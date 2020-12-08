/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ComponentType } from 'react';
import { TopNavMenuProps } from 'src/plugins/navigation/public';
import { CanvasServiceFactory } from '.';

export interface NavigationService {
  ui: { TopNavMenu: ComponentType<TopNavMenuProps> };
}

export const navigationServiceFactory: CanvasServiceFactory<NavigationService> = async (
  _coreSetup,
  _coreStart,
  _setupPlugins,
  startPlugins
) => ({
  ui: {
    TopNavMenu: startPlugins.navigation.ui.TopNavMenu,
  },
});
