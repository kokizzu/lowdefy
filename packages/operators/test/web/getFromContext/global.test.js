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

/* eslint-disable max-classes-per-file */
import WebParser from '../../../src/webParser';
import { operators } from '../../testContext';

const lowdefy = {
  inputs: {
    own: {
      string: 'input',
      arr: [{ a: 'input1' }, { a: 'input2' }],
    },
    other: {
      string: 'input-other',
      arr: [{ a: 'input1-other' }, { a: 'input2-other' }],
    },
  },
  lowdefyGlobal: {
    string: 'global',
    arr: [{ a: 'global1' }, { a: 'global2' }],
  },
  menus: [
    {
      menuId: 'default',
    },
    {
      menuId: 'm_1',
    },
    {
      menuId: 'm_2',
    },
  ],
  urlQuery: {
    string: 'urlQuery',
    arr: [{ a: 'urlQuery1' }, { a: 'urlQuery2' }],
  },
};

const context = {
  id: 'own',
  config: {
    string: 'config',
    arr: [{ a: 'config1' }, { a: 'config2' }],
  },
  requests: {
    not_loaded: { loading: true, response: 'fail' },
    string: { loading: false, response: 'request String' },
    number: { loading: false, response: 500 },
    arr: { loading: false, response: [{ a: 'request a1' }, { a: 'request a2' }] },
  },
  lowdefy,
  state: {
    string: 'state',
    arr: [{ a: 'state1' }, { a: 'state2' }],
  },
  updateListeners: new Set(),
  operators,
};

const otherContext = {
  id: 'other',
  config: {
    string: 'config',
    arr: [{ a: 'config1' }, { a: 'config2' }],
  },
  requests: {
    not_loaded: { loading: true, response: 'fail-other' },
    string: { loading: false, response: 'request String-other' },
    number: { loading: false, response: 600 },
    arr: { loading: false, response: [{ a: 'request a1-other' }, { a: 'request a2-other' }] },
  },
  lowdefy,
  state: {
    string: 'state-other',
    arr: [{ a: 'state1-other' }, { a: 'state2-other' }],
  },
  updateListeners: new Set(),
  operators,
};

const contexts = {
  own: context,
  other: otherContext,
};

const arrayIndices = [1];

console.error = () => {};

test('_global, other context contextId not a string', async () => {
  const input = { _global: { key: 'string', contextId: 1 } };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toBe(null);
  expect(res.errors).toMatchInlineSnapshot(`
    Array [
      [Error: Operator Error: _global.contextId must be of type string. Received: {"key":"string","contextId":1} at locationId.],
    ]
  `);
});

test('_global, other context contextId not found', async () => {
  const input = { _global: { key: 'string', contextId: 'not_there' } };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toBe(null);
  expect(res.errors).toMatchInlineSnapshot(`
    Array [
      [Error: Operator Error: Context not_there not found. Received: {"key":"string","contextId":"not_there"} at locationId.],
    ]
  `);
});

test('_global param object key', async () => {
  const input = {
    _global: {
      key: 'string',
      contextId: 'other',
    },
  };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toEqual('global');
  expect(res.errors).toMatchInlineSnapshot(`Array []`);
});

test('_global full state', async () => {
  const input = { _global: { contextId: 'other' } };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toEqual({
    string: 'global',
    arr: [{ a: 'global1' }, { a: 'global2' }],
  });
  expect(res.errors).toMatchInlineSnapshot(`Array []`);
});

test('_global replace key arrayIndices', async () => {
  const input = { a: { _global: { key: 'arr.$.a', contextId: 'other' } } };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toEqual({
    a: 'global2',
  });
  expect(res.errors).toMatchInlineSnapshot(`Array []`);
});

test('_global param object all', async () => {
  const input = {
    _global: {
      all: true,
      contextId: 'other',
    },
  };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toEqual({
    string: 'global',
    arr: [{ a: 'global1' }, { a: 'global2' }],
  });
  expect(res.errors).toMatchInlineSnapshot(`Array []`);
});

test('_global param object all and key', async () => {
  const input = {
    _global: {
      all: true,
      key: 'string',
      contextId: 'other',
    },
  };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toEqual({
    string: 'global',
    arr: [{ a: 'global1' }, { a: 'global2' }],
  });
  expect(res.errors).toMatchInlineSnapshot(`Array []`);
});

test('_global param object with string default', async () => {
  const input = {
    _global: {
      key: 'notFound',
      default: 'defaultValue',
      contextId: 'other',
    },
  };
  const parser = new WebParser({ context, contexts });
  await parser.init();
  const res = parser.parse({ input, location: 'locationId', arrayIndices });
  expect(res.output).toEqual('defaultValue');
  expect(res.errors).toMatchInlineSnapshot(`Array []`);
});
