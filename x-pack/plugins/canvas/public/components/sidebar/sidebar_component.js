/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiTabbedContent } from '@elastic/eui';
import { Datasource } from '../datasource';
import { FunctionFormList } from '../function_form_list';
import { SidebarHeader } from '../sidebar_header';

export const SidebarComponent = ({ selectedElement }) => {
  const elementIsSelected = Boolean(selectedElement);
  const tabs = [
    {
      id: 'edit',
      name: 'Display',
      content: (
        <div className="canvasSidebar__pop">
          <EuiSpacer size="s" />
          <div className="canvasSidebar--args">
            <FunctionFormList element={selectedElement} />
          </div>
        </div>
      ),
    },
    {
      id: 'data',
      name: 'Data',
      content: (
        <div className="canvasSidebar__pop">
          <EuiSpacer size="s" />
          <Datasource />
        </div>
      ),
    },
  ];

  return (
    <div className="canvasSidebar">
      {elementIsSelected && (
        <Fragment>
          <SidebarHeader />
          <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} size="s" />
        </Fragment>
      )}
    </div>
  );
};

SidebarComponent.propTypes = {
  selectedElement: PropTypes.object,
};
