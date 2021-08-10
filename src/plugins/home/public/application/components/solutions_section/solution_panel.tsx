/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { snakeCase } from 'lodash';
import React, { FC, MouseEvent } from 'react';
import { EuiCard, EuiFlexItem, EuiToken } from '@elastic/eui';
import { METRIC_TYPE } from '@kbn/analytics';
import { FeatureCatalogueEntry, FeatureCatalogueSolution } from '../../../';
import { createAppNavigationHandler } from '../app_navigation_handler';
import { getServices } from '../../kibana_services';
import { PLUGIN_ID } from '../../../../common/constants';

interface Props {
  addBasePath: (path: string) => string;
  solution: FeatureCatalogueSolution;
  apps?: FeatureCatalogueEntry[];
}

export const SolutionPanel: FC<Props> = ({ addBasePath, solution, apps = [] }) => {
  const { trackUiMetric } = getServices();

  const getSolutionGraphicURL = (solutionId: string) =>
    `/plugins/${PLUGIN_ID}/assets/solutions_${solutionId}_2x.png`;

  return (
    <EuiFlexItem
      className="homSolutions__item"
      data-test-subj={`homSolutionPanel homSolutionPanel_${solution.id}`}
    >
      <EuiCard
        className={`homSolutionPanel homSolutionPanel--${solution.id}`}
        description={solution.description}
        href={addBasePath(solution.path)}
        icon={
          <EuiToken
            className="homSolutionPanel__icon"
            iconType={solution.icon}
            shape="circle"
            size="l"
          />
        }
        image={addBasePath(getSolutionGraphicURL(snakeCase(solution.id)))}
        onClick={(event: MouseEvent) => {
          trackUiMetric(METRIC_TYPE.CLICK, `solution_panel_${solution.id}`);
          createAppNavigationHandler(solution.path)(event);
        }}
        title={solution.title}
        titleElement="h3"
      />
    </EuiFlexItem>
  );
};
