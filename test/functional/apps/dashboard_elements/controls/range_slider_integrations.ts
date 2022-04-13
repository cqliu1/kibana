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
  const retry = getService('retry');
  const esArchiver = getService('esArchiver');
  const security = getService('security');
  const queryBar = getService('queryBar');
  const pieChart = getService('pieChart');
  const filterBar = getService('filterBar');
  const testSubjects = getService('testSubjects');
  const kibanaServer = getService('kibanaServer');
  const dashboardAddPanel = getService('dashboardAddPanel');
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
      // await dashboardControls.clearAllControls();
      // await kibanaServer.importExport.unload(
      //   'test/functional/fixtures/kbn_archiver/kibana_sample_data_flights_index_pattern'
      // );
      // await esArchiver.unload('test/functional/fixtures/es_archiver/kibana_sample_data_flights');
      // await kibanaServer.uiSettings.unset('defaultIndex');
      // await security.testUser.restoreDefaults();
    });

    describe('create and edit', async () => {
      it('can create a new range slider control from a blank state', async () => {
        await dashboardControls.createRangeSliderControl({ fieldName: 'bytes', width: 'small' });
        expect(await dashboardControls.getControlsCount()).to.be(1);
      });

      it('can add a second range list control with a non-default data view', async () => {
        await dashboardControls.createRangeSliderControl({
          dataViewTitle: 'kibana_sample_data_flights',
          fieldName: 'AvgTicketPrice',
          width: 'medium',
        });
        expect(await dashboardControls.getControlsCount()).to.be(2);
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
        await dashboardControls.controlsEditorSetDataView('kibana_sample_data_flights');
        await dashboardControls.controlsEditorSetfield('dayOfWeek');
        await dashboardControls.controlEditorSave();
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
        await dashboardControls.rangeSliderSetLowerBound(firstId, '100');
      });

      it('can enter upper bound selection into the number field', async () => {
        const firstId = (await dashboardControls.getAllControlIds())[0];
        await dashboardControls.rangeSliderSetUpperBound(firstId, '300');
      });

      it('can set lower bound selection by dragging range thumb', async () => {
        // const firstId = (await dashboardControls.getAllControlIds())[0];
        // await dashboardControls.editExistingControl(firstId);
        // await dashboardControls.optionsListEditorSetDataView('animals-*');
        // await dashboardControls.optionsListEditorSetfield('animal.keyword');
        // await dashboardControls.controlEditorSave();
        // // when creating a new filter, the ability to select a data view should be removed, because the dashboard now only has one data view
        // await retry.try(async () => {
        //   await testSubjects.click('addFilter');
        //   const indexPatternSelectExists = await testSubjects.exists('filterIndexPatternsSelect');
        //   await filterBar.ensureFieldEditorModalIsClosed();
        //   expect(indexPatternSelectExists).to.be(false);
        // });
      });

      it('can set upper bound selection by dragging range thumb', async () => {
        // const firstId = (await dashboardControls.getAllControlIds())[0];
        // await dashboardControls.editExistingControl(firstId);
        // await dashboardControls.optionsListEditorSetDataView('animals-*');
        // await dashboardControls.optionsListEditorSetfield('animal.keyword');
        // await dashboardControls.controlEditorSave();
        // // when creating a new filter, the ability to select a data view should be removed, because the dashboard now only has one data view
        // await retry.try(async () => {
        //   await testSubjects.click('addFilter');
        //   const indexPatternSelectExists = await testSubjects.exists('filterIndexPatternsSelect');
        //   await filterBar.ensureFieldEditorModalIsClosed();
        //   expect(indexPatternSelectExists).to.be(false);
        // });
      });

      it('can clear out selections by clicking the reset button', async () => {
        // const firstId = (await dashboardControls.getAllControlIds())[0];
        // await dashboardControls.removeExistingControl(firstId);
        // expect(await dashboardControls.getControlsCount()).to.be(1);
      });

      it('deletes an existing control', async () => {
        // const firstId = (await dashboardControls.getAllControlIds())[0];
        // await dashboardControls.removeExistingControl(firstId);
        // expect(await dashboardControls.getControlsCount()).to.be(1);
      });
    });

    describe('validation', async () => {
      before(async () => {
        // await dashboardControls.optionsListOpenPopover(controlId);
        // await dashboardControls.optionsListPopoverSelectOption('meow');
        // await dashboardControls.optionsListPopoverSelectOption('bark');
        // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
      });

      after(async () => {
        await filterBar.removeAllFilters();
        await dashboardControls.clearAllControls();
      });

      it('can make valid selections invalid if parent filter changes', async () => {
        // await queryBar.setQuery('isDog : false ');
        // await queryBar.submitQuery();
        // await dashboard.waitForRenderComplete();
        // await header.waitUntilLoadingHasFinished();
        // await dashboardControls.optionsListOpenPopover(controlId);
        // await retry.try(async () => {
        //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(4);
        //   expect(await dashboardControls.optionsListPopoverGetAvailableOptions()).to.eql([
        //     'hiss',
        //     'meow',
        //     'growl',
        //     'grr',
        //     'Ignored selection',
        //     'bark',
        //   ]);
        // });
        // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
        // // only valid selections are applied as filters.
        // expect(await pieChart.getPieSliceCount()).to.be(1);
      });

      it('can make invalid selections valid again if the parent filter changes', async () => {
        // await queryBar.setQuery('');
        // await queryBar.submitQuery();
        // await dashboard.waitForRenderComplete();
        // await header.waitUntilLoadingHasFinished();
        // await dashboardControls.optionsListOpenPopover(controlId);
        // await retry.try(async () => {
        //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(8);
        //   expect(await dashboardControls.optionsListPopoverGetAvailableOptions()).to.eql([
        //     'hiss',
        //     'ruff',
        //     'bark',
        //     'grrr',
        //     'meow',
        //     'growl',
        //     'grr',
        //     'bow ow ow',
        //   ]);
        // });
        // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
        // expect(await pieChart.getPieSliceCount()).to.be(2);
      });

      it('displays error message when upper bound selection is less than lower bound selection', async () => {
        // await filterBar.addFilter('sound.keyword', 'is', ['hiss']);
        // await dashboard.waitForRenderComplete();
        // await header.waitUntilLoadingHasFinished();
        // await dashboardControls.optionsListOpenPopover(controlId);
        // await retry.try(async () => {
        //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(1);
        //   expect(await dashboardControls.optionsListPopoverGetAvailableOptions()).to.eql([
        //     'hiss',
        //     'Ignored selections',
        //     'meow',
        //     'bark',
        //   ]);
        // });
        // await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
        // // only valid selections are applied as filters.
        // expect(await pieChart.getPieSliceCount()).to.be(1);
      });

      it('disables inpuzts when no data available', async () => {});
    });

    describe('Interactions between range list and dashboard', async () => {
      let controlId: string;
      before(async () => {
        await dashboardAddPanel.addVisualization('Rendering-Test:-animal-sounds-pie');
        await dashboardControls.createOptionsListControl({
          dataViewTitle: 'animals-*',
          fieldName: 'sound.keyword',
          title: 'Animal Sounds',
        });

        controlId = (await dashboardControls.getAllControlIds())[0];
      });

      describe('Apply dashboard query and filters to range slider controls', async () => {
        after(async () => {
          await filterBar.removeAllFilters();
        });

        it('applies dashboard query to range slider control', async () => {
          // await queryBar.setQuery('isDog : true ');
          // await queryBar.submitQuery();
          // await dashboard.waitForRenderComplete();
          // await header.waitUntilLoadingHasFinished();
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await retry.try(async () => {
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(5);
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptions()).to.eql([
          //     'ruff',
          //     'bark',
          //     'grrr',
          //     'bow ow ow',
          //     'grr',
          //   ]);
          // });
          // await queryBar.setQuery('');
          // await queryBar.submitQuery();
        });

        it('Applies dashboard filters to range slider control', async () => {
          // await filterBar.addFilter('sound.keyword', 'is one of', ['bark', 'bow ow ow', 'ruff']);
          // await dashboard.waitForRenderComplete();
          // await header.waitUntilLoadingHasFinished();
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await retry.try(async () => {
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(3);
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptions()).to.eql([
          //     'ruff',
          //     'bark',
          //     'bow ow ow',
          //   ]);
          // });
        });

        it('Does not apply disabled dashboard filters to range slider control', async () => {
          // await filterBar.toggleFilterEnabled('sound.keyword');
          // await dashboard.waitForRenderComplete();
          // await header.waitUntilLoadingHasFinished();
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await retry.try(async () => {
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(8);
          // });
          // await filterBar.toggleFilterEnabled('sound.keyword');
          // await dashboard.waitForRenderComplete();
          // await header.waitUntilLoadingHasFinished();
        });

        it('Negated filters apply to range slider control', async () => {
          // await filterBar.toggleFilterNegated('sound.keyword');
          // await dashboard.waitForRenderComplete();
          // await header.waitUntilLoadingHasFinished();
          // await dashboardControls.optionsListOpenPopover(controlId);
          // await retry.try(async () => {
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptionsCount()).to.be(5);
          //   expect(await dashboardControls.optionsListPopoverGetAvailableOptions()).to.eql([
          //     'hiss',
          //     'grrr',
          //     'meow',
          //     'growl',
          //     'grr',
          //   ]);
          // });
        });
      });

      describe('Selections made in control apply to dashboard', async () => {
        after(async () => {
          await dashboardControls.optionsListOpenPopover(controlId);
          await dashboardControls.optionsListPopoverClearSelections();
          await dashboardControls.optionsListEnsurePopoverIsClosed(controlId);
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
