import {type Character, initCharacter, type RosterGoal, type Goal} from './types';

// Initialize character data and roster goal data at module level
let chars: Character[] = [];
let rosterGoals: RosterGoal[] = [];

let i: number = 0; // Character index
// Attempt to load data for character index i from local storage
let charData = localStorage.getItem("chr_" + i);
while (charData){ // Data for character index i exists in local storage
  chars.push(JSON.parse(charData) as Character); // Use local stored data
  i += 1;
  charData = localStorage.getItem("chr_" + i); // Load next character
}

// Attempt to load roster goals data from local storage
const storedRosterGoals = localStorage.getItem('rosterGoals');
if (storedRosterGoals) // Roster goal data exists in local storage
  rosterGoals = JSON.parse(storedRosterGoals); // Use local stored data

console.log("Initialized", chars.length, "characters.");
console.log("Initialized", rosterGoals.length, "roster goals.");


// Tracking how much data is being saved over the course of a testing session
let totalSaved: number = 0; // This can be deleted later.


/** Adds a new blank character to the end of the character data. */
export function addChar(): boolean{
  if (chars.length == 12) // Limit characters to 12
    return false; // Adding character failed

  chars.push(initCharacter()); // Add character
  // Each roster goal's goal indices field must be expanded for new character.
  rosterGoals.forEach((rosterGoal: RosterGoal) => {
    rosterGoal.goals.push([]); // New char has no goals
  });
  saveChar(chars.length - 1); // Save new character data to local storage
  saveRosterGoals(); // Save updated roster goals to local storage
  return true; // Adding character succeeded
} // Must save to prevent desync of chars and rosterGoals.


/** Deletes the character with the specified index. */
export function delChar(index: number){
  chars.splice(index, 1); // Remove the specified character from chars

  // Update (shift up) all character data in local storage after deleted index
  for (let i = index; i < chars.length; i++)
    saveChar(i); // Save updated character data to local storage
  localStorage.removeItem("chr_" + chars.length); // Remove last chr data slot

  // Remove the specified character from all roster goals
  rosterGoals.forEach((rosterGoal: RosterGoal) => {
    rosterGoal.goals.splice(index, 1);
  });
  saveRosterGoals(); // Save updated roster goals to local storage
}


/** Returns the contents of chars. */
export function getChars(): Character[]{
  return chars;
}


/** Returns the contents of rosterGoals. */
export function getRosterGoals(): RosterGoal[]{
  return rosterGoals;
}


/** Saves current character data to local storage. */
export function saveChar(index: number){
  let temp: string = JSON.stringify(chars[index]);
  totalSaved += temp.length;
  console.log("Character data: Saved", temp.length, "B,", totalSaved, "B total");

  localStorage.setItem('chr_' + index, temp);
}


/** Saves current roster goal data to local storage. */
export function saveRosterGoals(){
  let temp: string = JSON.stringify(rosterGoals);
  totalSaved += temp.length;
  console.log("Character data: Saved", temp.length, "B,", totalSaved, "B total");

  localStorage.setItem('rosterGoals', temp);
}


/** Save parameters received from a character's SettingsModal. */
export function saveCharParams(index: number, name: string, ilvl: string, charClass: string, usesClassColor: boolean, color: string){
  let char: Character = chars[index];
  char.name = name;
  char.ilvl = ilvl;
  char.class = charClass;
  char.usesClassColor = usesClassColor;
  char.color = color;
  saveChar(index); // Save updated character data to local storage
}


/** Overwrites a character's goals entirely with the specified data. */
export function setGoalData(charIndex: number, newData: Goal[]){
  chars[charIndex].goals = newData;
} // Don't save here, saveChar() will be called by next onBlur event


/** Sets the name of the specified roster goal. */
export function setRosterGoalName(index: number, name: string){
  rosterGoals[index].id = name;
} // Don't save here, saveRosterGoals() will be called by next onBlur event


/** Overwrites rosterGoals entirely with the specified data. */
export function setRosterGoalData(newData: RosterGoal[]){
  rosterGoals = newData;
  saveRosterGoals();  // Save updated roster goals to local storage
}


/** Swaps a character with another character in the specified direction. */
export function swapChar(index: number, direction: number): boolean{
  if ((index == 0 && direction == -1) || // First char and direction is up
      ((index == chars.length - 1) && direction == 1)) // Last char and direction is down
    return false; // Return without swapping

  // Swap character order in chars using array destructuring
  [chars[index], chars[index + direction]] = [chars[index + direction], chars[index]];
  // Swap character order in each roster goal by swapping indices arrays
  rosterGoals.forEach((rosterGoal: RosterGoal) => {
    [rosterGoal.goals[index], rosterGoal.goals[index + direction]] =
      [rosterGoal.goals[index + direction], rosterGoal.goals[index]];
  });

  saveChar(index); // Save updated character data to local storage
  saveChar(index + direction); // Save other character
  saveRosterGoals(); // Save updated roster goals to local storage
  return true; // Swapping characters succeeded
}