from fastapi import FastAPI, Form, File, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from contextlib import asynccontextmanager
from vcegen.strategies import StandardStrategy, PyMuPDFStrategy, TripleColumnStrategy
from io import BytesIO
import asyncio
import os
import logging
from typing import Literal

app = FastAPI()

# CORS
DEFAULT_ORIGINS = [
    "http://localhost",
    "http://localhost:1420",
    "http://localhost:5173",
    "http://localhost:8080",
    # Tauri
    "tauri://localhost",
    "http://tauri.localhost",
    "https://tauri.localhost"
]

extra_origins = [origin.strip() for origin in os.getenv("HOST_CLIENT", "").split(",") if origin.strip()]

app.add_middleware(
        CORSMiddleware,
        allow_origins=DEFAULT_ORIGINS + extra_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)

# max allowed upload size (in MB)
MAX_UPLOAD_BYTES = int(os.getenv("VCEGEN_MAX_UPLOAD_MB", "50")) * 1024 * 1024

# PDF signature
PDF_SIGNATURE = b"%PDF-"

# Strategies
Strategy = Literal["standard", "pymupdf", "triplecolumn"]

def parse_pdf(
    data: bytes,
    strategy: Strategy,
    exclude_rationale: bool,
    boxed_choices: bool
) -> dict:
    """
    Runs a parsing strategy on an in-memory PDF. Runs on a worker thread.
    """
    file_bytes = BytesIO(data)
    parser: StandardStrategy | PyMuPDFStrategy | TripleColumnStrategy

    if strategy == "triplecolumn":
        parser = TripleColumnStrategy(file_bytes, exclude_rationale=exclude_rationale)
    elif strategy == "pymupdf":
        parser = PyMuPDFStrategy(file_bytes, exclude_rationale=exclude_rationale)
    else:
        parser = StandardStrategy(file_bytes,
                                  boxed_choices=boxed_choices,
                                  exclude_rationale=exclude_rationale)

    parser.run()
    invalid: list[dict] = []

    if not isinstance(parser, PyMuPDFStrategy):
        parser.validate()
        invalid = parser.invalid if parser.invalid is not None else []

    return {
        "results": parser.get_results(print_results=False),
        "invalid": invalid
    }


async def read_pdf_upload(file: UploadFile) -> bytes:
    """
    Read and validate an uploaded PDF
    """
    try:
        if file.size is not None and file.size > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File is too large")

        file_data = await file.read(MAX_UPLOAD_BYTES + 1)
    finally:
        await file.close()

    if len(file_data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File is too large")

    if PDF_SIGNATURE not in file_data[:1024]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    return file_data


async def get_parser_results(parser: StandardStrategy | TripleColumnStrategy | PyMuPDFStrategy):
    while parser.get_results() is None:
        await asyncio.sleep(0.1)

    return parser.get_results()

@app.get("/")
async def root():
    return { "message": "Hello!" }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...),
                  strategy: Strategy = Form(...),
                  exclude_rationale: bool = Form(default=False),
                  boxed_choices: bool = Form(default=False)):
    file_data = await read_pdf_upload(file)

    try:
        return await run_in_threadpool(parse_pdf,
                                       file_data,
                                       strategy,
                                       exclude_rationale,
                                       boxed_choices)
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unknown error occurred")
    finally:
        await file.close()

