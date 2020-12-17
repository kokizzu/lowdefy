/*
  Copyright 2020 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import React from 'react';
import { Typography } from 'antd';
import { blockDefaultProps } from '@lowdefy/block-tools';
import { type } from '@lowdefy/helpers';

import Icon from '../Icon/Icon';

const Title = Typography.Title;

const TitleBlock = ({ blockId, properties, methods }) => (
  <Title
    id={blockId}
    className={methods.makeCssClass([
      properties.color && { color: `${properties.color} !important` },
      properties.style,
    ])}
    code={properties.code}
    copyable={
      type.isObject(properties.copyable)
        ? {
            text: properties.copyable.text,
            onCopy: () => {
              methods.callAction({
                action: 'onCopy',
                args: { value: properties.copyable.text },
              });
            },
            icon:
              properties.copyable.icon &&
              (type.isArray(properties.copyable.icon) ? (
                [
                  <Icon
                    key="copy-icon"
                    blockId={`${blockId}_copyable_before_icon`}
                    methods={methods}
                    properties={properties.copyable.icon[0]}
                  />,
                  <Icon
                    key="copied-icon"
                    blockId={`${blockId}_copyable_after_icon`}
                    methods={methods}
                    properties={properties.copyable.icon[1]}
                  />,
                ]
              ) : (
                <Icon
                  blockId={`${blockId}_copyable_icon`}
                  methods={methods}
                  properties={properties.copyable.icon}
                />
              )),
            tooltips: properties.copyable.tooltips,
          }
        : properties.copyable
    }
    delete={properties.delete}
    disabled={properties.disabled}
    ellipsis={
      type.isObject(properties.ellipsis)
        ? {
            rows: properties.ellipsis.rows,
            expandable: properties.ellipsis.expandable,
            suffix: properties.ellipsis.suffix,
            // FIX: not working, might be and antd issue.
            // symbol: properties.ellipsis.symbol && <span>{properties.ellipsis.symbol}</span>,
            // "symbol": {
            //   "type": "string",
            //   "description": "Custom ... symbol of ellipsis content."
            // }
            onExpand: (ellipsis) => {
              methods.callAction({
                action: 'onExpand',
                args: { ellipsis },
              });
            },
          }
        : properties.ellipsis
    }
    level={properties.level}
    mark={properties.mark}
    type={properties.type}
    underline={properties.underline}
  >
    {properties.content}
  </Title>
);

TitleBlock.defaultProps = blockDefaultProps;

export default TitleBlock;