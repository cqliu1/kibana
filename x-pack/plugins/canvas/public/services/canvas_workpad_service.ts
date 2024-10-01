/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ResolvedSimpleSavedObject, SavedObject } from '@kbn/core/public';
import {
  API_ROUTE_SHAREABLE_ZIP,
  API_ROUTE_TEMPLATES,
  API_ROUTE_WORKPAD,
  API_ROUTE_WORKPAD_ASSETS,
  API_ROUTE_WORKPAD_STRUCTURES,
  DEFAULT_WORKPAD_CSS,
} from '../../common/lib';
import type { CanvasRenderedWorkpad } from '../../shareable_runtime/types';
import { CanvasTemplate, CanvasWorkpad } from '../../types';
import { coreServices } from './kibana_services';

export type FoundWorkpads = Array<Pick<CanvasWorkpad, 'name' | 'id' | '@timestamp' | '@created'>>;
export type FoundWorkpad = FoundWorkpads[number];
export interface WorkpadFindResponse {
  total: number;
  workpads: FoundWorkpads;
}

export interface TemplateFindResponse {
  templates: CanvasTemplate[];
}

export interface ResolveWorkpadResponse {
  workpad: CanvasWorkpad;
  outcome: ResolvedSimpleSavedObject['outcome'];
  aliasId?: ResolvedSimpleSavedObject['alias_target_id'];
  aliasPurpose?: ResolvedSimpleSavedObject['alias_purpose'];
}

export interface CanvasWorkpadService {
  get: (id: string) => Promise<CanvasWorkpad>;
  resolve: (id: string) => Promise<ResolveWorkpadResponse>;
  create: (workpad: CanvasWorkpad) => Promise<CanvasWorkpad>;
  import: (workpad: CanvasWorkpad) => Promise<CanvasWorkpad>;
  createFromTemplate: (templateId: string) => Promise<CanvasWorkpad>;
  find: (term: string) => Promise<WorkpadFindResponse>;
  remove: (id: string) => Promise<void>;
  findTemplates: () => Promise<TemplateFindResponse>;
  update: (id: string, workpad: CanvasWorkpad) => Promise<void>;
  updateWorkpad: (id: string, workpad: CanvasWorkpad) => Promise<void>;
  updateAssets: (id: string, assets: CanvasWorkpad['assets']) => Promise<void>;
  getRuntimeZip: (workpad: CanvasRenderedWorkpad) => Promise<Blob>;
}

/*
  Remove any top level keys from the workpad which will be rejected by validation
*/
const validKeys = [
  '@created',
  '@timestamp',
  'assets',
  'colors',
  'css',
  'variables',
  'height',
  'id',
  'isWriteable',
  'name',
  'page',
  'pages',
  'width',
];

const sanitizeWorkpad = function (workpad: CanvasWorkpad) {
  const workpadKeys = Object.keys(workpad);

  for (const key of workpadKeys) {
    if (!validKeys.includes(key)) {
      delete (workpad as { [key: string]: any })[key];
    }
  }

  return workpad;
};

export const getCanvasWorkpadService: () => CanvasWorkpadService = () => {
  const getApiPath = function () {
    return `${API_ROUTE_WORKPAD}`;
  };

  return {
    get: async (id: string) => {
      const workpad = await coreServices.http.get<any>(`${getApiPath()}/${id}`, { version: '1' });

      return { css: DEFAULT_WORKPAD_CSS, variables: [], ...workpad };
    },
    export: async (id: string) => {
      const workpad = await coreServices.http.get<SavedObject<CanvasWorkpad>>(
        `${getApiPath()}/export/${id}`,
        { version: '1' }
      );
      const { attributes } = workpad;

      return {
        ...workpad,
        attributes: {
          ...attributes,
          css: attributes.css ?? DEFAULT_WORKPAD_CSS,
          variables: attributes.variables ?? [],
        },
      };
    },
    resolve: async (id: string) => {
      const { workpad, ...resolveProps } = await coreServices.http.get<ResolveWorkpadResponse>(
        `${getApiPath()}/resolve/${id}`,
        { version: '1' }
      );

      return {
        ...resolveProps,
        workpad: {
          // @ts-ignore: Shimming legacy workpads that might not have CSS
          css: DEFAULT_WORKPAD_CSS,
          // @ts-ignore: Shimming legacy workpads that might not have variables
          variables: [],
          ...workpad,
        },
      };
    },
    create: (workpad: CanvasWorkpad) => {
      return coreServices.http.post(getApiPath(), {
        body: JSON.stringify({
          ...sanitizeWorkpad({ ...workpad }),
          assets: workpad.assets || {},
          variables: workpad.variables || [],
        }),
        version: '1',
      });
    },
    import: (workpad: CanvasWorkpad) =>
      coreServices.http.post(`${getApiPath()}/import`, {
        body: JSON.stringify({
          ...sanitizeWorkpad({ ...workpad }),
          assets: workpad.assets || {},
          variables: workpad.variables || [],
        }),
        version: '1',
      }),
    createFromTemplate: (templateId: string) => {
      return coreServices.http.post(getApiPath(), {
        body: JSON.stringify({ templateId }),
        version: '1',
      });
    },
    findTemplates: async () => coreServices.http.get(API_ROUTE_TEMPLATES, { version: '1' }),
    find: (searchTerm: string) => {
      // TODO: this shouldn't be necessary.  Check for usage.
      const validSearchTerm = typeof searchTerm === 'string' && searchTerm.length > 0;

      return coreServices.http.get(`${getApiPath()}/find`, {
        query: {
          perPage: 10000,
          name: validSearchTerm ? searchTerm : '',
        },
        version: '1',
      });
    },
    remove: (id: string) => {
      return coreServices.http.delete(`${getApiPath()}/${id}`, { version: '1' });
    },
    update: (id, workpad) => {
      return coreServices.http.put(`${getApiPath()}/${id}`, {
        body: JSON.stringify({ ...sanitizeWorkpad({ ...workpad }) }),
        version: '1',
      });
    },
    updateWorkpad: (id, workpad) => {
      return coreServices.http.put(`${API_ROUTE_WORKPAD_STRUCTURES}/${id}`, {
        body: JSON.stringify({ ...sanitizeWorkpad({ ...workpad }) }),
        version: '1',
      });
    },
    updateAssets: (id, assets) => {
      return coreServices.http.put(`${API_ROUTE_WORKPAD_ASSETS}/${id}`, {
        body: JSON.stringify(assets),
        version: '1',
      });
    },
    getRuntimeZip: (workpad) => {
      return coreServices.http.post<Blob>(API_ROUTE_SHAREABLE_ZIP, {
        body: JSON.stringify(workpad),
        version: '1',
      });
    },
  };
};
