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

import serializer from '../src/serializer';

test('serialize convert object js date to _date', () => {
  let object = {
    a: new Date(0),
  };
  expect(serializer.serialize(object)).toEqual({ a: { _date: 0 } });
  object = {
    a: { b: { c: new Date(120) } },
  };
  expect(serializer.serialize(object)).toEqual({ a: { b: { c: { _date: 120 } } } });
});

test('serialize convert array js date to _date', () => {
  let object = {
    a: [new Date(0)],
  };
  expect(serializer.serialize(object)).toEqual({ a: [{ _date: 0 }] });
  object = {
    a: [{ b: new Date(0), c: [null, new Date(10)], d: [{ e: new Date(20) }] }],
  };
  expect(serializer.serialize(object)).toEqual({
    a: [{ b: { _date: 0 }, c: [null, { _date: 10 }], d: [{ e: { _date: 20 } }] }],
  });
});

test('serialize should not change a string date', () => {
  let object = {
    a: '2019-11-18T09:51:30.152Z',
  };
  expect(serializer.serialize(object)).toEqual(object);
  object = ['2019-11-18T09:51:30.152Z'];
  expect(serializer.serialize(object)).toEqual(object);
});

test('serialize a date should return a serialized date', () => {
  expect(serializer.serialize(new Date(0))).toEqual({ _date: 0 });
});

test('serialize array of dates should return a serialized array', () => {
  expect(serializer.serialize([new Date(0), new Date(1), new Date(2)])).toEqual([
    { _date: 0 },
    { _date: 1 },
    { _date: 2 },
  ]);
});

test('serialize primitives should pass', () => {
  expect(serializer.serialize('a')).toEqual('a');
  expect(serializer.serialize(0)).toEqual(0);
  expect(serializer.serialize(1)).toEqual(1);
  expect(serializer.serialize(-0.1)).toEqual(-0.1);
  expect(serializer.serialize(false)).toEqual(false);
  expect(serializer.serialize(true)).toEqual(true);
  expect(serializer.serialize(null)).toEqual(null);
  expect(serializer.serialize(undefined)).toEqual(undefined);
});

test('serializeToString convert object js date to _date', () => {
  let object = {
    a: new Date(0),
  };
  expect(serializer.serializeToString(object)).toMatchInlineSnapshot(`"{\\"a\\":{\\"_date\\":0}}"`);
  object = {
    a: { b: { c: new Date(120) } },
  };
  expect(serializer.serializeToString(object)).toMatchInlineSnapshot(
    `"{\\"a\\":{\\"b\\":{\\"c\\":{\\"_date\\":120}}}}"`
  );
});

test('serializeToString convert array js date to _date', () => {
  let object = {
    a: [new Date(0)],
  };
  expect(serializer.serializeToString(object)).toMatchInlineSnapshot(
    `"{\\"a\\":[{\\"_date\\":0}]}"`
  );
  object = {
    a: [{ b: new Date(0), c: [null, new Date(10)], d: [{ e: new Date(20) }] }],
  };
  expect(serializer.serializeToString(object)).toMatchInlineSnapshot(
    `"{\\"a\\":[{\\"b\\":{\\"_date\\":0},\\"c\\":[null,{\\"_date\\":10}],\\"d\\":[{\\"e\\":{\\"_date\\":20}}]}]}"`
  );
});

test('serializeToString should not change a string date', () => {
  let object = {
    a: '2019-11-18T09:51:30.152Z',
  };
  expect(serializer.serializeToString(object)).toMatchInlineSnapshot(
    `"{\\"a\\":\\"2019-11-18T09:51:30.152Z\\"}"`
  );
  object = ['2019-11-18T09:51:30.152Z'];
  expect(serializer.serializeToString(object)).toMatchInlineSnapshot(
    `"[\\"2019-11-18T09:51:30.152Z\\"]"`
  );
});

test('serializeToString a date should return a serialized date', () => {
  expect(serializer.serializeToString(new Date(0))).toMatchInlineSnapshot(`"{ \\"_date\\": 0 }"`);
});

test('serialize array of dates should return a serialized array', () => {
  expect(
    serializer.serializeToString([new Date(0), new Date(1), new Date(2)])
  ).toMatchInlineSnapshot(`"[{\\"_date\\":0},{\\"_date\\":1},{\\"_date\\":2}]"`);
});

test('serializeToString primitives should pass', () => {
  expect(serializer.serializeToString('a')).toMatchInlineSnapshot(`"\\"a\\""`);
  expect(serializer.serializeToString(0)).toMatchInlineSnapshot(`"0"`);
  expect(serializer.serializeToString(1)).toMatchInlineSnapshot(`"1"`);
  expect(serializer.serializeToString(-0.1)).toMatchInlineSnapshot(`"-0.1"`);
  expect(serializer.serializeToString(false)).toMatchInlineSnapshot(`"false"`);
  expect(serializer.serializeToString(true)).toMatchInlineSnapshot(`"true"`);
  expect(serializer.serializeToString(null)).toMatchInlineSnapshot(`"null"`);
  expect(serializer.serializeToString(undefined)).toEqual(undefined);
});

test('serializeToString stable option', () => {
  let object = {
    a: 'a',
    b: 'b',
    c: 'c',
  };
  expect(serializer.serializeToString(object, { stable: true })).toEqual(
    '{"a":"a","b":"b","c":"c"}'
  );
  object = {
    c: 'c',
    b: 'b',
    a: 'a',
  };
  expect(serializer.serializeToString(object, { stable: true })).toEqual(
    '{"a":"a","b":"b","c":"c"}'
  );
  object = {
    c: 'c',
    b: 'b',
    a: 'a',
  };
  expect(serializer.serializeToString(object, { stable: false })).toEqual(
    '{"c":"c","b":"b","a":"a"}'
  );
});

test('serializeToString stable and space option', () => {
  const object = {
    c: 'c',
    b: 'b',
    a: 'a',
  };
  expect(serializer.serializeToString(object, { stable: true, space: 2 })).toEqual(`{
  "a": "a",
  "b": "b",
  "c": "c"
}`);
});

test('serializeToString space option', () => {
  const object = {
    c: 'c',
    b: 'b',
    a: 'a',
  };
  expect(serializer.serializeToString(object, { space: 2 })).toEqual(`{
  "c": "c",
  "b": "b",
  "a": "a"
}`);
});

test('deserialize convert _date object to js date', () => {
  let object = {
    a: { _date: 0 },
  };
  expect(serializer.deserialize(object)).toEqual({ a: new Date(0) });
  object = {
    a: { b: { c: { _date: 120 } } },
  };
  expect(serializer.deserialize(object)).toEqual({ a: { b: { c: new Date(120) } } });
  object = {
    a: { _date: '1970-01-01T00:00:00.000Z' },
  };
  expect(serializer.deserialize(object)).toEqual({ a: new Date(0) });
});

test('deserialize convert _date in array to js date', () => {
  let object = {
    a: [{ _date: 0 }],
  };
  expect(serializer.deserialize(object)).toEqual({ a: [new Date(0)] });
  object = {
    a: [{ b: { _date: 0 }, c: [null, { _date: 10 }], d: [{ e: { _date: 20 } }] }],
  };
  expect(serializer.deserialize(object)).toEqual({
    a: [{ b: new Date(0), c: [null, new Date(10)], d: [{ e: new Date(20) }] }],
  });
});

test('deserialize should not change a string date', () => {
  let object = {
    a: '2019-11-18T09:51:30.152Z',
  };
  expect(serializer.deserialize(object)).toEqual(object);
  object = ['2019-11-18T09:51:30.152Z'];
  expect(serializer.deserialize(object)).toEqual(object);
});

test('deserialize a _date date should return a js date', () => {
  expect(serializer.deserialize({ _date: 0 })).toEqual(new Date(0));
  expect(serializer.deserialize({ _date: '1970-01-01T00:00:00.000Z' })).toEqual(new Date(0));
});

test('deserialize array of _date dates should return a js date array', () => {
  expect(serializer.deserialize([{ _date: 0 }, { _date: 1 }, { _date: 2 }])).toEqual([
    new Date(0),
    new Date(1),
    new Date(2),
  ]);
  expect(serializer.deserialize({ a: [{ _date: '1970-01-01T00:00:00.000Z' }] })).toEqual({
    a: [new Date(0)],
  });
});

test('deserialize primitives should pass', () => {
  expect(serializer.deserialize('a')).toEqual('a');
  expect(serializer.deserialize(0)).toEqual(0);
  expect(serializer.deserialize(1)).toEqual(1);
  expect(serializer.deserialize(-0.1)).toEqual(-0.1);
  expect(serializer.deserialize(false)).toEqual(false);
  expect(serializer.deserialize(true)).toEqual(true);
  expect(serializer.deserialize(null)).toEqual(null);
  expect(serializer.deserialize(undefined)).toEqual(undefined);
});

test('deserializeFromString convert object js date to _date', () => {
  let object = `{ "a":{ "_date":0}}`;
  expect(serializer.deserializeFromString(object)).toEqual({
    a: new Date(0),
  });
  object = `{"a":{"b":{"c":{"_date":120}}}}`;
  expect(serializer.deserializeFromString(object)).toEqual({
    a: { b: { c: new Date(120) } },
  });
  object = `{ "a":{ "_date":"1970-01-01T00:00:00.000Z"}}`;
  expect(serializer.deserializeFromString(object)).toEqual({
    a: new Date(0),
  });
});

test('deserializeFromString convert array js date to _date', () => {
  let object = `{"a":[{"_date":0}]}`;
  expect(serializer.deserializeFromString(object)).toEqual({
    a: [new Date(0)],
  });
  object = `{"a":[{"b":{"_date":0},"c":[null,{"_date":10}],"d":[{"e":{"_date":20}}]}]}`;
  expect(serializer.deserializeFromString(object)).toEqual({
    a: [{ b: new Date(0), c: [null, new Date(10)], d: [{ e: new Date(20) }] }],
  });
});

test('deserializeFromString should not change a string date', () => {
  let object = `{"a":"2019-11-18T09:51:30.152Z"}`;
  expect(serializer.deserializeFromString(object)).toEqual({
    a: '2019-11-18T09:51:30.152Z',
  });
  object = `["2019-11-18T09:51:30.152Z"]`;
  expect(serializer.deserializeFromString(object)).toEqual(['2019-11-18T09:51:30.152Z']);
});

test('deserializeFromString a date should return a serialized date', () => {
  expect(serializer.deserializeFromString(`{"_date":0}`)).toEqual(new Date(0));
});

test('deserializeFromString array of dates should return a serialized array', () => {
  expect(serializer.deserializeFromString(`[{"_date":0},{"_date":1},{"_date":2}]`)).toEqual([
    new Date(0),
    new Date(1),
    new Date(2),
  ]);
  expect(serializer.deserializeFromString(`[{"_date":"1970-01-01T00:00:00.000Z"}]`)).toEqual([
    new Date(0),
  ]);
});

test('deserializeFromString primitives should pass', () => {
  expect(serializer.deserializeFromString(`"a"`)).toEqual('a');
  expect(serializer.deserializeFromString(`0`)).toEqual(0);
  expect(serializer.deserializeFromString(`1`)).toEqual(1);
  expect(serializer.deserializeFromString(`-0.1`)).toEqual(-0.1);
  expect(serializer.deserializeFromString(`false`)).toEqual(false);
  expect(serializer.deserializeFromString(`true`)).toEqual(true);
  expect(serializer.deserializeFromString(`null`)).toEqual(null);
  expect(() => {
    serializer.deserializeFromString(`undefined}`);
  }).toThrow(); // does not work with undefined
});

test('Do not modify original object', () => {
  const a = { a: { b: [{ c: new Date(0) }] } };
  expect(serializer.deserializeFromString(serializer.serializeToString(a))).toEqual(a);
});

test('Undefined values in object', () => {
  const a = { a: undefined };
  expect(serializer.serialize(a)).toEqual({});
  expect(serializer.serializeToString(a)).toEqual('{}');
});

test('deserializeFromString undefined', () => {
  const a = undefined;
  expect(serializer.deserializeFromString(a)).toEqual(undefined);
});

test('copy an object', () => {
  const object = {
    date: new Date(0),
    array: [1, 'a', true, new Date(1)],
    string: 'hello',
    number: 42,
  };
  expect(serializer.copy(object)).toEqual({
    date: new Date(0),
    array: [1, 'a', true, new Date(1)],
    string: 'hello',
    number: 42,
  });
});

test('copy undefined', () => {
  expect(serializer.copy(undefined)).toEqual(undefined);
});

test('copy a date', () => {
  expect(serializer.copy(new Date(0))).toEqual(new Date(0));
});

test('copy with custom reviver', () => {
  const reviver = (key, value) => (key === 'a' ? 'x' : value);
  expect(serializer.copy({ a: 1, b: 2, c: new Date(120) }, { reviver })).toEqual({
    a: 'x',
    b: 2,
    c: new Date(120),
  });
});

test('deserializeFromString with custom reviver', () => {
  const reviver = (key, value) => (key === 'a' ? 'x' : value);
  expect(
    serializer.deserializeFromString('{ "a": 1, "b": 2, "c": {"_date": 120 } }', { reviver })
  ).toEqual({
    a: 'x',
    b: 2,
    c: new Date(120),
  });
});

test('deserialize with custom reviver', () => {
  const reviver = (key, value) => (key === 'a' ? 'x' : value);
  expect(serializer.deserialize({ a: 1, b: 2, c: { _date: 120 } }, { reviver })).toEqual({
    a: 'x',
    b: 2,
    c: new Date(120),
  });
});

test('copy with custom replacer', () => {
  const replacer = (key, value) => (key === 'a' ? 'x' : value);
  expect(serializer.copy({ a: 1, b: 2, c: new Date(120) }, { replacer })).toEqual({
    a: 'x',
    b: 2,
    c: new Date(120),
  });
});

test('serializeToString with custom replacer', () => {
  const replacer = (key, value) => (key === 'a' ? 'x' : value);
  expect(serializer.serializeToString({ a: 1, b: 2, c: new Date(120) }, { replacer })).toEqual(
    '{"a":"x","b":2,"c":{"_date":120}}'
  );
});

test('serialize with custom replacer', () => {
  const replacer = (key, value) => (key === 'a' ? 'x' : value);
  expect(serializer.serialize({ a: 1, b: 2, c: new Date(120) }, { replacer })).toEqual({
    a: 'x',
    b: 2,
    c: { _date: 120 },
  });
});

test('should not deserialize _date now', () => {
  expect(serializer.copy({ _date: 'now' })).toEqual({ _date: 'now' });
  expect(serializer.copy([{ _date: 'now' }])).toEqual([{ _date: 'now' }]);
  expect(serializer.copy({ a: { _date: 'now' } })).toEqual({ a: { _date: 'now' } });

  expect(serializer.deserialize({ _date: 'now' })).toEqual({ _date: 'now' });
  expect(serializer.deserialize([{ _date: 'now' }])).toEqual([{ _date: 'now' }]);
  expect(serializer.deserialize({ a: { _date: 'now' } })).toEqual({ a: { _date: 'now' } });

  expect(serializer.deserializeFromString('{ "_date": "now" }')).toEqual({ _date: 'now' });
  expect(serializer.deserializeFromString('[{ "_date": "now" }]')).toEqual([{ _date: 'now' }]);
  expect(serializer.deserializeFromString('{ "a": { "_date": "now" } }')).toEqual({
    a: { _date: 'now' },
  });
});

test('deserialize should pass invalid date through without error', () => {
  expect(serializer.copy({ _date: 'invalid' })).toEqual({ _date: 'invalid' });
  expect(serializer.copy([{ _date: 'invalid' }])).toEqual([{ _date: 'invalid' }]);
  expect(serializer.copy({ a: { _date: 'invalid' } })).toEqual({ a: { _date: 'invalid' } });

  expect(serializer.deserialize({ _date: 'invalid' })).toEqual({ _date: 'invalid' });
  expect(serializer.deserialize([{ _date: 'invalid' }])).toEqual([{ _date: 'invalid' }]);
  expect(serializer.deserialize({ a: { _date: 'invalid' } })).toEqual({ a: { _date: 'invalid' } });

  expect(serializer.deserializeFromString('{ "_date": "invalid" }')).toEqual({ _date: 'invalid' });
  expect(serializer.deserializeFromString('[{ "_date": "invalid" }]')).toEqual([
    { _date: 'invalid' },
  ]);
  expect(serializer.deserializeFromString('{ "a": { "_date": "invalid" } }')).toEqual({
    a: { _date: 'invalid' },
  });
});

test('serialize isoStringDates', () => {
  expect(serializer.serialize(new Date(0), { isoStringDates: true })).toEqual({
    _date: '1970-01-01T00:00:00.000Z',
  });
  expect(serializer.serialize({ a: new Date(0) }, { isoStringDates: true })).toEqual({
    a: { _date: '1970-01-01T00:00:00.000Z' },
  });
  expect(serializer.serialize({ a: [new Date(0)] }, { isoStringDates: true })).toEqual({
    a: [{ _date: '1970-01-01T00:00:00.000Z' }],
  });
});

test('serializeToString isoStringDates', () => {
  expect(serializer.serializeToString(new Date(0), { isoStringDates: true })).toEqual(
    '{ "_date": "1970-01-01T00:00:00.000Z" }'
  );
  expect(serializer.serializeToString({ a: new Date(0) }, { isoStringDates: true })).toEqual(
    '{"a":{"_date":"1970-01-01T00:00:00.000Z"}}'
  );
  expect(serializer.serializeToString({ a: [new Date(0)] }, { isoStringDates: true })).toEqual(
    '{"a":[{"_date":"1970-01-01T00:00:00.000Z"}]}'
  );
});

test('serialize convert Error to _error', () => {
  let object = {
    a: new Error('Test error'),
  };
  expect(serializer.serialize(object)).toEqual({
    a: { _error: { message: 'Test error', name: 'Error', value: 'Error: Test error' } },
  });
});

test('serializeToString convert Error to _error', () => {
  let object = {
    a: new Error('Test error'),
  };
  expect(serializer.serializeToString(object)).toEqual(
    '{"a":{"_error":{"name":"Error","message":"Test error","value":"Error: Test error"}}}'
  );
});

test('deserialize revive _error to Error', () => {
  let object = {
    a: { _error: { message: 'Test error', name: 'Error', value: 'Error: Test error' } },
  };
  expect(serializer.deserialize(object)).toEqual({
    a: new Error('Test error'),
  });
});

test('deserializeFromString revive _error to Error', () => {
  let object =
    '{"a": {"_error": {"message": "Test error", "name": "Error", "value": "Error: Test error"}}}';
  expect(serializer.deserializeFromString(object)).toEqual({
    a: new Error('Test error'),
  });
});
