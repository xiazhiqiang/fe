import { IRouterConfig } from 'ice';
import Popup from '@/pages/popup/index';
import SidePanel from '@/pages/sidePanel/index';

const routerConfig: IRouterConfig[] = [
  {
    path: '/popup',
    component: Popup,
  },
  {
    path: '/sidePanel',
    component: SidePanel,
  },
];

export default routerConfig;
