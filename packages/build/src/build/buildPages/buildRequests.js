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

function buildRequest({ request, blockContext }) {
  if (!type.isString(request.id)) {
    if (type.isUndefined(request.id)) {
      throw new Error(`Request id missing at page "${blockContext.pageId}".`);
    }
    throw new Error(
      `Request id is not a string at page "${blockContext.pageId}". Received ${JSON.stringify(
        request.id
      )}.`
    );
  }
  if (request.id.includes('.')) {
    throw new Error(`Request id "${request.id}" should not include a period (".").`);
  }

  request.auth = blockContext.auth;
  request.requestId = request.id;
  request.contextId = blockContext.contextId;
  request.id = `request:${blockContext.pageId}:${blockContext.contextId}:${request.id}`;
  blockContext.requests.push(request);
}

function buildRequests(block, blockContext) {
  if (!type.isNone(block.requests)) {
    if (!type.isArray(block.requests)) {
      throw new Error(
        `Requests is not an array at ${block.blockId} on page ${
          blockContext.pageId
        }. Received ${JSON.stringify(block.requests)}`
      );
    }
    block.requests.forEach((request) => {
      buildRequest({ request, blockContext });
    });
    delete block.requests;
  }
}

export default buildRequests;
