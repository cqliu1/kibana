/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useRef, useEffect } from 'react';
import { Subject } from 'rxjs';

import { EuiResizeObserver } from '@elastic/eui';
import {
  ReactExpressionRenderer,
  ExpressionsInspectorAdapter,
} from '../../../../../../src/plugins/expressions/public';

import { Positionable } from '../positionable';
import { TransformMatrix3d } from '../../lib/aeroelastic';

export interface Props {
  expression?: string;
  transformMatrix: TransformMatrix3d;
  height: number;
  width: number;
}

const inspectorAdapters = {
  expression: new ExpressionsInspectorAdapter(),
};

const handleEvents = (event: any) => {
  console.log(event.id, event);
};

export const Element = ({ expression, transformMatrix, height, width }: Props) => {
  const reload = useRef(new Subject());

  useEffect(() => {
    reload.current.next();
  }, [height, width]);

  if (!expression) {
    return null;
  }

  return (
    <EuiResizeObserver onResize={() => reload.current.next()}>
      {(resizeRef) => (
        <Positionable
          ref={resizeRef}
          transformMatrix={transformMatrix}
          width={width}
          height={height}
        >
          <ReactExpressionRenderer
            expression={expression}
            onEvent={handleEvents}
            inspectorAdapters={inspectorAdapters}
            reload$={reload.current}
            renderError={(message: any, error) => {
              console.log(error);
              return <div>{message}</div>;
            }}
          />
        </Positionable>
      )}
    </EuiResizeObserver>
  );
};
