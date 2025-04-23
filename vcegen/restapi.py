from fastapi import FastAPI, BackgroundTasks, Form, File, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from vcegen.strategies import StandardStrategy, PyMuPDFStrategy, TripleColumnStrategy
from io import BytesIO
import asyncio
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    background_tasks = BackgroundTasks()
    await background_tasks()
    yield

app = FastAPI(lifespan=lifespan)

origins = [os.getenv("HOST_CLIENT")] if "HOST_CLIENT" in os.environ else [
    "http://localhost", 
    "http://localhost:1420", 
    "http://localhost:5173", 
    "http://localhost:8080"
]

app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)

async def get_parser_results(parser: StandardStrategy | TripleColumnStrategy | PyMuPDFStrategy):
    while parser.get_results() is None:
        await asyncio.sleep(0.1)

    return parser.get_results()

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

    try:
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
        results = await get_parser_results(parser)
        invalid: list[dict] = []

        if not isinstance(parser, PyMuPDFStrategy):
            parser.validate()
            invalid = parser.invalid if parser.invalid is not None else []

        if export:
            parser.export()

        return { 
            "results": results,
            "invalid": invalid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unknown error occurred")
    finally:
        await file.close()

