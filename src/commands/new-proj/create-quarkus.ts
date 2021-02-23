/**
 * Constructs creation command for Quarkus projects
 *
 * @param projName desired project name
 * @param kotlin true/false if using Kotlin
 * @param gradle true/false if using Gradle
 * 
 * @returns a command that is used to create the Quarkus project
 */
export const CreateQuarkus = async (projName: string, kotlin: boolean, gradle: boolean): Promise<string> => {
  const { ORGANIZATION } = process.env;
  const kotlinString: string =  kotlin ? ", kotlin" : "";
  const gradleString: string = gradle ? "\
  -DbuildTool=gradle" : "";

  return `mvn io.quarkus:quarkus-maven-plugin:1.11.3.Final:create \
  -DprojectGroupId=${ORGANIZATION} \
  -DprojectArtifactId=${projName} \
  -DclassName="${ORGANIZATION}.${projName}" \
  -Dpath="/${projName}" \
  -Dextensions="resteasy, resteasy-jackson${kotlinString}" ${gradleString}`;
}
