/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export const DashboardConstants = {
  LANDING_PAGE_PATH: '/list',
  CREATE_NEW_DASHBOARD_URL: '/create',
  VIEW_DASHBOARD_URL: '/view',
  ADD_EMBEDDABLE_ID: 'addEmbeddableId',
  ADD_EMBEDDABLE_TYPE: 'addEmbeddableType',
  DASHBOARDS_ID: 'dashboards',
  DASHBOARD_ID: 'dashboard',
};

export function createDashboardEditUrl(id: string) {
  return `${DashboardConstants.VIEW_DASHBOARD_URL}/${id}`;
}

export function createDashboardListingFilterUrl(filter: string) {
  return filter
    ? `${DashboardConstants.LANDING_PAGE_PATH}?filter="${filter}"`
    : DashboardConstants.LANDING_PAGE_PATH;
}
