/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useMemo, useState } from 'react';
import { EuiButtonEmpty, EuiDualRange, EuiPopover, EuiPopoverTitle } from '@elastic/eui';
import { ValidatedDualRange } from '../../../../kibana_react/public';

import { RangeSliderEmbeddableInput, RangeValue } from './types';
import { RangeSliderStrings } from './range_slider_strings';
import { rangeSliderReducers } from './range_slider_reducers';
import { RangeSliderComponentState } from './range_slider.component';
import { useReduxEmbeddableContext } from '../../../../presentation_util/public';

export interface Props {
  id: string;
  title?: string;
  value: RangeValue;
  min: number;
  max: number;
  onChange: (value: RangeValue) => void;
  step?: number;
  showLabels?: boolean;
  showRange?: boolean;
  isLoading?: boolean;
}

export const RangeSliderPopover: FC<Props> = ({
  id,
  title,
  min,
  max,
  step,
  value,
  showLabels,
  showRange,
  onChange,
  isLoading,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const ticks = [
    { value: min, label: min },
    { value: max, label: max },
  ];

  const button = (
    <EuiButtonEmpty
      className="rangeSlider__popoverAnchorButton"
      data-test-subj={`range-slider-control-${id}`}
      onClick={() => setIsPopoverOpen((openState) => !openState)}
      isLoading={isLoading}
    >
      <EuiDualRange
        value={value}
        showInput="inputWithPopover"
        fullWidth
        readOnly
        onChange={() => {}}
      />
    </EuiButtonEmpty>
  );

  return (
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
      <EuiPopoverTitle paddingSize="s">{title}</EuiPopoverTitle>
      <div className="rangeSlider__actions">
        <ValidatedDualRange
          id={id}
          max={max}
          min={min}
          onChange={onChange}
          showRange={showRange}
          step={step}
          ticks={ticks}
          value={value}
          fullWidth
          showInput
          showTicks
        />
      </div>
    </EuiPopover>
  );
};
