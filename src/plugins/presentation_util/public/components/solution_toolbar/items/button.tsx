/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { EuiButton } from '@elastic/eui';
import { EuiButtonPropsForButton } from '@elastic/eui/src/components/button/button';

import './button.scss';

export interface Props extends Pick<EuiButtonPropsForButton, 'onClick' | 'iconType'> {
  label: string;
  primary?: boolean;
}

export const SolutionToolbarButton = ({ label, primary, ...rest }: Props) => (
  <EuiButton
    {...rest}
    size="s"
    color={primary ? 'primary' : 'text'}
    className="solutionToolbarButton"
    fill={primary}
  >
    {label}
  </EuiButton>
);

// required for dynamic import using React.lazy()
// eslint-disable-next-line import/no-default-export
export default SolutionToolbarButton;
