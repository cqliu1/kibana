/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiHorizontalRule, EuiScreenReaderOnly } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { SolutionPanel } from './solution_panel';
import { FeatureCatalogueEntry, FeatureCatalogueSolution } from '../../../';

const sortByOrder = (
  { order: orderA = 0 }: FeatureCatalogueSolution | FeatureCatalogueEntry,
  { order: orderB = 0 }: FeatureCatalogueSolution | FeatureCatalogueEntry
) => orderA - orderB;

interface Props {
  addBasePath: (path: string) => string;
  solutions: FeatureCatalogueSolution[];
  directories: FeatureCatalogueEntry[];
}

export const SolutionsSection: FC<Props> = ({ addBasePath, solutions, directories }) => {
  // Separate Kibana from other solutions
  const kibana = solutions.find(({ id }) => id === 'kibana');
  const kibanaApps = directories
    .filter(({ solutionId }) => solutionId === 'kibana')
    .sort(sortByOrder);
  solutions = solutions.sort(sortByOrder).filter(({ id }) => id !== 'kibana');

  return (
    <>
      <section aria-labelledby="homSolutions__title" className="homSolutions">
        <EuiScreenReaderOnly>
          <h2 id="homSolutions__title">
            <FormattedMessage
              id="home.solutionsSection.sectionTitle"
              defaultMessage="Pick your solution"
            />
          </h2>
        </EuiScreenReaderOnly>

        <EuiFlexGroup className="homSolutions__content">
          {kibana ? (
            <SolutionPanel
              addBasePath={addBasePath}
              apps={kibanaApps.length ? kibanaApps : undefined}
              solution={kibana}
            />
          ) : null}

          {solutions.length
            ? solutions.map((solution) => (
                <SolutionPanel addBasePath={addBasePath} key={solution.id} solution={solution} />
              ))
            : null}
        </EuiFlexGroup>
      </section>

      <EuiHorizontalRule margin="xxl" />
    </>
  );
};

SolutionsSection.propTypes = {
  addBasePath: PropTypes.func.isRequired,
  directories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      showOnHomePage: PropTypes.bool.isRequired,
      category: PropTypes.string.isRequired,
      order: PropTypes.number,
      solutionId: PropTypes.string,
    })
  ),
  solutions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      description: PropTypes.string,
      appDescriptions: PropTypes.arrayOf(PropTypes.string).isRequired,
      icon: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      order: PropTypes.number,
    })
  ),
};
