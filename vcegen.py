import argparse
from vcegen.strategies import StandardStrategy, PyMuPDFStrategy, TripleColumnStrategy

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--strategy", 
                        '-s', 
                        help="Parsing Strategy to use (`pymupdf` | `standard` | `triplecolumn` | `boxedchoices`) (default: `standard`)",
                        default="standard"
    )
    parser.add_argument("--input", 
                        '-i', 
                        help="Path to input PDF file"
    )
    parser.add_argument("--debug", 
                        '-d', 
                        help="Run in Debug Mode", 
                        action=argparse.BooleanOptionalAction, 
                        default=False
    )
    parser.add_argument("--boxedchoices", 
                        '-b', 
                        help="Tell the parser that the input file uses boxed choices", 
                        action=argparse.BooleanOptionalAction, 
                        default=False
    )
    parser.add_argument("--export",
                        '-e',
                        help="Exports the parser's output to a VCE-ready TXT file",
                        action=argparse.BooleanOptionalAction,
                        default=False
    )

    args = parser.parse_args()

    if not args.input:
        print("Please provide an input PDF file")
        raise SystemExit(1)
    
    if args.strategy not in ["triplecolumn", "standard", "pymupdf"]:
        print("Please provide a valid strategy. Strategies include `triplecolumn`, `standard`, and `pymupdf`")
        raise SystemExit(1)

    strategy: StandardStrategy | PyMuPDFStrategy | TripleColumnStrategy | None = None

    if args.strategy == "triplecolumn":
        strategy = TripleColumnStrategy(args.input)

    if args.strategy == "standard":
        strategy = StandardStrategy(args.input, boxed_choices=args.boxedchoices)

    if args.strategy == "pymupdf":
        strategy = PyMuPDFStrategy(args.input)

    if strategy is not None:
        strategy.run()
        strategy.get_results()

        if not isinstance(strategy, PyMuPDFStrategy):
            strategy.validate()

        if args.export:
            strategy.export()
