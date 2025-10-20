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
    name: "",
    ilvl: "",
    class: "(New Character)",
    usesClassColor: true,
    color: "#777",
    goals: [initGoal("Total")],
    boundMats: initMaterials()
  };
}

/** Searches a Character array for the specified name. */
export function charNameUnique(chars: Character[], name: string, ignoreIndex?: number): boolean{
  return chars.every(function(char: Character, index: number){
    if (index == ignoreIndex)
      return true;
    return name != char.name; // Returns false on any match
  }); // Returns true if no match
}


/** Roster goal data structure. */
export interface RosterGoal{
  id: string; // Name of roster goal.
  goals: boolean[][]; // Indices of goals to include from each character.
                     // [[goals of chars[0]], [goals of chars[1]]]...]
}

/** Initializes and returns a default RosterGoal object. */
export function initRosterGoal(name: string, chars: Character[]): RosterGoal{
  let out: RosterGoal = {id: name, goals: []};

  // Initialize RosterGoal shape: [chars.length, chars[i].goals.length]
  for (let i = 0; i < chars.length; i++){ // For each character i
    let charGoals: boolean[] = []; // Initialize included goals array
    // For each goal of character i (use length - 1 to exclude "Total")
    for (let j = 0; j < chars[i].goals.length - 1; j++)
      charGoals.push(false); // chars[i].goals[j] not included in RosterGoal
    out.goals.push(charGoals); // Push included goals array for character i
  }
  return out;
}


/** Goal data structure. */
export interface Goal{
  id: string; // Name of goal.
  mats: Materials; // Uniform index signature helps with type checking.
}

/** Initializes and returns a default Goal object. */
export function initGoal(name: string): Goal{
  return {id: name, mats: initMaterials()};
}

/** Searches a Goal or RosterGoal array for the specified name. */
export function goalNameUnique(goals: Goal[] | RosterGoal[], name: string, ignoreIndex?: number): boolean{
  return goals.every(function(goal: Goal | RosterGoal, index: number){
    if (index == ignoreIndex)
      return true;
    return name != goal.id; // Returns false on any match
  }); // Returns true if no match
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


/** Roster storage table source data structure. */
export interface Source{
  id: string;

  // If arrays have length 2, this Source is a combo source (e.g., reds/blues)
  qty: number[];
  amt: number[];

  sel?: boolean[]; // If defined, source is selectable; true = active
  use?: number[]; // If defined, source is a selection chest, fields represent quantities used

  mult?: number[]; // If defined, qty has a multiplier
  div?: number; // If defined, qty has a floored division before multiplier
}

/** Returns the index of a Source id within a Source array. */
export function findSource(idToFind: string, sources: Source[]){
  return sources.findIndex(({id}) => idToFind === id);
}