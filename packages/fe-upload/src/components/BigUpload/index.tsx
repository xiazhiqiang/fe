import { Button, Icon, Message, Upload } from '@alifd/next';
import { UploadProps } from '@alifd/next/types/upload';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StsCredentials, Uploader } from '../../index';
import './index.scss';

interface IProps extends UploadProps {
  onChange?: (...p: any) => any;
  onComplete?: (...p: any) => any;
  value?: any[] | string | any;
  accept?: string;
  templateLink?: string | any;
  multiple?: boolean | true;
  disabled?: boolean;
  limit?: number;
  webkitdirectory?: boolean | false;
  stsParams?: any | {};
  uploadPathPrefix?: string | 'apsara/';
  chunkSize?: number; //分片上传大小,
  onRemove?: any;
  uploadTips?: string;
  limitSize?: number | any;
  [k: string]: any;
}

/**
 * 文件分片上传，支持目录上传
 */
export default function (props: IProps) {
  const {
    multiple = true,
    disabled,
    limit = false,
    webkitdirectory = false,
    value = '',
    uploadTips = '',
    accept = '',
    limitSize,
    templateLink,
    stsParams = {},
    uploadPathPrefix = 'apsara/',
    chunkSize = 5 * 1024 * 1024, //分片上传大小,
    onChange = () => {},
    onComplete = () => {},
    ...otherProps
  } = props;
  const [uploadValue, setUploadValue] = useState<any>([]); // 显示文件
  const uploadInfoRef = useRef<any>({}); // 上传信息
  const uploaderRef = useRef<any>(); // 上传实例

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

  const onSelect = (files: any[]) => {
    const data: any = uploadValue || [];
    files.forEach((obj: any) => {
      const item = {
        state: 'uploading',
        uid: obj.uid,
        name: obj.name,
        size: obj.size,
        path: '',
        uploadDir: uploaderRef.current.client.uploadDir, // 文件夹上传显示使用
        uploadInfo: null, // 上传唯一标识
      };
      data.push(item);
      uploadInfoRef.current[`uid_${obj.uid}`] = item;
    });

    setUploadValue(data);
    onChange(data);
  };

  const downloadTemplate = () => {
    const a: any = document.createElement('a');
    a.style.display = 'none';
    a.target = '_blank';
    a.href = templateLink;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const onError = (err: any) => {
    console.log('err', err);
    Message.error(err?.message || err?.response?.errorMsg || '上传失败');
  };

  const onAbort = async (obj: any) => {
    // console.log('onAbort', obj);
    try {
      const res = await uploaderRef.current?.handleAbortMultipartUpload(
        uploadInfoRef.current?.[`uid_${obj.uid}`]?.uploadInfo,
      );
      console.log('abort', res);

      delete uploadInfoRef.current[`uid_${obj.uid}`];
      const newValue = uploadValue.filter((i: any) => i?.uid !== obj.uid);
      setUploadValue(newValue);
      onChange(newValue);
    } catch (err) {}
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

  // 每个文件都会执行
  const beforeUpload = (file: any) => {
    // console.log('before upload', option, accept);
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

  // 每个文件自定义上传请求
  const customRequest = async (option: any) => {
    const { onProgress, onError, onSuccess, file } = option || {};
    const returnRet = { abort: onAbort };

    if (!uploadInfoRef.current?.[`uid_${file.uid}`]) {
      return returnRet;
    }

    try {
      // 初始化分片
      const uploadInfo = await uploaderRef.current?.handleInitMultipartUpload(
        file?.name,
      );
      console.log('initMultipartUpload', uploadInfo);
      uploadInfoRef.current[`uid_${file.uid}`].uploadInfo = uploadInfo;

      // 分片上传
      const uploadParts = await uploaderRef.current?.handleMultipartUpload(
        uploadInfo,
        file,
        chunkSize, // minio最小分片5M
        (percent = 0) => {
          onProgress({ percent });
        },
      );
      console.log('parts', uploadParts);

      // 分片合并
      const res = await uploaderRef.current?.handleCompleteMultipartUpload(
        uploadInfo,
        uploadParts,
      );
      console.log('res', res);
      console.log('uploadRef', uploadInfoRef.current);

      if (res) {
        // 分片合并成功
        uploadInfoRef.current[`uid_${file.uid}`].state = 'done';
        uploadInfoRef.current[`uid_${file.uid}`].path = uploadInfo?.filePath;
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
      if (webkitdirectory) {
        onComplete(
          newValue,
          uploadInfoRef.current[`uid_${file.uid}`].uploadDir,
        );
      } else {
        onComplete(newValue);
      }
    }

    return returnRet;
  };

  const renderFileName = (obj: any) => {
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
        <div className="renderFileMain">
          <div className="renderFileTitle">
            {obj?.name}
            <span className={`renderFileSubTitle`}>
              {obj?.size ? renderSize(obj?.size) : ''}
            </span>
          </div>
          {obj.state === 'error' && (
            <div className="renderFileError">{obj?.errorMsg || '上传错误'}</div>
          )}
        </div>
      </div>
    );
  };

  // 目录上传不用拖拽组件
  const UploadComp = webkitdirectory ? Upload : Upload.Dragger;

  return (
    <div className="big-upload">
      <UploadComp
        value={uploadValue}
        disabled={disabled}
        multiple={webkitdirectory ? false : multiple}
        webkitdirectory={webkitdirectory}
        listType="text"
        accept={accept}
        beforeUpload={beforeUpload}
        request={customRequest}
        fileNameRender={renderFileName}
        limit={webkitdirectory ? Infinity : limit ? limit : Infinity}
        previewOnFileName={true}
        onSelect={onSelect}
        onRemove={onRemove}
        onError={onError}
        onCancel={onAbort}
        {...otherProps}
      >
        <div className="uploadWrapper">
          <Icon type="upload" size={16} />
          <p className="uploadActions">
            <Button style={{ marginTop: 12 }} size="small">
              上传本地{webkitdirectory ? '文件夹' : '文件'}
            </Button>
          </p>
          {uploadTips ? <p className="uploadTips">{uploadTips}</p> : null}
          {templateLink ? (
            <Button text type="primary" onClick={downloadTemplate}>
              下载模板
            </Button>
          ) : null}
        </div>
      </UploadComp>
    </div>
  );
}
