import {type Materials, initMaterials} from './types';

// Initialize roster storage data at module level
let rosterMats: Materials = initMaterials();

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