import YamlUtils from "./yaml-utils";
import { KubeComponent, KubeArgs } from "../interfaces/types";

export default class MinikubeUtils {

  public async createComponents(compArr: KubeComponent[], repoPath: string): Promise<void> {

    for (const comp in compArr) {
      YamlUtils.createYaml(comp.args, comp.type, repoPath);
    }
  }
}