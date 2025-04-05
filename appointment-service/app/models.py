from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    datetime: datetime
    reason: str

class AppointmentDB(AppointmentCreate):
    status: str = "scheduled"
    invoice_path: Optional[str] = None
    measurement: str = "appointments"  # InfluxDB measurement name

    def to_influx_point(self):
        return {
            "measurement": self.measurement,
            "tags": {
                "patient_id": self.patient_id,
                "doctor_id": self.doctor_id,
                "status": self.status
            },
            "time": self.datetime.isoformat(),
            "fields": {
                "reason": self.reason,
                "invoice_path": self.invoice_path or ""
            }
        }