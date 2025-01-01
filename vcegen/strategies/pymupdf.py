import pymupdf
import pandas as pd
import json
import os

class PyMuPDFStrategy:

    def __init__(self, input_file, exclude_rationale=False, debug=False):
        self.input_file = input_file
        self.document: pymupdf.Document = self.__create_document(input_file)
        self.exclude_rationale = exclude_rationale
        self.debug = debug
        self.result: list[dict] | None = None


    def __create_document(self, input_file) -> pymupdf.Document:
        return pymupdf.open(input_file)


    def __get_tables_from_page(self, page: pymupdf.Page):
        return page.find_tables()


    def __sanitize_text(self, text):
        if type(text) is not str:
            return text

        return text.replace("\n", " ")


    def __parse_table_dataframe(self, df: pd.DataFrame, question_buf: list[dict] = []):
        # actual table mappings for parsing:
        #   'QUESTION': question number (None if it corresponds to a choice/rationale row)
        #   'Col1': actual question text
        #   'CHOICES': choices
        #   'ANSWER & RATIONALE': letter of the correct answer (None corresponds to a rationale row)
        #   'Col4': rationale corresponding to the correct answer

        # convert to lists for faster iteration without vectorization;
        # all arrays will have an equal shape
        question_no = [num for num in df.iloc[:, 0]]
        question_text = [question for question in df.iloc[:, 1]]
        choices = [choice for choice in df.iloc[:, 2]]
        answers = [answer for answer in df.iloc[:, 3]]
        rationales = [rationale for rationale in df.iloc[:, 4]]

        rows = question_buf
        array_idx_ptr = len(question_buf)

        for idx, q in enumerate(question_no):
            # if the value of a cell within the QUESTION column starts with a digit string,
            # it must be a question
            if type(q) is str and q.isdigit():
                question = self.__sanitize_text(question_text[idx])

                rows.append({
                    "question_number": q,
                    "question_text": question,
                    "answer": answers[idx],
                    "choices": [self.__sanitize_text(choices[idx])],
                    "rationale": [self.__sanitize_text(rationales[idx])]
                })

            # if the cell value within the QUESTION column is `None`, 
            # it must be a choice/rationale row
            #
            # example: [None, None, ..., "Strings here", "string there"]
            if q is None:
                rows[-1]["choices"].append(self.__sanitize_text(choices[idx]))
                rows[-1]["rationale"].append(self.__sanitize_text(rationales[idx]))

            # increment pointer if the next entry is a string 
            # (indicating the start of another question)
            if idx + 1 < len(question_no) and type(question_no[idx + 1]) is str:
                array_idx_ptr += 1

        return rows


    def __scan_page(self, page: pymupdf.Page, question_buf: list[dict] = []):
        tables = self.__get_tables_from_page(page)

        for table in tables:
            # parse the detected table into a dataframe
            df = table.to_pandas()
            table_keys = df.keys()

            if df.empty:
                continue

            input_df: pd.DataFrame | None = None
            
            if page.number == 0:
                if "question" not in [k.lower() for k in table_keys]:
                    continue

                input_df = df
            else:
                # create a copy of the dataframe, since the output dataframe
                # from PyMuPDF treats the first row as the dataframe's index
                parsed_df = df.copy()
                parsed_df = parsed_df.reset_index(drop=True)
                new_row = pd.DataFrame([parsed_df.columns], columns=parsed_df.columns)
                parsed_df = pd.concat([new_row, parsed_df], ignore_index=True)

                input_df = parsed_df

            if input_df is not None:
                question_buf = self.__parse_table_dataframe(input_df, question_buf)

        return question_buf


    def __run_strategy(self, document: pymupdf.Document):
        questions = []
        
        for page_idx in range(document.page_count):
            if self.debug:
                print(f"Scanning Page #{page_idx + 1}")

            page = document[page_idx]
            questions = self.__scan_page(page, questions)

        self.result = questions


    def run(self):
        self.__run_strategy(self.document)

        if self.result is not None:
            print(f"Found {len(self.result)} questions")
        else:
            print("No questions found")


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

            if not self.exclude_rationale:
                file.write(f"Rationale:\n")

                for idx, choice in enumerate(row["choices"]):
                    if idx < len(row["rationale"]):
                        file.write(f"{choice}: {row['rationale'][idx]}\n")
                    else:
                        file.write(f"{choice}: No associated rationale for choice\n")

            file.write("\n")

        file.close()

        print(f"Exported results to {output_file_name}")
