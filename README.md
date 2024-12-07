## Strategies

### `PyMuPDFStrategy`

Use `PyMuPDFStrategy` or `--strategy=pymupdf` for tables where the question number is in its own separate column AND each choice is mapped to one rationale entry.

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

### `StandardStrategy`

`StandardStrategy` or `--strategy=standard` is useful in most formats.

#### Mixed Rationale Mappings

`StandardStrategy` has default settings that work with tables where the question column contains both the question text and question number in a single cell. 

However, the default settings for this strategy do not assume one-to-one mappings between choices and rationale entries. Thus, you can use this strategy in cases where rationale columns may sometimes live in merged cells.

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

Some examples may combine both the question and choices in a single column. In this case, you can use `TripleColumnStrategy`.

```python
strategy = TripleColumnStrategy("test.pdf")
```

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
