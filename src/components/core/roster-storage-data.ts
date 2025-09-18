import {type Materials, initMaterials, type Source} from './types';

// Declare roster storage data structures at module level
const rosterMats: Materials = initMaterials();
const sources: {[index: string]: Source[]} = {}

const defaultSources: {[index: string]: Source[]} = {
  "silver": [
    {label: "Roster-bound", qty: [0], amt: [0]},
    {label: "Total", qty: [0], amt: [0]}
  ],
  "gold": [
    {label: "Tradable", qty: [0], selected: [true], amt: [0]},
    {label: "Roster-bound", qty: [0], amt: [0]},
    {label: "Total", qty: [0], amt: [0]}
  ],
  "fusions": [
    {label: "Tradable", qty: [0], selected: [true], amt: [0]},
    {label: "Product Inventory", qty: [0], mult: [50], amt: [0]},
    {label: "Blue Crystals", qty: [0], selected: [false], mult: [50], div: 65, amt: [0]},
    {label: "Craftable", qty: [0], selected: [false], mult: [10], amt: [0]},
    {label: "Farm Chest", qty: [0], mult: [10], amt: [0]},
    {label: "Other", qty: [0], amt: [0]},
    {label: "Total", qty: [0], amt: [0]}
  ],
  "shards": [
    {label: "Tradable (L)", qty: [0], selected: [false], mult: [3000], amt: [0]},
    {label: "Tradable (M)", qty: [0], selected: [false], mult: [2000], amt: [0]},
    {label: "Tradable (S)", qty: [0], selected: [false], mult: [1000], amt: [0]},
    {label: "Roster-bound (L)", qty: [0], mult: [3000], amt: [0]},
    {label: "Roster-bound (M)", qty: [0], mult: [2000], amt: [0]},
    {label: "Roster-bound (S)", qty: [0], mult: [1000], amt: [0]},
    {label: "Event Chest (M)", qty: [0], mult: [2000], amt: [0]},
    {label: "Daily Chest", qty: [0], selected: [true], mult: [1000], amt: [0]},
    {label: "Other", qty: [0], amt: [0]},
    {label: "Total", qty: [0], amt: [0]}
  ],
  "leaps": [
    {label: "Tradable 1640", qty: [0], selected: [false], amt: [0]},
    {label: "Tradable 1580", qty: [0], selected: [false], div: 5, amt: [0]},
    {label: "Tradable 1490", qty: [0], selected: [false], div: 25, amt: [0]},
    {label: "Tradable 1250", qty: [0], selected: [false], div: 125, amt: [0]},
    {label: "Event Chest (x5)", qty: [0], mult: [5], amt: [0]},
    {label: "Daily Chest", qty: [0], selected: [false], mult: [2], amt: [0]},
    {label: "Other", qty: [0], amt: [0]},
    {label: "Total", qty: [0], amt: [0]}
  ],
  "reds": [
    {label: "Tradable 1640",
      qty: [0, 0], selected: [true, true], amt: [0, 0]},
    {label: "Tradable 1580",
      qty: [0, 0], selected: [true, true], div: 5, amt: [0, 0]},
    {label: "Tradable 1490",
      qty: [0, 0], selected: [true, true], div: 25, amt: [0, 0]},
    {label: "Tradable 1250",
      qty: [0, 0], selected: [true, true], div: 125, amt: [0, 0]},
    {label: "75x Pouch",
      qty: [0, 0], mult: [75, 75], amt: [0, 0]},
    {label: "Daily Chest",
      qty: [0, 0], selected: [true, false], mult: [40, 80], selectionChest: true, amt: [0, 0]},
    {label: "Other",
      qty: [0, 0], amt: [0, 0]},
    {label: "Total",
      qty: [0, 0], amt: [0, 0]},
  ],
  "redSolars": [
    {label: "Tradable",
      qty: [0, 0], selected: [false, false], amt: [0, 0]},
    {label: "3/9 Selection",
      qty: [0, 0], selected: [true, false], mult: [3, 9], selectionChest: true, amt: [0, 0]},
    {label: "Daily Chest",
      qty: [0, 0], selected: [true, false], mult: [1, 3], selectionChest: true, amt: [0, 0]},
    {label: "Other",
      qty: [0, 0], amt: [0, 0]},
    {label: "Total",
      qty: [0, 0], amt: [0, 0]},
  ],
};

// Initialize roster storage data
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

    // Set rosterMats value to total amount for this key
    rosterMats[key] = sources[key][sources[key].length - 1].amt[0];
  }
  /* Due to the structure of the Materials object, reds always initialize
     before blues, and likewise for redSolars and blueSolars. */
  else if (key == "blues") // Set rosterMats value to total blues amount
    rosterMats[key] = sources["reds"][sources["reds"].length - 1].amt[1];
  else // Set rosterMats value to total blueSolars amount
    rosterMats[key] = sources["redSolars"][sources["redSolars"].length - 1].amt[1];
}

console.log("Initialized roster materials:", rosterMats);


/* I have some concerns about how much data is being saved with the current
   implementations, so tracking how much is being saved over the course of a
   testing session. */
let totalSaved: number = 0; // This can be deleted later.


/** Returns a const reference to rosterMats. */
export function getRosterMats(): Materials{
  return rosterMats;
}

/** Returns a const reference to stored source data for specified mat. */
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