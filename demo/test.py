from vcegen.strategies import PyMuPDFStrategy, StandardStrategy, TripleColumnStrategy

strategy = PyMuPDFStrategy("./test1.pdf")
strategy.run()
strategy.get_results()
strategy.export()

# standard: boxed choice labels
# strategy = StandardStrategy("./test2.pdf", boxed_choices=True)
# strategy.run()
# strategy.get_results()
# strategy.validate()

# standard: mixed rationale mappings
# strategy = StandardStrategy("./test5.pdf")
# strategy.run()
# strategy.get_results()
# strategy.validate()

# standard: mixed rationale mappings
# test3.pdf is slightly problematic, most likely due to the software used to produce the document
# strategy = StandardStrategy("./test3.pdf")
# strategy.run()
# strategy.get_results()
# strategy.validate()

# standard: mixed rationale mappings
# test6.pdf is also problematic, similar to test3.pdf. Rationale format is also affecting the parser's ability to identify rows.
# strategy = StandardStrategy("./test6.pdf")
# strategy.run()
# strategy.get_results()
# strategy.validate()

# triple column (with example blacklist)
# strategy = TripleColumnStrategy("./test4.pdf", blacklist=["Anatomy | LE # 1"])
# strategy.run()
# strategy.get_results()
# strategy.validate()
