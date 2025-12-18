from typing import Annotated, Any, Literal

from fastapi import APIRouter, Body, Depends, HTTPException, Path, status, Query
from sqlalchemy.orm import Session
from models import Application
from pydantic import BaseModel

from api.controllers.application_controller import (
    create_app,
    delete_app,
    list_apps_with_details,
    restore_app,
    update_app,
    get_trashed_apps,
    get_app_stats,
    list_apps,
    get_app_details,
    list_all_apps,
    change_app_status,
)
from db.connection import get_db_conn
from schemas.app_schemas import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    AppQueryParams,
)
from schemas.auth_schemas import UserOut
from schemas.crud_schemas import PriorityVal
from services.auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", summary="Create New Application")
async def create_application(
    payload: Annotated[ApplicationCreate, "Request fields for creating an application"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    data = create_app(payload=payload, db=db, creator=current_user, owner=current_user)
    return {"msg": "Application created successfully", "data": data}


@router.get("/list")
async def new_list_all_apps(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    sort_by: Annotated[str, Query()] = "created_at",
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
):
    params = AppQueryParams(
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        page=page,
        page_size=page_size,
        search_by=search_by,
    )
    data = list_all_apps(
        db=db,
        user=current_user,
        params=params,
    )
    return {"msg": "Applications fetched successfully", "data": data}


@router.get("")
async def get_apps(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    sort_by: Annotated[str, Query()] = "created_at",
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
):
    params = AppQueryParams(
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        page=page,
        page_size=page_size,
        search_by=search_by,
    )
    data = list_apps(
        db=db,
        user=current_user,
        params=params,
    )
    return {"msg": "", "data": data}


@router.get("/with_details")
async def get_applications_with_details(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    sort_by: Annotated[str, Query()] = "created_at",
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
):
    params = AppQueryParams(
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        page=page,
        page_size=page_size,
        search_by=search_by,
    )
    data = list_apps_with_details(db=db, user=current_user, params=params)
    return {"msg": "", "data": data}


@router.get("/{app_id}", response_model=ApplicationOut)
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


@router.patch("/{app_id}", response_model=ApplicationOut)
async def update_application(
    payload: Annotated[ApplicationUpdate, Body(title="App update payload")],
    app_id: Annotated[str, Path(title="App Id of the app to be updated")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have to update the application {current_user.username}",
        )
    data = update_app(payload, app_id, db, current_user)
    return {"msg": "", "data": data}


@router.delete("/{app_id}", response_model=ApplicationOut)
async def delete_application(
    app_id: Annotated[str, Path(title="App Id of the app to be updated")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
) -> dict[str, Any]:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are not authorised {current_user.username}",
        )
    data = delete_app(app_id, db, current_user)
    return {"msg": "", "data": data}


@router.patch("/restore/{app_id}")
async def restore_app_from_trash(
    app_id: Annotated[str, Path(title="App Id of the app to be updated")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    # return {"msg": "Hello"}
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are not authorised {current_user.username}",
        )
    data = restore_app(app_id=app_id, db=db)
    return {"msg": "", "data": data}


@router.get("/trash", response_model=list[ApplicationOut])
async def get_apps_in_trash(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are not authorised {current_user.username}",
        )
    data = get_trashed_apps(db=db)
    return {"msg": "", "data": data}


@router.get("/stats")
def application_stats(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    data = get_app_stats(current_user=current_user, db=db)
    return {"msg": "", "data": data}


@router.patch("/{app_id}/set-priority")
def set_app_priority(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    priority_val: Annotated[
        PriorityVal,
        Body(description="Priority value 1 = Low, 2 = Medium, 3 = High"),
    ],
    app_id: Annotated[str, Path(title="App Id of the app to be updated")],
):
    app = db.get(Application, app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"App not found {app_id}"
        )

    is_assigned = any(
        any(a.user_id == current_user.id for a in checklist.assignments)
        for checklist in app.checklists
    )

    if not is_assigned and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorised to edit this app",
        )
    app.set_priority_for_user(
        user_id=current_user.id, db=db, priority_val=priority_val.priority_val
    )


class StatusVal(BaseModel):
    status_val: Annotated[
        Literal["pending", "completed", "cancelled", "in_progress"], ""
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
