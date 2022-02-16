/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useCallback, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

import { useReduxEmbeddableContext } from '../../../../presentation_util/public';
import { useStateObservable } from '../../hooks/use_state_observable';
import { ceilWithPrecision, floorWithPrecision } from './lib/round_with_precision';
import { RangeSliderPopover } from './range_slider_popover';
import { rangeSliderReducers } from './range_slider_reducers';
import { RangeSliderEmbeddableInput, RangeValue } from './types';

import './range_slider.scss';

interface Props {
  componentStateSubject: BehaviorSubject<RangeSliderComponentState>;
}
// Availableoptions and loading state is controled by the embeddable, but is not considered embeddable input.
export interface RangeSliderComponentState {
  min?: number;
  max?: number;
  loading: boolean;
}

export const RangeSliderComponent: FC<Props> = ({ componentStateSubject }) => {
  // Redux embeddable Context to get state from Embeddable input
  const {
    useEmbeddableSelector,
    actions: { selectRange },
  } = useReduxEmbeddableContext<RangeSliderEmbeddableInput, typeof rangeSliderReducers>();
  const { value, decimalPlaces = 0, id, step, title } = useEmbeddableSelector((state) => state);

  const [selectedValue, setSelectedValue] = useState<RangeValue>(value);

  // useStateObservable to get component state from Embeddable
  const { loading, min, max } = useStateObservable<RangeSliderComponentState>(
    componentStateSubject,
    componentStateSubject.getValue()
  );

  const onChangeComplete = useCallback(
    (range: RangeValue) => {
      selectRange(range);
      setSelectedValue(range);
    },
    [selectRange, setSelectedValue]
  );

  const roundedMin = floorWithPrecision(min || Number(value[0]), decimalPlaces);
  const roundedMax = ceilWithPrecision(max || Number(value[1]), decimalPlaces);

  return (
    <RangeSliderPopover
      id={id}
      isLoading={loading}
      min={roundedMin}
      max={roundedMax}
      step={step}
      title={title}
      value={selectedValue}
      onChange={onChangeComplete}
    />
  );
};
