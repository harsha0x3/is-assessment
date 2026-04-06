from db.connection import get_db_conn
from api.controllers.exec_summary_controller import (
    get_application_exec_summary,
    create_app_exec_summary,
)
from schemas import exec_summary_schemas as exec_schemas

db = next(get_db_conn())

print(
    create_app_exec_summary(
        payload=exec_schemas.ExecSummaryInput(
            application_id="asdf", content="asdfa", author_id="asdf"
        ),
        db=db,
    )
)
