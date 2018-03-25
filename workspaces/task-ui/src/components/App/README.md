## Overview

UI is split into these regions

```
 ModeBar    ModeActions              OutputPanel                HistoryPanel
 +------+ +--------------++---------------------------------++---------------+
 |      | |              ||                                 || +-----------+ |
 |      | | +----------+ ||                                 || |           | |
 |      | | |          | ||   +------------------------+    || |           | |
 |      | | |          | ||   |       RunInfo          |    || |  History  | |
 |      | | |          | ||   +------------------------+    || |           | |
 |      | | | Taskfiles| ||   +------------------------+    || |           | |
 |      | | |          | ||   |                        |    || +-----------+ |
 |      | | |          | ||   |                        |    || +-----------+ |
 |      | | |          | ||   |                        |    || |           | |
 |      | | +----------+ ||   |        Output          |    || | Bookmarks | |
 |      | |              ||   |                        |    || |           | |
 |      | |              ||   |                        |    || |           | |
 |      | |              ||   |                        |    || |           | |
 |      | |              ||   |                        |    || +-----------+ |
 |      | |              ||   |                        |    ||               |
 |      | |              ||   |                        |    ||               |
 |      | |              ||   +------------------------+    ||               |
 |      | |              ||   +------------------------+    ||               |
 |      | |              ||   |                        |    ||               |
 |      | |              ||   |     OutputDetail       |    ||               |
 |      | |              ||   |                        |    ||               |
 |      | |              ||   |                        |    ||               |
 |      | |              ||   +------------------------+    ||               |
 |      | |              ||                                 ||               |
 +------+ +--------------++---------------------------------++---------------+
```

[Textik Drawing](https://textik.com/#af2ed1231ef956fe)

## Glossary

* Taskfiles - Each taskfile is a ES6/TypeScript file with exported tasks
* Task - An exported function which does some discrete work
* Bookmark - A replayable task with saved arguments
