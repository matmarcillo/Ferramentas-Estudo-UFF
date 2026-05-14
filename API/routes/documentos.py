from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from api_types import *
from bdd import get_db

router = APIRouter(tags=["Documentos"])