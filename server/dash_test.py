from db.connection import get_db_conn
from api.controllers.dashboard_controller import get_dashboard_stats

db = next(get_db_conn())
get_dashboard_stats(db=db)
