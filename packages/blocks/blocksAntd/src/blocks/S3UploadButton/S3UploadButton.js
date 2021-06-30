import React, { useEffect, useState } from 'react';
import { blockDefaultProps } from '@lowdefy/block-tools';
import { get } from '@lowdefy/helpers';
import { Upload } from 'antd';

import Button from '../Button/Button';

const makeFileValue = (file, s3Parameters) => {
  const { lastModified, name, percent, size, status, type, uid } = file;
  const { bucket, key } = get(s3Parameters, uid, { default: {} });
  return { bucket, key, lastModified, name, percent, size, status, type, uid };
};

const makeOnChangeValue = (s3Parameters, changeEvent) => {
  const { file, fileList } = changeEvent;
  return {
    file: makeFileValue(file, s3Parameters),
    fileList: fileList.map((fl) => makeFileValue(fl, s3Parameters)),
  };
};

const getDisabled = ({ properties, value }) => {
  if (properties.disabled) return true;
  if (properties.singleFile && value && (value.fileList || []).length >= 1) {
    return true;
  }
  return false;
};

const getCustomRequest =
  ({ methods, setS3Parameters }) =>
  async ({ file, onError, onProgress, onSuccess }) => {
    try {
      const { name, size, type, uid } = file;

      const s3PostPolicyResponse = await methods.triggerEvent({
        name: '__getS3PostPolicy',
        event: { filename: name, size, type, uid },
      });

      if (s3PostPolicyResponse.success !== true) {
        throw new Error('S3 post policy request error.');
      }

      const { url, fields } = s3PostPolicyResponse.responses.__getS3PostPolicy.response[0];
      const { bucket, key } = fields;

      setS3Parameters((prevState) => {
        const ret = { ...prevState };
        ret[uid] = { bucket, key };
        return ret;
      });

      // Set 20 % progress on policy is acquired else user waits to long before progress is reported
      onProgress({ percent: 20 });

      // Create FormData with all required fields in S3 policy
      const formData = new FormData();
      Object.keys(fields).forEach((field) => {
        formData.append(field, fields[field]);
      });
      // file needs to be the last field in the form
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress({ percent: (event.loaded / event.total) * 80 + 20 });
        }
      };
      xhr.addEventListener('error', onError);
      xhr.addEventListener('load', onSuccess);
      xhr.open('post', url);
      xhr.send(formData);
    } catch (error) {
      console.error(error);
      onError(error);
    }
  };

const S3UploadButtonBlock = ({ blockId, events, methods, properties, value }) => {
  // Use state here because we need to set s3 bucket and key as block value
  // The customRequest function does not have access to the updated block value,
  // so it cannot set the value directly. customRequest sets the parameters to s3Parameters state,
  // and then onChange updates the block value.
  const [s3Parameters, setS3Parameters] = useState(value);
  const customRequest = getCustomRequest({ methods, setS3Parameters });
  useEffect(() => {
    methods.setValue({ file: null, fileList: [] });
    methods.registerEvent({
      name: '__getS3PostPolicy',
      actions: [
        {
          id: '__getS3PostPolicy',
          type: 'Request',
          params: [properties.s3PostPolicyRequestId],
        },
      ],
    });
  }, []);

  const disabled = getDisabled({ properties, value });
  return (
    <Upload
      accept={properties.accept}
      customRequest={customRequest}
      disabled={disabled}
      id={blockId}
      multiple={!properties.singleFile} // Allows selection of multiple files at once, does not block multiple uploads
      showUploadList={properties.showUploadList}
      onChange={(event) => {
        methods.setValue(makeOnChangeValue(s3Parameters, event));
        methods.triggerEvent({ name: 'onChange' });
      }}
    >
      <Button
        blockId={`${blockId}_button`}
        events={events}
        properties={{
          disabled,
          icon: 'UploadOutlined',
          title: 'Upload',
          type: 'default',
          ...properties.button,
        }}
        methods={methods}
      />
    </Upload>
  );
};

S3UploadButtonBlock.defaultProps = blockDefaultProps;

export default S3UploadButtonBlock;
