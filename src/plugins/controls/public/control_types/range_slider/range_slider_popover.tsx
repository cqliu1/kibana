/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useMemo, useState } from 'react';
import {
  EuiFilterSelectItem,
  EuiPopoverTitle,
  EuiFieldSearch,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
  EuiFormRow,
  EuiSpacer,
  EuiIcon,
} from '@elastic/eui';
import { ValidatedDualRange } from '../../../../kibana_react/public';

import { RangeSliderEmbeddableInput, RangeValue } from './types';
import { RangeSliderStrings } from './range_slider_strings';
import { rangeSliderReducers } from './range_slider_reducers';
import { RangeSliderComponentState } from './range_slider.component';
import { useReduxEmbeddableContext } from '../../../../presentation_util/public';

export interface Props {
  id: string;
  value: RangeValue;
  min: number;
  max: number;
  onChange: (value: RangeValue) => void;
  step?: number;
  showLabels?: boolean;
  showRange?: boolean;
}

export const RangeSliderPopover: FC<Props> = ({
  id,
  min,
  max,
  step,
  value,
  showLabels,
  showRange,
  onChange,
}) => {
  // Redux embeddable container Context
  const { useEmbeddableSelector } = useReduxEmbeddableContext<
    RangeSliderEmbeddableInput,
    typeof rangeSliderReducers
  >();

  const { title } = useEmbeddableSelector((state) => state);
  const ticks = [
    { value: min, label: min },
    { value: max, label: max },
  ];

  return (
    <>
      <EuiPopoverTitle paddingSize="s">{title}</EuiPopoverTitle>
      <div className="rangeSlider__actions">
        <ValidatedDualRange
          id={id}
          max={max}
          min={min}
          onChange={onChange}
          showLabels={showLabels}
          showRange={showRange}
          step={step}
          ticks={ticks}
          value={value}
          fullWidth
          showInput
          showTicks
        />
      </div>
    </>
  );
};
