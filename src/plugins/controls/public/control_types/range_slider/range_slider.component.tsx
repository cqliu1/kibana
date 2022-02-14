/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiFilterButton, EuiFilterGroup, EuiPopover } from '@elastic/eui';
import React, { FC, useCallback, useState } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';

import { useReduxEmbeddableContext } from '../../../../presentation_util/public';
import { ValidatedDualRange } from '../../../../kibana_react/public';
import { useStateObservable } from '../../hooks/use_state_observable';
import { ceilWithPrecision, floorWithPrecision } from './lib/round_with_precision';
import { RangeSliderPopover } from './range_slider_popover';
import { rangeSliderReducers } from './range_slider_reducers';
import { RangeSliderEmbeddableInput, RangeValue } from './types';

import './range_slider.scss';

interface Props {
  typeaheadSubject: Subject<string>;
  componentStateSubject: BehaviorSubject<RangeSliderComponentState>;
}
// Availableoptions and loading state is controled by the embeddable, but is not considered embeddable input.
export interface RangeSliderComponentState {
  availableOptions?: string[];
  loading: boolean;
}

export const RangeSliderComponent: FC<Props> = ({ typeaheadSubject, componentStateSubject }) => {
  // Redux embeddable Context to get state from Embeddable input
  const { useEmbeddableDispatch, useEmbeddableSelector } = useReduxEmbeddableContext<
    RangeSliderEmbeddableInput,
    typeof rangeSliderReducers
  >();
  const dispatch = useEmbeddableDispatch();
  const {
    min = 0,
    max = 20,
    value,
    showLabels,
    showRange,
    decimalPlaces = 0,
    id,
    step,
  } = useEmbeddableSelector((state) => state);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<RangeValue>(value);

  // useStateObservable to get component state from Embeddable
  const { availableOptions } = useStateObservable<RangeSliderComponentState>(
    componentStateSubject,
    componentStateSubject.getValue()
  );

  const onChangeComplete = useCallback(
    (newValue: RangeValue) => {
      setSelectedValue(newValue);
    },
    [setSelectedValue]
  );

  const button = (
    <EuiFilterButton
      className="rangeSlider__popoverAnchorButton"
      data-test-subj={`range-slider-control-${id}`}
      onClick={() => setIsPopoverOpen((openState) => !openState)}
      isSelected={isPopoverOpen}
    >
      <ValidatedDualRange value={selectedValue} showInput="inputWithPopover" fullWidth readOnly />
    </EuiFilterButton>
  );

  const roundedMin = floorWithPrecision(min, decimalPlaces);
  const roundedMax = ceilWithPrecision(max, decimalPlaces);

  return (
    <EuiFilterGroup className="rangeSlider--filterGroup">
      <EuiPopover
        button={button}
        isOpen={isPopoverOpen}
        className="rangeSlider__popoverOverride"
        anchorClassName="rangeSlider__anchorOverride"
        closePopover={() => setIsPopoverOpen(false)}
        panelPaddingSize="none"
        anchorPosition="downCenter"
        ownFocus
        repositionOnScroll
      >
        <RangeSliderPopover
          id={id}
          value={selectedValue}
          min={roundedMin}
          onChange={onChangeComplete}
          max={roundedMax}
          showLabels={showLabels}
          showRange={showRange}
          step={step}
        />
      </EuiPopover>
    </EuiFilterGroup>
  );
};
