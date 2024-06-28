/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { i18n } from '@kbn/i18n';
// Prefer importing entire lodash library, e.g. import { get } from "lodash"
// eslint-disable-next-line no-restricted-imports
import isEmpty from 'lodash/isEmpty';

import { EuiForm, EuiButton, EuiPage, EuiPageBody, EuiPageSection, EuiSpacer } from '@elastic/eui';
import { EventInput } from '../event_input';
import { PatternInput } from '../pattern_input';
import { CustomPatternsInput } from '../custom_patterns_input';
import { EventOutput } from '../event_output';
import { GrokdebuggerRequest } from '../../models/grokdebugger_request';
import { withKibana } from '@kbn/kibana-react-plugin/public';
import { FormattedMessage } from '@kbn/i18n-react';
import { pasteText, useAppSelector } from '@elastic/help-center-host';

const i18nTexts = {
  simulate: {
    errorTitle: i18n.translate('xpack.grokDebugger.simulate.errorTitle', {
      defaultMessage: 'Simulate error',
    }),
    unknownErrorTitle: i18n.translate('xpack.grokDebugger.unknownErrorTitle', {
      defaultMessage: 'Something went wrong',
    }),
  },
};

export const GrokDebuggerComponent = (props) => {
  const [rawEvent, setRawEvent] = useState('');
  const [pattern, setPattern] = useState('');
  const [customPatterns, setCustomPatterns] = useState('');
  const [structuredEvent, setStructuredEvent] = useState({});
  const [grokdebuggerRequest] = useState(new GrokdebuggerRequest());

  const onRawEventChange = useCallback(
    (rawEvent) => {
      setRawEvent(rawEvent);
      grokdebuggerRequest.rawEvent = rawEvent.trimEnd();
    },
    [grokdebuggerRequest]
  );

  const onPatternChange = useCallback(
    (pattern) => {
      setPattern(pattern);
      grokdebuggerRequest.pattern = pattern.trimEnd();
    },
    [grokdebuggerRequest]
  );

  const onCustomPatternsChange = useCallback(
    (customPatterns) => {
      setCustomPatterns(customPatterns);
      customPatterns = customPatterns.trim();
      const customPatternsObj = {};

      if (!customPatterns) {
        grokdebuggerRequest.customPatterns = customPatternsObj;
        return;
      }

      customPatterns.split('\n').forEach((customPattern) => {
        // Patterns are defined like so:
        // patternName patternDefinition
        // For example:
        // POSTGRESQL %{DATESTAMP:timestamp} %{TZ} %{DATA:user_id} %{GREEDYDATA:connection_id} %{POSINT:pid}
        const [, patternName, patternDefinition] = customPattern.match(/(\S+)\s+(.+)/) || [];
        if (patternName && patternDefinition) {
          customPatternsObj[patternName] = patternDefinition;
        }
      });

      grokdebuggerRequest.customPatterns = customPatternsObj;
    },
    [grokdebuggerRequest]
  );

  const simulateGrok = useCallback(async () => {
    const notifications = props.kibana.services.notifications;
    try {
      const simulateResponse = await props.grokdebuggerService.simulate(grokdebuggerRequest);
      setStructuredEvent(simulateResponse.structuredEvent);

      if (!isEmpty(simulateResponse.error)) {
        notifications.toasts.addDanger({
          title: i18nTexts.simulate.errorTitle,
          text: simulateResponse.error,
        });
      }
    } catch (e) {
      notifications.toasts.addError(e, {
        title: i18nTexts.simulate.unknownErrorTitle,
      });
    }
  }, [grokdebuggerRequest, props.grokdebuggerService, props.kibana.services.notifications]);

  const onSimulateClick = useCallback(() => {
    setStructuredEvent({});
    simulateGrok();
  }, [simulateGrok]);

  const isSimulateDisabled = useCallback(() => {
    return rawEvent.trim() === '' || pattern.trim() === '';
  }, [pattern, rawEvent]);

  const paste = useAppSelector(pasteText.selectors.selectPasteText);

  useEffect(() => {
    if (paste?.text) {
      const { text, targetId } = paste;

      if (targetId === 'sample-data') {
        onRawEventChange(text);
      }
      if (targetId === 'grok-pattern') {
        onPatternChange(text);
      }
      if (targetId === 'custom-patterns') {
        onCustomPatternsChange(text);
      }
    }
  }, [onCustomPatternsChange, onPatternChange, onRawEventChange, paste]);

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageSection grow={true} color="plain">
          <EuiForm className="grokdebugger-container" data-test-subj="grokDebuggerContainer">
            <EventInput value={rawEvent} onChange={onRawEventChange} />
            <PatternInput value={pattern} onChange={onPatternChange} />
            <EuiSpacer />
            <CustomPatternsInput
              value={customPatterns}
              onChange={onCustomPatternsChange}
              isOpen={customPatterns.trim().length > 0}
            />
            <EuiSpacer />
            <EuiButton
              fill
              onClick={onSimulateClick}
              isDisabled={isSimulateDisabled()}
              data-test-subj="btnSimulate"
            >
              <FormattedMessage
                id="xpack.grokDebugger.simulateButtonLabel"
                defaultMessage="Simulate"
              />
            </EuiButton>
            <EuiSpacer />
            <EventOutput value={structuredEvent} />
          </EuiForm>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};

export const GrokDebugger = withKibana(GrokDebuggerComponent);
