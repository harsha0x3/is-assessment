import os
from msal import ConfidentialClientApplication
import httpx
from dotenv import load_dotenv
import json
from models import User
from sqlalchemy import select
from sqlalchemy.orm import Session
from schemas.notification_schemas import NewAppNotification, NewAppData
from fastapi import HTTPException, status
import asyncio
from datetime import datetime

load_dotenv()

# Azure AD App Credentials
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
tenant_id = os.getenv("TENANT_ID")
email_sender_admin = os.getenv("EMAIL_ADDRESS")

authority = f"https://login.microsoftonline.com/{tenant_id}"
scopes = ["https://graph.microsoft.com/.default"]
graph_endpoint = f"https://graph.microsoft.com/v1.0/users/{email_sender_admin}/sendMail"


def fetch_token():
    """Fetch Microsoft Graph access token using MSAL."""
    app = ConfidentialClientApplication(
        client_id, authority=authority, client_credential=client_secret
    )

    result = app.acquire_token_for_client(scopes=scopes)
    if not result:
        return {"success": False}
    return {"success": True, "token": result.get("access_token")}


async def send_new_app_notif(payload: NewAppNotification, token: str):
    def val(v: str | None | datetime):
        return v if v else "Not specified"

    sla_value = (
        payload.sla.strftime("%d %b %Y")
        if hasattr(payload.sla, "strftime")
        else val(payload.sla)
    )

    try:
        html_body = f"""
<html>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.5;">
    <p>Dear {payload.full_name},</p>

    <p>
      This is to inform you that a new application has been registered in the
      <strong>IS Assessment System</strong>.
    </p>

    <table
      style="
        border-collapse: collapse;
        margin-top: 14px;
        margin-bottom: 18px;
        width: 100%;
        max-width: 600px;
      "
    >
      <tr>
        <td style="padding: 8px; font-weight: bold;">Application Name</td>
        <td style="padding: 8px;">{payload.app_name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Description</td>
        <td style="padding: 8px;">{val(payload.description)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Vertical</td>
        <td style="padding: 8px;">{val(payload.vertical)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Vendor Company</td>
        <td style="padding: 8px;">{val(payload.vendor_company)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">SLA</td>
        <td style="padding: 8px;">{sla_value}</td>
      </tr>
    </table>

    <p>
      Please log in to the IS Assessment portal to review the application and
      proceed with the necessary assessment activities relevant to your role.
    </p>

    <p style="margin-top: 24px;">
      Regards,<br />
      <strong>IS Assessment Team</strong>
    </p>

    <hr style="margin-top: 32px;" />

    <p style="font-size: 12px; color: #777;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </body>
</html>

"""
        email_msg = {
            "message": {
                "subject": "New Application for IS Assessment",
                "body": {"contentType": "HTML", "content": html_body},
                "toRecipients": [{"emailAddress": {"address": payload.email}}],
            }
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                graph_endpoint,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                content=json.dumps(email_msg),
            )
            if response.status_code == 202:
                print({"success": True, "status_code": response.status_code})
                print(response.__dict__)
                return {"success": True, "status_code": response.status_code}
            else:
                print({"success": False, "status_code": response.status_code})
                print(response.__dict__)

                return {"success": False, "status_code": response.status_code}

    except Exception as e:
        raise


async def send_new_app_mails_to_all(payload: NewAppData, db: Session):
    try:
        token = fetch_token()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Access token not found for sending mail",
            )
        access_token = token["token"]

        all_usrs = db.scalars(select(User).where(User.is_active)).all()
        tasks = [
            send_new_app_notif(
                NewAppNotification(
                    **payload.model_dump(), full_name=usr.full_name, email=usr.email
                ),
                token=str(access_token),
            )
            for usr in all_usrs
        ]

        await asyncio.gather(*tasks, return_exceptions=True)
    except Exception as e:
        raise


def send_new_app_mails_bg(payload: NewAppData, db: Session):
    asyncio.run(send_new_app_mails_to_all(payload, db))


# async def send_email(
#     subject: str,
#     reciepient: UserOut,
#     message: str | None = None,
# ):
#     try:
# token = fetch_token()
# if not token:
#     raise HTTPException(
#         status_code=status.HTTP_404_NOT_FOUND,
#         detail="Access token not found for sending mail",
#     )
# access_token = token["token"]
#         reciepient_name = (
#             f"{reciepient.first_name} {reciepient.last_name}"
#             if reciepient.last_name
#             else f"{reciepient.first_name}"
#         )
#         html_body = f"""
#                         <html>
#                         <body>
#                             <h2>Hello {reciepient_name},</h2>
#                             <p>{message}</p>
#                             <p>Thankyou.</p>
#                         </body>
#                         </html>

#                     """

# email_msg = {
#     "message": {
#         "subject": subject,
#         "body": {"contentType": "HTML", "content": html_body},
#         "toRecipients": [{"emailAddress": {"address": reciepient.email}}],
#     }
# }
# async with httpx.AsyncClient(timeout=10.0) as client:
#     response = await client.post(
#         graph_endpoint,
#         headers={
#             "Authorization": f"Bearer {access_token}",
#             "Content-Type": "application/json",
#         },
#         content=json.dumps(email_msg),
#     )
#     if response.status_code == 202:
#         print({"success": True, "status_code": response.status_code})
#         print(response.__dict__)
#         return {"success": True, "status_code": response.status_code}
#     else:
#         print({"success": False, "status_code": response.status_code})
#         print(response.__dict__)

#         return {"success": False, "status_code": response.status_code}

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to send mail {str(e)}",
#         )


# ggqtLBDV-a5GVv-
