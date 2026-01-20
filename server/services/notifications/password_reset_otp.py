import os
from msal import ConfidentialClientApplication
import httpx
from dotenv import load_dotenv
import json
from schemas.auth_schemas import UserOut, OTPEmailPaylod
from fastapi import HTTPException, status

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


async def send_email(
    subject: str,
    payload: OTPEmailPaylod,
    message: str | None = None,
):
    try:
        token = fetch_token()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Access token not found for sending mail",
            )
        access_token = token["token"]
        reciepient_name = payload.full_name
        html_body = f"""
                        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IS Assessment Application Password Reset OTP</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <!-- Preheader -->
    <div style="display: none; max-height: 0; overflow: hidden; color: #ffffff">
      IS Assessment Application OTP Reset
    </div>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding: 24px 0"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  padding: 20px 28px;
                  background: #1274b1;
                  color: #ffffff;
                  text-align: left;
                "
              >
                <h1 style="margin: 0; font-size: 20px; line-height: 1.2">
                  IS Assessment Application Password Reset - OTP
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 28px">
                <p style="margin: 0 0 14px; font-size: 15px; color: #333333">
                  Hello <strong>{reciepient_name}</strong>
                </p>
                <p>Use this below OTP for password reset. Expires in {payload.expires_in}</p>

                <!-- OTP Block -->
                <div style="text-align: center; margin: 18px 0 22px">
                  <div
                    style="
                      display: inline-block;
                      background: #f3f9fe;
                      border: 1px solid #c6e2f5;
                      padding: 18px 24px;
                      border-radius: 8px;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 20px;
                        letter-spacing: 4px;
                        font-weight: 700;
                        color: #1274b1;
                      "
                    >
                      {payload.otp}
                    </p>
                  </div>
                </div>

                <p
                  style="
                    margin: 0;
                    font-size: 12.5px;
                    color: #8a8f95;
                    line-height: 1.4;
                  "
                >
                  Security Notice: This OTP is confidential and intended for
                  authorized personnel only. Do not forward this email or share
                  the code.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>


                    """

        email_msg = {
            "message": {
                "subject": subject,
                "body": {"contentType": "HTML", "content": html_body},
                "toRecipients": [{"emailAddress": {"address": payload.email}}],
            }
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                graph_endpoint,
                headers={
                    "Authorization": f"Bearer {access_token}",
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send mail {str(e)}",
        )
