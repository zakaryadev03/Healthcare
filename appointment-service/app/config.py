from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PATIENT_SERVICE_URL: str = "http://patient-service:8000"
    DOCTOR_SERVICE_URL: str = "http://doctor-service:8001"
    INTERNAL_API_KEY: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    INFLUX_URL: str = "http://influxdb:8086"
    INFLUX_TOKEN: str
    INFLUX_ORG: str = "medical"
    INFLUX_BUCKET: str = "appointments"

    HTTP_REQUEST_TIMEOUT: int = 5

    class Config:
        env_file = ".env"

settings = Settings()