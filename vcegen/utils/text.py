def sanitize_text(text):
    if type(text) is not str:
        return text

    return text.replace("\n", " ")
