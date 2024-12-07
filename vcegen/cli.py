import argparse
import vcegen.strategies as strategy

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--input", "-i", help="Path to an Input File")
    parser.add_argument("--strategy", "-s", type=int, default=1, help="Parsing strategy of choice")
    parser.add_argument("--debug", "-d", default=False, action=argparse.BooleanOptionalAction, help="Run in debug mode")

    args = parser.parse_args()

    if not args.input:
        print("Please provide an input file")
        raise SystemExit(1)

    if args.strategy == 1:
        strategy = strategy.PyMuPDFStrategy(args.input)
