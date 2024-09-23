/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { AggregateQuery, Filter, FilterStateStore, Query } from '@kbn/es-query';
import { I18nProvider } from '@kbn/i18n-react';
import { waitForEuiPopoverOpen } from '@elastic/eui/lib/test/rtl';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { FiltersNotificationActionApi } from './filters_notification_action';
import { FiltersNotificationPopover } from './filters_notification_popover';

const getMockPhraseFilter = (key: string, value: string): Filter => {
  return {
    meta: {
      type: 'phrase',
      key,
      params: {
        query: value,
      },
    },
    query: {
      match_phrase: {
        [key]: value,
      },
    },
    $state: {
      store: FilterStateStore.APP_STATE,
    },
  };
};

const mockedEditPanelAction = {
  execute: jest.fn(),
  isCompatible: jest.fn().mockResolvedValue(true),
};
jest.mock('@kbn/presentation-panel-plugin/public', () => ({
  getEditPanelAction: () => mockedEditPanelAction,
}));

describe('filters notification popover', () => {
  let api: FiltersNotificationActionApi;
  let updateFilters: (filters: Filter[]) => void;
  let updateQuery: (query: Query | AggregateQuery | undefined) => void;

  beforeEach(async () => {
    const filtersSubject = new BehaviorSubject<Filter[] | undefined>(undefined);
    updateFilters = (filters) => filtersSubject.next(filters);
    const querySubject = new BehaviorSubject<Query | AggregateQuery | undefined>(undefined);
    updateQuery = (query) => querySubject.next(query);

    api = {
      uuid: 'testId',
      parentApi: {
        getAllDataViews: jest.fn(),
        getDashboardPanelFromId: jest.fn(),
      },
      viewMode: new BehaviorSubject<ViewMode>('edit'),
      filters$: filtersSubject,
      query$: querySubject,
    };
  });

  const renderAndOpenPopover = async () => {
    render(
      <I18nProvider>
        <FiltersNotificationPopover api={api} />
      </I18nProvider>
    );
    await userEvent.click(await screen.findByTestId(`embeddablePanelNotification-${api.uuid}`));
    await waitForEuiPopoverOpen();
  };

  it('renders the filter section when given filters', async () => {
    updateFilters([getMockPhraseFilter('ay', 'oh')]);
    await renderAndOpenPopover();
    expect(await screen.findByTestId('filtersNotificationModal__filterItems')).toBeInTheDocument();
  });

  it('renders the query section when given a query', async () => {
    updateQuery({ esql: 'FROM test_dataview' } as AggregateQuery);
    await renderAndOpenPopover();
    expect(await screen.findByTestId('filtersNotificationModal__query')).toBeInTheDocument();
  });

  it('renders an edit button when the edit panel action is compatible', async () => {
    updateFilters([getMockPhraseFilter('ay', 'oh')]);
    await renderAndOpenPopover();
    expect(await screen.findByTestId('filtersNotificationModal__editButton')).toBeInTheDocument();
  });

  it('does not render an edit button when the query is ESQL', async () => {
    updateFilters([getMockPhraseFilter('ay', 'oh')]);
    updateQuery({ esql: 'FROM test_dataview' } as AggregateQuery);
    updateFilters([getMockPhraseFilter('ay', 'oh')]);
    await renderAndOpenPopover();
    expect(
      await screen.queryByTestId('filtersNotificationModal__editButton')
    ).not.toBeInTheDocument();
  });

  it('calls edit action execute when edit button is clicked', async () => {
    updateFilters([getMockPhraseFilter('ay', 'oh')]);
    await renderAndOpenPopover();
    const editButton = await screen.findByTestId('filtersNotificationModal__editButton');
    await userEvent.click(editButton);
    expect(mockedEditPanelAction.execute).toHaveBeenCalled();
  });
});
