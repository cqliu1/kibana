/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useState, useRef } from 'react';
import {
  EuiFieldNumber,
  EuiPopoverTitle,
  EuiText,
  EuiInputPopover,
  EuiButtonIcon,
  EuiToolTip,
  EuiLoadingSpinner,
  EuiFlexGroup,
  EuiFlexItem,
  EuiDualRange,
} from '@elastic/eui';

// import { ceilWithPrecision, floorWithPrecision } from './lib/round_with_precision';
import { RangeValue } from './types';

export interface Props {
  id: string;
  isLoading?: boolean;
  min: string;
  max: string;
  title?: string;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
}

export const RangeSliderPopover: FC<Props> = ({
  id,
  isLoading,
  min,
  max,
  title,
  value = ['', ''],
  onChange,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const rangeRef = useRef();
  let errorMessage = '';
  let helpText = '';

  const hasAvailableRange = min !== '' && max !== '';
  const hasLowerBoundSelection = value[0] !== '';
  const hasUpperBoundSelection = value[1] !== '';

  const lowerBoundValue = parseInt(value[0], 10);
  const upperBoundValue = parseInt(value[1], 10);
  const minValue = parseInt(min, 10);
  const maxValue = parseInt(max, 10);

  if (!hasAvailableRange) {
    helpText = 'There is no data to display. Adjust the time range and filters.';
  }

  // const roundedLowerBound = hasLowerBoundSelection ? Math.floor(lowerBoundValue) : lowerBoundValue;
  // const roundedUpperBound = hasUpperBoundSelection ? Math.ceil(upperBoundValue) : upperBoundValue;
  const roundedMin = hasAvailableRange ? Math.floor(minValue) : minValue;
  const roundedMax = hasAvailableRange ? Math.ceil(maxValue) : maxValue;

  const isLowerSelectionInvalid = hasLowerBoundSelection && lowerBoundValue > roundedMax;
  const isUpperSelectionInvalid = hasUpperBoundSelection && upperBoundValue < roundedMin;
  const isSelectionInvalid =
    hasAvailableRange && (isLowerSelectionInvalid || isUpperSelectionInvalid);

  if (isSelectionInvalid) {
    helpText = 'Selected range is outside of available data. No filter was applied.';
  }

  if (lowerBoundValue > upperBoundValue) {
    errorMessage = 'Upper value must be greater than or equal to lower value.';
  }

  const rangeSliderMin = Math.min(
    roundedMin,
    isNaN(lowerBoundValue) ? Infinity : lowerBoundValue,
    isNaN(upperBoundValue) ? Infinity : upperBoundValue
  );
  const rangeSliderMax = Math.max(
    roundedMax,
    isNaN(lowerBoundValue) ? -Infinity : lowerBoundValue,
    isNaN(upperBoundValue) ? -Infinity : upperBoundValue
  );

  const displayedValue = [
    hasLowerBoundSelection ? String(lowerBoundValue) : hasAvailableRange ? String(roundedMin) : '',
    hasUpperBoundSelection ? String(upperBoundValue) : hasAvailableRange ? String(roundedMax) : '',
  ] as RangeValue;

  const ticks = [];
  const levels = [];

  if (hasAvailableRange) {
    ticks.push({ value: rangeSliderMin, label: rangeSliderMin });
    ticks.push({ value: rangeSliderMax, label: rangeSliderMax });
    levels.push({ min: roundedMin, max: roundedMax, color: 'success' });
  }

  const button = (
    <button
      onClick={() => setIsPopoverOpen((openState) => !openState)}
      className="rangeSliderAnchor__button"
      data-test-subj={`range-slider-control-${id}`}
    >
      <EuiFieldNumber
        controlOnly
        className={`rangeSliderAnchor__fieldNumber ${
          hasLowerBoundSelection && isSelectionInvalid
            ? 'rangeSliderAnchor__fieldNumber--invalid'
            : ''
        }`}
        value={hasLowerBoundSelection ? lowerBoundValue : ''}
        onChange={(event) => {
          onChange([event.target.value, isNaN(upperBoundValue) ? '' : String(upperBoundValue)]);
        }}
        disabled={!hasAvailableRange || isLoading}
        placeholder={`${hasAvailableRange ? roundedMin : ''}`}
        isInvalid={isLowerSelectionInvalid}
      />
      <EuiText className="rangeSliderAnchor__delimiter" size="s" color="subdued">
        →
      </EuiText>
      <EuiFieldNumber
        controlOnly
        className={`rangeSliderAnchor__fieldNumber ${
          hasUpperBoundSelection && isSelectionInvalid
            ? 'rangeSliderAnchor__fieldNumber--invalid'
            : ''
        }`}
        value={hasUpperBoundSelection ? upperBoundValue : ''}
        onChange={(event) => {
          onChange([isNaN(lowerBoundValue) ? '' : String(lowerBoundValue), event.target.value]);
        }}
        disabled={!hasAvailableRange || isLoading}
        placeholder={`${hasAvailableRange ? roundedMax : ''}`}
        isInvalid={isUpperSelectionInvalid}
      />
      {isLoading ? (
        <div className="rangeSliderAnchor__spinner">
          <EuiLoadingSpinner />
        </div>
      ) : undefined}
    </button>
  );

  return (
    <EuiInputPopover
      input={button}
      isOpen={isPopoverOpen}
      display="block"
      panelPaddingSize="s"
      className="rangeSlider__popoverOverride"
      anchorClassName="rangeSlider__anchorOverride"
      closePopover={() => setIsPopoverOpen(false)}
      anchorPosition="downCenter"
      initialFocus={false}
      repositionOnScroll
      disableFocusTrap
      onPanelResize={() => {
        rangeRef.current.onResize();
      }}
    >
      <EuiPopoverTitle paddingSize="s">{title}</EuiPopoverTitle>
      <EuiFlexGroup className="rangeSlider__actions" gutterSize="none">
        <EuiFlexItem>
          <EuiDualRange
            id={id}
            min={hasAvailableRange ? rangeSliderMin : undefined}
            max={hasAvailableRange ? rangeSliderMax : undefined}
            onChange={([newLowerBound, newUpperBound]) => {
              const updatedLowerBound =
                typeof newLowerBound === 'number' ? String(newLowerBound) : value[0];
              const updatedUpperBound =
                typeof newUpperBound === 'number' ? String(newUpperBound) : value[1];

              onChange([updatedLowerBound, updatedUpperBound]);
            }}
            // step={hasAvailableRange ? step : undefined}
            value={displayedValue}
            ticks={hasAvailableRange ? ticks : undefined}
            levels={hasAvailableRange ? levels : undefined}
            showTicks={hasAvailableRange}
            disabled={!hasAvailableRange}
            fullWidth
            ref={rangeRef}
          />
          <EuiText size="s" color={errorMessage ? 'danger' : 'text'}>
            {errorMessage || helpText}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip content="Reset range">
            <EuiButtonIcon
              iconType="eraser"
              color="danger"
              onClick={() => onChange(['', ''])}
              aria-label="Reset range"
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiInputPopover>
  );
};
