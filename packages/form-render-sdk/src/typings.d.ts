declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface Window {
  [k: string]: any;
}

declare interface IFormRenderProps {
  // formily schema
  formSchema: {
    form: any;
    schema: any;
  };
  createFormProps?: any;
  createFormEffects?: () => any;

  /**
   * @description 自定义表单组件
   */
  customComps?: any;

  [k: string]: any;
}
