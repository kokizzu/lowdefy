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

import testContext from '../testContext';

const pageId = 'one';

const lowdefy = {
  auth: {
    login: jest.fn(),
  },
  pageId,
};

const RealDate = Date;
const mockDate = jest.fn(() => ({ date: 0 }));
mockDate.now = jest.fn(() => 0);

beforeEach(() => {
  global.Date = mockDate;
  lowdefy.auth.login.mockReset();
});

afterAll(() => {
  global.Date = RealDate;
});

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

test('Wait', async () => {
  const rootBlock = {
    blockId: 'root',
    meta: {
      category: 'context',
    },
    areas: {
      content: {
        blocks: [
          {
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'Wait',
                  params: { ms: 500 },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
  });
  const { button } = context.RootBlocks.map;
  let resolved = false;
  button.triggerEvent({ name: 'onClick' }).then(() => {
    resolved = true;
  });
  expect(resolved).toBe(false);
  await timeout(100);
  expect(resolved).toBe(false);
  await timeout(300);
  expect(resolved).toBe(false);
  await timeout(150);
  expect(resolved).toBe(true);
});

test('Wait ms not a integer', async () => {
  const rootBlock = {
    blockId: 'root',
    meta: {
      category: 'context',
    },
    areas: {
      content: {
        blocks: [
          {
            blockId: 'button',
            type: 'Button',
            meta: {
              category: 'display',
              valueType: 'string',
            },
            events: {
              onClick: [
                {
                  id: 'a',
                  type: 'Wait',
                  params: { ms: 1.1 },
                },
              ],
            },
          },
        ],
      },
    },
  };
  const context = await testContext({
    lowdefy,
    rootBlock,
  });
  const { button } = context.RootBlocks.map;
  const res = await button.triggerEvent({ name: 'onClick' });
  expect(res).toEqual({
    blockId: 'button',
    endTimestamp: { date: 0 },
    error: {
      action: { id: 'a', params: { ms: 1.1 }, type: 'Wait' },
      error: {
        error: new Error('Wait action "ms" param should be an integer.'),
        index: 0,
        type: 'Wait',
      },
    },
    event: undefined,
    eventName: 'onClick',
    responses: {
      a: {
        error: new Error('Wait action "ms" param should be an integer.'),
        index: 0,
        type: 'Wait',
      },
    },
    startTimestamp: { date: 0 },
    success: false,
  });
});
