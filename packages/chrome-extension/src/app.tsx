import { IAppConfig, runApp } from 'ice';

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container',
  },
  router: {
    type: 'browser',
  },
};

runApp(appConfig);
