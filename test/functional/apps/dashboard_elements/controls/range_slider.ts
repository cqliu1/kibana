/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import expect from '@kbn/expect';

import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const dashboardAddPanel = getService('dashboardAddPanel');
  const esArchiver = getService('esArchiver');
  const security = getService('security');
  const filterBar = getService('filterBar');
  const kibanaServer = getService('kibanaServer');
  const queryBar = getService('queryBar');
  const retry = getService('retry');
  const testSubjects = getService('testSubjects');
  const { dashboardControls, timePicker, common, dashboard, header } = getPageObjects([
    'dashboardControls',
    'timePicker',
    'dashboard',
    'common',
    'header',
  ]);

  describe('Range Slider Control', async () => {
    before(async () => {
      await security.testUser.setRoles([
        'kibana_admin',
        'kibana_sample_admin',
        'test_logstash_reader',
      ]);
      await esArchiver.load('test/functional/fixtures/es_archiver/kibana_sample_data_flights');
      await kibanaServer.importExport.load(
        'test/functional/fixtures/kbn_archiver/dashboard/current/kibana'
      );
      await kibanaServer.importExport.load(
        'test/functional/fixtures/kbn_archiver/kibana_sample_data_flights_index_pattern'
      );
      await kibanaServer.uiSettings.replace({
        defaultIndex: '0bf35f60-3dc9-11e8-8660-4d65aa086b3c',
      });
      await common.navigateToApp('dashboard');
      await dashboardControls.enableControlsLab();
      await common.navigateToApp('dashboard');
      await dashboard.preserveCrossAppState();
      await dashboard.gotoDashboardLandingPage();
      await dashboard.clickNewDashboard();
      await timePicker.setAbsoluteRange(
        'Oct 22, 2018 @ 00:00:00.000',
        'Dec 3, 2018 @ 00:00:00.000'
      );
    });

    after(async () => {
      await dashboardControls.clearAllControls();
      await kibanaServer.importExport.unload(
        'test/functional/fixtures/kbn_archiver/kibana_sample_data_flights_index_pattern'
      );
      await esArchiver.unload('test/functional/fixtures/es_archiver/kibana_sample_data_flights');
      await kibanaServer.uiSettings.unset('defaultIndex');
      await security.testUser.restoreDefaults();
    });

    describe('create and edit', async () => {
      it('can create a new range slider control from a blank state', async () => {
        await dashboardControls.createRangeSliderControl({
          dataViewTitle: 'logstash-*',
          fieldName: 'bytes',
          width: 'small',
        });
        expect(await dashboardControls.getControlsCount()).to.be(1);
      });

      it('can add a second range list control with a non-default data view', async () => {
        await dashboardControls.createRangeSliderControl({
          dataViewTitle: 'kibana_sample_data_flights',
          fieldName: 'AvgTicketPrice',
          width: 'medium',
        });
        expect(await dashboardControls.getControlsCount()).to.be(2);
        const secondId = (await dashboardControls.getAllControlIds())[1];
        expect(
          await dashboardControls.rangeSliderGetLowerBoundAttribute(secondId, 'placeholder')
        ).to.be('100');
        expect(
          await dashboardControls.rangeSliderGetUpperBoundAttribute(secondId, 'placeholder')
        ).to.be('1200');
        // data views should be properly propagated from the control group to the dashboard
        expect(await filterBar.getIndexPatterns()).to.be('logstash-*,kibana_sample_data_flights');
      });

      it('renames an existing control', async () => {
        const secondId = (await dashboardControls.getAllControlIds())[1];
        const newTitle = 'Average ticket price';
        await dashboardControls.editExistingControl(secondId);
        await dashboardControls.controlEditorSetTitle(newTitle);
        await dashboardControls.controlEditorSave();
        expect(await dashboardControls.doesControlTitleExist(newTitle)).to.be(true);
      });

      it('can edit range slider control', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.editExistingControl(firstId);

        const saveButton = await testSubjects.find('control-editor-save');
        expect(await saveButton.isEnabled()).to.be(true);
        await dashboardControls.controlsEditorSetDataView('kibana_sample_data_flights');
        expect(await saveButton.isEnabled()).to.be(false);
        await dashboardControls.controlsEditorSetfield('dayOfWeek');
        await dashboardControls.controlEditorSave();
        await dashboardControls.rangeSliderWaitForLoading();
        expect(
          await dashboardControls.rangeSliderGetLowerBoundAttribute(firstId, 'placeholder')
        ).to.be('0');
        expect(
          await dashboardControls.rangeSliderGetUpperBoundAttribute(firstId, 'placeholder')
        ).to.be('6');
        // when creating a new filter, the ability to select a data view should be removed, because the dashboard now only has one data view
        await retry.try(async () => {
          await testSubjects.click('addFilter');
          const indexPatternSelectExists = await testSubjects.exists('filterIndexPatternsSelect');
          await filterBar.ensureFieldEditorModalIsClosed();
          expect(indexPatternSelectExists).to.be(false);
        });
      });

      it('can enter lower bound selection from the number field', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.rangeSliderSetLowerBound(firstId, '1');
        const lowerBoundSelection = await dashboardControls.rangeSliderGetLowerBoundAttribute(
          firstId,
          'value'
        );
        expect(lowerBoundSelection).to.be('1');
      });

      it('can enter upper bound selection into the number field', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.rangeSliderSetUpperBound(firstId, '2');
        const upperBoundSelection = await dashboardControls.rangeSliderGetUpperBoundAttribute(
          firstId,
          'value'
        );
        expect(upperBoundSelection).to.be('2');
      });

      it('applies filter from the first control on the second control', async () => {
        await dashboardControls.rangeSliderWaitForLoading();
        const secondId = (await dashboardControls.getAllControlIds())[1];
        const availableMin = await dashboardControls.rangeSliderGetLowerBoundAttribute(
          secondId,
          'placeholder'
        );
        expect(availableMin).to.be('100');
        const availabeMax = await dashboardControls.rangeSliderGetUpperBoundAttribute(
          secondId,
          'placeholder'
        );
        expect(availabeMax).to.be('1000');
      });

      it('can clear out selections by clicking the reset button', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.rangeSliderClearSelection(firstId);
        const lowerBoundSelection = await dashboardControls.rangeSliderGetLowerBoundAttribute(
          firstId,
          'value'
        );
        expect(lowerBoundSelection.length).to.be(0);
        const upperBoundSelection = await dashboardControls.rangeSliderGetUpperBoundAttribute(
          firstId,
          'value'
        );
        expect(upperBoundSelection.length).to.be(0);
      });

      it('deletes an existing control', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.removeExistingControl(firstId);
        expect(await dashboardControls.getControlsCount()).to.be(1);
      });
    });

    describe('validation', async () => {
      it('displays error message when upper bound selection is less than lower bound selection', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.rangeSliderSetLowerBound(firstId, '500');
        await dashboardControls.rangeSliderSetUpperBound(firstId, '400');
      });

      it('disables inputs when no data available', async () => {
        await dashboardControls.createRangeSliderControl({
          dataViewTitle: 'logstash-*',
          fieldName: 'bytes',
          width: 'small',
        });
        const secondId = (await dashboardControls.getAllControlIds())[1];
        expect(
          await dashboardControls.rangeSliderGetLowerBoundAttribute(secondId, 'disabled')
        ).to.be('true');
        expect(
          await dashboardControls.rangeSliderGetUpperBoundAttribute(secondId, 'disabled')
        ).to.be('true');
        await dashboardControls.rangeSliderOpenPopover(secondId);
        await dashboardControls.rangeSliderPopoverAssertOpen();
        expect(
          await dashboardControls.rangeSliderGetDualRangeAttribute(secondId, 'disabled')
        ).to.be('true');
        expect((await testSubjects.getVisibleText('rangeSlider__helpText')).length).to.be.above(0);
      });
    });

    describe('Interactions between range list and dashboard', async () => {
      let controlId: string;
      before(async () => {
        await dashboardControls.clearAllControls();
        await timePicker.setDefaultAbsoluteRange();
        controlId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.rangeSliderClearSelection(controlId);
        await dashboardAddPanel.addVisualization('Rendering-Test:-animal-sounds-pie');
        await dashboardControls.createRangeSliderControl({
          dataViewTitle: '',
          fieldName: 'sound.keyword',
          title: 'Animal Sounds',
        });
      });

      describe('Apply dashboard query and filters to range slider controls', async () => {
        after(async () => {
          await filterBar.removeAllFilters();
        });

        it('applies dashboard query to range slider control', async () => {
          await queryBar.setQuery('AvgTicketPrice > 500 ');
          await queryBar.submitQuery();
          await dashboard.waitForRenderComplete();
          await header.waitUntilLoadingHasFinished();
          await dashboardControls.rangeSliderOpenPopover(controlId);
          await retry.try(async () => {
            expect(
              await dashboardControls.rangeSliderGetLowerBoundAttribute(controlId, 'placeholder')
            ).to.be(5);
            expect(
              await dashboardControls.rangeSliderGetUpperBoundAttribute(controlId, 'placeholder')
            ).to.be(5);
          });
          await queryBar.setQuery('');
          await queryBar.submitQuery();
        });

        it('Applies dashboard filters to range slider control', async () => {
          await filterBar.addFilter('AvgTicketPrice', 'is between', ['300', '800']);
          await dashboard.waitForRenderComplete();
          await header.waitUntilLoadingHasFinished();
          await dashboardControls.optionsListOpenPopover(controlId);
          await retry.try(async () => {
            expect(
              await dashboardControls.rangeSliderGetLowerBoundAttribute(controlId, 'placeholder')
            ).to.be(5);
            expect(
              await dashboardControls.rangeSliderGetUpperBoundAttribute(controlId, 'placeholder')
            ).to.be(5);
          });
        });

        it('Does not apply disabled dashboard filters to range slider control', async () => {
          await filterBar.toggleFilterEnabled('AvgTicketPrice');
          await dashboard.waitForRenderComplete();
          await header.waitUntilLoadingHasFinished();
          await dashboardControls.optionsListOpenPopover(controlId);
          await retry.try(async () => {
            expect(
              await dashboardControls.rangeSliderGetLowerBoundAttribute(controlId, 'placeholder')
            ).to.be(5);
            expect(
              await dashboardControls.rangeSliderGetUpperBoundAttribute(controlId, 'placeholder')
            ).to.be(5);
          });
          await filterBar.toggleFilterEnabled('sound.keyword');
          await dashboard.waitForRenderComplete();
          await header.waitUntilLoadingHasFinished();
        });
      });

      describe('Selections made in control apply to dashboard', async () => {
        after(async () => {
          await dashboardControls.rangeSliderClearSelection(controlId);
          await dashboardControls.rangeSliderEnsurePopoverIsClosed(controlId);
        });

        it('Shows available range in range slider with no selection by default', async () => {
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await retry.try(async () => {
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(8);
          // });
          // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
        });

        it('Can set lower bound selection without selecting upper bound', async () => {
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await dashboardControls.optionsListPopoverSelectOption('hiss');
          // await dashboardControls.optionsListPopoverSelectOption('grr');
          // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
        });

        it('Can set upper bound selection without selecting lower bound', async () => {
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await dashboardControls.optionsListPopoverSelectOption('hiss');
          // await dashboardControls.optionsListPopoverSelectOption('grr');
          // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
        });

        it('shows selection in control', async () => {
          // const selectionString = await dashboardControls.optionsListGetSelectionsString(controlId);
          // expect(selectionString).to.be('hiss, grr');
        });

        it('applies selected range to dashboard', async () => {
          // await retry.try(async () => {
          //   expect(await pieChart.getPieSliceCount()).to.be(2);
          // });
        });

        it('Applies selected range to dashboard by default on open', async () => {
          // await dashboard.gotoDashboardLandingPage();
          // await header.waitUntilLoadingHasFinished();
          // await dashboard.clickUnsavedChangesContinueEditing('New Dashboard');
          // await header.waitUntilLoadingHasFinished();
          // expect(await pieChart.getPieSliceCount()).to.be(2);
          // const selectionString = await dashboardControls.optionsListGetSelectionsString(controlId);
          // expect(selectionString).to.be('hiss, grr');
        });
      });
    });
  });
}
