export default {
  'GET /llmapp/openapi/schema': {
    success: true,
    data: {
      form: {
        labelCol: 6,
        wrapperCol: 12,
        layout: 'vertical',
      },
      schema: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            title: '模式',
            'x-component': 'Input',
            'x-component-props': {
              hasClear: true,
            },
            'x-decorator': 'FormItem',
            'x-decorator-props': {},
            'x-display': 'hide',
          },
          name: {
            type: 'string',
            title: '资源名称',
            'x-component': 'Input',
            'x-component-props': {
              trim: true,
              placeholder: '请输入资源名称（20个字符以内）',
            },
            required: true,
            'x-validator': [],
            'x-decorator': 'FormItem',
            'x-decorator-props': {},
            'x-reactions': {},
          },
        },
      },
    },
  },
};
