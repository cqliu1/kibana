/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import isEqual from 'react-fast-compare';
import PropTypes from 'prop-types';
import { EuiTabbedContent } from '@elastic/eui';
// @ts-expect-error unconverted component
import { Datasource } from '../../datasource';
// @ts-expect-error unconverted component
import { FunctionFormList } from '../../function_form_list';
import { PositionedElement } from '../../../../types';
import { ComponentStrings } from '../../../../i18n';

interface Props {
  /**
   * a Canvas element used to populate config forms
   */
  element: PositionedElement;
}

const { ElementSettings: strings } = ComponentStrings;

export const ElementSettings: FunctionComponent<Props> = ({ element }) => {
  const tabs = [
    {
      id: 'edit',
      name: strings.getDisplayTabLabel(),
      content: (
        <div className="canvasSidebar__pop">
          <div className="canvasSidebar--args">
            <FunctionFormList element={element} />
          </div>
        </div>
      ),
    },
    {
      id: 'data',
      name: strings.getDataTabLabel(),
      content: (
        <div className="canvasSidebar__pop">
          <Datasource />
        </div>
      ),
    },
  ];
  return <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} size="s" />;
};
