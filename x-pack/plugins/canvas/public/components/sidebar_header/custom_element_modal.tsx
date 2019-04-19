/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/forbid-elements */
import React, { PureComponent } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import {
  EuiModal,
  EuiModalBody,
  EuiOverlayMask,
  EuiFormRow,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiTextArea,
  EuiModalHeaderTitle,
  EuiModalHeader,
  EuiIcon,
  // @ts-ignore EuiCard is an exported member of @elastic/eui
  EuiCard,
  // @ts-ignore EuiFilePicker is an exported member of @elastic/eui
  EuiFilePicker,
} from '@elastic/eui';
import { VALID_IMAGE_TYPES } from '../../../common/lib/constants';
import { encode } from '../../../common/lib/dataurl';

const MAX_NAME_LENGTH = 25;
const MAX_DESCRIPTION_LENGTH = 70;

export interface Props {
  /**
   * name of the custom element
   */
  name?: string;
  /**
   * description of the custom element
   */
  description?: string;
  /**
   * preview image of the custom element as a base64 dataurl
   */
  image?: string;
  /**
   * title of the modal
   */
  title: string;
  /**
   * A click handler for the save button
   */
  onSave: (name: string, description?: string, image?: string) => void;
  /**
   * A click handler for the cancel button
   */
  onCancel: () => void;
}

export class CustomElementModal extends PureComponent<Props> {
  public static propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  public state = {
    name: this.props.name || '',
    description: this.props.description || '',
    image: this.props.image || '',
  };

  private _handleChange = (type: string, value: string) => {
    this.setState({ [type]: value });
  };

  private _handleUpload = (files: File[]) => {
    const [file] = files;
    const [type, subtype] = get(file, 'type', '').split('/');
    if (type === 'image' && VALID_IMAGE_TYPES.indexOf(subtype) >= 0) {
      encode(file).then((dataurl: string) => this._handleChange('image', dataurl));
    }
  };

  public render() {
    const { onSave, onCancel, title, ...rest } = this.props;
    const { name, description, image } = this.state;

    return (
      <EuiOverlayMask>
        <EuiModal
          {...rest}
          className={`canvasCustomElementModal canvasModal--fixedSize`}
          maxWidth="1000px"
          onClose={onCancel}
          initialFocus=".canvasCustomElementForm__name"
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h3>{title}</h3>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFormRow
                  label="Name"
                  helpText={`${MAX_NAME_LENGTH - name.length} characters remaining`}
                  compressed
                >
                  <EuiFieldText
                    value={name}
                    className="canvasCustomElementForm__name"
                    onChange={e =>
                      e.target.value.length <= MAX_NAME_LENGTH &&
                      this._handleChange('name', e.target.value)
                    }
                    required
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
                      this._handleChange('description', e.target.value)
                    }
                  />
                </EuiFormRow>
                <EuiFormRow label="Description" compressed>
                  <EuiFilePicker
                    initialPromptText="Select or drag and drop an image"
                    onChange={this._handleUpload}
                    className="canvasImageUpload"
                    accept="image/*"
                  />
                </EuiFormRow>
                <EuiFormRow>
                  <EuiFlexGroup>
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        fill
                        onClick={() => {
                          onSave(name, description, image);
                          onCancel();
                        }}
                      >
                        Save
                      </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty onClick={onCancel}>Cancel</EuiButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCard
                  textAlign="left"
                  image={image || null}
                  icon={image ? null : <EuiIcon type="canvasApp" size="xxl" />}
                  title={name}
                  description={description}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiModalBody>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
