import os
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import uvicorn

from config import Config
from services.pdf_extractor import PDFExtractor
from services.llm_analyzer import OllamaAnalyzer
from services.data_formatter import DataFormatter
from utils.file_handler import FileHandler
from utils.validators import Validators, ValidationError
from models.schemas import ProcessingResponse, PatientInfo, LabResult

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Lab PDF Processor API",
    description="API for processing medical lab PDFs and extracting structured data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
pdf_extractor = PDFExtractor()
ollama_analyzer = OllamaAnalyzer(
    base_url=Config.OLLAMA_BASE_URL,
    model=Config.OLLAMA_MODEL
)
data_formatter = DataFormatter()
file_handler = FileHandler(Config.UPLOAD_FOLDER)

# Request/Response Models
class TextAnalysisRequest(BaseModel):
    text: str
    tables: Optional[List[Dict[str, Any]]] = []

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, str]
    timestamp: str

class StatusResponse(BaseModel):
    success: bool
    status: Dict[str, str]

class APIResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    data: Optional[Any] = None
    details: Optional[str] = None

# Dependency to get services
def get_services():
    return {
        'pdf_extractor': pdf_extractor,
        'ollama_analyzer': ollama_analyzer,
        'data_formatter': data_formatter,
        'file_handler': file_handler
    }

# Exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": str(exc)
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error occurred"
        }
    )

# API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        ollama_status = ollama_analyzer.is_available()
        return HealthResponse(
            status="healthy",
            services={
                "pdf_extractor": "available",
                "ollama": "available" if ollama_status else "unavailable",
                "file_handler": "available"
            },
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )

@app.post("/api/upload", response_model=APIResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    services = Depends(get_services)
):
    """Upload and process PDF file"""
    try:
        logger.info(f"📁 Processing upload: {file.filename}")
        
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file provided"
            )
        
        if not file_handler.is_allowed_file(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not allowed. Only PDF files are accepted."
            )
        
        # Save uploaded file
        temp_filename = f"{uuid.uuid4().hex}_{file.filename}"
        temp_filepath = os.path.join(Config.UPLOAD_FOLDER, temp_filename)
        
        try:
            # Save file content
            content = await file.read()
            with open(temp_filepath, "wb") as f:
                f.write(content)
            
            # Extract content from PDF
            logger.info("🔍 Extracting PDF content...")
            extracted_content = pdf_extractor.extract_content(temp_filepath)
            
            if extracted_content['status'] == 'error':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to extract PDF content"
                )
            
            # Analyze with LLM
            logger.info("🧠 Analyzing content with LLM...")
            analyzed_data = ollama_analyzer.analyze_medical_data(extracted_content)
            
            # Format for frontend
            logger.info("📊 Formatting data for frontend...")
            formatted_data = data_formatter.format_for_frontend(analyzed_data)
            
            # Add processing metadata
            formatted_data['processing_metadata'] = {
                'filename': file.filename,
                'extraction_metadata': extracted_content['metadata'],
                'processing_timestamp': datetime.now().isoformat(),
                'ollama_available': ollama_analyzer.is_available()
            }
            
            logger.info("✅ PDF processing completed successfully")
            
            return APIResponse(
                success=True,
                message="PDF processed successfully",
                data=formatted_data
            )
            
        finally:
            # Clean up uploaded file
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error processing PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF file: {str(e)}"
        )

@app.post("/api/analyze", response_model=APIResponse)
async def analyze_text(
    request: TextAnalysisRequest,
    services = Depends(get_services)
):
    """Analyze text content directly"""
    try:
        text_content = request.text
        logger.info(f"📝 Analyzing text content ({len(text_content)} characters)")
        
        # Create mock extracted content structure
        extracted_content = {
            'text': text_content,
            'tables': request.tables,
            'metadata': {
                'text_length': len(text_content),
                'extraction_method': 'direct_input'
            },
            'status': 'success'
        }
        
        # Analyze with LLM
        analyzed_data = ollama_analyzer.analyze_medical_data(extracted_content)
        
        # Format for frontend
        formatted_data = data_formatter.format_for_frontend(analyzed_data)
        
        return APIResponse(
            success=True,
            message="Text analyzed successfully",
            data=formatted_data
        )
        
    except Exception as e:
        logger.error(f"❌ Error analyzing text: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze text: {str(e)}"
        )

@app.get("/api/patient/{patient_id}", response_model=APIResponse)
async def get_patient_data(patient_id: str):
    """Get patient data by ID (mock endpoint for demo)"""
    try:
        # This would typically fetch from a database
        # For now, returning mock data
        mock_data = {
            'patientInfo': {
                'id': patient_id,
                'name': 'John Doe',
                'age': 45,
                'gender': 'male',
                'dateOfBirth': '1979-03-15',
                'lastTestDate': '2024-01-20'
            },
            'latestResults': [
                {
                    'id': 'result_1',
                    'testName': 'Hemoglobin',
                    'value': 14.2,
                    'unit': 'g/dL',
                    'referenceRange': {'min': 13.5, 'max': 17.5},
                    'status': 'normal',
                    'date': '2024-01-20',
                    'category': 'blood'
                }
            ],
            'testCategories': data_formatter.default_categories,
            'trendData': {}
        }
        
        return APIResponse(
            success=True,
            data=mock_data
        )
        
    except Exception as e:
        logger.error(f"❌ Error fetching patient data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patient data"
        )

@app.get("/api/status", response_model=StatusResponse)
async def get_status():
    """Get system status"""
    try:
        return StatusResponse(
            success=True,
            status={
                'pdf_extractor': 'operational',
                'ollama': 'available' if ollama_analyzer.is_available() else 'unavailable',
                'ollama_model': Config.OLLAMA_MODEL,
                'upload_folder': Config.UPLOAD_FOLDER,
                'max_file_size': str(Config.MAX_CONTENT_LENGTH)
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Error getting status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get system status"
        )

# Additional FastAPI specific endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Medical Lab PDF Processor API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/api/models")
async def get_available_models():
    """Get available Ollama models"""
    try:
        if not ollama_analyzer.is_available():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ollama server is not available"
            )
        
        # This would call Ollama API to get available models
        # For now, returning current model
        return APIResponse(
            success=True,
            data={
                "current_model": Config.OLLAMA_MODEL,
                "available_models": [Config.OLLAMA_MODEL]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting models: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get available models"
        )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting Medical Lab PDF Processor API")
    logger.info(f"📁 Upload folder: {Config.UPLOAD_FOLDER}")
    logger.info(f"🤖 Ollama URL: {Config.OLLAMA_BASE_URL}")
    logger.info(f"🎯 Ollama Model: {Config.OLLAMA_MODEL}")
    
    # Ensure upload folder exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    
    # Check Ollama availability
    if ollama_analyzer.is_available():
        logger.info("✅ Ollama server is available")
    else:
        logger.warning("⚠️  Ollama server is not available - using fallback analysis")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down Medical Lab PDF Processor API")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )