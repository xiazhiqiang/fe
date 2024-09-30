import { useTheme } from '@designable/react';
import React from 'react';

const logo: any = {
  // dark: '//img.alicdn.com/imgextra/i2/O1CN01NTUDi81fHLQvZCPnc_!!6000000003981-55-tps-1141-150.svg',
  // light:
  //   '//img.alicdn.com/imgextra/i2/O1CN01Kq3OHU1fph6LGqjIz_!!6000000004056-55-tps-1141-150.svg',
  light:
    '//img.alicdn.com/imgextra/i1/O1CN01qtiEUn1I16O7XtPLX_!!6000000000832-2-tps-40-40.png',
  dark: '',
};

export const LogoWidget: React.FC = () => {
  const url = logo[useTheme() || 'light'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
      <img
        src={url}
        style={{
          margin: '12px 8px',
          height: 18,
          width: 'auto',
        }}
      />
      <h2 style={{ margin: 0 }}>FormDesign</h2>
    </div>
  );
};
