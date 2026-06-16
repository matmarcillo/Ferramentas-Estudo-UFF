from fastapi import APIRouter, HTTPException, Depends
from psycopg2.extras import RealDictCursor
from bdd import get_db
from auth import get_current_admin
from tier_system import set_double_xp, DOUBLE_XP_ACTIVE

router = APIRouter(tags=["Admin"], prefix="/admin")

@router.get("/telemetry")
def get_telemetry(_ = Depends(get_current_admin)):
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT date(date_uploaded) as day, count(*) as total, 'document' as category FROM documento GROUP BY day
                UNION ALL
                SELECT date(date_uploaded) as day, count(*) as total, 'course_review' as category FROM avaliacao_disciplina GROUP BY day
                UNION ALL
                SELECT date(date_uploaded) as day, count(*) as total, 'professor_review' as category FROM avaliacao_professor GROUP BY day
                ORDER BY day DESC, category;
                """
                cursor.execute(query)
                results = cursor.fetchall()
                
                # Format the data for easier consumption by the frontend charts
                formatted_data = {}
                for row in results:
                    day = str(row['day'])
                    if day not in formatted_data:
                        formatted_data[day] = {"date": day, "document": 0, "course_review": 0, "professor_review": 0}
                    formatted_data[day][row['category']] = row['total']
                
                return sorted(list(formatted_data.values()), key=lambda x: x['date'], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching telemetry: {str(e)}")

@router.get("/double-xp")
def get_double_xp_status(_ = Depends(get_current_admin)):
    return {"active": DOUBLE_XP_ACTIVE}

@router.post("/double-xp")
def toggle_double_xp(active: bool, _ = Depends(get_current_admin)):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO system_config (key, value) VALUES ('double_xp_active', %s) "
                    "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                    (str(active).lower(),)
                )
                conn.commit()
        
        set_double_xp(active)
        return {"active": active, "message": f"Double XP mode {'activated' if active else 'deactivated'}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling double XP: {str(e)}")
