import {type Materials, initMaterials, type Source} from './types';

// Initialize roster storage data at module level
let rosterMats: Materials = initMaterials();

// Hardcoded placeholder sources
let sources: {[index: string]: Source[]} = {
  "fusions": [
    {label: "Tradable", qty: [0], selected: [true], mult: [1]},
    {label: "Other", qty: [0], mult: [1]},
    {label: "Total", qty: [0], mult: [1]}
  ],
  "shards": [
    {label: "Other", qty: [0], mult: [1]},
    {label: "Total", qty: [0], mult: [1]}
  ],
  "leaps": [
    {label: "Other", qty: [0], mult: [1]},
    {label: "Total", qty: [0], mult: [1]}
  ],
  "reds": [
    {label: "Tradable 1640",
      qty: [1000, 3000], selected: [true, true], mult: [1, 1]},
    {label: "Tradable 1580",
      qty: [1000, 3000], selected: [true, true], mult: [0.2, 0.2]},
    {label: "Tradable 1490",
      qty: [1000, 3000], selected: [true, true], mult: [0.04, 0.04]},
    {label: "Tradable 1250",
      qty: [1000, 3000], selected: [true, true], mult: [0.008, 0.008]},
    {label: "Daily Chest",
      qty: [100, 100], selected: [true, false], mult: [40, 80], selectionChest: true},
    {label: "Other",
      qty: [0, 0], mult: [1, 1]},
    {label: "Total",
      qty: [5248, 3744], mult: [1, 1]},
  ],
  "redSolars": [
    {label: "Other",
      qty: [0, 0], mult: [1, 1]},
    {label: "Total",
      qty: [0, 0], mult: [1, 1]},
  ],
};

rosterMats = { // Uses placeholder values for now
  silver: 645120369,
  gold: 3687289,
  shards: 2652000,
  fusions: 11873,
  reds: 80569,
  blues: 1063845,
  leaps: 25780,
  redSolars: 77,
  blueSolars: 3957
}

/** Returns the contents of rosterMats. */
export function getRosterMats(): Materials{
  return rosterMats;
}

/** Returns the stored source data for the specified material. */
export function getSources(mat: keyof Materials): Source[]{
  return sources[mat];
}

/** Sets roster storage data for the specified material and quantity. */
export function setRosterMat(mat: keyof Materials, quantity: number){
  rosterMats[mat] = quantity;
  console.log("rosterMats:", rosterMats);
}