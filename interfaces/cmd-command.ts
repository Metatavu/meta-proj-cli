export interface OsCommand {
  OS : string,
  commands : Command[]
}

export interface Command {
  name : string
  command : string
}