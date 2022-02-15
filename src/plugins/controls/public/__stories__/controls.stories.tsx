/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { EuiFlexGroup, EuiFlexItem, EuiSwitch, EuiTextAlign } from '@elastic/eui';
import React, { useEffect, useMemo, useState, useCallback, FC } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import uuid from 'uuid';

import {
  getFlightOptionsAsync,
  storybookFlightsDataView,
} from '../../../presentation_util/public/mocks';
import {
  ControlGroupContainerFactory,
  OptionsListEmbeddableInput,
  RangeSliderEmbeddableInput,
  OPTIONS_LIST_CONTROL,
  RANGE_SLIDER_CONTROL,
} from '../';

import { ViewMode } from '../../../embeddable/public';
import { EmbeddablePersistableStateService } from '../../../embeddable/common';

import { decorators } from './decorators';
import { ControlsPanels } from '../control_group/types';
import { ControlGroupContainer } from '../control_group';
import { pluginServices, registry } from '../services/storybook';
import { replaceValueSuggestionMethod } from '../services/storybook/data';
import { injectStorybookDataView } from '../services/storybook/data_views';
import { populateStorybookControlFactories } from './storybook_control_factories';
import { RangeSliderPopover } from '../control_types/range_slider/range_slider_popover';

export default {
  title: 'Controls',
  description: '',
  decorators,
};

injectStorybookDataView(storybookFlightsDataView);
replaceValueSuggestionMethod(getFlightOptionsAsync);

const ControlGroupStoryComponent: FC<{
  panels?: ControlsPanels;
  edit?: boolean;
}> = ({ panels, edit }) => {
  const embeddableRoot: React.RefObject<HTMLDivElement> = useMemo(() => React.createRef(), []);
  const [embeddable, setEmbeddable] = useState<ControlGroupContainer>();
  const [viewMode, setViewMode] = useState<ViewMode>(
    edit === undefined || edit ? ViewMode.EDIT : ViewMode.VIEW
  );

  const handleToggleViewMode = useCallback(() => {
    if (embeddable) {
      const newViewMode =
        embeddable.getInput().viewMode === ViewMode.EDIT ? ViewMode.VIEW : ViewMode.EDIT;
      embeddable.updateInput({ viewMode: newViewMode });
    }
  }, [embeddable]);

  pluginServices.setRegistry(registry.start({}));
  populateStorybookControlFactories(pluginServices.getServices().controls);

  useEffectOnce(() => {
    (async () => {
      const factory = new ControlGroupContainerFactory(
        {} as unknown as EmbeddablePersistableStateService
      );
      const controlGroupContainerEmbeddable = await factory.create({
        controlStyle: 'oneLine',
        panels: panels ?? {},
        id: uuid.v4(),
        viewMode,
      });

      if (controlGroupContainerEmbeddable && embeddableRoot.current) {
        controlGroupContainerEmbeddable.render(embeddableRoot.current);
      }
      setEmbeddable(controlGroupContainerEmbeddable);
    })();
  });

  useEffect(() => {
    if (embeddable) {
      const subscription = embeddable.getInput$().subscribe((updatedInput) => {
        if (updatedInput.viewMode) {
          setViewMode(updatedInput.viewMode);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [embeddable, setViewMode]);

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiTextAlign textAlign="right">
            <EuiSwitch checked={viewMode === 'edit'} label="Edit" onChange={handleToggleViewMode} />
          </EuiTextAlign>
        </EuiFlexItem>
      </EuiFlexGroup>
      <br />

      <div ref={embeddableRoot} />
    </>
  );
};

export const EmptyControlGroupStory = () => <ControlGroupStoryComponent edit={false} />;
export const ConfiguredControlGroupStory = () => (
  <ControlGroupStoryComponent
    panels={{
      optionsList1: {
        type: OPTIONS_LIST_CONTROL,
        order: 1,
        width: 'auto',
        explicitInput: {
          title: 'Origin City',
          id: 'optionsList1',
          dataViewId: 'demoDataFlights',
          fieldName: 'OriginCityName',
          selectedOptions: ['Toronto'],
        } as OptionsListEmbeddableInput,
      },
      optionsList2: {
        type: OPTIONS_LIST_CONTROL,
        order: 2,
        width: 'auto',
        explicitInput: {
          title: 'Destination City',
          id: 'optionsList2',
          dataViewId: 'demoDataFlights',
          fieldName: 'DestCityName',
          selectedOptions: ['London'],
        } as OptionsListEmbeddableInput,
      },
      optionsList3: {
        type: OPTIONS_LIST_CONTROL,
        order: 3,
        width: 'auto',
        explicitInput: {
          title: 'Carrier',
          id: 'optionsList3',
          dataViewId: 'demoDataFlights',
          fieldName: 'Carrier',
        } as OptionsListEmbeddableInput,
      },
      rangeSlider1: {
        type: RANGE_SLIDER_CONTROL,
        order: 4,
        width: 'auto',
        explicitInput: {
          id: 'rangeSlider1',
          width: 'auto',
          title: 'Average ticket price',
          dataViewId: 'demoDataFlights',
          fieldName: 'avgTicketPrice',
          value: ['3', '13'],
          step: 2,
          loading: false,
        } as RangeSliderEmbeddableInput,
      },
    }}
  />
);

export const RangeSliderPopoverStory = () => (
  <RangeSliderPopover
    {...{
      id: 'rangeSlider1',
      width: 'auto',
      title: 'Average ticket price',
      dataViewId: 'demoDataFlights',
      fieldName: 'avgTicketPrice',
      value: ['3', '13'],
      step: 2,
      min: 0,
      max: 20,
      componentStateSubject: { loading: false, min: 0, max: 20 },
      onChange: action('onChange'),
    }}
  />
);
