import React from 'react';
import { Card, Range, Rating } from '@alifd/next';
import {
  ArrayCards,
  ArrayTable,
  Cascader,
  Checkbox,
  DatePicker,
  Editable,
  FormCollapse,
  FormGrid,
  FormItem,
  FormLayout,
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
  Transfer,
  TreeSelect,
  Upload,
  Form,
} from '@formily/next';
import { FormConsumer, createSchemaField, Field } from '@formily/react';
import Text from './components/Text';
import ObjectContainer from './components/ObjectContainer';

const SchemaField = createSchemaField({
  components: {
    ObjectContainer,
    Form,
    Field,
    Space,
    FormGrid,
    FormLayout,
    FormTab,
    FormCollapse,
    ArrayTable,
    ArrayCards,
    FormItem,
    DatePicker,
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
    Transfer,
    TreeSelect,
    Upload,
    Card,
    Range,
    Rating,
  },
});

export default (props: any) => {
  const { schema = {}, layout = {}, scope = {} } = props || {};

  return (
    <FormConsumer>
      {(form) => {
        if (!form) {
          console.log('缺少form实例！');
          return <></>;
        }

        return (
          <FormLayout {...layout}>
            <SchemaField schema={schema} scope={scope} />
          </FormLayout>
        );
      }}
    </FormConsumer>
  );
};
