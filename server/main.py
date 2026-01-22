from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from api.controllers.user_responses_controller import UPLOAD_DIR
from db.connection import init_db

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from services.extensions.rate_limiter import limiter

# from db.events import checklist_complete_update
from api.routes import (
    application_routes,
    auth_routes,
    department_routes,
    comments_routes,
    dashboard_routes,
    file_serving,
    user_management_routes,
    export_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan, root_path="/api/v1.0")

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    lambda request, exc: JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again after sometime."},
    ),
)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://10.160.14.76:8057",
        "http://localhost:8057",
        "http://192.168.43.240:8057",
        "http://172.25.202.250:8057",
        "https://is-assessment.titancustomers.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.middleware("http")
async def remove_server_header(request: Request, call_next):
    response = await call_next(request)
    if "server" in response.headers:
        del response.headers["server"]
    return response


@app.middleware("http")
async def add_csp_header(request, call_next):
    response: Response = await call_next(request)

    # === CSP Configuration ===
    #     # Local testing over HTTP may require 'unsafe-inline' for React development scripts
    #     # Production HTTPS can remove 'unsafe-inline' for better security
    LOCAL_TESTING = False  # Set False in production
    if request.url.path.startswith("/docs") or request.url.path.startswith("/redoc"):
        return response

    if LOCAL_TESTING:
        csp = (
            "default-src 'self'; "
            "script-src 'unsafe-inline';"  # <-- inline scripts are blocked now
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self';"
        )

    else:
        csp = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "upgrade-insecure-requests;"  # upgrade HTTP to HTTPS
        )

    response.headers["Content-Security-Policy"] = csp
    return response


app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health_check(request: Request):
    return {"msg": "I'm alive", "status": "ok"}


app.include_router(auth_routes.router)
app.include_router(application_routes.router)
app.include_router(department_routes.router)
app.include_router(comments_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(file_serving.router)
app.include_router(user_management_routes.router)
app.include_router(export_routes.router)
