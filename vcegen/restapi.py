from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    background_tasks = BackgroundTasks()
    # background_tasks.add_task(some_loading_function)
    await background_tasks()
    yield
    # call unloading/unmounting functions here

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
