from typing import Annotated, Any, Literal

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Path,
    status,
    Query,
    BackgroundTasks,
)
from sqlalchemy.orm import Session
from models import Application
from pydantic import BaseModel

from api.controllers.application_controller import (
    create_app,
    # delete_app,
    # list_apps_with_details,
    # restore_app,
    update_app,
    # get_trashed_apps,
    # list_apps,
    get_app_details,
    list_all_apps,
    change_app_status,
)
from db.connection import get_db_conn
from schemas.app_schemas import (
    ApplicationCreate,
    ApplicationUpdate,
    AppQueryParams,
)
from schemas.auth_schemas import UserOut
from services.auth.deps import get_current_user, require_admin, require_manager
from api.controllers import evidence_controller as e_ctrl
import os

ENV = os.getenv("ENV")

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", summary="Create New Application")
async def create_application(
    payload: Annotated[ApplicationCreate, "Request fields for creating an application"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
    background_tasks: BackgroundTasks,
):
    data = create_app(
        payload=payload,
        db=db,
        creator=current_user,
        owner=current_user,
        background_tasks=background_tasks,
    )
    return {"msg": "Application created successfully", "data": data}


@router.get("/list")
async def new_list_all_apps(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    sort_by: Annotated[str, Query()] = "started_at",
    sort_order: Annotated[Literal["asc", "desc"], Query()] = "desc",
    search: Annotated[str | None, Query()] = None,
    page: Annotated[int, Query()] = 1,
    page_size: Annotated[int, Query()] = 15,
    search_by: Annotated[
        Literal[
            "name",
            "environment",
            "region",
            "owner_name",
            "vendor_company",
            "vertical",
            "ticket_id",
        ],
        Query(),
    ] = "name",
    status: Annotated[
        str | None,
        Query(),
    ] = None,
    dept_filter_id: Annotated[int | None, Query()] = None,
    dept_status: Annotated[str | None, Query()] = None,
    app_priority: Annotated[str | None, Query()] = None,
    vertical: Annotated[str | None, Query()] = None,
    sla_filter: Annotated[int | None, Query()] = None,
    ai_apps: Annotated[str | None, Query()] = None,
    web_apps: Annotated[str | None, Query()] = None,
    mobile_apps: Annotated[str | None, Query()] = None,
    mobile_web_apps: Annotated[str | None, Query()] = None,
):
    print(
        f"ai_apps: {ai_apps} \n web_apps: {web_apps}\nmobile_apps: {mobile_apps}\n mobile_web_apps: {mobile_web_apps}"
    )

    status_list = []

    if (
        status
        and status.strip() != "null"
        and status.strip() != "all"
        and status.strip() != "undefined"
    ):
        status_list = status.split(",")
        print("STATUS LIST SATIS FIED", status)
    print("STATUS LIST NOT SATIS FIED", status)
    dept_status_list = []

    if (
        dept_status
        and dept_status.strip() != "null"
        and dept_status.strip() != "all"
        and dept_status.strip() != "undefined"
    ):
        dept_status_list = dept_status.split(",")

    app_priority_list = app_priority.split(",") if app_priority else []

    params = AppQueryParams(
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        page=page,
        page_size=page_size,
        search_by=search_by,
        status=status_list,
        dept_filter_id=dept_filter_id,
        dept_status=dept_status_list,
        app_priority=app_priority_list,
        vertical=vertical,
        sla_filter=sla_filter,
        mobile_apps=mobile_apps,
        web_apps=web_apps,
        ai_apps=ai_apps,
        mobile_web_apps=mobile_web_apps,
    )
    data = list_all_apps(
        db=db,
        params=params,
    )
    return {"msg": "Applications fetched successfully", "data": data}


@router.get("/{app_id}")
async def get_application(
    app_id: Annotated[str, Path(title="App Id of the app to be fetched")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """
    Get a specific application by its ID.
    """
    data = get_app_details(app_id=app_id, db=db, current_user=current_user)
    return {"msg": "", "data": data}


@router.patch("/{app_id}")
async def update_application(
    payload: Annotated[ApplicationUpdate, Body(title="App update payload")],
    app_id: Annotated[str, Path(title="App Id of the app to be updated")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
):
    data = update_app(payload, app_id, db, current_user)
    return {"msg": "", "data": data}


class StatusVal(BaseModel):
    status_val: Annotated[
        Literal[
            "new_request",
            "in_progress",
            "not_yet_started",
            "completed",
            "reopen",
            "closed",
            "cancelled",
        ],
        "",
    ]


@router.patch("/update-status/{app_id}")
async def update_applicaion_status(
    db: Annotated[Session, Depends(get_db_conn)],
    payload: Annotated[StatusVal, ""],
    current_user: Annotated[UserOut, Depends(require_admin)],
    app_id: Annotated[str, Path(title="App Id of the app to be updated")],
):
    data = change_app_status(app_id=app_id, status_val=payload.status_val, db=db)
    return {"msg": "", "data": data}


# @router.post("/{app_id}/evidences")
# async def add_application_evidences(
#     app_id: Annotated[str, Path(...)],
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(require_manager)],
#     severity: Annotated[str | None, Form()] = None,
#     evidence_files: Annotated[list[UploadFile] | None, File()] = None,
# ):
#     try:
#         if not evidence_files:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="No files found to upload",
#             )
#         app = db.get(Application, app_id)
#         if not app:
#             raise HTTPException(
#                 status_code=status.HTTP_400,
#                 detail="Application you are uploading evidence to is not found",
#             )
#         save_evidence = (
#             e_ctrl.save_evidence_file_s3
#             if ENV == "production"
#             else e_ctrl.save_evidence_file_local
#         )
#         failed = []
#         success = []

#         for file in evidence_files:
#             try:
#                 file_path = await save_evidence(file=file, app_name=app.name)
#                 evidence_payload = e_schemas.CreateEvidenceSchema(
#                     uploader_id=current_user.id,
#                     evidence_path=file_path,
#                     severity=severity or "medium",
#                     application_id=app_id,
#                 )
#                 await e_ctrl.add_evidence(payload=evidence_payload, db=db)
#                 success.append(file.filename)
#             except Exception as e:
#                 failed.append(f"Failed to add file. Error: {str(e)}")
#         return {
#             "msg": "Evidences uploaded",
#             "data": {"success": success, "failed": failed},
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail={"msg": "Error adding evidences", "err_stack": str(e)},
#         )


@router.get("/{app_id}/evidences")
async def get_application_evidences(
    app_id: Annotated[str, Path(...)],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        result = e_ctrl.get_application_evidences(app_id=app_id, db=db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error getting application evidences", "err_stack": str(e)},
        )


# ---------- NOT USED --------------


# @router.delete("/{app_id}")
# async def delete_application(
#     app_id: Annotated[str, Path(title="App Id of the app to be updated")],
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(get_current_user)],
# ) -> dict[str, Any]:
#     if current_user.role != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail=f"You are not authorised {current_user.full_name}",
#         )
#     data = delete_app(app_id, db, current_user)
#     return {"msg": "", "data": data}


# @router.patch("/restore/{app_id}")
# async def restore_app_from_trash(
#     app_id: Annotated[str, Path(title="App Id of the app to be updated")],
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(get_current_user)],
# ):
#     # return {"msg": "Hello"}
#     if current_user.role != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail=f"You are not authorised {current_user.full_name}",
#         )
#     data = restore_app(app_id=app_id, db=db)
#     return {"msg": "", "data": data}


# @router.get("/trash")
# async def get_apps_in_trash(
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(get_current_user)],
# ):
#     if current_user.role != "admin":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail=f"You are not authorised {current_user.full_name}",
#         )
#     data = get_trashed_apps(db=db)
#     return {"msg": "", "data": data}


# @router.patch("/{app_id}/set-priority")
# def set_app_priority(
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(get_current_user)],
#     priority_val: Annotated[
#         PriorityVal,
#         Body(description="Priority value 1 = Low, 2 = Medium, 3 = High"),
#     ],
#     app_id: Annotated[str, Path(title="App Id of the app to be updated")],
# ):
#     app = db.get(Application, app_id)
#     if not app:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail=f"App not found {app_id}"
#         )

#     is_assigned = any(
#         any(a.user_id == current_user.id for a in checklist.assignments)
#         for checklist in app.checklists
#     )

#     if not is_assigned and current_user.role not in ["admin", "moderator"]:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Not authorised to edit this app",
#         )
#     app.set_priority_for_user(
#         user_id=current_user.id, db=db, priority_val=priority_val.priority_val
#     )


# # -------------- OLD ----------


# @router.get("")
# async def get_apps(
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(get_current_user)],
#     sort_by: Annotated[str, Query()] = "created_at",
#     sort_order: Annotated[Literal["asc", "desc"], Query()] = "desc",
#     search: Annotated[str | None, Query()] = None,
#     page: Annotated[int, Query()] = 1,
#     page_size: Annotated[int, Query()] = 15,
#     search_by: Annotated[
#         Literal[
#             "name",
#             "environment",
#             "region",
#             "owner_name",
#             "vendor_company",
#             "vertical",
#             "ticket_id",
#         ],
#         Query(),
#     ] = "name",
# ):
#     params = AppQueryParams(
#         sort_by=sort_by,
#         sort_order=sort_order,
#         search=search,
#         page=page,
#         page_size=page_size,
#         search_by=search_by,
#     )
#     data = list_apps(
#         db=db,
#         user=current_user,
#         params=params,
#     )
#     return {"msg": "", "data": data}


# @router.get("/with_details")
# async def get_applications_with_details(
#     db: Annotated[Session, Depends(get_db_conn)],
#     current_user: Annotated[UserOut, Depends(get_current_user)],
#     sort_by: Annotated[str, Query()] = "created_at",
#     sort_order: Annotated[Literal["asc", "desc"], Query()] = "desc",
#     search: Annotated[str | None, Query()] = None,
#     page: Annotated[int, Query()] = 1,
#     page_size: Annotated[int, Query()] = 15,
#     search_by: Annotated[
#         Literal[
#             "name",
#             "environment",
#             "region",
#             "owner_name",
#             "vendor_company",
#             "vertical",
#             "ticket_id",
#         ],
#         Query(),
#     ] = "name",
# ):
#     params = AppQueryParams(
#         sort_by=sort_by,
#         sort_order=sort_order,
#         search=search,
#         page=page,
#         page_size=page_size,
#         search_by=search_by,
#     )
#     data = list_apps_with_details(db=db, user=current_user, params=params)
#     return {"msg": "", "data": data}
