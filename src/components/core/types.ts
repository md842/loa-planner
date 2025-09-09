/** Character data structure. */
export interface Character{
  name: string; // Name of character.
  ilvl: string; // Item level of character.
  class: string; // Class of character.
  usesClassColor: boolean; // If false, character uses a custom color.
  color: string; // The character's custom color.
  goals: Goal[]; // Array of goals belonging to character.
  boundMats: Materials; // Bound materials belonging to character.
}

/** Initializes and returns a default Character object. */
export function initCharacter(): Character{
  return {
    name: "(Name)",
    ilvl: "(Ilvl)",
    class: "(Class)",
    usesClassColor: true,
    color: "#777",
    goals: [initGoal()],
    boundMats: initMaterials()
  };
}

/** Roster goal data structure. */
export interface RosterGoal{
  name: string; // Name of roster goal.
  goals: boolean[][]; // Indices of goals to include from each character.
                     // [[goals of chars[0]], [goals of chars[1]]]...]
}

/** Initializes and returns a default RosterGoal object. */
export function initRosterGoal(chars: Character[]): RosterGoal{
  let out: RosterGoal = {
    name: "(Goal Name)",
    goals: []
  };
  for (let i = 0; i < chars.length; i++){ // For each character
    let charGoals: boolean[] = []; // Initialize goals to false (not included)
    for (let j = 0; j < chars[i].goals.length; j++)
      charGoals.push(false); // Default to false
    out.goals.push(charGoals); // Add empty indices array for each character
  }
  return out;
}


/** Goal data structure. */
export interface Goal{
  name: string; // Name of goal.
  mats: Materials; // Uniform index signature helps with type checking.
}

/** Initializes and returns a default Goal object. */
export function initGoal(): Goal{
  return {name: "(Goal Name)", mats: initMaterials()};
}


/** Materials data structure. */
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

/** Initializes and returns a default Materials object. */
export function initMaterials(): Materials{
  return {silver: 0, gold: 0, shards: 0, fusions: 0, reds: 0, blues: 0, leaps: 0, redSolars: 0, blueSolars: 0};
}

/** Initializes and returns a sum of Materials objects. */
export function addMaterials(a: Materials, b: Materials): Materials{
  let out = initMaterials();
  for (let [key] of Object.entries(a))
    out[key] = a[key] + b[key];
  return out;
}

/** Initializes and returns a difference of Materials objects. */
export function subMaterials(a: Materials, b: Materials): Materials{
  let out = initMaterials();
  for (let [key] of Object.entries(a))
    out[key] = Math.max(0, a[key] - b[key]); // Materials cannot be negative
  return out;
}