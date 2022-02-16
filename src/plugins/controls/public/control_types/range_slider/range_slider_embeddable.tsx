/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { compareFilters, buildRangeFilter } from '@kbn/es-query';
import React from 'react';
import ReactDOM from 'react-dom';
import { get, isEqual } from 'lodash';
import deepEqual from 'fast-deep-equal';
import { Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, map } from 'rxjs/operators';

import {
  withSuspense,
  LazyReduxEmbeddableWrapper,
  ReduxEmbeddableWrapperPropsWithChildren,
} from '../../../../presentation_util/public';
import { Embeddable, IContainer } from '../../../../embeddable/public';
import { DataView, DataViewField } from '../../../../data_views/public';

import { ControlsDataViewsService } from '../../services/data_views';
import { ControlsDataService } from '../../services/data';
import { ControlInput, ControlOutput } from '../..';
import { pluginServices } from '../../services';

import { RangeSliderComponent, RangeSliderComponentState } from './range_slider.component';
import { rangeSliderReducers } from './range_slider_reducers';
import { RangeSliderStrings } from './range_slider_strings';
import { RangeSliderEmbeddableInput, RANGE_SLIDER_CONTROL } from './types';

const RangeSliderReduxWrapper = withSuspense<
  ReduxEmbeddableWrapperPropsWithChildren<RangeSliderEmbeddableInput>
>(LazyReduxEmbeddableWrapper);

const diffDataFetchProps = (
  current?: RangeSliderDataFetchProps,
  last?: RangeSliderDataFetchProps
) => {
  if (!current || !last) return false;
  const { filters: currentFilters, ...currentWithoutFilters } = current;
  const { filters: lastFilters, ...lastWithoutFilters } = last;
  if (!deepEqual(currentWithoutFilters, lastWithoutFilters)) return false;
  if (!compareFilters(lastFilters ?? [], currentFilters ?? [])) return false;
  return true;
};

interface RangeSliderDataFetchProps {
  fieldName: string;
  dataViewId: string;
  query?: ControlInput['query'];
  filters?: ControlInput['filters'];
}

const fieldMissingError = (fieldName: string) =>
  new Error(`field ${fieldName} not found in index pattern`);

export class RangeSliderEmbeddable extends Embeddable<RangeSliderEmbeddableInput, ControlOutput> {
  public readonly type = RANGE_SLIDER_CONTROL;
  public deferEmbeddableLoad = true;

  private subscriptions: Subscription = new Subscription();
  private node?: HTMLElement;

  // Controls services
  private dataService: ControlsDataService;
  private dataViewsService: ControlsDataViewsService;

  private dataView?: DataView;

  // State to be passed down to component
  private componentState: RangeSliderComponentState;
  private componentStateSubject$ = new BehaviorSubject<RangeSliderComponentState>({
    loading: true,
    min: 0,
    max: 0,
  });

  constructor(input: RangeSliderEmbeddableInput, output: ControlOutput, parent?: IContainer) {
    super(input, output, parent); // get filters for initial output...

    // Destructure controls services
    ({ data: this.dataService, dataViews: this.dataViewsService } = pluginServices.getServices());

    this.componentState = { loading: true, min: 0, max: 0 };
    this.updateComponentState(this.componentState);

    this.initialize();
  }

  private setupSubscriptions = () => {
    const dataFetchPipe = this.getInput$().pipe(
      map((newInput) => ({
        lastReloadRequestTime: newInput.lastReloadRequestTime,
        dataViewId: newInput.dataViewId,
        fieldName: newInput.fieldName,
        timeRange: newInput.timeRange,
        filters: newInput.filters,
        query: newInput.query,
      })),
      distinctUntilChanged(diffDataFetchProps)
    );

    // fetch available options when input changes or when search string has changed
    this.subscriptions.add(dataFetchPipe.subscribe(this.fetchMinMax));

    // build filters when value change
    this.subscriptions.add(
      this.getInput$()
        .pipe(
          debounceTime(400),
          distinctUntilChanged((a, b) => isEqual(a.value, b.value)),
          skip(1) // skip the first input update because initial filters will be built by initialize.
        )
        .subscribe(() => this.buildFilter())
    );
  };

  private getCurrentDataView = async (): Promise<DataView> => {
    const { dataViewId } = this.getInput();
    if (this.dataView && this.dataView.id === dataViewId) return this.dataView;
    this.dataView = await this.dataViewsService.get(dataViewId);
    if (this.dataView === undefined) {
      this.onFatalError(new Error(RangeSliderStrings.errors.getDataViewNotFoundError(dataViewId)));
    }
    this.updateOutput({ dataViews: [this.dataView] });
    return this.dataView;
  };

  private updateComponentState(changes: Partial<RangeSliderComponentState>) {
    this.componentState = {
      ...this.componentState,
      ...changes,
    };
    this.componentStateSubject$.next(this.componentState);
  }

  private minMaxAgg = (field?: DataViewField) => {
    const aggBody: any = {};
    if (field) {
      if (field.scripted) {
        aggBody.script = {
          source: field.script,
          lang: field.lang,
        };
      } else {
        aggBody.field = field.name;
      }
    }

    return {
      maxAgg: {
        max: aggBody,
      },
      minAgg: {
        min: aggBody,
      },
    };
  };

  private fetchMinMax = async () => {
    this.updateComponentState({ loading: true });
    const { ignoreParentSettings, filters, fieldName, query } = this.getInput();
    const dataView = await this.getCurrentDataView();
    const field = dataView.getFieldByName(fieldName);

    if (!field) {
      this.updateComponentState({ loading: false });
      throw fieldMissingError(fieldName);
    }

    const searchSource = await this.dataService.searchSource.create();
    searchSource.setField('size', 0);
    searchSource.setField('index', dataView);

    const aggs = this.minMaxAgg(field);
    searchSource.setField('aggs', aggs);

    searchSource.setField('filter', ignoreParentSettings?.ignoreFilters ? [] : filters || []);
    searchSource.setField('query', ignoreParentSettings?.ignoreQuery ? undefined : query);
    console.log({ ignoreParentSettings });
    console.log({ query, filters });

    const resp = await searchSource.fetch$().toPromise();

    console.log(resp);

    const min = get(resp, 'rawResponse.aggregations.minAgg.value', null);
    const max = get(resp, 'rawResponse.aggregations.maxAgg.value', null);

    this.updateComponentState({ min, max, loading: false });
  };

  private initialize = async () => {
    const initialValue = this.getInput().value;
    if (initialValue) {
      await this.getCurrentDataView();
      await this.buildFilter();
    }
    this.setInitializationFinished();
    this.setupSubscriptions();
  };

  private buildFilter = async () => {
    const {
      fieldName,
      value: [min, max],
    } = this.getInput();
    if (!min || !max) {
      this.updateOutput({ filters: [] });
      return;
    }
    const dataView = await this.getCurrentDataView();
    const field = dataView.getFieldByName(this.getInput().fieldName);

    if (!field) throw fieldMissingError(fieldName);

    const rangeFilter = buildRangeFilter(field, { gte: min, lte: max }, dataView);

    console.log({ rangeFilter });

    rangeFilter.meta.key = field?.name;
    this.updateOutput({ filters: [rangeFilter] });
  };

  reload = () => {
    this.fetchMinMax();
  };

  public destroy = () => {
    super.destroy();
    this.subscriptions.unsubscribe();
  };

  public render = (node: HTMLElement) => {
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node);
    }
    this.node = node;
    ReactDOM.render(
      <RangeSliderReduxWrapper embeddable={this} reducers={rangeSliderReducers}>
        <RangeSliderComponent componentStateSubject={this.componentStateSubject$} />
      </RangeSliderReduxWrapper>,
      node
    );
  };
}
