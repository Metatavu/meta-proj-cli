import Vorpal from "vorpal";

/**
 * Helps with grouping commands without needing a new .use.execSync for each of them
 * 
 * use: intended to hold imported contents of command
 * command: string used to call the command in question
 */
export interface CommandSet {
  use: (Vorpal) => Vorpal.Command,
  command: string
}

/**
 * Used to store and transmit data about the outcome of a prerequisite check
 * 
 * check: name of the prerequisite that was checked\
 * error: did an error occur or not\
 * details: possible extra details about the error
 */
export interface CheckErrorSet {
  check: string,
  error: boolean,
  details: string
}

/**
 * Provides the name and possible details to a prerequisite checking function
 * 
 * checkable: name of the prerequisite to check\
 * details: possible extra details needed for the check
 */
export interface CheckSet {
  checkable: string,
  details: unknown
}

/**
 * OS and its corresponding commands
 * 
 * OS: operating system
 * commands: an array that contains the commands
 */
export interface OsCommand {
  OS: string,
  commands: CommandObj[]
}

/**
 * Command that is used in bash
 * 
 * name: command key that is used when searching for command
 * command: command value that is OS-dependent
 */
export interface CommandObj {
  name: string
  command: string
}

/**
 * Interface for user-config file to not run into errors
 * 
 * osPref: user preferred OS
 */
export interface UserConfigJson {
  osPref: string
}

/**
 * Format for project-config.jsons
 * 
 * @property projectName name of the project
 */
export interface ProjConfigJson {
  projectName: string
}

/**
 * User arguments that are passed to edit and create .yaml files
 * 
 * @property name: Project name
 * @property image: Image for component, if any
 * @property port: Port number for component
 * @property portType: Port type for Service, if any
 * @property ports: Array of ports for Service / Deployment, if any
 * @property replicas: Amount of component replicas
 */
export interface KubeArgs {
  name: string,
  image: string,
  port: number,
  portType: string,
  ports: Array<unknown>
  replicas: number
}

/**
 * Includes user arguments and the component type attached
 * 
 * @property args User arguments
 * @property type Component type Pod / Service / Deployment
 */
export interface KubeComponent {
  args: KubeArgs,
  type: string
}

/**
 * Contains a detail for linking a Minikube into AWS
 */
export interface YamlEnv {
  name: string,
  value: string
}

/**
 * Global constants for OS names
 */
export enum OperatingSystems {
  LINUX = "LINUX",
  WINDOWS = "WINDOWS",
  MAC = "MAC OS"
}

/**
 * Global constants for command names
 */
export enum CommandNames {
  copy = "copy",
  remove = "remove",
  removeDir = "remove directory",
  installUtil = "installation utility"
}

/**
 * Global constants for software names
 */
export enum Software {
  NodeJs = "NodeJs",
  GitHub = "GitHub",
  GitCLI = "Git CLI",
  Maven = "Maven",
  JDK8 = "Java Development Kit 8",
  JDK11 = "Java Development Kit 11",
  Homebrew = "Homebrew",
  Docker = "Docker",
  Minikube = "Minikube",
  KubernetesCLI = "Kubernetes CLI",
  Kustomize = "Kustomize",
  EKSctl = "EKS CLI",
  AWSCLI = "AWS CLI"
}