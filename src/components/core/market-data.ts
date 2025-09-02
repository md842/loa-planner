import {type Materials} from './types';

let marketPrices = {
  shards: 0.63,
  fusions: 65,
  reds: 1.56,
  blues: 0.03,
  leaps: 7,
  redSolars: 350,
  blueSolars: 164
};

export function goldValue(mats: Materials): number{
  let goldValue: number = 0;
  for (let [key, value] of Object.entries(marketPrices))
    goldValue += value * mats[key];
  goldValue += mats.gold;
  return Math.round(goldValue);
}