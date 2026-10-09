# API Reference

## Strategies

When parsing PDFs, you need to specify a parsing **strategy**. Currently, vcegen offers three (3) strategies:

* PyMuPDF (`pymupdf`)
* Standard (`standard`) (default)
* Triple Column (`triplecolumn`)

### `StandardStrategy`

**Programmatic:**

```python
from vcegen.strategies import StandardStrategy

strategy = StandardStrategy()
```

**CLI:**

```sh
python vcegen.py -i exam.pdf -s standard
```

**Arguments:**
* `input_file` (string): accepts a path to a PDF file.
* `boxed_choices` (boolean): if `True`, the parser will run with the assumption that choice labels are in separate columns.
* `blacklist` (list[string]): a list of words or strings - if the parser detects these strings inside a row, it will ignore the row.
* `debug`: run in **debug mode** - the parser will run in a verbose manner.

**Returns:**
* `StandardStrategy` - instance of `StandardStrategy`

**Methods:**

* `run(start_page: int | None = None, end_page: int | None = None)`: runs the parser (returns: `None`)
    * `start_page` (`int | None`, default: `None`): starting page number that the parser should process
    * `end_page` (`int | None`, default: `None`): ending page number where the parser should stop processing
* `get_results()`: returns the parser's output/results (returns: `list[str]`)
  * `print_results` (boolean, `default=True`): if `True`, the results will be printed in the console.
* `export()`: generates a TXT file that can be passed to [ExamFormatter](https://www.examcollection.com/examformatter.html) to generate a VCE file.
* `validate()`: validates the results returned by the parser
  * `min_choices` (int, `default=3`): minimum number of choices that a valid exam row should have.
  * `auto_filter` (boolean, `default=True`): if `True`, detected invalid entries/rows will be omitted from the parser's results.

`StandardStrategy` or `standard` is the default strategy for vcegen. This strategy uses [pdfplumber](https://github.com/jsvine/pdfplumber) and outputs are processed as ordinary string lists.

#### Mixed Rationale Mappings

`StandardStrategy` has default settings that work with tables where the question column contains both the question text and question number in a single cell. 

The default settings for this strategy do not assume one-to-one mappings between choices and rationale entries. Thus, you can use this strategy in cases where rationale columns may sometimes live in merged cells.

Fixture: **[2027] LE 6 - ANATOMY (V2) - test5.pdf**

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

```sh
python vcegen.py -i test.pdf -s standard --boxedchoices
```

Fixture: **[BOGART] ANA - LE4 - test2.pdf**

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


### `PyMuPDFStrategy`

**Programmatic:**

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

**Methods:**

* `run()`: runs the parser (returns: `None`)
* `get_results()`: returns the parser's output/results (returns: `list[str]`)
  * `print_results` (boolean): if `True`, the results will be printed in the console.
* `export()`: generates a TXT file that can be passed to [ExamFormatter](https://www.examcollection.com/examformatter.html) to generate a VCE file.
:smiling_face_with_3_hearts: 

**CLI:**

```sh
python vcegen.py -i exam.pdf -s pymupdf
```

**Strategy Description:**

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

### `TripleColumnStrategy`

**Programmatic:**

```python
from vcegen.strategies import TripleColumnStrategy

strategy = TripleColumnStrategy()
```

**CLI:**

```sh
python vcegen.py -i exam.pdf -s triplecolumn
```

**Strategy Description:**

Certain inputs may only have three (3) columns because the question and choices may instead live in a single column. In these cases, you can use `TripleColumnStrategy`.

Fixture: **[BOGART] ANA - LE1.docx - test2.pdf**

For example:

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



**Arguments:**
* `input_file` (string): accepts a path to a PDF file.
* `boxed_choices` (boolean): if `True`, the parser will run with the assumption that choice labels are in separate columns.
* `blacklist` (list[string]): a list of words or strings - if the parser detects these strings inside a row, it will ignore the row.
* `debug`: run in **debug mode** - the parser will run in a verbose manner.

**Returns:**
* `TripleColumnStrategy` - instance of `TripleColumnStrategy`

**Methods:**

* `run()`: runs the parser (returns: `None`)
* `get_results()`: returns the parser's output/results (returns: `list[str]`)
  * `print_results` (boolean): if `True`, the results will be printed in the console.
* `export()`: generates a TXT file that can be passed to [ExamFormatter](https://www.examcollection.com/examformatter.html) to generate a VCE file.
* `validate()`: validates the results returned by the parser
  * `min_choices` (int, `default=3`): minimum number of choices that a valid exam row should have.
  * `auto_filter` (boolean, `default=True`): if `True`, detected invalid entries/rows will be omitted from the parser's results.
