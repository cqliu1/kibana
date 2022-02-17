/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useState } from 'react';
import { EuiFieldNumber, EuiPopover, EuiPopoverTitle, EuiText } from '@elastic/eui';
import { ValidatedDualRange } from '../../../../kibana_react/public';

import { RangeValue } from './types';

export interface Props {
  id: string;
  title?: string;
  value: RangeValue;
  min: number;
  max: number;
  onChange: (value: RangeValue) => void;
  step?: number;
  isLoading?: boolean;
}

export const RangeSliderPopover: FC<Props> = ({
  id,
  title,
  min,
  max,
  step,
  value,
  onChange,
  isLoading,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const ticks = [
    { value: min, label: min },
    { value: max, label: max },
  ];

  const button = (
    <button onClick={() => setIsPopoverOpen((openState) => !openState)} className="customButton">
      <EuiFieldNumber readOnly value={min} />
      <EuiText className="customButton__delimeter" size="s" color="subdued">
        →
      </EuiText>
      <EuiFieldNumber readOnly value={max} />
    </button>
    // className="rangeSlider__popoverAnchorButton"
    // data-test-subj={`range-slider-control-${id}`}
    // onClick={() => setIsPopoverOpen((openState) => !openState)}
    // isLoading={isLoading}
    // isSelected={isPopoverOpen}
    /* <EuiDualRange
        min={min}
        max={max}
        value={value}
        showInput="inputWithPopover"
        fullWidth
        readOnly
        onChange={() => {}}
      /> */
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
