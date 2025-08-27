import React from 'react';
import {
  BitcoinIcon,
  BitcoinCircleIcon,
  SatoshiIcon,
  MiningIcon,
  BTCIcon,
  BitcoinOutlineIcon,
  BitcoinCircleOutlineIcon,
  SatoshiOutlineIcon,
  MinerOutlineIcon,
  MiningOutlineIcon,
  BitcoinPresentationIcon,
  BitcoinStyledIcon,
  SatoshiManIcon
} from './index';

export const IconShowcase: React.FC = () => {
  const filledIcons = [
    { name: 'BitcoinIcon', component: BitcoinIcon },
    { name: 'BitcoinCircleIcon', component: BitcoinCircleIcon },
    { name: 'SatoshiIcon', component: SatoshiIcon },
    { name: 'MiningIcon', component: MiningIcon },
  ];

  const outlineIcons = [
    { name: 'BitcoinOutlineIcon', component: BitcoinOutlineIcon },
    { name: 'BitcoinCircleOutlineIcon', component: BitcoinCircleOutlineIcon },
    { name: 'SatoshiOutlineIcon', component: SatoshiOutlineIcon },
    { name: 'MinerOutlineIcon', component: MinerOutlineIcon },
    { name: 'MiningOutlineIcon', component: MiningOutlineIcon },
  ];

  const specialIcons = [
    { name: 'BTCIcon', component: BTCIcon },
    { name: 'BitcoinPresentationIcon', component: BitcoinPresentationIcon },
    { name: 'BitcoinStyledIcon', component: BitcoinStyledIcon },
    { name: 'SatoshiManIcon', component: SatoshiManIcon },
  ];

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Bitcoin Icons Showcase</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Filled Icons</h3>
        <div className="grid grid-cols-4 gap-4">
          {filledIcons.map(({ name, component: Icon }) => (
            <div key={name} className="flex flex-col items-center p-4 border rounded">
              <Icon size={32} className="text-bitcoin-500 mb-2" />
              <span className="text-sm text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Outline Icons</h3>
        <div className="grid grid-cols-4 gap-4">
          {outlineIcons.map(({ name, component: Icon }) => (
            <div key={name} className="flex flex-col items-center p-4 border rounded">
              <Icon size={32} className="text-bitcoin-500 mb-2" />
              <span className="text-sm text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Special Icons</h3>
        <div className="grid grid-cols-4 gap-4">
          {specialIcons.map(({ name, component: Icon }) => (
            <div key={name} className="flex flex-col items-center p-4 border rounded">
              <Icon size={32} className="mb-2" />
              <span className="text-sm text-center">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Size Examples</h3>
        <div className="flex items-center space-x-4">
          <BitcoinIcon size={16} className="text-bitcoin-500" />
          <BitcoinIcon size={24} className="text-bitcoin-500" />
          <BitcoinIcon size={32} className="text-bitcoin-500" />
          <BitcoinIcon size={48} className="text-bitcoin-500" />
        </div>
      </div>
    </div>
  );
};