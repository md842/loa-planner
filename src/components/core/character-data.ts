import {type Character, initCharacter, type RosterGoal, initRosterGoal} from './types';

// Initialize character data and roster goal data at module level
let chars: Character[] = [];
let rosterGoals: RosterGoal[] = [];

// Attempt to load data from local storage
const storedChars = window.localStorage.getItem('chars');
const storedRosterGoals = window.localStorage.getItem('rosterGoals');

if (storedChars) // Character data exists in local storage
  chars = JSON.parse(storedChars); // Use local stored data
if (storedRosterGoals) // Roster goal data exists in local storage
  rosterGoals = JSON.parse(storedRosterGoals); // Use local stored data
else // Must have at least one roster goal, initialize one
  rosterGoals = [initRosterGoal(chars)];

console.log("Initialized", chars.length, "characters.");
console.log("Initialized", rosterGoals.length, "roster goals.");


/* I have some concerns about how much data is being saved with the current
   implementations, so tracking how much is being saved over the course of a
   testing session. May need to implement saving of individual characters or
   even individual fields to reduce (will complicate all data operations). */
let totalSaved: number = 0; // This can be deleted later.


/** Adds a new blank character to the end of the character data. */
export function addChar(): boolean{
  if (chars.length == 10) // Limit characters to 10
    return false; // Adding character failed

  chars.push(initCharacter()); // Add character
  // Each roster goal's goal indices field must be expanded for new character.
  rosterGoals.forEach((rosterGoal: RosterGoal) => {
    rosterGoal.goals.push([false]); // New char has one goal, default to false
  });
  saveChars(); // Save updated character data to local storage
  saveRosterGoals(); // Save updated roster goals to local storage
  return true; // Adding character succeeded
} // Must save to prevent desync of chars and rosterGoals.

/** Adds a new blank roster goal to the end of the roster goal data. */
export function addRosterGoal(): boolean{
  if (rosterGoals.length == 10) // Limit roster goals to 10
    return false; // Adding roster goal failed

  rosterGoals.push(initRosterGoal(chars)); // Add roster goal
  return true; // Adding roster goal succeeded
} // Don't save goal data; changing anything in new roster goal will save


/** Deletes the character with the specified index. */
export function delChar(index: number){
  chars.splice(index, 1); // Remove the specified character from chars
  // Remove the specified character from all roster goals
  rosterGoals.forEach((rosterGoal: RosterGoal) => {
    rosterGoal.goals.splice(index, 1);
  });
  saveChars(); // Save updated character data to local storage
  saveRosterGoals(); // Save updated roster goals to local storage
}

/** Deletes the last roster goal. */
export function delRosterGoal(){
  rosterGoals.pop(); // Remove the last roster goal
  saveRosterGoals(); // Save updated roster goals to local storage
}


/** Returns the contents of chars in a new array to a state setter. */
export function getChars(): Character[]{
  return [...chars]; // Returning as a new array triggers re-render.
}

/** Returns the contents of rosterGoals. */
export function getRosterGoals(): RosterGoal[]{
  return rosterGoals;
}


/** Mutates corresponding entries in rosterGoals after a char goal operation. */
export function expandRosterGoals(charIndex: number, expand: boolean){
  rosterGoals.forEach((rosterGoal: RosterGoal) => { // For each roster goal,
    if (expand) // Expand roster goal entry for current character
      rosterGoal.goals[charIndex].push(false); // Default to false
    else // Contract roster goal entry for current character
      rosterGoal.goals[charIndex].pop(); // Removes last item
  });
  saveChars(); // Save updated character data to local storage
  saveRosterGoals(); // Save updated roster goals to local storage
} // Must save to prevent desync of chars and rosterGoals.


/** Saves current character data to local storage. */
export function saveChars(){
  let temp: string = JSON.stringify(chars);
  totalSaved += temp.length;
  console.log("Saved", temp.length, "B,", totalSaved, "B total");

  window.localStorage.setItem('chars', temp);
}

/** Saves current roster goal data to local storage. */
export function saveRosterGoals(){
  let temp: string = JSON.stringify(rosterGoals);
  totalSaved += temp.length;
  console.log("Saved", temp.length, "B,", totalSaved, "B total");

  window.localStorage.setItem('rosterGoals', temp);
}


/** Save parameters received from a character's SettingsModal. */
export function saveCharParams(index: number, name: string, ilvl: string, charClass: string, usesClassColor: boolean, color: string){
  let char: Character = chars[index];
  char.name = name;
  char.ilvl = ilvl;
  char.class = charClass;
  char.usesClassColor = usesClassColor;
  char.color = color;
  saveChars(); // Save updated character data to local storage
}


/** Sets the name of the specified roster goal. */
export function setRosterGoalName(index: number, name: string){
  rosterGoals[index].name = name;
} // Don't save here, saveRosterGoals() will be called by next onBlur event


/** Overwrites rosterGoals entirely with the specified data. */
export function setRosterGoals(newData: RosterGoal[]){
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
  saveChars(); // Save updated character data to local storage
  saveRosterGoals(); // Save updated roster goals to local storage
  return true; // Swapping characters succeeded
}