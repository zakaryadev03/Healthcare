import httpx
from fastapi import HTTPException
from tenacity import retry, stop_after_attempt, wait_fixed
from app.config import settings

class ServiceClient:
    def __init__(self):
        self.timeout = httpx.Timeout(5.0)  # 5 second timeout
        self.headers = {
            "X-Internal-API-Key": settings.INTERNAL_API_KEY,
            "User-Agent": "Appointment-Service"
        }

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(0.5))
    async def _make_request(self, client, method, url):
        try:
            response = await client.request(method, url, headers=self.headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Service request failed: {response.text}"
                )
            return response
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Service unavailable")

    async def verify_patient_exists(self, patient_id: str):
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            url = f"{settings.PATIENT_SERVICE_URL}/patients/{patient_id}"
            await self._make_request(client, "GET", url)

    async def verify_doctor_exists(self, doctor_id: str):
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            url = f"{settings.DOCTOR_SERVICE_URL}/doctors/{doctor_id}"
            await self._make_request(client, "GET", url)