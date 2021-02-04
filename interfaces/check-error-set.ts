/**
 * Used to store and transmit data about the outcome of a prerequisite check
 * 
 * checkable : name of the prerequisite that was checked\
 * error : did an error occur or not\
 * details : possible extra details about the error
 */
export interface CheckErrorSet {
  check : string,
  error : boolean,
  details : string
}