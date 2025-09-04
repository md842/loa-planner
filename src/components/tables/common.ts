import {type ChangeEvent} from 'react';

import {saveChars} from '../core/character-data';

/** Prevents unnecessary saving of character data when no changes were made. */
export function saveChanges(changed: boolean){
  if (changed) // Check for unsaved changes
    saveChars(); // Save updated character data
}

/** Sanitizes input and improves user experience with numeric inputs. */
export function sanitizeInput(e: ChangeEvent<HTMLInputElement>, prevValue: number): boolean{
  if (e.target.value == "") // Input sanitization: allow deleting last digit
    e.target.value = "0"; // Set empty input to 0
  
  let input: number = Number(e.target.value);
  if (Number.isNaN(input)){ // Input sanitization: Reject non-numeric input
    e.target.value = String(prevValue); // Overwrite invalid value
    return false; // Input is invalid
  }
  e.target.value = String(input); // Input sanitization: Clear leading 0s
  return true; // Input is valid
}