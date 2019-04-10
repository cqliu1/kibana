/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/forbid-elements */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiModal,
  EuiModalBody,
  EuiOverlayMask,
  EuiFormRow,
  EuiTitle,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiButton,
  EuiButtonEmpty,
  EuiTextArea,
} from '@elastic/eui';

const MAX_NAME_LENGTH = 25;
const MAX_DESCRIPTION_LENGTH = 70;

export class CustomElementModal extends Component {
  state = {
    name: '',
    description: '',
  };

  handleChange = (type, value) => {
    this.setState({ [type]: value });
  };

  handleSave = () => {
    const { onSave } = this.props;
    const { name, description } = this.state;
    onSave && onSave(name, description);
  };

  handleClose = ev => {
    const { onClose } = this.props;
    onClose && onClose(ev);
  };

  render() {
    const { isOpen, className, onSave, onClose, ...rest } = this.props;
    const { name, description } = this.state;

    // render nothing if this component isn't open
    if (!isOpen) {
      return null;
    }

    return (
      <EuiOverlayMask>
        <EuiModal
          {...rest}
          className={`canvasCustomElementModal canvasModal--fixedSize ${className || ''}`}
          maxWidth="1000px"
          onClose={onClose}
        >
          <EuiModalBody>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h3>Create new element</h3>
                </EuiTitle>
                <EuiFormRow
                  label="Name"
                  helpText={`${MAX_NAME_LENGTH - name.length} characters remaining`}
                >
                  <EuiFieldText
                    value={name}
                    onChange={e =>
                      e.target.value.length <= MAX_NAME_LENGTH &&
                      this.handleChange('name', e.target.value)
                    }
                  />
                </EuiFormRow>
                <EuiFormRow
                  label="Description"
                  helpText={`${MAX_DESCRIPTION_LENGTH - description.length} characters remaining`}
                >
                  <EuiTextArea
                    value={description}
                    onChange={e =>
                      e.target.value.length <= MAX_DESCRIPTION_LENGTH &&
                      this.handleChange('description', e.target.value)
                    }
                  />
                </EuiFormRow>
                <EuiFormRow>
                  <EuiFlexGroup>
                    <EuiFlexItem grow={false}>
                      <EuiButton fill onClick={() => onSave(name, description)}>
                        Save
                      </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  image={null}
                  title={name}
                  description={description}
                  className="canvasCard"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiModalBody>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}

CustomElementModal.propTypes = {
  isOpen: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CustomElementModal.defaultProps = {};
