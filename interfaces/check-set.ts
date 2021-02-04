/**
 * Provides the name and possible details to a prerequisite checking function
 * 
 * checkable : name of the prerequisite to check\
 * details : possible extra details needed for the check
 */
export interface CheckSet {
  checkable : string,
  details : {}
}