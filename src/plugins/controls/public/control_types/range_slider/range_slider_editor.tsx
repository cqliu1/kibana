/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import useMount from 'react-use/lib/useMount';
import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiFieldNumber } from '@elastic/eui';

import { pluginServices } from '../../services';
import { ControlEditorProps } from '../../types';
import { RangeSliderEmbeddableInput } from './types';
import { RangeSliderStrings } from './range_slider_strings';
import { DataViewListItem, DataView } from '../../../../data_views/common';
import {
  LazyDataViewPicker,
  LazyFieldPicker,
  withSuspense,
} from '../../../../presentation_util/public';

interface RangeSliderEditorState {
  dataViewListItems: DataViewListItem[];
  dataView?: DataView;
  fieldName?: string;
  decimalPlaces: number;
  step: number;
}

const FieldPicker = withSuspense(LazyFieldPicker, null);
const DataViewPicker = withSuspense(LazyDataViewPicker, null);

export const RangeSliderEditor = ({
  onChange,
  initialInput,
  setValidState,
  setDefaultTitle,
}: ControlEditorProps<RangeSliderEmbeddableInput>) => {
  // Controls Services Context
  const { dataViews } = pluginServices.getHooks();
  const { getIdsWithTitle, getDefaultId, get } = dataViews.useService();

  const [state, setState] = useState<RangeSliderEditorState>({
    fieldName: initialInput?.fieldName,
    dataViewListItems: [],
    decimalPlaces: initialInput?.decimalPlaces || 0,
    step: initialInput?.step || 1,
  });

  useMount(() => {
    let mounted = true;
    if (state.fieldName) setDefaultTitle(state.fieldName);
    (async () => {
      const dataViewListItems = await getIdsWithTitle();
      const initialId = initialInput?.dataViewId ?? (await getDefaultId());
      let dataView: DataView | undefined;
      if (initialId) {
        onChange({ dataViewId: initialId });
        dataView = await get(initialId);
      }
      if (!mounted) return;
      setState((s) => ({ ...s, dataView, dataViewListItems }));
    })();
    return () => {
      mounted = false;
    };
  });

  useEffect(
    () =>
      setValidState(
        Boolean(state.fieldName) &&
          Boolean(state.dataView) &&
          state.decimalPlaces >= 0 &&
          state.step >= 1
      ),
    [state.fieldName, setValidState, state.dataView, state.decimalPlaces, state.step]
  );

  const { dataView, fieldName } = state;
  return (
    <>
      <EuiFormRow fullWidth label={RangeSliderStrings.editor.getDataViewTitle()}>
        <DataViewPicker
          dataViews={state.dataViewListItems}
          selectedDataViewId={dataView?.id}
          onChangeDataViewId={(dataViewId) => {
            onChange({ dataViewId });
            get(dataViewId).then((newDataView) =>
              setState((s) => ({ ...s, dataView: newDataView }))
            );
          }}
          trigger={{
            label: state.dataView?.title ?? RangeSliderStrings.editor.getNoDataViewTitle(),
          }}
        />
      </EuiFormRow>
      <EuiFormRow fullWidth label={RangeSliderStrings.editor.getFieldTitle()}>
        <FieldPicker
          filterPredicate={(field) => field.aggregatable && field.type === 'number'}
          selectedFieldName={fieldName}
          dataView={dataView}
          onSelectField={(field) => {
            setDefaultTitle(field.displayName ?? field.name);
            onChange({ fieldName: field.name });
            setState((s) => ({ ...s, fieldName: field.name }));
          }}
        />
      </EuiFormRow>
      <EuiFormRow fullWidth label={RangeSliderStrings.editor.getDecimalPlacesTitle()}>
        <EuiFieldNumber
          value={state.decimalPlaces}
          onChange={(event) => {
            const decimalPlaces = event.target.valueAsNumber;
            onChange({ decimalPlaces });
            setState((s) => ({ ...s, decimalPlaces }));
          }}
        />
      </EuiFormRow>
      <EuiFormRow fullWidth label={RangeSliderStrings.editor.getStepTitle()}>
        <EuiFieldNumber
          value={state.step}
          onChange={(event) => {
            const step = event.target.valueAsNumber;
            onChange({ step });
            setState((s) => ({ ...s, step }));
          }}
        />
      </EuiFormRow>
    </>
  );
};
