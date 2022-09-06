/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { storybookFlightsDataView } from '@kbn/presentation-util-plugin/public/mocks';
import { injectStorybookDataView } from '../../services/storybook/data_views';
import { decorators } from '../../__stories__/decorators';
import { RangeSliderPopover } from '../components/range_slider_popover';

export default {
  title: 'Range Slider/Popover',
  description: '',
  decorators,
};

injectStorybookDataView(storybookFlightsDataView);

export const RangeSliderPopoverStory = () => <RangeSliderPopover />;
