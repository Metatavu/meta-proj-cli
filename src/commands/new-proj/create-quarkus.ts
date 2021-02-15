/**
 * Constructs creation command for Quarkus projects
 * @param projName desired project name
 * 
 * @param kotlin true/false if using Kotlin
 * 
 * @param gradle true/false if using Gradle
 * 
 * @returns a command that is used to create the Quarkus project
 */
export const CreateQuarkus = async (projName : string, kotlin : boolean, gradle : boolean) : Promise<string> => {
  const orgName = "fi.metatavu";
  let kotlinS : string = null;
  kotlin ? kotlinS = ", kotlin" : kotlinS = "";
  let gradleS : string = null;
  gradle ? gradleS = "\
  -DbuildTool=gradle" : gradleS = ""; 
  
  return `mvn io.quarkus:quarkus-maven-plugin:1.11.3.Final:create \
  -DprojectGroupId=${orgName} \
  -DprojectArtifactId=${projName} \
  -DclassName="${orgName}.${projName}" \
  -Dpath="/${projName}" \
  -Dextensions="resteasy, resteasy-jackson${kotlinS}" ${gradleS}`;
}
