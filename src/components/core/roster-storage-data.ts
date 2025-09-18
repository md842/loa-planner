import {type Materials, initMaterials, type Source} from './types';

// Initialize roster storage data at module level
const rosterMats: Materials = initMaterials();
const sources: {[index: string]: Source[]} = {}
const defaultSources: {[index: string]: Source[]} = {
  "silver": [
    {label: "Roster-bound", qty: [0], mult: [1]},
    {label: "Total", qty: [0], mult: [1]}
  ],
  "gold": [
    {label: "Tradable", qty: [0], selected: [true], mult: [1]},
    {label: "Roster-bound", qty: [0], mult: [1]},
    {label: "Total", qty: [0], mult: [1]}
  ],
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

for (let [key] of Object.entries(rosterMats)){
  /* blues and blueSolars are combo materials with their source data stored in
     reds and redSolars respectively; don't read source data for these keys. */
  if (key != "blues" && key != "blueSolars"){
    // Attempt to load data from local storage
    const storedSources = window.localStorage.getItem('src_' + key);

    if (storedSources) // Source data exists in local storage
      sources[key] = JSON.parse(storedSources); // Use local stored data
    else // Source data does not exist in local storage
      sources[key] = defaultSources[key]; // Use default data

    // Set rosterMats value to total quantity for this key
    rosterMats[key] = sources[key][sources[key].length - 1].qty[0];
  }
  /* Due to the structure of the Materials object, reds always initialize
     before blues, and likewise for redSolars and blueSolars. */
  else if (key == "blues") // Set rosterMats value to total blues quantity
    rosterMats[key] = sources["reds"][sources["reds"].length - 1].qty[1];
  else // Set rosterMats value to total blueSolars quantity
    rosterMats[key] = sources["redSolars"][sources["redSolars"].length - 1].qty[1];
}

console.log("Initialized roster materials:", rosterMats);


/* I have some concerns about how much data is being saved with the current
   implementations, so tracking how much is being saved over the course of a
   testing session. */
let totalSaved: number = 0; // This can be deleted later.


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
}

/** Saves current roster storage data for specified mat to local storage. */
export function saveSources(mat: keyof Materials){
  let temp: string = JSON.stringify(sources[mat]);
  totalSaved += temp.length;
  console.log("Roster storage data: Saved", temp.length, "B,", totalSaved, "B total");

  window.localStorage.setItem('src_' + mat, temp);
}