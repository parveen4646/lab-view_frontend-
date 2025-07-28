from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class ReferenceRange(BaseModel):
    min: float
    max: float

class LabResult(BaseModel):
    id: str
    testName: str
    value: float
    unit: str
    referenceRange: ReferenceRange
    status: Literal['normal', 'high', 'low', 'critical']
    date: str
    category: str

class TrendData(BaseModel):
    date: str
    value: float
    testName: str
    status: Literal['normal', 'high', 'low', 'critical']

class PatientInfo(BaseModel):
    id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    dateOfBirth: Optional[str] = None
    lastTestDate: str

class TestCategory(BaseModel):
    id: str
    name: str
    description: str
    color: str
    tests: List[str]

class ProcessingResponse(BaseModel):
    patientInfo: PatientInfo
    latestResults: List[LabResult]
    testCategories: List[TestCategory]
    trendData: Dict[str, List[TrendData]]
    processing_metadata: Optional[Dict[str, Any]] = None
