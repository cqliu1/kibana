/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../../ftr_provider_context';

export default function canvasLensTest({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects(['canvas', 'common', 'header', 'lens']);
  const esArchiver = getService('esArchiver');
  const dashboardAddPanel = getService('dashboardAddPanel');
  const kibanaServer = getService('kibanaServer');
  const archives = {
    es: 'x-pack/test/functional/es_archives/canvas/logstash_lens',
    kbn: 'x-pack/test/functional/fixtures/kbn_archiver/canvas/lens',
  };

  describe('lens in canvas', function () {
    before(async () => {
      await esArchiver.load(archives.es);
      await kibanaServer.importExport.load(archives.kbn);
      // open canvas home
      await PageObjects.common.navigateToApp('canvas');
      // load test workpad
      await PageObjects.common.navigateToApp('canvas', {
        hash: '/workpad/workpad-1705f884-6224-47de-ba49-ca224fe6ec31/page/1',
      });
    });

    after(async () => {
      await esArchiver.unload(archives.es);
      await kibanaServer.importExport.unload(archives.kbn);
    });

    describe('by-reference', () => {
      it('renders lens visualization using savedLens expression', async () => {
        await PageObjects.header.waitUntilLoadingHasFinished();

        await PageObjects.lens.assertMetric('Maximum of bytes', '16,788');
      });

      it('adds existing visualize embeddable from the visualize library', async () => {
        await PageObjects.canvas.clickAddFromLibrary();
        await dashboardAddPanel.toggleFilter('lens');
      });

      it('edits visualize by-reference embeddable', async () => {});
    });

    describe('by-value', () => {
      it('creates new lens embeddable', () => {});

      it('edits lens by-value embeddable', () => {});
    });
  });
}
