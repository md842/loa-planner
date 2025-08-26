/** Stores information about a character. */
export interface Character{
  index: number; // Index of character.
  name: string; // Name of character.
  ilvl: string; // Item level of character.
  class: string; // Class of character.
  goals: Goal[]; // Array of goals belonging to character.
  boundMats: Materials; // Bound materials belonging to character.
}

/** Interface for character goal data. */
export interface Goal{
  name: string;
  values: Materials;
}

/** Helps with type checking by providing a uniform index signature. **/
export interface Materials{
  [key: string]: number; // Index signature
  silver: number;
  gold: number;
  shards: number;
  fusions: number;
  reds: number;
  blues: number;
  leaps: number;
  redSolars: number;
  blueSolars: number;
}

var chars: Character[]; // Stored character data

export function loadChars(): Character[]{
  const storedChars = window.localStorage.getItem('chars');
  if (storedChars){ // Found stored chars, load and return them.
    chars = JSON.parse(storedChars);
    return chars;
  }

  // If no stored characters were found, load placeholder character.
  chars = []; // Initialize chars array
  let char1: Character = {
    index: 0,
    name: "Stormvex",
    ilvl: "1727",
    class: "Aeromancer",
    goals: [],
    boundMats: {
      silver: NaN,
      gold: 27000,
      shards: 6062599,
      fusions: 11,
      reds: 36624,
      blues: 206512,
      leaps: 3218,
      redSolars: 60,
      blueSolars: 624}
  }

  // Push placeholder goals
  char1.goals.push({
    name: "Weapon +25",
    values: {
      silver: 6307022,
      gold: 237565,
      shards: 904007,
      fusions: 2103,
      reds: 189211,
      blues: 0,
      leaps: 2734,
      redSolars: 2095, 
      blueSolars: 0
    }
  });
  char1.goals.push({
    name: "1740 (TFM)",
    values: {
      silver: 39737657,
      gold: 982255,
      shards: 4880462,
      fusions: 8332,
      reds: 0,
      blues: 766125,
      leaps: 11431,
      redSolars: 0,
      blueSolars: 1006
    }
  });
  
  chars.push(char1);

  return chars;
}

export function saveChars(){
  window.localStorage.setItem('chars', JSON.stringify(chars));
}

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