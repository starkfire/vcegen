from fastapi import FastAPI, BackgroundTasks, Form, File, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from vcegen.strategies import StandardStrategy, PyMuPDFStrategy, TripleColumnStrategy
from io import BytesIO

@asynccontextmanager
async def lifespan(app: FastAPI):
    background_tasks = BackgroundTasks()
    await background_tasks()
    yield

app = FastAPI(lifespan=lifespan)

origins = ["http://localhost", "http://localhost:1420", "http://localhost:5173", "http://localhost:8080"]

app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)


@app.get("/")
async def root():
    return { "message": "Hello!" }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...),
                  strategy: str = Form(...),
                  exclude_rationale: bool = Form(default=False),
                  boxed_choices: bool = Form(default=False),
                  export: bool = Form(default=False)):

    VALID_MIMETYPES = [
        "application/pdf"
    ]

    if file.content_type not in VALID_MIMETYPES:
        raise HTTPException(status_code=400, detail="Invalid File Type")

    # read file
    file_data = await file.read()

    # reset reader pointer
    file.file.seek(0)

    # convert to a BytesIO object
    file_bytes = BytesIO(file_data)

    parser: StandardStrategy | PyMuPDFStrategy | TripleColumnStrategy | None = None
    
    if strategy == "triplecolumn":
        parser = TripleColumnStrategy(file, exclude_rationale=exclude_rationale)

    if strategy == "standard":
        parser = StandardStrategy(file_bytes, 
                                  boxed_choices=boxed_choices,
                                  exclude_rationale=exclude_rationale)

    if strategy == "pymupdf":
        parser = PyMuPDFStrategy(file, exclude_rationale=exclude_rationale)

    if parser is None:
        raise HTTPException(status_code=500, detail="Cannot determine parser for input strategy")

    parser.run()
    results = parser.get_results()

    if not isinstance(parser, PyMuPDFStrategy):
        parser.validate()

    if export:
        parser.export()

    return { 
        "results": results 
    }

