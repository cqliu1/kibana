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

import React from 'react';
import { Subscription } from 'rxjs';
import { PanelState, EmbeddableStart, ViewMode } from '../../../../../embeddable/public';
import { DashboardContainer, DashboardReactContextValue } from '../dashboard_container';
import { DashboardGrid } from '../grid';
import { context } from '../../../../../kibana_react/public';

export interface DashboardViewportProps {
  container: DashboardContainer;
  PanelComponent: EmbeddableStart['EmbeddablePanel'];
  renderEmpty?: () => React.ReactNode;
}

interface State {
  isFullScreenMode: boolean;
  useMargins: boolean;
  title: string;
  description?: string;
  panels: { [key: string]: PanelState };
  isEmbeddedExternally?: boolean;
}

export class DashboardViewport extends React.Component<DashboardViewportProps, State> {
  static contextType = context;

  public readonly context!: DashboardReactContextValue;
  private subscription?: Subscription;
  private mounted: boolean = false;
  constructor(props: DashboardViewportProps) {
    super(props);
    const {
      isFullScreenMode,
      panels,
      useMargins,
      title,
      isEmbeddedExternally,
    } = this.props.container.getInput();

    this.state = {
      isFullScreenMode,
      panels,
      useMargins,
      title,
      isEmbeddedExternally,
    };
  }

  public componentDidMount() {
    this.mounted = true;
    this.subscription = this.props.container.getInput$().subscribe(() => {
      const {
        isFullScreenMode,
        useMargins,
        title,
        description,
        isEmbeddedExternally,
      } = this.props.container.getInput();
      if (this.mounted) {
        this.setState({
          isFullScreenMode,
          description,
          useMargins,
          title,
          isEmbeddedExternally,
        });
      }
    });
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public onExitFullScreenMode = () => {
    this.props.container.updateInput({
      isFullScreenMode: false,
    });
  };

  private shouldRenderEmpty() {
    const container = this.props.container;
    const getShouldShowEditHelp = () =>
      container.getPanelCount() === 0 &&
      container.getInput().viewMode !== ViewMode.VIEW &&
      !container.getInput().dashboardCapabilities?.hideWriteControls;

    const getShouldShowViewHelp = () =>
      container.getPanelCount() === 0 &&
      container.getInput().viewMode === ViewMode.VIEW &&
      !container.getInput().dashboardCapabilities?.hideWriteControls;

    const shouldShowUnauthorizedEmptyState = () => {
      const readonlyMode =
        container.getPanelCount() === 0 &&
        !getShouldShowEditHelp() &&
        !getShouldShowViewHelp() &&
        container.getInput().dashboardCapabilities?.hideWriteControls;
      const userHasNoPermissions =
        container.getPanelCount() === 0 &&
        !container.getInput().dashboardCapabilities?.visualizeCapabilities.save &&
        !container.getInput().dashboardCapabilities?.mapsCapabilities.save;
      return readonlyMode || userHasNoPermissions;
    };

    const shouldShowEditHelp = getShouldShowEditHelp();
    const shouldShowViewHelp = getShouldShowViewHelp();
    const isEmptyInReadOnlyMode = shouldShowUnauthorizedEmptyState();
    return shouldShowEditHelp || shouldShowViewHelp || isEmptyInReadOnlyMode;
  }

  private renderEmptyScreen() {
    const { isEmbeddedExternally, isFullScreenMode } = this.state;
    return (
      <div className="dshDashboardEmptyScreen">
        {isFullScreenMode && (
          <this.context.services.ExitFullScreenButton
            onExitFullScreenMode={this.onExitFullScreenMode}
            toggleChrome={!isEmbeddedExternally}
          />
        )}
        {this.props.container.emptyScreen}
      </div>
    );
  }

  private renderContainerScreen() {
    const { container, PanelComponent } = this.props;
    const {
      isEmbeddedExternally,
      isFullScreenMode,
      panels,
      title,
      description,
      useMargins,
    } = this.state;
    return (
      <div
        data-shared-items-count={Object.values(panels).length}
        data-shared-items-container
        data-title={title}
        data-description={description}
        className={useMargins ? 'dshDashboardViewport-withMargins' : 'dshDashboardViewport'}
      >
        {isFullScreenMode && (
          <this.context.services.ExitFullScreenButton
            onExitFullScreenMode={this.onExitFullScreenMode}
            toggleChrome={!isEmbeddedExternally}
          />
        )}
        <DashboardGrid container={container} PanelComponent={PanelComponent} />
      </div>
    );
  }

  public render() {
    return (
      <React.Fragment>
        {this.shouldRenderEmpty() ? this.renderEmptyScreen() : this.renderContainerScreen()}
      </React.Fragment>
    );
  }
}
