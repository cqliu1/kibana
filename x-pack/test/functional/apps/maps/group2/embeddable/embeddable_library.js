/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export default function ({ getPageObjects, getService }) {
  const find = getService('find');
  const testSubjects = getService('testSubjects');
  const { dashboard, header, maps, visualize } = getPageObjects([
    'dashboard',
    'header',
    'maps',
    'visualize',
  ]);
  const kibanaServer = getService('kibanaServer');
  const security = getService('security');
  const dashboardAddPanel = getService('dashboardAddPanel');
  const dashboardPanelActions = getService('dashboardPanelActions');
  const mapTitle = 'embeddable library map';

  describe('maps in embeddable library', () => {
    before(async () => {
      await security.testUser.setRoles(
        [
          'test_logstash_reader',
          'global_maps_all',
          'geoshape_data_reader',
          'global_dashboard_all',
          'meta_for_geoshape_data_reader',
        ],
        { skipBrowserRefresh: true }
      );
      await kibanaServer.uiSettings.replace({
        defaultIndex: 'c698b940-e149-11e8-a35a-370a8516603a',
      });
      await dashboard.navigateToApp();
      await dashboard.clickNewDashboard();
      await dashboardAddPanel.clickEditorMenuButton();
      await visualize.clickMapsApp();
      await header.waitUntilLoadingHasFinished();
      await maps.waitForLayersToLoad();
      await maps.clickSaveAndReturnButton();
      await dashboard.waitForRenderComplete();
    });

    after(async () => {
      await security.testUser.restoreDefaults();
    });

    it('save map panel to embeddable library', async () => {
      await dashboardPanelActions.saveToLibrary(mapTitle);
      await testSubjects.existOrFail('addPanelToLibrarySuccess');
      await dashboardPanelActions.expectInLibrary(mapTitle);
    });

    it('unlink map panel from embeddable library', async () => {
      await dashboardPanelActions.unlinkFromLibraryByTitle(mapTitle);
      await testSubjects.existOrFail('unlinkPanelSuccess');
      await dashboardPanelActions.expectNotInLibrary(mapTitle);

      await dashboardAddPanel.clickOpenAddPanel();
      await dashboardAddPanel.filterEmbeddableNames(mapTitle);
      await find.existsByLinkText(mapTitle);
      await dashboardAddPanel.closeAddPanel();
    });
  });
}
