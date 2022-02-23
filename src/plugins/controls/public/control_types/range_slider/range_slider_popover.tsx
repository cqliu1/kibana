/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useState } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldNumber,
  EuiPopover,
  EuiPopoverTitle,
  EuiText,
  EuiLoadingSpinner,
} from '@elastic/eui';
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
    <button
      onClick={() => setIsPopoverOpen((openState) => !openState)}
      className="rangeSliderAnchor__button"
      data-test-subj={`range-slider-control-${id}`}
    >
      <EuiFieldNumber controlOnly className="rangeSliderAnchor__fieldNumber" readOnly value={min} />
      <EuiText className="rangeSliderAnchor__delimiter" size="s" color="subdued">
        →
      </EuiText>
      <EuiFieldNumber controlOnly className="rangeSliderAnchor__fieldNumber" readOnly value={max} />
      {isLoading ? (
        <div className="rangeSliderAnchor__spinner">
          <EuiLoadingSpinner />
        </div>
      ) : undefined}
    </button>
  );

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      display="block"
      panelPaddingSize="s"
      className="rangeSlider__popoverOverride"
      anchorClassName="rangeSlider__anchorOverride"
      closePopover={() => setIsPopoverOpen(false)}
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
