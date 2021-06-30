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
import actions from './actions/index.js';

class Actions {
  constructor(context) {
    this.context = context;
    this.callAction = this.callAction.bind(this);
    this.callActionLoop = this.callActionLoop.bind(this);
    this.callActions = this.callActions.bind(this);
    this.displayMessage = this.displayMessage.bind(this);
    this.actions = actions;
  }

  async callActionLoop({ actions, arrayIndices, block, event, responses }) {
    for (const [index, action] of actions.entries()) {
      try {
        const response = await this.callAction({
          action,
          arrayIndices,
          block,
          event,
          index,
          responses,
        });
        responses[action.id] = response;
      } catch (error) {
        responses[action.id] = error;
        throw {
          error,
          action,
        };
      }
    }
  }

  async callActions({ actions, arrayIndices, block, catchActions, event, eventName }) {
    const startTimestamp = new Date();
    const responses = {};
    try {
      await this.callActionLoop({ actions, arrayIndices, block, event, responses });
    } catch (error) {
      console.error(error);
      try {
        await this.callActionLoop({ actions: catchActions, arrayIndices, block, event, responses });
      } catch (errorCatch) {
        console.error(errorCatch);
        return {
          blockId: block.blockId,
          error,
          errorCatch,
          event,
          eventName,
          responses,
          endTimestamp: new Date(),
          startTimestamp,
          success: false,
        };
      }
      return {
        blockId: block.blockId,
        error,
        event,
        eventName,
        responses,
        endTimestamp: new Date(),
        startTimestamp,
        success: false,
      };
    }
    return {
      blockId: block.blockId,
      event,
      eventName,
      responses,
      endTimestamp: new Date(),
      startTimestamp,
      success: true,
    };
  }

  async callAction({ action, arrayIndices, block, event, index, responses }) {
    if (!actions[action.type]) {
      throw {
        error: new Error(`Invalid action type "${action.type}" at "${block.blockId}".`),
        type: action.type,
        index,
      };
    }
    const { output: parsedAction, errors: parserErrors } = this.context.parser.parse({
      actions: responses,
      event,
      arrayIndices,
      input: action,
      location: block.blockId,
    });
    if (parserErrors.length > 0) {
      throw { error: parserErrors[0], type: action.type, index };
    }
    if (parsedAction.skip === true) {
      return { type: action.type, skipped: true, index };
    }
    const messages = parsedAction.messages || {};
    let response;
    const closeLoading = this.displayMessage({
      defaultMessage: 'Loading',
      duration: 0,
      message: messages.loading,
      status: 'loading',
    });
    try {
      response = await actions[action.type]({
        arrayIndices,
        context: this.context,
        event,
        params: parsedAction.params,
      });
    } catch (error) {
      responses[action.id] = { error, index, type: action.type };
      const { output: parsedMessages, errors: parserErrors } = this.context.parser.parse({
        actions: responses,
        event,
        arrayIndices,
        input: action.messages,
        location: block.blockId,
      });
      if (parserErrors.length > 0) {
        // this condition is very unlikely since parser errors usually occur in the first parse.
        throw { error: parserErrors[0], type: action.type, index };
      }
      closeLoading();
      this.displayMessage({
        defaultMessage: error.message,
        duration: 6,
        hideExplicitly: true,
        message: (parsedMessages || {}).error,
        status: 'error',
      });
      throw {
        type: action.type,
        error,
        index,
      };
    }
    closeLoading();
    this.displayMessage({
      defaultMessage: 'Success',
      message: messages.success,
      status: 'success',
    });
    return { type: action.type, response, index };
  }

  displayMessage({ defaultMessage, duration, hideExplicitly, message, status }) {
    let close = () => undefined;
    if ((hideExplicitly && message !== false) || (!hideExplicitly && !type.isNone(message))) {
      close = this.context.lowdefy.displayMessage({
        content: type.isString(message) ? message : defaultMessage,
        duration,
        status,
      });
    }
    return close;
  }
}

export default Actions;
