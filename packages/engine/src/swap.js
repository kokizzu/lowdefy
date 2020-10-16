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

// engine

import type from '@lowdefy/type';

const swap = (arr, from, to) => {
  if (!type.isArray(arr) || from < 0 || to < 0 || from >= arr.length || to >= arr.length) {
    return;
  }
  arr.splice(from, 1, arr.splice(to, 1, arr[from])[0]);
};

export default swap;