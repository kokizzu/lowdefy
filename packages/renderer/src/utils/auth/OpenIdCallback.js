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

import React, { useEffect, useState } from 'react';
import { Loading } from '@lowdefy/block-tools';
import { useHistory, useLocation } from 'react-router-dom';
import openIdCallbackFn from './openIdCallbackFn';

const OpenIdCallback = ({ lowdefy }) => {
  const { search } = useLocation();
  lowdefy.routeHistory = useHistory();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const mount = async () => {
      try {
        await openIdCallbackFn({ lowdefy, search });
        setLoading(false);
      } catch (err) {
        setError(err);
      }
    };
    mount();
    return () => {};
  }, [lowdefy, search]);

  if (error) throw error;

  if (loading) return <Loading type="Spinner" properties={{ height: '100vh' }} />;

  return <div>Done</div>;
};

export default OpenIdCallback;
