/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import { EuiSpacer, EuiTabbedContent } from '@elastic/eui';
// @ts-ignore
import { Datasource } from '../../datasource';
// @ts-ignore
import { FunctionFormList } from '../../function_form_list';
import { SidebarHeader } from '../../sidebar_header';

export interface Element {
  /**
   * a Canvas element used to populate config forms
   */
  id: string;
  /**
   * layout engine settings
   */
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    parent: number | null;
  };
  /**
   * Canvas expression used to generate the element
   */
  expression: string;
  /**
   * AST of the Canvas expression for the element
   */
  ast: any;
}

export interface Props {
  /**
   * a Canvas element used to populate config forms
   */
  element: Element;
}
export const ElementSettings: FunctionComponent<Props> = ({ element }) => {
  const tabs = [
    {
      id: 'edit',
      name: 'Display',
      content: (
        <div className="canvasSidebar__pop">
          <EuiSpacer size="s" />
          <div className="canvasSidebar--args">
            <FunctionFormList element={element} />
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
    <Fragment>
      <SidebarHeader title="Selected layer" />
      <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} size="s" />
    </Fragment>
  );
};

ElementSettings.propTypes = {
  element: PropTypes.object,
};
