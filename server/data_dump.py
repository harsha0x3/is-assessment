import pandas as pd
from sqlalchemy import select
from db.connection import get_db_conn
from models import Application

csv_path = r"C:\Users\harshavardhancg\CodeBase\is-assessment\server\parsed_app_urls.csv"
desc_csv = r"C:\Users\harshavardhancg\Downloads\IS Assessment DashBoard with URL(App List) (1).csv"


def dump_urls():
    df = pd.read_csv(csv_path)
    with next(get_db_conn()) as db:
        for _, row in df.iterrows():
            if pd.notna(row["ApplicationURL"]):
                app = db.scalar(
                    select(Application).where(
                        Application.name == row["ApplicationName"]
                    )
                )
                if not app:
                    print("app not found", row["ApplicationName"])
                    continue
                print(":added")
                app.app_url = row["ApplicationURL"]
                db.commit()


def dump_descriptions():
    df = pd.read_csv(desc_csv)
    with next(get_db_conn()) as db:
        for _, row in df.iterrows():
            if pd.notna(row["APP Use Case/Purpose of the application"]):
                app = db.scalar(
                    select(Application).where(
                        Application.name == row["ApplicationName"]
                    )
                )
                if not app:
                    print("app not found", row["ApplicationName"])
                    continue
                app.description = row["APP Use Case/Purpose of the application"]
                print("Added")
                db.commit()


dump_descriptions()


# dump_urls()
