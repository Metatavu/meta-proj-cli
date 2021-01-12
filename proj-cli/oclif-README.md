proj-cli
========

cli for starting projects

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/proj-cli.svg)](https://npmjs.org/package/proj-cli)
[![Downloads/week](https://img.shields.io/npm/dw/proj-cli.svg)](https://npmjs.org/package/proj-cli)
[![License](https://img.shields.io/npm/l/proj-cli.svg)](https://github.com/metatavu/metatavu-projekti-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g proj-cli
$ proj-cli COMMAND
running command...
$ proj-cli (-v|--version|version)
proj-cli/0.0.1 linux-x64 node-v10.19.0
$ proj-cli --help [COMMAND]
USAGE
  $ proj-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`proj-cli hello [FILE]`](#proj-cli-hello-file)
* [`proj-cli help [COMMAND]`](#proj-cli-help-command)

## `proj-cli hello [FILE]`

describe the command here

```
USAGE
  $ proj-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ proj-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/metatavu/metatavu-projekti-cli/blob/v0.0.1/src/commands/hello.ts)_

## `proj-cli help [COMMAND]`

display help for proj-cli

```
USAGE
  $ proj-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_
<!-- commandsstop -->
