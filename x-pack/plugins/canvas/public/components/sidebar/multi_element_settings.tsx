/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, FunctionComponent } from 'react';
import { EuiText, EuiSpacer } from '@elastic/eui';
// @ts-ignore
import { SidebarHeader } from '../sidebar_header/';

export const MultiElementSettings: FunctionComponent = () => (
  <Fragment>
    <SidebarHeader title="Multiple elements" showLayerControls={false} />
    <EuiSpacer />
    <EuiText>
      <p>Multiple elements are selected.</p>
    </EuiText>
    <EuiSpacer />
    <EuiText>
      <p>
        Deselect these elements to edit their settings or press (G) to group them. Grouped elements
        can be saved as a new, reusable element.
      </p>
    </EuiText>
  </Fragment>
);
