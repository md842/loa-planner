import {type Materials} from './types';

let marketPrices = {
  shards: 0.6,
  fusions: 84,
  reds: 1.05,
  blues: 0.04,
  leaps: 6,
  redSolars: 350,
  blueSolars: 195
};

export function goldValue(mats: Materials): number{
  let goldValue: number = 0;
  for (let [key, value] of Object.entries(marketPrices))
    goldValue += value * mats[key];
  goldValue += mats.gold;
  return Math.round(goldValue);
}