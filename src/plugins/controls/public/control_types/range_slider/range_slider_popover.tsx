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

import { ceilWithPrecision, floorWithPrecision } from './lib/round_with_precision';
import { RangeValue } from './types';

export interface Props {
  id: string;
  isLoading?: boolean;
  min: string;
  max: string;
  title?: string;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  step: number;
  decimalPlaces: number;
}

export const RangeSliderPopover: FC<Props> = ({
  id,
  isLoading,
  min,
  max,
  title,
  value = ['', ''],
  onChange,
  decimalPlaces,
  step,
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

  const roundedLowerBound = hasLowerBoundSelection
    ? floorWithPrecision(lowerBoundValue, decimalPlaces)
    : lowerBoundValue;
  const roundedUpperBound = hasUpperBoundSelection
    ? ceilWithPrecision(upperBoundValue, decimalPlaces)
    : upperBoundValue;
  const roundedMin = hasAvailableRange ? Math.floor(minValue) : minValue;
  let roundedMax = hasAvailableRange ? Math.ceil(maxValue) : maxValue;

  const isLowerSelectionInvalid = hasLowerBoundSelection && roundedLowerBound > roundedMax;
  const isUpperSelectionInvalid = hasUpperBoundSelection && roundedUpperBound < roundedMin;
  const isSelectionInvalid =
    hasAvailableRange && (isLowerSelectionInvalid || isUpperSelectionInvalid);

  if (isSelectionInvalid) {
    helpText = 'Selected range is outside of available data. No filter was applied.';
  }

  if (roundedLowerBound > roundedUpperBound) {
    errorMessage = 'Upper value must be greater than or equal to lower value.';
  }

  const rangeSliderMin = Math.min(
    roundedMin,
    isNaN(roundedLowerBound) ? Infinity : roundedLowerBound,
    isNaN(roundedUpperBound) ? Infinity : roundedUpperBound
  );
  const rangeSliderMax = Math.max(
    roundedMax,
    isNaN(roundedLowerBound) ? -Infinity : roundedLowerBound,
    isNaN(roundedUpperBound) ? -Infinity : roundedUpperBound
  );

  const displayedValue = [
    hasLowerBoundSelection
      ? String(roundedLowerBound)
      : hasAvailableRange
      ? String(roundedMin)
      : '',
    hasUpperBoundSelection
      ? String(roundedUpperBound)
      : hasAvailableRange
      ? String(roundedMax)
      : '',
  ] as RangeValue;

  const ticks = [];
  const levels = [];

  if (hasAvailableRange) {
    ticks.push({ value: rangeSliderMin, label: rangeSliderMin });
    ticks.push({ value: rangeSliderMax, label: rangeSliderMax });
    levels.push({ min: roundedMin, max: roundedMax, color: 'success' });
  }

  // Round max value up to a multiple of the step interval
  if (hasAvailableRange && step > 1) {
    roundedMax =
      ceilWithPrecision((roundedMax - roundedMin) / step, decimalPlaces) * step + roundedMin;
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
        value={hasLowerBoundSelection ? roundedLowerBound : ''}
        onChange={(event) => {
          onChange([event.target.value, isNaN(roundedUpperBound) ? '' : String(roundedUpperBound)]);
        }}
        disabled={!hasAvailableRange || isLoading}
        placeholder={`${hasAvailableRange ? roundedMin : ''}`}
        isInvalid={isLowerSelectionInvalid}
        step={hasAvailableRange ? step : undefined}
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
        value={hasUpperBoundSelection ? roundedUpperBound : ''}
        onChange={(event) => {
          onChange([isNaN(roundedLowerBound) ? '' : String(roundedLowerBound), event.target.value]);
        }}
        disabled={!hasAvailableRange || isLoading}
        placeholder={`${hasAvailableRange ? roundedMax : ''}`}
        isInvalid={isUpperSelectionInvalid}
        step={hasAvailableRange ? step : undefined}
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
            step={hasAvailableRange ? step : undefined}
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
