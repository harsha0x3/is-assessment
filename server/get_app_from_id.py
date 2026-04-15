from services.notifications.email_notify import fetch_token
import requests


def get_app(app_id):
    try:
        token = fetch_token()
        if not token:
            print("Access token not found for fetching app details")
        access_token = token["token"]

        headers = {"Authorization": f"Bearer {access_token}"}
        # response = requests.get(
        #     f"https://graph.microsoft.com/v1.0/applications/{app_id}", headers=headers
        # )

        response = requests.get(
            f"https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '{app_id}'",
            headers=headers,
        )

        print("RES TEXT", response.text)
        print("RES JSON", response.json())
    except Exception as e:
        print("Error fetching app details:", e)


get_app("b74c6bb0-3996-45e2-a864-59fb57be54da")
