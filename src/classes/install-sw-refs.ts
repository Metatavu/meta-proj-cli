import { Software } from "../interfaces/types";

export class InstallSwRefs {

  /**
   * Get Install Reference for Installation Utils class
   * 
   * @param software is the software in question
   * 
   * @returns installation reference used in bash to install the software
   */
  public static async getInstallRef(installUtil : string, software : string) : Promise<string> {

    switch (software) {
      case Software.NodeJs:
        return (installUtil == "brew") ? "node" : "nodejs";

      case Software.GitHub:
        return "gh";

      case Software.GitCLI:
        return (installUtil == "sudo apt") ? "git-all" : "git";

      case Software.Maven:
        return (installUtil == "brew") ? "maven@3.5" : "maven";

      case Software.JDK8:
        if (installUtil == "choco") {
          return "ojdkbuild8";
        }
        if (installUtil == "sudo apt") {
          return "openjdk-8-jdk";
        } else {
          return "openjdk@8";
        }
        
      case Software.JDK11:
        if (installUtil == "choco") {
          return "ojdkbuild11";
        }
        if (installUtil == "sudo apt") {
          return "openjdk-11-jdk";
        } else {
          return "openjdk@11";
        }
    }
  }

  /**
   * Get bash references for Installation Utils class
   * 
   * @param software is the software in question
   * 
   * @returns bash reference for the software
   */
  public static async getBashRef(software : string) : Promise<string> {
    switch (software) {
      case Software.NodeJs:
        return "npm";

      case Software.GitHub:
        return "gh";

      case Software.GitCLI:
        return "git";

      case Software.Maven:
        return "mvn";

      case Software.JDK8:
        return "java";
        
      case Software.JDK11:
        return "java";

      case Software.Homebrew:
        return "brew";
    }
  }
}