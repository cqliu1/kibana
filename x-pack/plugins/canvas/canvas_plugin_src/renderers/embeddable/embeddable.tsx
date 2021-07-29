/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { CoreStart } from '../../../../../../src/core/public';
import { StartDeps } from '../../plugin';
import {
  IEmbeddable,
  EmbeddableFactory,
  EmbeddableFactoryNotFoundError,
} from '../../../../../../src/plugins/embeddable/public';
import { EmbeddableExpression } from '../../expression_types/embeddable';
import { RendererStrings } from '../../../i18n';
import { embeddableInputToExpression } from './embeddable_input_to_expression';
import { EmbeddableInput } from '../../expression_types';
import { RendererFactory } from '../../../types';
import { CANVAS_EMBEDDABLE_CLASSNAME } from '../../../common/lib';

const { embeddable: strings } = RendererStrings;

const embeddablesRegistry: {
  [key: string]: IEmbeddable | Promise<IEmbeddable>;
} = {};

let destroyFn: () => void;

const encode = (input: EmbeddableInput) => btoa(JSON.stringify(input));
const decode = (serializedInput: string) => JSON.parse(atob(serializedInput));

const renderEmbeddableFactory = (core: CoreStart, plugins: StartDeps) => {
  const I18nContext = core.i18n.Context;

  return (embeddableObject: IEmbeddable) => {
    return (
      <div
        className={CANVAS_EMBEDDABLE_CLASSNAME}
        style={{ width: '100%', height: '100%', cursor: 'auto' }}
      >
        <I18nContext>
          <plugins.embeddable.EmbeddablePanel embeddable={embeddableObject} />
        </I18nContext>
      </div>
    );
  };
};

export const embeddableRendererFactory = (
  core: CoreStart,
  plugins: StartDeps
): RendererFactory<EmbeddableExpression<EmbeddableInput>> => {
  const renderEmbeddable = renderEmbeddableFactory(core, plugins);
  return () => ({
    name: 'embeddable',
    displayName: strings.getDisplayName(),
    help: strings.getHelpDescription(),
    reuseDomNode: true,
    render: async (domNode, { input, embeddableType }, handlers) => {
      const isByValueEnabled = plugins.presentationUtil.labsService.isProjectEnabled(
        'labs:canvas:byValueEmbeddable'
      );

      const uniqueId = handlers.getElementId();
      const serializedInput = handlers.getInput();

      const embeddableInput =
        isByValueEnabled && serializedInput !== ''
          ? { ...decode(serializedInput), ...input }
          : input;

      if (!embeddablesRegistry[uniqueId]) {
        const factory = Array.from(plugins.embeddable.getEmbeddableFactories()).find(
          (embeddableFactory) => embeddableFactory.type === embeddableType
        ) as EmbeddableFactory<EmbeddableInput>;

        if (!factory) {
          handlers.done();
          throw new EmbeddableFactoryNotFoundError(embeddableType);
        }

        const embeddablePromise = factory
          .createFromSavedObject(input.id, embeddableInput)
          .then((embeddable) => {
            embeddablesRegistry[uniqueId] = embeddable;
            return embeddable;
          });
        embeddablesRegistry[uniqueId] = embeddablePromise;

        const embeddableObject = await (async () => embeddablePromise)();

        const palettes = await plugins.charts.palettes.getPalettes();

        embeddablesRegistry[uniqueId] = embeddableObject;
        ReactDOM.unmountComponentAtNode(domNode);

        const subscription = embeddableObject.getInput$().subscribe(function (updatedInput) {
          const updatedExpression = embeddableInputToExpression(
            updatedInput,
            embeddableType,
            palettes,
            isByValueEnabled
          );

          if (isByValueEnabled) {
            handlers.setInput(encode(updatedInput));
          }

          if (updatedExpression) {
            handlers.onEmbeddableInputChange(updatedExpression);
          }
        });

        ReactDOM.render(renderEmbeddable(embeddableObject), domNode, () => handlers.done());

        destroyFn = () => {
          subscription.unsubscribe();
          handlers.onEmbeddableDestroyed();

          delete embeddablesRegistry[uniqueId];

          return ReactDOM.unmountComponentAtNode(domNode);
        };
      } else {
        const embeddable = embeddablesRegistry[uniqueId];

        if ('updateInput' in embeddable) {
          embeddable.updateInput(input);
          embeddable.reload();
        }
      }

      if (destroyFn) {
        handlers.onDestroy(destroyFn);
      }
    },
  });
};
