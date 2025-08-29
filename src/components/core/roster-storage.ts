import {type Materials} from './types';

export function loadRosterMats(): Materials{
  // Uses placeholder values for now.
  let rosterMats: Materials = {
    silver: 612665650,
    gold: 15929434,
    shards: 2257000,
    fusions: 11393,
    reds: 201826,
    blues: 772896,
    leaps: 20987,
    redSolars: 59,
    blueSolars: 3400
  };
  return rosterMats;
}