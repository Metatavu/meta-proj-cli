import MinikubeUtils from "../src/classes/minikube-utils.ts";

it("exports Minikube component creation function", async () => {
  MinikubeUtils.createComponents = jest.fn();
  await MinikubeUtils.createComponents(
    [ {
    args: {
      name: "test",
      image: "test-image",
      port: 3080,
      portType: null,
      ports: null,
      replicas: null
    },
    type: "pod"
    } ], ""
  );
  expect((MinikubeUtils.createComponents)).toReturn();
});

it("is able to provide command string for attaching KeyCloak", async () => {
  const kcCommand = await MinikubeUtils.attachKeycloak("");
  expect((kcCommand)).toMatch(/ keycloak\.yaml /);
});

it("exports function for attaching Ingress to Keycloak", async () => {
  MinikubeUtils.createIngress = jest.fn();
  await MinikubeUtils.createIngress("", "");

  expect((MinikubeUtils.createIngress)).toReturn();
});

it("provides command strings for finishing Minikube setup", () => {
  const strArr: string[] = MinikubeUtils.finishBuild();
  expect((strArr[0])).toMatch("kustomize create --autodetect");
  expect((strArr[1])).toMatch("kubectl create -f kustomization.yaml");
});