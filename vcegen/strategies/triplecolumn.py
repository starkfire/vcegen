import pdfplumber
import re
import json
import os

class TripleColumnStrategy:

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
                "rationale": [],
                "leftover": False
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

        # if row[0] contains a string of reasonable length, parse it
        if type(row[0]) is str and len(row[0]) > 0:
            # if row[0] is a digit, then it must be a question number indicator
            if row[0].strip().isdigit():
                entry["question_number"] = row[0].strip()

            # otherwise, the first few characters before a period must be the number
            if '.' in row[0]:
                question_no, rest = row[0].split('.', 1)
                entry["question_number"] = question_no.strip() if question_no.strip().isdigit() else None

            # if it is not a number, it must be a leftover row
            # (i.e. a fragment of the previously parsed row)
            if entry["question_number"] is None:
                entry["leftover"] = True

                # check which part of the string is a question and choice
                choices_start = re.search(r'\b[a-zA-Z]\.\s', row[0])

                if choices_start:
                    entry["question_text"] = row[0][:choices_start.start()].strip()
                    choices_part = row[0][choices_start.start():].strip()

                    choices = re.split(r'(?=[a-zA-Z]\.)', choices_part)
                    entry["choices"] = [choice.strip() for choice in choices if choice.strip()]
                else:
                    entry["question_text"] = row[0]

                if len(row) >= 2:
                    entry["answer"] = row[1]

                for word in self.blacklist:
                    if word in entry["question_text"] or word in entry["choices"]:
                        return None

                return entry
        
            # otherwise, first few characters before a '.' must be the number
            question_no, rest = row[0].split('.', 1)
            entry["question_number"] = question_no.strip()

            # if row[0] contains more
            choices_start = re.search(r'\b[a-zA-Z]\.\s', rest)

            if choices_start:
                entry["question_text"] = rest[:choices_start.start()].strip()
                choices_part = rest[choices_start.start():].strip()

                choices = re.split(r'(?=[a-zA-Z]\.)', choices_part)
                entry["choices"] = [choice.strip() for choice in choices if choice.strip()]
            else:
                entry["question_text"] = rest

            if len(row) >= 2:
                entry["answer"] = row[1]

        if entry["question_number"] and entry["question_text"] and len(entry["choices"]) > 0:
            for choice in entry["choices"]:
                found_exact_match = False
                
                if found_exact_match:
                    break

                # discard letter from choice to take account of document creators making mistakes
                choice = choice[1:].strip().lower()

                for idx, cell in enumerate(row):
                    if cell is None:
                        continue
                    
                    # disregard first letter from string to account for errors
                    if cell[1:].strip().lower() == choice:
                        found_exact_match = True
                        entry["answer"] = cell
                        break

                    if idx == 1 and choice in cell.lower():
                        parts = cell.split(choice, 1)
                        entry["answer"] = choice.strip()

                        # attach excess text to rationale
                        if len(parts) > 1:
                            entry["rationale"].append(parts[1].strip())

        if entry["answer"] is None and entry["question_text"] is None:
            return None

        return entry

    
    def __run_strategy(self, pdf: pdfplumber.pdf.PDF):
        rows = []

        for page in pdf.pages:
            tables = page.extract_tables()

            for table in tables:
                for row in table:
                    output = self.__parse_row(row)

                    if output is None:
                        continue

                    if output["leftover"] == False:
                        del output["leftover"]
                        rows.append(output)
                        continue
                    
                    if len(rows) > 0:
                        prev_row = rows[-1]

                        if output["question_text"] and "question_text" in prev_row:
                            if prev_row["question_text"] is not None:
                                prev_row["question_text"] = " ".join([prev_row["question_text"], output["question_text"]])
                            else:
                                prev_row["question_text"] = output["question_text"]

                        if output["choices"] and "choices" in prev_row:
                            prev_row["choices"] += output["choices"]

                        if output["answer"] and "answer" in prev_row:
                            if prev_row["answer"] is not None:
                                prev_row["answer"] = " ".join([prev_row["answer"], output["answer"]])
                            else:
                                prev_row["answer"] = output["answer"]

                        rows[-1] = prev_row
        
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


    def run(self):
        with pdfplumber.open(self.input_file) as pdf:
            self.__run_strategy(pdf)

    
    def get_results(self, print_results=True):
        if print_results:
            if self.result is not None:
                for q in self.result:
                    print(json.dumps(q, indent=2))
            else:
                print(f"No questions found")

        return self.result


    def export(self, output_name=None):
        output_file_name = "output.txt"

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


