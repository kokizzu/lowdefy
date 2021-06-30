/*
  Copyright 2020-2021 Lowdefy, Inc

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

import { type } from '@lowdefy/helpers';

async function Validate({ context, params }) {
  if (!type.isNone(params) && !type.isString(params) && !type.isArray(params)) {
    throw new Error('Invalid validate params.');
  }
  context.showValidationErrors = true;
  let validationErrors = context.RootBlocks.validate();
  if (params) {
    const blockIds = type.isString(params) ? [params] : params;
    validationErrors = validationErrors.filter((block) => {
      return blockIds.includes(block.blockId);
    });
  }
  if (validationErrors.length > 0) {
    const message = `Your input has ${validationErrors.length} validation error${
      validationErrors.length !== 1 ? 's' : ''
    }.`;
    const error = new Error(message);
    throw error;
  }
}

export default Validate;
