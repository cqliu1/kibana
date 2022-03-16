/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';

export const RangeSliderStrings = {
  summary: {
    getSeparator: () =>
      i18n.translate('controls.rangeSlider.summary.separator', {
        defaultMessage: ', ',
      }),
    getPlaceholder: () =>
      i18n.translate('controls.rangeSlider.summary.placeholder', {
        defaultMessage: 'Select...',
      }),
  },
  editor: {
    getIndexPatternTitle: () =>
      i18n.translate('controls.rangeSlider.editor.indexPatternTitle', {
        defaultMessage: 'Index pattern',
      }),
    getDataViewTitle: () =>
      i18n.translate('controls.rangeSlider.editor.dataViewTitle', {
        defaultMessage: 'Data view',
      }),
    getNoDataViewTitle: () =>
      i18n.translate('controls.rangeSlider.editor.noDataViewTitle', {
        defaultMessage: 'Select data view',
      }),
    getFieldTitle: () =>
      i18n.translate('controls.rangeSlider.editor.fieldTitle', {
        defaultMessage: 'Field',
      }),
  },
  popover: {
    getLoadingMessage: () =>
      i18n.translate('controls.rangeSlider.popover.loading', {
        defaultMessage: 'Loading filters',
      }),
    getEmptyMessage: () =>
      i18n.translate('controls.rangeSlider.popover.empty', {
        defaultMessage: 'No filters found',
      }),
    getSelectionsEmptyMessage: () =>
      i18n.translate('controls.rangeSlider.popover.selectionsEmpty', {
        defaultMessage: 'You have no selections',
      }),
    getAllOptionsButtonTitle: () =>
      i18n.translate('controls.rangeSlider.popover.allOptionsTitle', {
        defaultMessage: 'Show all options',
      }),
    getSelectedOptionsButtonTitle: () =>
      i18n.translate('controls.rangeSlider.popover.selectedOptionsTitle', {
        defaultMessage: 'Show only selected options',
      }),
    getClearAllSelectionsButtonTitle: () =>
      i18n.translate('controls.rangeSlider.popover.clearAllSelectionsTitle', {
        defaultMessage: 'Clear selections',
      }),
  },
  errors: {
    getDataViewNotFoundError: (dataViewId: string) =>
      i18n.translate('controls.rangeSlider.errors.dataViewNotFound', {
        defaultMessage: 'Could not locate data view: {dataViewId}',
        values: { dataViewId },
      }),
  },
};
