<div align="center">
<h1>vcegen</h1>
<b>Python library for generating VCE-ready files from PDFs.</b>
</div>

## Installation

Clone the repository:

```sh
git clone https://github.com/starkfire/vcegen.git
cd vcegen
```

It is also recommended that you set up a virtual environment for installing the dependencies, but you can freely skip this step:

```sh
# setup a virtual environment with virtualenv
virtualenv .venv

# activate virtual environment (on Windows)
.venv\Scripts\activate

# activate virtual environment (on Linux)
.venv/bin/activate
```

You can then install the required dependencies and set up the library:

```sh
pip install .
```

## Usage

There are two ways you can use vcegen.

1. Through the **command-line**:

```sh
python vcegen.py -i exam.pdf -s <strategy>
```

2. Through a **Python script**:

```python
from vcegen.strategies import PyMuPDFStrategy, StandardStrategy, TripleColumnStrategy
```

For scripting, you can read the [API reference](#api-reference) below.

### Command Syntax

```sh
python vcegen.py -i <path_to_input_pdf_file> -s <strategy> [--boxedchoices | --export]
```

**Required Arguments:**
* `-i`: should contain the path to an input PDF file
* `-s`: the parsing strategy to use (options: `standard`, `triplecolumn`, `pymupdf`)

**Optional Arguments:**
* `--boxedchoices`: tells vcegen that your PDF file consists of boxed choice labels. This option is only considered if the selected strategy is `standard`.
* `--export`: exports the output to a VCE-ready TXT file. The TXT files can be passed to [Exam Formatter](https://www.examcollection.com/examformatter.html) for conversion.

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

### Demo Directory

This repository includes a `/demo` directory which includes test files and an example script that you can freely change.

You can also use the test files to try the CLI:

```sh
# demo/test1.pdf is suited for the pymupdf strategy
python vcegen.py -i demo/test1.pdf -s pymupdf

# demo/test2.pdf is suited for the standard strategy with --boxedchoices
python vcegen.py -i demo/test2.pdf -s standard --boxedchoices
```

## Strategies

When parsing PDFs, you need to specify a parsing **strategy**. Currently, vcegen offers three (3) strategies:

* PyMuPDF (`pymupdf`)
* Standard (`standard`) (default)
* Triple Column (`triplecolumn`)

### `PyMuPDFStrategy`

```sh
python vcegen.py -i exam.pdf -s pymupdf
```

`PyMuPDFStrategy` or `pymupdf` is ideal for tables where the question number is in its own separate column AND each choice is mapped to one rationale entry.

Example:

```
+------------------+---------+----------------------+
|     QUESTION     | Choices |  Answer & Rationale  |
+-----+------------+---------+-----+----------------+
|     |            | A. a    |     | ...            |
|     |            +---------+     +----------------+
|     |            | B. b    |     | ...            |
|  1  | Question   +---------+  C  +----------------+
|     |            | C. c    |     | ...            |
|     |            +---------+     +----------------+
|     |            | D. d    |     | ...            |
+-----+------------+---------+-----+----------------+
```

This strategy uses [pymupdf](https://pymupdf.readthedocs.io/) for table detection and outputs are processed as dataframes.

### `StandardStrategy`

```sh
python vcegen.py -i exam.pdf -s standard
```

`StandardStrategy` or `standard` is a more robust and flexible strategy option, and is the default strategy that vcegen will use if the strategy option is not specified.

This strategy uses [pdfplumber](https://github.com/jsvine/pdfplumber) and outputs are processed as ordinary string lists.

#### Mixed Rationale Mappings

`StandardStrategy` has default settings that work with tables where the question column contains both the question text and question number in a single cell. 

The default settings for this strategy do not assume one-to-one mappings between choices and rationale entries. Thus, you can use this strategy in cases where rationale columns may sometimes live in merged cells.

Test Case: **[2027] LE 6 - ANATOMY (V2) - test5.pdf**

Example:

```
+----------------+---------+----------------------+
|   QUESTION     | Choices | Answer & Rationale   |
+----------------+---------+-----+----------------+
|                | A. a    |     | ...            |
| 1.  Question?  | B. b    |  C  | ...            |
|                | C. c    |     | ...            |
|                | D. d    |     | ...            |
+----------------+---------+-----+----------------+
```

```
+----------------+---------+--------------------+
|   QUESTION     | Choices | Answer & Rationale |
+----------------+---------+---+----------------+
|                | A. a    |   | ...            |
|                +---------+   +----------------+
|                | B. b    |   | ...            |
| 1. Question?   +---------+ C +----------------+
|                | C. c    |   | ...            |
|                +---------+   +----------------+
|                | D. d    |   | ...            |
+----------------+---------+---+----------------+
```

#### Boxed Choice Labels

For tables where the question labels (e.g. `A`, `B`, `C`, `D`) are in separate cells and columns, you can pass a `boxed_choices=True` option:

```python
strategy = StandardStrategy("test.pdf", boxed_choices=True)
```

If you are using vcegen through the commandline, you have to include the `--boxedchoices` option:

```python
python vcegen.py -i test.pdf -s standard --boxedchoices
```

Test Case: **[BOGART] ANA - LE4 - test2.pdf**

Example:

```
+----------------+---------+--------------------+
|   QUESTION     | Choices | Answer & Rationale |
+----------------+---+-----+---+----------------+
|                | A | a   |   | ...            |
|                +---+-----+   +----------------+
|                | B | b   |   | ...            |
| 1. Question?   +---+-----+ C +----------------+
|                | C | c   |   | ...            |
|                +---+-----+   +----------------+
|                | D | d   |   | ...            |
+----------------+---+-----+---+----------------+
```

```
+----------------+---------+----------------------+
|   QUESTION     | Choices | Answer & Rationale   |
+----------------+---+-----+-----+----------------+
|                | A | a   |     | ...            |
|                +---+-----+     | ...            |
|                | B | b   |     | ...            |
| 1. Question?   +---+-----+  C  | ...            |
|                | C | c   |     | ...            |
|                +---+-----+     | ...            |
|                | D | d   |     | ...            |
+----------------+---+-----+-----+----------------+
```

### `TripleColumnStrategy`

```sh
python vcegen.py -i exam.pdf -s triplecolumn
```

Certain inputs may only have three (3) columns because the question and choices may instead live in a single column. In these cases, you can use `TripleColumnStrategy`.

Test Case: **[BOGART] ANA - LE1.docx - test2.pdf**

Example:

```
+----------------+---------+------------+
|   QUESTION     | Answer  | Rationale  |
+----------------+---------+------------+
|                |         |            |
| 1. Question?   |         | ...        |
|    a. A        |         | ...        |
|    b. B        | b. B    | ...        |
|    c. C        |         | ...        |
|    d. D        |         | ...        |
|                |         |            |
+----------------+---------+------------+
```

# API Reference

## `StandardStrategy`

```python
from vcegen.strategies import StandardStrategy

strategy = StandardStrategy()
```

**Arguments:**
* `input_file` (string): accepts a path to a PDF file.
* `boxed_choices` (boolean): if `True`, the parser will run with the assumption that choice labels are in separate columns.
* `blacklist` (list[string]): a list of words or strings - if the parser detects these strings inside a row, it will ignore the row.
* `debug`: run in **debug mode** - the parser will run in a verbose manner.

**Returns:**
* `StandardStrategy` - instance of `StandardStrategy`

### Methods

* `run(start_page: int | None = None, end_page: int | None = None)`: runs the parser (returns: `None`)
    * `start_page` (`int | None`, default: `None`): starting page number that the parser should process
    * `end_page` (`int | None`, default: `None`): ending page number where the parser should stop processing
* `get_results()`: returns the parser's output/results (returns: `list[str]`)
  * `print_results` (boolean, `default=True`): if `True`, the results will be printed in the console.
* `export()`: generates a TXT file that can be passed to [ExamFormatter](https://www.examcollection.com/examformatter.html) to generate a VCE file.
* `validate()`: validates the results returned by the parser
  * `min_choices` (int, `default=3`): minimum number of choices that a valid exam row should have.
  * `auto_filter` (boolean, `default=True`): if `True`, detected invalid entries/rows will be omitted from the parser's results.

## `PyMuPDFStrategy`

```python
from vcegen.strategies import PyMuPDFStrategy

strategy = PyMuPDFStrategy()
```

**Arguments:**
* `input_file` (string): accepts a path to a PDF file.
* `boxed_choices` (boolean): if `True`, the parser will run with the assumption that choice labels are in separate columns.
* `blacklist` (list[string]): a list of words or strings - if the parser detects these strings inside a row, it will ignore the row.
* `debug`: run in **debug mode** - the parser will run in a verbose manner.

**Returns:**
* `PyMuPDFStrategy` - instance of `PyMuPDFStrategy`

### Methods

* `run()`: runs the parser (returns: `None`)
* `get_results()`: returns the parser's output/results (returns: `list[str]`)
  * `print_results` (boolean): if `True`, the results will be printed in the console.
* `export()`: generates a TXT file that can be passed to [ExamFormatter](https://www.examcollection.com/examformatter.html) to generate a VCE file.

## `TripleColumnStrategy`

```python
from vcegen.strategies import TripleColumnStrategy

strategy = TripleColumnStrategy()
```

**Arguments:**
* `input_file` (string): accepts a path to a PDF file.
* `boxed_choices` (boolean): if `True`, the parser will run with the assumption that choice labels are in separate columns.
* `blacklist` (list[string]): a list of words or strings - if the parser detects these strings inside a row, it will ignore the row.
* `debug`: run in **debug mode** - the parser will run in a verbose manner.

**Returns:**
* `TripleColumnStrategy` - instance of `TripleColumnStrategy`

### Methods

* `run()`: runs the parser (returns: `None`)
* `get_results()`: returns the parser's output/results (returns: `list[str]`)
  * `print_results` (boolean): if `True`, the results will be printed in the console.
* `export()`: generates a TXT file that can be passed to [ExamFormatter](https://www.examcollection.com/examformatter.html) to generate a VCE file.
* `validate()`: validates the results returned by the parser
  * `min_choices` (int, `default=3`): minimum number of choices that a valid exam row should have.
  * `auto_filter` (boolean, `default=True`): if `True`, detected invalid entries/rows will be omitted from the parser's results.
