<div align="center">
<h1>vcegen</h1>
<b>Generate VCE-ready (VCE Exam Simulator) files from PDFs.</b>
</div>

## Requirements

- Node.js v22+ with pnpm 10+ (use `corepack enable`)
- Rust 
- [uv](https://docs.astral.sh/uv/) + Python 3.13+

## Setup

### Installation

Clone the repository:

```sh
git clone https://github.com/starkfire/vcegen.git
cd vcegen
```

Install the dependencies:

```sh
# install pnpm dependencies
pnpm install

# for the backend (apps/vcegen)
pnpm nx run vcegen:install
```

### Run

Activate the virtual environment and start the server:

```sh
# Windows
source .\apps\vcegen\.venv\Scripts\activate
# POSIX
source ./apps/vcegen/.venv/bin/activate

pnpm nx serve vcegen
```

To run the client, start the dev server or use the desktop app:

```sh
# Option 1: Web Client
pnpm nx run vcegen-app

# Option 2: Desktop App
pnpm nx run vcegen-app:tauri-dev
```

## Usage

There are three ways you can use vcegen.

1. Through the **command-line**:

```sh
python vcegen.py -i exam.pdf -s <strategy>
```

2. Through a **Python script**:

```python
from vcegen.strategies import PyMuPDFStrategy, StandardStrategy, TripleColumnStrategy
```

For scripting, you can read the [API reference](#api-reference) below.

3. As a **RESTful API**:

You can also run vcegen as a RESTful API using FastAPI:

```sh
uvicorn vcegen.restapi:app
```

### Command Syntax

```sh
python vcegen.py -i <path_to_input_pdf_file> -s <strategy> [--boxedchoices | --export | --apply-corrections]
```

**Required Arguments:**
* `-i`: should contain the path to an input PDF file
* `-s`: the parsing strategy to use (options: `standard`, `triplecolumn`, `pymupdf`)

**Optional Arguments:**
* `--boxedchoices`: tells vcegen that your PDF file consists of boxed choice labels. This option is only considered if the selected strategy is `standard`.
* `--export`: exports the output to a VCE-ready TXT file. The TXT files can be passed to [Exam Formatter](https://www.examcollection.com/examformatter.html) for conversion.
* `--apply-corrections`: applies sentence correction with [wordninja](https://github.com/keredson/wordninja)

### Example Script

If you want to use vcegen inside your own Python script, here is a quick example:

```python
from vcegen.strategies import StandardStrategy

# create an instance of StandardStrategy and pass your PDF file
strategy = StandardStrategy("my_exam.pdf")

# run the parser
strategy.run()

# print results
strategy.get_results()

# validate the output (this will remove parsed entries that are syntactically invalid)
strategy.validate()
```

The CLI already automates this procedure for you. The above script is equivalent to running the command:

```sh
python vcegen.py -i my_exam.pdf -s standard
```

## Usage Tips

### Excluding Rationale from Exported Files

To exclude rationale entries to output TXT files, you can pass an `--exclude-rationale` option. This is supported in all strategies. For example:

```sh
python vcegen.py -i exam.pdf -s standard --exclude-rationale
```

## Monorepo Tasks

| Command | Description |
| ------- | ----------- |
| `pnpm nx serve vcegen-app`                 | Run the client dev server on the browser (port 1420)   |
| `pnpm nx run vcegen-app:tauri-dev`         | Run the client as a desktop app in dev mode            |
| `pnpm nx run vcegen-app:tauri-build`       | Build the desktop app                                  |
| `pnpm nx run-many -t lint typecheck build` | Lint, typecheck, and build all JS projects (client)    |
| `pnpm nx run vcegen:cli -- -i exam.pdf -s standard -e` | Run vcegen CLI                             |
| `pnpm nx run vcegen:lock`                  | Regenerate `uv.lock` after editing the `pyproject.toml`|
| `pnpm nx graph`                            | Visualize the workspace |

