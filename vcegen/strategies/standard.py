import pdfplumber
import re
import json
import os

class StandardStrategy:

    def __init__(self, 
                    input_file, 
                    boxed_choices = False,
                    merged_rationales = False,
                    blacklist: list[str] = [], 
                    debug=False
        ):
        self.input_file = input_file
        self.debug = debug
        self.result: list[dict] | None = None
        self.blacklist: list[str] = blacklist
        self.boxed_choices = boxed_choices
        self.merged_rationales = merged_rationales


    def set_blacklist(self, words: list[str] = []):
        self.blacklist = words


    def __parse_row(self, row: list):
        entry = {
                "question_number": None,
                "question_text": None,
                "answer": None,
                "choices": [],
                "rationale": []
        }

        # check if row contains blacklisted words
        for cell in row:
            for word in self.blacklist:
                if type(cell) is str and word.lower() in cell.lower():
                    return None

        # pre-processing
        for idx, cell in enumerate(row):
            if type(cell) is str:
                row[idx] = cell.replace("\n", " ").encode("ascii", "ignore").decode("ascii")

        # skip parsing the input row if it has fewer columns than expected
        if len(row) < 2:
            return None
        
        last_cell = None
        for cell in reversed(row):
            if cell is not None:
                last_cell = cell
                break
        
        single_letter_instances = []
        non_empty_cells = [cell for cell in row if bool(cell)]
        
        if self.boxed_choices:
            if len(non_empty_cells) == 1 and last_cell:
                entry["rationale"].append(last_cell)
                return entry

            single_letter_instances = [cell for cell in row if type(cell) is str and len(cell) <= 2]

        for cell_idx, cell in enumerate(row):
            if cell is None or type(cell) is not str or len(cell) == 0:
                continue
            
            # check if string starts with a number indicator and a period
            match = re.match(r'(\d+)\.', cell)

            if match:
                # make sure this is the only number-period pattern within the cell
                if len(re.findall(r'(\d+)\.', cell)) == 1:
                    entry["question_number"] = match.group(1)

            if entry["question_number"] is not None and entry["question_text"] is None:
                entry["question_text"] = cell.replace(f"{entry['question_number']}.", "").strip()

            if self.boxed_choices:
                if len(cell) <= 2 and entry["answer"] is None:
                    if len(single_letter_instances) > 1:
                        if cell_idx < len(row) and row[cell_idx + 1] is not None:
                            if len(cell) == 1:
                                entry["choices"].append(f"{cell}. {row[cell_idx + 1]}")
                            else:
                                entry["choices"].append(f"{cell} {row[cell_idx + 1]}")

                            entry["answer"] = row[cell_idx + 2]
                    elif len(single_letter_instances) == 1:
                        if cell_idx < len(row) and row[cell_idx + 1] is not None:
                            if len(cell) == 1:
                                entry["choices"].append(f"{cell}. {row[cell_idx + 1]}")
                            else:
                                entry["choices"].append(f"{cell} {row[cell_idx + 1]}")
                    else:
                        entry["answer"] = cell
            else:
                if len(cell) <= 2:
                    entry["answer"] = cell

            # in some cases, all choices may be found in one combined string, so we need
            # to extract the individual choices from the large string
            if self.boxed_choices:
                if re.match(r"[a-zA-Z]\.", cell):
                    for match in re.findall(r'[a-zA-Z]\.\s?[a-zA-Z]*[a-zA-Z]+(?:\s[a-z]+)*', cell):
                        # if the match only has 2 characters or less, next cell must be the choice label
                        if len(match) <= 2 and cell_idx < len(row) and row[cell_idx + 1] is not None:
                            choice = " ".join([str(match), row[cell_idx + 1]])
                            entry["choices"].append(choice)
                        else:
                            entry["choices"].append(match)
            else:
                for match in re.findall(r'[a-zA-Z]\.\s?[a-zA-Z]*[a-zA-Z]+(?:\s[a-z]+)*', cell):
                    # if the match only has 2 characters or less, next cell must be the choice label
                    if len(match) <= 2 and cell_idx < len(row) and row[cell_idx + 1] is not None:
                        choice = " ".join([str(match), row[cell_idx + 1]])
                        entry["choices"].append(choice)
                    else:
                        entry["choices"].append(match)

            # we assume that the last cell must be a rationale entry if it is not found
            # on the choice strings within the same row
            if cell == last_cell:
                if cell not in entry["choices"]:
                    entry["rationale"].append(cell)

        if entry["question_text"] is None and entry["answer"] is None and len(entry["choices"]) == 0 and len(entry["rationale"]) == 0:
            return None

        return entry

    
    def __run_strategy(self, pdf: pdfplumber.pdf.PDF, start_page: int | None = None, end_page: int | None = None):
        rows = []

        for page_index, page in enumerate(pdf.pages):
            if start_page is not None and end_page is not None and end_page >= start_page:
                current_page_number = page_index + 1

                if current_page_number < start_page:
                    continue

                if current_page_number > end_page:
                    break

            tables = page.extract_tables()

            for table in tables:
                for row in table:
                    output = self.__parse_row(row)

                    if output is None:
                        continue

                    if output["question_number"] is None and len(rows) > 0:
                        if rows[-1]["answer"] is None:
                            rows[-1]["answer"] = output["answer"]

                        if rows[-1]["question_text"] is None:
                            rows[-1]["question_text"] = output["question_text"]

                        rows[-1]["choices"] += output["choices"]

                        if len(output["choices"]) == 0 and len(rows[-1]["rationale"]) > 0:
                            for ratio in output["rationale"]:
                                rows[-1]["rationale"][-1] = " ".join([rows[-1]["rationale"][-1], ratio])
                        else:
                            rows[-1]["rationale"] += output["rationale"]
                    else:
                        rows.append(output)

        self.result = rows


    def validate(self, min_choices=3, auto_filter=True):
        print("\nValidating...\n")
        invalid = []
        original_count = len(self.result) if self.result is not None else 0

        if self.result is None:
            print("No results attached to instance")
            return

        for row in self.result:
            is_invalid = False

            if len(row["choices"]) < min_choices:
                is_invalid = True
            
            if row["answer"] is None or row["question_text"] is None:
                is_invalid = True
            
            if is_invalid:
                invalid.append(row)

        if auto_filter:
            for entry in invalid:
                self.result.remove(entry)
        
        print(f"Found {original_count} rows.")
        print(f"Invalid Rows: {len(invalid)}/{original_count}")
        print(f"Total Valid Rows: {len(self.result)}/{original_count}")

        if auto_filter:
            print("The following invalid rows were trimmed out of the results:")
            for entry in invalid:
                print(json.dumps(entry, indent=2))


    def run(self, start_page: int | None = None, end_page: int | None = None):
        with pdfplumber.open(self.input_file) as pdf:
            self.__run_strategy(pdf, start_page, end_page)

    
    def get_results(self, print_results=True):
        if print_results:
            if self.result is not None:
                for q in self.result:
                    print(json.dumps(q, indent=2))
            else:
                print(f"No questions found")

        return self.result


    def export(self, output_name=None):
        output_file_name = output_name

        if self.result is None or len(self.result) == 0:
            print("No questions found.")
            return

        if output_name is None:
            basename = os.path.basename(self.input_file)
            output_file_name = f"{os.path.splitext(basename)[0]}.txt"

        file = open(f"{output_file_name}", "w")

        for row in self.result:
            file.write(f"Question NO: {row['question_number']}\n")
            file.write(f"{row['question_text']}\n\n")

            for choice in row["choices"]:
                file.write(f"{choice}\n")

            file.write(f"\nAnswer: {row['answer']}\n\n")
            file.write(f"Rationale:\n")

            for idx, choice in enumerate(row["choices"]):
                if idx < len(row["rationale"]):
                    file.write(f"{choice}: {row['rationale'][idx]}\n")
                else:
                    file.write(f"{choice}: No associated ationale for choice\n")

            file.write("\n")

        file.close()

        print(f"Exported results to {output_file_name}")


