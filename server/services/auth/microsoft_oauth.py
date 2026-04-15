# services/auth/microsoft_oauth.py

import os
import requests
from jose import jwt
from fastapi import HTTPException, status

_jwks_cache = None

AUTH_TENANT_ID = os.getenv("AUTH_TENANT_ID")
AUTH_CLIENT_ID = os.getenv("AUTH_CLIENT_ID")
AUTH_CLIENT_SECRET = os.getenv("AUTH_CLIENT_SECRET")
APPLICATION_URI = os.getenv("APPLICATION_URI")
REDIRECT_URI = f"{APPLICATION_URI}/auth/microsoft/callback"

AUTHORITY = f"https://login.microsoftonline.com/{AUTH_TENANT_ID}"
AUTHORIZE_URL = f"{AUTHORITY}/oauth2/v2.0/authorize"
TOKEN_URL = f"{AUTHORITY}/oauth2/v2.0/token"
JWKS_URL = f"{AUTHORITY}/discovery/v2.0/keys"


def exchange_code_for_token(code: str) -> dict:
    data = {
        "client_id": AUTH_CLIENT_ID,
        "client_secret": AUTH_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
    }
    res = None
    for i in range(3):
        res = requests.post(TOKEN_URL, data=data)
        if res.status_code == 200:
            break
        else:
            continue

    if not res:
        raise HTTPException(status_code=400, detail="Failed to get Microsoft token")

    return res.json()


def get_jwks():
    global _jwks_cache
    if not _jwks_cache:
        res = requests.get(JWKS_URL)
        _jwks_cache = res.json()
    return _jwks_cache


def verify_id_token(id_token: str) -> dict:
    jwks = get_jwks()
    unverified_header = jwt.get_unverified_header(id_token)
    key = None
    for jwk in jwks.get("keys", []):
        if jwk.get("kid", "") == unverified_header.get("kid", None):
            key = jwk
            break
    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token Key"
        )

    try:
        payload = jwt.decode(
            token=id_token,
            key=key,
            algorithms=["RS256"],
            audience=AUTH_CLIENT_ID,
            issuer=f"{AUTHORITY}/v2.0",
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Microsoft token",
        )
