/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFieldSearch,
  EuiCard,
  EuiFlexGroup,
  EuiFlexGrid,
  EuiFlexItem,
  EuiModalHeader,
  EuiModalBody,
  EuiTabbedContent,
  EuiEmptyPrompt,
  EuiSpacer,
} from '@elastic/eui';
import lowerCase from 'lodash.lowercase';
import { map, includes, sortBy } from 'lodash';

export class ElementTypes extends Component {
  static propTypes = {
    elements: PropTypes.object,
    addElement: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    search: PropTypes.string,
    setSearch: PropTypes.func,
  };

  componentDidMount() {
    // fetch custom elements
    this.props.findCustomElements();
  }

  _getElementCards = (elements, handleClick) => {
    const { search, onClose } = this.props;
    return map(elements, (element, name) => {
      const { help, displayName, image } = element;
      const whenClicked = () => {
        handleClick(element);
        onClose();
      };

      // Add back in icon={image} to this when Design has a full icon set
      const card = (
        <EuiFlexItem key={name}>
          <EuiCard
            textAlign="left"
            image={image}
            title={displayName}
            description={help}
            onClick={whenClicked}
            className="canvasCard"
          />
        </EuiFlexItem>
      );

      if (!search) {
        return card;
      }
      if (includes(lowerCase(name), search)) {
        return card;
      }
      if (includes(lowerCase(displayName), search)) {
        return card;
      }
      if (includes(lowerCase(help), search)) {
        return card;
      }
      return null;
    });
  };

  render() {
    const { setSearch, addElement, addCustomElement } = this.props;
    let { elements, search, customElements } = this.props;
    search = lowerCase(search);
    elements = sortBy(map(elements, (element, name) => ({ name, ...element })), 'displayName');
    const elementList = this._getElementCards(elements, addElement);

    let customElementContent = (
      // TODO: update copy
      <EuiEmptyPrompt
        iconType="vector"
        title={<h2>Add new elements</h2>}
        body={<p>Group and save workpad elements to create new elements</p>}
        titleSize="s"
      />
    );

    if (customElements.length) {
      customElements = sortBy(
        map(customElements, (element, name) => ({ name, ...element })),
        'name'
      );
      customElementContent = this._getElementCards(customElements, addCustomElement);
    }

    // TODO: make tab content scrollable and have tabs fixed at the top
    const tabs = [
      {
        id: 'elements',
        name: 'Elements',
        content: (
          <Fragment>
            <EuiSpacer />
            <EuiFlexGrid gutterSize="l" columns={4}>
              {elementList}
            </EuiFlexGrid>
          </Fragment>
        ),
      },
      {
        id: 'customElements',
        name: 'My elements',
        content: (
          <Fragment>
            <EuiSpacer />
            <EuiFlexGrid gutterSize="l" columns={4}>
              {customElementContent}
            </EuiFlexGrid>
          </Fragment>
        ),
      },
    ];

    return (
      <Fragment>
        <EuiModalHeader>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFieldSearch
                className="canvasElements__filter"
                placeholder="Filter elements"
                onChange={e => setSearch(e.target.value)}
                value={search}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
        </EuiModalBody>
      </Fragment>
    );
  }
}
