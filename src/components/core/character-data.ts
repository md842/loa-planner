import {type Character, initCharacter} from './types';

var chars: Character[]; // Store character data at module level

/* I have some concerns about how much data is being saved with the current
   implementation, so tracking how much is being saved over the course of a 
   testing session. May need to implement saving of individual characters or
   even individual fields to reduce (will increase complexity of loadChars). */
let totalSaved: number = 0; // This can be deleted later.

/* Loads character data from local storage if available, else initialize. */
export function loadChars(): Character[]{
  // Attempt to load character data from local storage
  const storedChars = window.localStorage.getItem('chars');

  if (storedChars) // Character data exists in local storage
    chars = JSON.parse(storedChars); // Initialize chars with local stored data
  else // Character data does not exist in local storage
    chars = [initCharacter()]; // Initialize chars with blank character

  return chars; // Return character data array
}

/* Saves current character data to local storage. */
export function saveChars(){
  let temp: string = JSON.stringify(chars);
  totalSaved += temp.length;
  console.log("Saved", temp.length, "B,", totalSaved, "B total");

  window.localStorage.setItem('chars', temp);
}

/* Save parameters received from a character's SettingsModal. */
export function saveCharParams(index: number, name: string, ilvl: string, charClass: string, usesClassColor: boolean, color: string){
  let char: Character = chars[index];
  char.name = name;
  char.ilvl = ilvl;
  char.class = charClass;
  char.usesClassColor = usesClassColor;
  char.color = color;
  saveChars(); // Save updated character data to local storage
}