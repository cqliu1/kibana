/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isEmpty, cloneDeep, has, merge } from 'lodash';
import { BaseWatch } from './base_watch';
import { WATCH_TYPES } from '../../../common/constants';
import { serializeJsonWatch } from '../../../common/lib/serialization';

export class JsonWatch extends BaseWatch {
  // This constructor should not be used directly.
  // JsonWatch objects should be instantiated using the
  // fromUpstreamJson and fromDownstreamJson static methods
  constructor(props) {
    super(props);

    this.watch = props.watch;
  }

  get watchJson() {
    return serializeJsonWatch(this.name, this.watch);
  }

  // To Kibana
  get downstreamJson() {
    const result = merge({}, super.downstreamJson, {
      watch: this.watch,
    });

    return result;
  }

  // From Elasticsearch
  static fromUpstreamJson(json, options) {
    const baseProps = super.getPropsFromUpstreamJson(json, options);
    const watch = cloneDeep(baseProps.watchJson);

    if (has(watch, 'metadata.name')) {
      delete watch.metadata.name;
    }
    if (has(watch, 'metadata.xpack')) {
      delete watch.metadata.xpack;
    }

    if (isEmpty(watch.metadata)) {
      delete watch.metadata;
    }

    const props = merge({}, baseProps, {
      type: WATCH_TYPES.JSON,
      watch,
    });

    return new JsonWatch(props);
  }

  // From Kibana
  static fromDownstreamJson(json) {
    const props = merge({}, super.getPropsFromDownstreamJson(json), {
      type: WATCH_TYPES.JSON,
      watch: json.watch,
    });

    return new JsonWatch(props);
  }
}
