import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { Upload, Icon, Button, Message } from '@alifd/next';
import { UploadProps } from '@alifd/next/types/upload';
import { v4 as uuidv4 } from 'uuid';
import { StsCredentials, Uploader } from '../../index';
import './index.scss';

interface UploadIProps extends UploadProps {
  onChange?: (p: any) => any;
  onComplete?: (p: any) => any;
  stsParams?: any;
  limitSize?: number; // M为单位
  disabled?: boolean;
  tip?: string;
  accept?: string;
  topText?: string | '拖拽上传文件 或';
  btnText?: string | '上传本地文件';
  uploadPathPrefix?: string | 'apsara/';
  value?: any[] | string | any;
  templateLink?: string; //模版下载地址
  [k: string]: any;
}

export default (props: UploadIProps) => {
  const {
    value,
    disabled,
    limitSize,
    stsParams = {},
    tip = '',
    accept = '',
    templateLink = '',
    topText = '拖拽上传文件 或',
    btnText = '上传本地文件',
    uploadPathPrefix = 'apsara/',
    onChange = () => {},
    onComplete = () => {},
    ...otherProps
  } = props;
  const [uploadValue, setUploadValue] = useState<any>([]); // 显示文件
  const uploadInfoRef = useRef<any>({}); // 上传信息
  const uploaderRef = useRef<any>(); // 上传实例

  // 异步初始化上传
  useEffect(() => {
    (async () => {
      // 异步初始化Client
      const stsIns = new StsCredentials(stsParams);
      uploaderRef.current = new Uploader(stsIns);
      await uploaderRef.current.initClient();

      // 生成uploadDir
      const uploadDir = `${uploadPathPrefix}${uuidv4().replace(/-/g, '')}`;
      uploaderRef.current.client?.setUploadDir(uploadDir);
    })();
  }, []);

  // 根据fileData设置组件value值
  useEffect(() => {
    let data: any = [];
    uploadInfoRef.current = [];

    if (Array.isArray(value) && value?.length) {
      data = value;
    } else {
      data = value ? [{ name: value }] : [];
    }

    data.map((item: any) => {
      if (!item?.uid) {
        item.uid = uuidv4().replace(/-/g, '');
      }

      uploadInfoRef.current[`uid_${item.uid}`] = item;
      return item;
    });

    setUploadValue(data);
  }, [value]);

  const onSelect = (files: any) => {
    const data: any = uploadValue || [];
    files.forEach((obj: any) => {
      const item = {
        state: 'uploading',
        uid: obj.uid,
        name: obj.name,
        size: obj.size,
        path: '',
        originFileObj: obj?.originFileObj,
      };
      data.push(item);
      uploadInfoRef.current[`uid_${obj.uid}`] = item;
    });

    setUploadValue(data);
    onChange(data);
  };

  const beforeUpload = (file: File) => {
    const { size, type } = file;
    try {
      if (limitSize && size > limitSize) {
        throw new Error(
          `文件大小不能超过${Math.round(limitSize / 1024 / 1024)}M！`,
        );
      }

      if (accept) {
        if (accept !== '*' && accept.indexOf(type) < 0) {
          throw new Error('请上传指定类型的文件！');
        }
      }

      return Promise.resolve(true);
    } catch (err: any) {
      if (err?.message) {
        Message.warning(err?.message);
      }
      return Promise.reject();
    }
  };

  const onError = (err: any) => {
    console.log('err', err);
    Message.error(
      err?.message || err?.response?.errorMsg || '文件上传失败，请稍后重试',
    );
  };

  const onRemove = async (obj: any) => {
    // console.log('onremove', obj);
    try {
      if (disabled) {
        return;
      }

      // 暂时不调用删除object
      // await uploaderRef.current.deleteFile(obj.path);
      typeof props.onRemove === 'function' && props.onRemove(obj);

      delete uploadInfoRef.current[`uid_${obj.uid}`];
      const newValue = uploadValue.filter((i: any) => i?.uid !== obj.uid);
      setUploadValue(newValue);
      onChange(newValue);
    } catch (err) {
      console.log('onremove error', err);
    }
  };

  // 每个文件自定义上传请求
  const customRequest = async (option: any) => {
    const { onProgress, onError, onSuccess, file } = option || {};
    const returnRet = { abort: onRemove };

    if (!uploadInfoRef.current?.[`uid_${file.uid}`]) {
      return returnRet;
    }

    try {
      onProgress(10);
      const res = await uploaderRef.current.uploadFile(file);
      onProgress(100);
      console.log('upload file res', res);

      if (res) {
        uploadInfoRef.current[`uid_${file.uid}`].state = 'done';
        uploadInfoRef.current[`uid_${file.uid}`].path = res;
        onSuccess({
          success: true,
          data: uploadInfoRef.current[`uid_${file.uid}`],
        });
      } else {
        throw new Error('分片上传失败！');
      }
    } catch (e: any) {
      // 如果文件已经abort记录被删除，则不处理
      if (uploadInfoRef.current[`uid_${file.uid}`]) {
        uploadInfoRef.current[`uid_${file.uid}`].state = 'error';
        uploadInfoRef.current[`uid_${file.uid}`].errorMsg = e?.message;
      }
      onError(e, { success: false, errorMsg: e?.message });
    }

    // 无论成功失败都更新
    const newValue = Object.keys(uploadInfoRef.current || {}).map(
      (u) => uploadInfoRef.current[u],
    );
    onChange(newValue);
    setUploadValue(newValue);

    // 所有文件都为done，则调用onComplete
    if (newValue.every((i: any) => i?.state === 'done')) {
      onComplete(newValue);
    }

    return returnRet;
  };

  const renderFileName = (obj: any) => {
    const renderSubTitle = (obj: any) => {
      return (
        <div className={`renderFileSubTitle`}>
          {obj?.gmtUpload
            ? `上传时间 ${moment(obj?.gmtUpload).format('YYYY-MM-DD HH:mm')}`
            : ''}
        </div>
      );
    };

    const renderSize = (size: number) => {
      if (!size || size < 1024) {
        return `1 KB`;
      }
      if (size < 1024 * 1024) {
        return `${Math.floor((size * 100) / 1024) / 100} KB`;
      }
      if (size < 1024 * 1024 * 1024) {
        return `${Math.floor((size * 100) / (1024 * 1024)) / 100} MB`;
      }

      return `${Math.floor((size * 100) / (1024 * 1024 * 1024)) / 100} GB`;
    };

    return (
      <div className="renderFileWrapper">
        <div className="renderFileImgWrapper">
          <img
            className="renderFileImg"
            src={
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAABACAYAAABcIPRGAAAAAXNSR0IArs4c6QAAA4RJREFUaEPtmstrE1EUxs9Jmj6CUnClVdxLwYoLdVVS+wo+EBUSH2gXbU27EBRB/Q8EEcGNSfqgUKFmAgouWjKppaUbFSrowp22Kho3VfBBaZt0PrmpsbW2nWfSDJ1ZBe45557f+c6duTO5TMuuSFxuBaiNCdUAbV0+ZtVvJp4FUYoJ48zUHwr6R83EZuHcFx/dPof5fgCNZoIZ8WXmoQqP+2LLqYavhvyFU1hKDBOogYhTzHzDXeIZq1zwfTESMOczW5ksn/nu3kvIXAEosF4sZp5yM9W3B5qn9M7J0ViyTSGlm5k/s7d0X+h43bTeIGr24Zh8iwg3VSA+upl8eiE4LMnPCDjkctH5UMA/oJaMkfHoxIQH76YnAdplNQRHpMQPsWBLK1w7W080pYwkqMUnEpNjIATVbJlZlxIcjiUggnae8WcXdL6uqCTfVYCrWuLrgShKAAGpFaJoAbRCFDXAn3b7QGVlvs6Tde9Xaz87AIi814SwC8CaEHYCWBXCbgD/QdgRQNxkJ72l7gNiA2hTAPGcoMGOoP+YbQGyt1S3u66AAIlrCuiOlq2EVhtmV1/BALofD+9ZSC+8AqhUa4LqdjxZMACRTFSSW0C4D5BXPTl1C/F6WlAAkVLvk2RVZk7xEfFu9RSXLACqIqJaADXL/QoOoCfplbYAuCuevKwA93JjtgLIJR2V5IgChLI71kK90Jip/ErfaGxkv0Lpl/YFmJjwKG+n520LIBLPdY4tW8gBsHJBGo3ltJDRylnl5yhgVSWNxtlcCkQkeRDAEaPV+mf3yDzUEWw+ajaWLgVyxmYnzflb8SF5cwFY20KLXxPMqqlLAbOT5cPfAchHVfXEdBTQU6182DoK5KOqemJuLgWsfJBprbI4BLLenkmXAlbvhbRCrLdn2lwAG9NC6++ZdCmgVfJC2jkAhaz2anM5CjgKmKyA00ImC2jafUkBSf5JwBaXx1sVOl1r6qyo6aw0Bog+Gt+hpGdSxPyLIzH5OQgHmV3nOoJNDzXG2FCziJQ8CygDTPyCw1KinUBdzPSphKmmLeD/tqHZqUzeE09sy4BeZ8+gMl1i8d9rJJ58SsBhAUHkus4l5WPF1k6ibZCZ9REpt0XyTDQSCjY3Zs+KZgfTMw9AVF/M1c/lJpJnj/eCKPLfw66LSshtDG4FU7VY2EUFIxYs6A0YvR2B5h5mzh7Y/Q0N7LiGRvTVWgAAAABJRU5ErkJggg=='
            }
          />
        </div>
        <div className={`renderFileMain`}>
          <div className={`renderFileTitle`}>
            {obj?.name}
            <span className={`renderFileSubTitle`}>
              {obj?.size ? renderSize(obj?.size) : ''}
            </span>
          </div>
          {obj?.state === 'error' ? (
            <div className={`renderFileError`}>上传错误</div>
          ) : (
            renderSubTitle(obj)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="simple-upload">
      <Upload.Dragger
        webkitdirectory={false}
        listType="text"
        disabled={disabled}
        accept={accept}
        value={uploadValue}
        onSelect={onSelect}
        beforeUpload={beforeUpload}
        request={customRequest}
        onError={onError}
        onRemove={onRemove}
        previewOnFileName={true}
        fileNameRender={renderFileName}
        {...otherProps}
      >
        <div className="uploadWrapper">
          <Icon type="upload" size={16} />
          <p className={'uploadActions'}>
            <div>{topText}</div>
            <Button size="small" type="secondary">
              {btnText}
            </Button>
          </p>
          <p className={'uploadTips'}>{tip}</p>
          {templateLink && (
            <Button
              text
              type="primary"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              component="a"
              href={templateLink}
            >
              下载模版
            </Button>
          )}
        </div>
      </Upload.Dragger>
    </div>
  );
};
