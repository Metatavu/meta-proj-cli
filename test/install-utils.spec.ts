import { InstallUtils } from "../src/classes/install-utils";
import * as refs from "../src/classes/install-sw-refs";
import { Software } from "../src/interfaces/types";

it("gets an install reference", async () => {
  const installRef: string = await refs.getInstallRef("sudo apt", Software.GitHub);

  expect(installRef).toMatch("gh");
});

it("gets an bash reference", async () => {
  const bashRef: string = await refs.getBashRef(Software.GitHub);

  expect(bashRef).toMatch("gh");
});

it("provides a command for Brew installation", async () => {
  const bashRef: string = await InstallUtils.installBrew();

  (bashRef == null) ? expect(bashRef).toBeFalsy() : expect(bashRef).toMatch(/^\/bin\/bash/);
});

it("provides commands for Minikube installation", async () => {
  const bashRefs: string[] = await InstallUtils.installKube();

  (bashRefs.length == 1) ? expect(bashRefs[0]).toMatch(/ install /) : expect(bashRefs[0]).toMatch(/^wget/);
});

it("provides a command for software installation", async () => {
  const bashRef: string = await InstallUtils.installSW(Software.Maven);

  expect(bashRef).toMatch(/ install /);
});

it("detects whether a program has been installed", async () => {
  const bool: boolean = await InstallUtils.isInstalled(Software.NodeJs);

  expect(bool).toBeTruthy();
});
