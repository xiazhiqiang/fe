# FE

前端通用包

- [fe-request](./packages/fe-request/README.md)
- [fe-upload](./packages/fe-upload/README.md)
- [form-design-next](./packages/form-design-next/README.md)
- [form-render-next2](./packages/form-render-next2/README.md)
- [form-render-sdk](./packages/form-render-sdk/README.md)

## Install

```sh
yarn install --ignore-scripts --registry=https://registry.npmjs.com
```

## Development

- 组件开发

```sh
npx create-dumi
```

```sh
yarn workspace <pkgName> run <scripts>
```

```sh
yarn workspaces info # 展示所有包及其依赖
yarn add father-build -W # 根目录下安装依赖包

yarn workspace package-a add react@17 # 给指定包安装依赖
yarn workspace package-a add typescript --dev # 给指定包安装开发依赖

yarn workspaces run build # 执行每个子包的 script
yarn workspace package-a run build # 执行指定子包的 script
```
