import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# did this to give the possibility to set a real secret key, for deployment and security reasons
# allows to change the key if needed without changing the code, and also to just be able to launch the project without needing to set env variables
SECRET_KEY = os.getenv("SECRET_KEY", "my_super_secret_project_key_uff")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": int(user_id), "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user_id(current_user: dict = Depends(get_current_user)):
    return current_user["id"]

def get_user_from_header_or_query(
    token: str = Query(None),
    credentials: HTTPAuthorizationCredentials = Depends(security_optional)
):
    """
    Dependency that allows authentication via the standard Authorization header 
    OR a 'token' query parameter (used for direct browser links like downloads).
    """
    token_to_use = credentials.credentials if credentials else token
    
    if not token_to_use:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        payload = jwt.decode(token_to_use, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": int(user_id), "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user["id"]
