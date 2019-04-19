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
  EuiModalFooter,
  EuiOverlayMask,
  EuiFormRow,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiSpacer,
  EuiTextArea,
  EuiText,
  EuiTitle,
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

const MAX_NAME_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 100;

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
          className={`canvasCustomElementModal`}
          maxWidth={700}
          onClose={onCancel}
          initialFocus=".canvasCustomElementForm__name"
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h3>{title}</h3>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexStart">
              <EuiFlexItem className="canvasCustomElementForm" grow={2}>
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
                    rows={2}
                    onChange={e =>
                      e.target.value.length <= MAX_DESCRIPTION_LENGTH &&
                      this._handleChange('description', e.target.value)
                    }
                  />
                </EuiFormRow>
                <EuiFormRow className="canvasCustomElementForm__thumbnail" label="Thumbnail image" compressed>
                  <EuiFilePicker
                    initialPromptText="Select or drag and drop an image"
                    onChange={this._handleUpload}
                    className="canvasImageUpload"
                    accept="image/*"
                  />
                </EuiFormRow>
                <EuiText className="canvasCustomElementForm__thumbnailHelp" size="xs">
                  <p>Take a screenshot of your element and upload it here. This can also be done after saving.</p>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem className="canvasElementCard canvasCustomElementForm__preview" grow={1}>
                <EuiTitle size="xxxs">
                  <h4>Element preview</h4>
                </EuiTitle>
                <EuiSpacer size="s" />
                <EuiCard
                  textAlign="left"
                  image={image || null}
                  icon={image ? null : <EuiIcon type="canvasApp" size="xxl" />}
                  title={name}
                  description={description}
                  className={image ? 'canvasCard' : 'canvasCard canvasCard--hasIcon'}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty onClick={onCancel}>Cancel</EuiButtonEmpty>
              </EuiFlexItem>
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
            </EuiFlexGroup>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
