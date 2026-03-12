from db.connection import get_db_conn
from api.controllers.dashboard_controller import (
   get_app_types_summary
)

db = next(get_db_conn())
res = get_app_types_summary(db=db)

print("FIANL REs", ConnectionResetError)
# print("Applications")
# get_app_status_stats(db=db)
# print()
# print("Departments")
# get_department_status_stats(db=db)


print("Hello")
