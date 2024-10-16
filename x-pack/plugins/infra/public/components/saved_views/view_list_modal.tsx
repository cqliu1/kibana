/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useState, useMemo } from 'react';

import { EuiButtonEmpty, EuiModalFooter, EuiButton, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiModal, EuiModalHeader, EuiModalHeaderTitle, EuiModalBody } from '@elastic/eui';
import { EuiSelectable } from '@elastic/eui';
import { EuiSelectableOption } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { SavedView } from '../../containers/saved_view/saved_view';

interface Props<ViewState> {
  views: Array<SavedView<ViewState>>;
  onClose(): void;
  setView(viewState: ViewState): void;
  currentView?: ViewState;
}

export function SavedViewListModal<ViewState extends { id: string; name: string }>({
  onClose,
  views,
  setView,
  currentView,
}: Props<ViewState>) {
  const [options, setOptions] = useState<EuiSelectableOption[] | null>(null);

  const onChange = useCallback((opts: EuiSelectableOption[]) => {
    setOptions(opts);
  }, []);

  const loadView = useCallback(() => {
    if (!options) {
      onClose();
      return;
    }

    const selected = options.find((o) => o.checked);
    if (!selected) {
      onClose();
      return;
    }
    setView(views.find((v) => v.id === selected.key)!);
    onClose();
  }, [options, views, setView, onClose]);

  const defaultOptions = useMemo<EuiSelectableOption[]>(() => {
    return views.map((v) => ({
      label: v.name,
      key: v.id,
      checked: currentView?.id === v.id ? 'on' : undefined,
    }));
  }, [views, currentView]);

  return (
    <EuiModal onClose={onClose} data-test-subj="savedViews-loadModal">
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <FormattedMessage
            defaultMessage="Select a view to load"
            id="xpack.infra.waffle.savedView.selectViewHeader"
          />
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiSelectable
          singleSelection
          searchable
          options={options || defaultOptions}
          onChange={onChange}
          searchProps={{
            placeholder: i18n.translate('xpack.infra.savedView.searchPlaceholder', {
              defaultMessage: 'Search for saved views',
            }),
          }}
          listProps={{ bordered: true }}
          data-test-subj="savedViews-loadList"
        >
          {(list, search) => (
            <>
              {search}
              <EuiSpacer size="m" />
              {list}
            </>
          )}
        </EuiSelectable>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty data-test-subj="cancelSavedViewModal" onClick={onClose}>
          <FormattedMessage defaultMessage="Cancel" id="xpack.infra.openView.cancelButton" />
        </EuiButtonEmpty>
        <EuiButton fill color="primary" data-test-subj="loadSavedViewModal" onClick={loadView}>
          <FormattedMessage defaultMessage="Load view" id="xpack.infra.openView.loadButton" />
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
