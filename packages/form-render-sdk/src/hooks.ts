import { Card, Range, Rating } from '@alifd/next';
import { createForm, onFormMount, onFormUnmount } from '@formily/core';
import {
  ArrayCards,
  ArrayCollapse,
  ArrayItems,
  ArrayTable,
  Cascader,
  Checkbox,
  DatePicker,
  DatePicker2,
  Editable,
  Form,
  FormCollapse,
  FormGrid,
  FormItem,
  FormLayout,
  FormStep,
  FormTab,
  Input,
  NumberPicker,
  Password,
  PreviewText,
  Radio,
  Reset,
  Select,
  Space,
  Submit,
  Switch,
  TimePicker,
  TimePicker2,
  Transfer,
  TreeSelect,
  Upload,
} from '@formily/next';
import { Field } from '@formily/react';
import { useEffect, useMemo, useState } from 'react';
import ObjectContainer from './form-components/ObjectContainer';
import Text from './form-components/Text';
// import { getRemoteComps } from '../components/Remote';
// import RemoteHoc from '../components/Remote/Hoc';

// 内置表单组件
const coreComps = {
  ObjectContainer,
  Form,
  Field,
  Space,
  FormGrid,
  FormLayout,
  FormTab,
  FormStep,
  FormCollapse,
  ArrayCollapse,
  ArrayTable,
  ArrayCards,
  ArrayItems,
  FormItem,
  DatePicker,
  DatePicker2,
  Checkbox,
  Cascader,
  Editable,
  Input,
  Text,
  NumberPicker,
  Switch,
  Password,
  PreviewText,
  Radio,
  Reset,
  Select,
  Submit,
  TimePicker,
  TimePicker2,
  Transfer,
  TreeSelect,
  Upload,
  Card,
  Range,
  Rating,
};

// 表单渲染 Hooks
export const useFormRender = (props: IFormRenderProps) => {
  const {
    createFormProps = {},
    createFormEffects = () => {},
    formSchema = null,
    onFormMountEffect = () => {},
    onFormUnmountEffect = () => {},

    customComps = {},
    materialsConfig,
    moduleExternals,
  } = props;
  const [fieldComps, setFieldComps] = useState({
    ...coreComps,
    ...customComps,
  });

  const form = useMemo(() => {
    return createForm({
      effects: () => {
        onFormMount(onFormMountEffect);
        onFormUnmount(onFormUnmountEffect);
        createFormEffects();
      },
      ...createFormProps,
    });
  }, []);

  // todo 加载动态表单组件
  useEffect(() => {
    (async () => {
      // const comps: any = await getRemoteComps({ materialsConfig, moduleExternals });
      // if (comps && Object.keys(comps).length > 0) {
      //   Object.keys(comps).forEach((k) => {
      //     comps[k] = RemoteHoc(comps[k]);
      //   });
      //   // console.log('comps', { ...comps });
      //   setFieldComps({ ...fieldComps, ...comps });
      // }
      setFieldComps({ ...fieldComps });
    })();
  }, []);

  return {
    form,
    formSchema,
    schema: formSchema?.schema || null,
    layout: formSchema?.form || null,
    fieldComps,
    setFieldComps,
  };
};
