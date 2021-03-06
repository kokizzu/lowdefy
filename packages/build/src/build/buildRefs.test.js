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

import buildRefs from './buildRefs';
import testContext from '../test/testContext';

const configLoaderMockImplementation = (files) => {
  const mockImp = (filePath) => {
    const file = files.find((file) => file.path === filePath);
    if (!file) {
      return null;
    }
    return file.content;
  };
  return mockImp;
};

const mockConfigLoader = jest.fn();

const context = testContext({
  configLoader: {
    load: mockConfigLoader,
  },
});

test('buildRefs file not found', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        doesNotExist: { _ref: 'doesNotExist' },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  await expect(buildRefs({ context })).rejects.toThrow(
    'Tried to reference file with path "doesNotExist", but file does not exist.'
  );
});

test('buildRefs no refs', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        key: 'value',
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    key: 'value',
  });
});

test('buildRefs', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        jsonFile: { _ref: 'jsonFile.json' },
        twoLevels: { _ref: 'twoLevels.json' },
        vars: {
          _ref: {
            path: 'vars.json',
            vars: {
              var_1: 'var_1_value',
            },
          },
        },
      },
    },
    {
      path: 'jsonFile.json',
      content: {
        path: 'jsonFile.json',
      },
    },
    {
      path: 'twoLevels.json',
      content: {
        path: 'twoLevels.json',
        jsonFile: { _ref: 'jsonFile.json' },
      },
    },
    {
      path: 'vars.json',
      content: {
        path: 'vars.json',
        var1: {
          _var: 'var_1',
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    jsonFile: { path: 'jsonFile.json' },
    twoLevels: { path: 'twoLevels.json', jsonFile: { path: 'jsonFile.json' } },
    vars: { path: 'vars.json', var1: 'var_1_value' },
  });
});

test('buildRefs max recursion depth', async () => {
  const ctx = {
    ...context,
    MAX_RECURSION_DEPTH: 3,
  };
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        1: { _ref: 'maxRecursion1.json' },
      },
    },
    {
      path: 'maxRecursion1.json',
      content: {
        2: { _ref: 'maxRecursion2.json' },
      },
    },
    {
      path: 'maxRecursion2.json',
      content: {
        3: { _ref: 'maxRecursion3.json' },
      },
    },
    {
      path: 'maxRecursion3.json',
      content: {
        4: { _ref: 'maxRecursion4.json' },
      },
    },
    {
      path: 'maxRecursion4.json',
      content: {
        4: 'done',
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  await expect(buildRefs({ context: ctx })).rejects.toThrow();
  await expect(buildRefs({ context: ctx })).rejects.toThrow(
    'Maximum recursion depth of references exceeded. Only 3 consecutive references are allowed'
  );
});

test('load refs to text files', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        text: { _ref: 'text.txt' },
        html: { _ref: 'html.html' },
        md: { _ref: 'markdown.md' },
      },
    },
    {
      path: 'text.txt',
      content: `Some multiline
text.


Hello.`,
    },
    {
      path: 'html.html',
      content: `<h1>Heading</h1>
<p>Hello there</p>`,
    },
    {
      path: 'markdown.md',
      content: `### Title

Hello there`,
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    html: `<h1>Heading</h1>
<p>Hello there</p>`,
    md: `### Title

Hello there`,
    text: `Some multiline
text.


Hello.`,
  });
});

test('buildRefs should copy vars', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref: {
          _ref: {
            path: 'file.yaml',
            vars: {
              var1: {
                key: 'value',
              },
            },
          },
        },
      },
    },
    {
      path: 'file.yaml',
      content: {
        ref1: {
          _var: 'var1',
        },
        ref2: {
          _var: 'var1',
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref: {
      ref1: { key: 'value' },
      ref2: { key: 'value' },
    },
  });
  res.ref.ref1.key = 'newValue';
  expect(res).toEqual({
    ref: {
      ref1: { key: 'newValue' },
      ref2: { key: 'value' },
    },
  });
});

test('buildRefs null ref definition', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        invalid: { _ref: null },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  await expect(buildRefs({ context })).rejects.toThrow(
    'Invalid _ref definition {"_ref":null} in file lowdefy.yaml'
  );
});

test('buildRefs invalid ref definition', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        invalid: { _ref: 1 },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  await expect(buildRefs({ context })).rejects.toThrow(
    'Invalid _ref definition {"_ref":1} in file lowdefy.yaml'
  );
});

test('buildRefs invalid ref definition 2', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        invalid: { _ref: { a: 'b' } },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  await expect(buildRefs({ context })).rejects.toThrow(
    'Invalid _ref definition {"_ref":{"a":"b"}} in file lowdefy.yaml'
  );
});

test('buildRefs nunjucks text file', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        templated: {
          _ref: {
            path: 'template.njk',
            vars: {
              var_1: 'There',
            },
          },
        },
      },
    },
    {
      path: 'template.njk',
      content: 'Hello {{ var_1 }}',
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    templated: 'Hello There',
  });
});

test('buildRefs nunjucks json file', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        templated: {
          _ref: {
            path: 'template.json.njk',
            vars: {
              key: 'key1',
            },
          },
        },
      },
    },
    {
      path: 'template.json.njk',
      content: '{ "{{ key }}": true }',
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    templated: { key1: true },
  });
});

test('buildRefs nunjucks yaml file', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        templated: {
          _ref: {
            path: 'template.yaml.njk',
            vars: {
              values: ['value1', 'value2'],
            },
          },
        },
      },
    },
    {
      path: 'template.yaml.njk',
      content: `list:
{% for value in values %}
  - key: {{ value }}
{% endfor %}
      `,
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    templated: { list: [{ key: 'value1' }, { key: 'value2' }] },
  });
});

test('buildRefs nunjucks yml file', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        templated: {
          _ref: {
            path: 'template.yml.njk',
            vars: {
              values: ['value1', 'value2'],
            },
          },
        },
      },
    },
    {
      path: 'template.yml.njk',
      content: `list:
{% for value in values %}
  - key: {{ value }}
{% endfor %}
      `,
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    templated: { list: [{ key: 'value1' }, { key: 'value2' }] },
  });
});

test('buildRefs pass vars two levels', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref1: {
          _ref: {
            path: 'file1.yaml',
            vars: {
              var1: 'Hello',
            },
          },
        },
      },
    },
    {
      path: 'file1.yaml',
      content: {
        ref2: {
          _ref: {
            path: 'file2.yaml',
            vars: {
              var2: {
                _var: 'var1',
              },
            },
          },
        },
      },
    },
    {
      path: 'file2.yaml',
      content: {
        value: {
          _var: 'var2',
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref1: {
      ref2: {
        value: 'Hello',
      },
    },
  });
});

test('buildRefs use a ref in a var', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref1: {
          _ref: {
            path: 'file1.yaml',
            vars: {
              file2: {
                _ref: 'file2.md',
              },
            },
          },
        },
      },
    },
    {
      path: 'file1.yaml',
      content: {
        content: {
          _var: 'file2',
        },
      },
    },
    {
      path: 'file2.md',
      content: 'Hello',
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref1: {
      content: 'Hello',
    },
  });
});

test('buildRefs use a ref in var, with a var from parent as a var', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref1: {
          _ref: {
            path: 'file1.yaml',
            vars: {
              parent1: 1,
              parent2: 2,
            },
          },
        },
      },
    },
    {
      path: 'file1.yaml',
      content: {
        ref2: {
          _ref: {
            path: 'file2.yaml',
            vars: {
              var: {
                _var: 'parent1',
              },
              ref: {
                _ref: {
                  path: 'file3.yaml',
                  vars: {
                    var: {
                      _var: 'parent2',
                    },
                    const: 3,
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      path: 'file2.yaml',
      content: {
        value: {
          _var: 'var',
        },
        ref: {
          _var: 'ref',
        },
      },
    },
    {
      path: 'file3.yaml',
      content: {
        value: {
          _var: 'var',
        },
        const: {
          _var: 'const',
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref1: {
      ref2: {
        value: 1,
        ref: {
          value: 2,
          const: 3,
        },
      },
    },
  });
});

test('buildRefs var specified by name', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref: {
          _ref: {
            path: 'file.yaml',
            vars: {
              var1: 'value',
            },
          },
        },
      },
    },
    {
      path: 'file.yaml',
      content: {
        key: {
          _var: {
            name: 'var1',
          },
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref: {
      key: 'value',
    },
  });
});

test('buildRefs var with default value, but value specified', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref: {
          _ref: {
            path: 'file.yaml',
            vars: {
              var1: 'value',
            },
          },
        },
      },
    },
    {
      path: 'file.yaml',
      content: {
        key: {
          _var: {
            name: 'var1',
            default: 'default',
          },
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref: {
      key: 'value',
    },
  });
});

test('buildRefs var uses default value if value not specified', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref: {
          _ref: {
            path: 'file.yaml',
            vars: {
              var2: 'value',
            },
          },
        },
      },
    },
    {
      path: 'file.yaml',
      content: {
        key: {
          _var: {
            name: 'var1',
            default: 'default',
          },
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    ref: {
      key: 'default',
    },
  });
});

test('buildRefs with transformer function', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        _ref: {
          path: 'target.yaml',
          transformer: 'src/test/testBuildRefsTransform.js',
          vars: {
            var1: 'var1',
          },
        },
      },
    },
    {
      path: 'target.yaml',
      content: {
        a: 1,
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    add: 43,
    json: '{"a":1}',
    var: 'var1',
  });
});

test('buildRefs with eval json content', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        _ref: {
          eval: 'src/test/testBuildRefsEvalJson.js',
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({ a: 123 });
});

test('buildRefs with eval function', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        _ref: {
          eval: 'src/test/testBuildRefsEval.js',
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toMatchInlineSnapshot(`
    "function js(obj, vars) {
      return {
        json: JSON.stringify(obj),
        add: add(obj.a, 42),
        var: vars.var1,
      };
    }"
  `);
});

test('buildRefs _var receives invalid type', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        ref: {
          _ref: {
            path: 'file.yaml',
            vars: {
              var1: 'value',
            },
          },
        },
      },
    },
    {
      path: 'file.yaml',
      content: {
        key: {
          _var: [1],
        },
      },
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  await expect(buildRefs({ context })).rejects.toThrow(
    '"_var" operator takes a string or object with name field as arguments. Received "{"_var":[1]}"'
  );
});

test('buildRefs _ref path is a var, shorthand path', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        _ref: {
          path: 'file1.yaml',
          vars: {
            filePath: 'file2.md',
          },
        },
      },
    },
    {
      path: 'file1.yaml',
      content: {
        text: {
          _ref: {
            _var: 'filePath',
          },
        },
      },
    },
    {
      path: 'file2.md',
      content: 'Hello',
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    text: 'Hello',
  });
});

test('buildRefs _ref path is a var', async () => {
  const files = [
    {
      path: 'lowdefy.yaml',
      content: {
        _ref: {
          path: 'file1.yaml',
          vars: {
            filePath: 'file2.md',
          },
        },
      },
    },
    {
      path: 'file1.yaml',
      content: {
        text: {
          _ref: {
            path: {
              _var: 'filePath',
            },
          },
        },
      },
    },
    {
      path: 'file2.md',
      content: 'Hello',
    },
  ];
  mockConfigLoader.mockImplementation(configLoaderMockImplementation(files));
  const res = await buildRefs({ context });
  expect(res).toEqual({
    text: 'Hello',
  });
});
