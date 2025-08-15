/** Stores information about a character. */
export interface Character{
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

export function loadChars(): Character[]{
  // Uses placeholder values for now.
  let chars: Character[] = [];

  let char1: Character = {
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

  // Push placeholder goals to char 1
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

  /*let char2: Character = {
    name: "Glaiv",
    ilvl: "1704",
    class: "Glaivier",
    goals: [],
    boundMats: {
      silver: NaN,
      gold: 0,
      shards: 3378661,
      fusions: 1054,
      reds: 50755,
      blues: 225010,
      leaps: 2725,
      redSolars: 69,
      blueSolars: 579}
  }

  // Push placeholder goals to char 2
  char2.goals.push({
    name: "Adv 21-30",
    values: {
      silver: 19665071,
      gold: 473413,
      shards: 2006944,
      fusions: 4025,
      reds: 0,
      blues: 236707,
      leaps: 4261,
      redSolars: 0, 
      blueSolars: 855
    }
  });
  char2.goals.push({
    name: "Adv 31-40",
    values: {
      silver: 23430545,
      gold: 568095,
      shards: 2593650,
      fusions: 4498,
      reds: 0,
      blues: 284048,
      leaps: 5445,
      redSolars: 0,
      blueSolars: 1026
    }
  });
  
  chars.push(char2);*/

  return chars;
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