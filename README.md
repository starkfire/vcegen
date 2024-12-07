# vcegen

**Command-line tool and library for generating VCE-ready files from PDFs.**

## Usage

There are two ways you can use vcegen.

1. Through the commandline:

```sh
python vcegen.py -i exam.pdf -s <strategy>
```

2. Through a Python script:

```python
from vcegen.strategies import PyMuPDFStrategy, StandardStrategy, TripleColumnStrategy
```

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

# validate the output (this will remove parsed entries that are semantically invalid)
strategy.validate()
```

The CLI already automates this procedure for you. The above script is equivalent to running the command:

```sh
python vcegen.py -i my_exam.pdf -s standard
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
