from fastapi import FastAPI, Depends, HTTPException
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS
from app.models import AppointmentCreate, AppointmentDB
from app.auth import get_current_doctor
from app.config import settings
from app.http_client import ServiceClient

service_client = ServiceClient()

app = FastAPI()

# Initialize InfluxDB client
client = InfluxDBClient(
    url=settings.INFLUX_URL,
    token=settings.INFLUX_TOKEN,
    org=settings.INFLUX_ORG
)
write_api = client.write_api(write_options=SYNCHRONOUS)

@app.post("/appointments", response_model=AppointmentDB)
async def create_appointment(
    appointment: AppointmentCreate,
    current_doctor: dict = Depends(get_current_doctor)
):
    # Verify requesting doctor matches appointment
    if current_doctor.get("doctorId") != appointment.doctor_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create appointments for other doctors"
        )

    await service_client.verify_patient_exists(appointment.patient_id)
    await service_client.verify_doctor_exists(appointment.doctor_id)

    
    # Create database model
    appointment_db = AppointmentDB(**appointment.dict())
    
    # Write to InfluxDB
    try:
        write_api.write(
            bucket=settings.INFLUX_BUCKET,
            record=appointment_db.to_influx_point()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save appointment: {str(e)}"
        )

    return appointment_db