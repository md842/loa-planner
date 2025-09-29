import {type Materials, initMaterials, type Source} from './types';

// Declare market price data structure at module level
const marketData: Materials = initMaterials();
const sources: {[index: string]: Source[]} = {}

const defaultSources: {[index: string]: Source[]} = {
  "shards": [
    {id: "Destiny Shard Pouch (S)", qty: [0], sel: [true], mult: [1000], amt: [0]},
    {id: "Destiny Shard Pouch (M)", qty: [0], sel: [true], mult: [2000], amt: [0]},
    {id: "Destiny Shard Pouch (L)", qty: [0], sel: [true], mult: [3000], amt: [0]},
    {id: "Optimal", qty: [0], amt: [0]}
  ],
  "fusions": [
    {id: "Abidos Fusion Material (1640)", qty: [0], sel: [true], amt: [0]},
  ],
  "reds": [
    {id: "Destiny Destruction Stone (1640)", qty: [0], sel: [true], mult: [100], amt: [0]},
    {id: "Refined Obliteration Stone (1580)", qty: [0], sel: [true], mult: [100], div: 5, amt: [0]},
    {id: "Optimal", qty: [0], amt: [0]}
  ],
  "blues": [
    {id: "Destiny Guardian Stone (1640)", qty: [0], sel: [true], mult: [100], amt: [0]}
  ],
  "leaps": [
    {id: "Destiny Leapstone (1640)", qty: [0], sel: [true], amt: [0]}
  ],
  "redSolars": [
    {id: "Lava's Breath", qty: [0], sel: [true], amt: [0]}
  ],
  "blueSolars": [
    {id: "Glacier's Breath", qty: [0], sel: [true], amt: [0]}
  ],
};

// Initialize market data
for (let [key] of Object.entries(marketData)){
  // Silver and gold are ignored by market data
  if (key != "silver" && key != "gold"){
    // Attempt to load data from local storage
    const storedSources = window.localStorage.getItem('m_' + key);

    if (storedSources) // Source data exists in local storage
      sources[key] = JSON.parse(storedSources); // Use local stored data
    else // Source data does not exist in local storage
      sources[key] = defaultSources[key]; // Use default data

    // Set marketData value to total amount for this key
    marketData[key] = sources[key][sources[key].length - 1].amt[0];
  }
}

console.log("Initialized market prices:", marketData);

/** Returns a const reference to stored source data for specified mat. */
export function getSources(mat: keyof Materials): Source[]{
  return sources[mat];
}

export function goldValue(mats: Materials): number{
  let goldValue: number = 0;
  for (let [key, value] of Object.entries(marketData))
    if (key != "silver" && key != "gold")
      goldValue += value * mats[key];
  goldValue += mats.gold;
  return Math.round(goldValue);
}

/** Saves current market data for specified mat to local storage. */
export function saveSources(mat: keyof Materials){
  window.localStorage.setItem('m_' + mat, JSON.stringify(sources[mat]));
}

/** Sets market data for the specified material and quantity. */
export function setMarketData(mat: keyof Materials, quantity: number){
  marketData[mat] = quantity;
}

export function setSourceData(mat: keyof Materials, newData: Source[]){
  sources[mat] = newData;
}