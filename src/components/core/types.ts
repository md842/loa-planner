/* Stores information about a character. */
export interface Character{
  index: number; // Index of character, used for data organization
  name: string; // Name of character.
  ilvl: string; // Item level of character.
  class: string; // Class of character.
  usesClassColor: boolean; // If false, character uses a custom color.
  color: string; // The character's custom color.
  goals: Goal[]; // Array of goals belonging to character.
  boundMats: Materials; // Bound materials belonging to character.
}

/* Initializes and returns a default Character object. */
export function initCharacter(): Character{
  return {
    index: 0,
    name: "(Name)",
    ilvl: "0",
    class: "",
    usesClassColor: false,
    color: "#777",
    goals: [initGoal()],
    boundMats: {...initMaterials(), silver: NaN} // Bound silver does not exist
  };
}


/* Interface for character goal data. */
export interface Goal{
  name: string;
  values: Materials; // Uniform index signature helps with type checking.
}

/* Initializes and returns a default Goal object. */
export function initGoal(): Goal{
  return {name: "(Goal Name)", values: initMaterials()};
}


/* Interface for material types. */
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

/* Initializes and returns a default Materials object. */
export function initMaterials(): Materials{
  return {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0};
}