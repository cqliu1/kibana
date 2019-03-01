/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiPanel,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSwitch,
  EuiSelect,
  EuiRange,
} from '@elastic/eui';
import { ExpressionInput } from '../expression_input';
import { fontSizes } from '../text_style_picker/font_sizes';

const minFontSize = 12;
const maxFontSize = 32;

export const Expression = ({
  functionDefinitions,
  formState,
  updateValue,
  setExpression,
  done,
  error,
  isAutocompleteEnabled,
  toggleAutocompleteEnabled,
  fontSize,
  setFontSize,
  isCompact,
  toggleCompactView,
}) => {
  return (
    <EuiPanel
      className={`canvasTray__panel canvasExpression--${isCompact ? 'compactSize' : 'fullSize'}`}
    >
      <ExpressionInput
        fontSize={fontSize}
        isCompact={isCompact}
        functionDefinitions={functionDefinitions}
        error={error}
        value={formState.expression}
        onChange={updateValue}
        isAutocompleteEnabled={isAutocompleteEnabled}
      />
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiSwitch
            id="autocompleteOptIn"
            name="popswitch"
            label="Enable autocomplete"
            checked={isAutocompleteEnabled}
            onChange={toggleAutocompleteEnabled}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiSelect
                compressed
                value={fontSize}
                options={fontSizes.map(size => ({ text: `${size}`, value: size }))}
                onChange={e => setFontSize(e.target.value)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>Font size</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center" gutterSize="xs">
            <EuiFlexItem style={{ fontSize: `${minFontSize}px` }} grow={false}>
              A
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiRange
                value={fontSize}
                min={minFontSize}
                step={4}
                max={maxFontSize}
                onChange={e => setFontSize(e.target.value)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ fontSize: `${maxFontSize}px` }}>
              A
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty onClick={toggleCompactView} iconType="expand">
            {isCompact ? 'expand' : 'shrink'}
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
            <EuiButtonEmpty size="s" color={formState.dirty ? 'danger' : 'primary'} onClick={done}>
              {formState.dirty ? 'Cancel' : 'Close'}
            </EuiButtonEmpty>
            <EuiButton
              fill
              disabled={!!error}
              onClick={() => setExpression(formState.expression)}
              size="s"
            >
              Run
            </EuiButton>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};

Expression.propTypes = {
  functionDefinitions: PropTypes.array,
  formState: PropTypes.object,
  updateValue: PropTypes.func,
  setExpression: PropTypes.func,
  done: PropTypes.func,
  error: PropTypes.string,
  isAutocompleteEnabled: PropTypes.bool,
  toggleAutocompleteEnabled: PropTypes.func,
};
