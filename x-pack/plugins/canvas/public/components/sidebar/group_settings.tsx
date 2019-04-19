/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, FunctionComponent } from 'react';
import { EuiText, EuiSpacer } from '@elastic/eui';
// @ts-ignore
import { SidebarHeader } from '../sidebar_header/';

export const GroupSettings: FunctionComponent = () => (
  <Fragment>
    <SidebarHeader title="Grouped element" groupIsSelected showLayerControls={false} />
    <EuiSpacer />
    <EuiText>
      <p>Ungroup (U) these layers to edit their individual settings</p>
    </EuiText>
  </Fragment>
);
