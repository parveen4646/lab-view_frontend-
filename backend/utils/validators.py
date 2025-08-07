import re
from typing import Dict, Any, List, Optional

class ValidationError(Exception):
    """Custom validation error"""
    pass

class Validators:
    """Input validation utilities"""
    
    @staticmethod
    def validate_pdf_upload_request(request) -> Dict[str, Any]:
        """Validate PDF upload request"""
        if 'file' not in request.files:
            raise ValidationError("No file part in request")
        
        file = request.files['file']
        if file.filename == '':
            raise ValidationError("No file selected")
        
        return {"file": file}
    
    @staticmethod
    def validate_patient_info(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate patient information"""
        validated = {}
        
        # Name validation
        name = patient_data.get("name", "").strip()
        if name and len(name) > 100:
            raise ValidationError("Patient name too long")
        validated["name"] = name
        
        # Age validation
        age = patient_data.get("age")
        if age is not None:
            try:
                age = int(age)
                if age < 0 or age > 150:
                    raise ValidationError("Invalid age")
                validated["age"] = age
            except (ValueError, TypeError):
                raise ValidationError("Age must be a number")
        else:
            validated["age"] = None
        
        # Gender validation
        gender = patient_data.get("gender", "").lower().strip()
        if gender and gender not in ["male", "female", "m", "f"]:
            raise ValidationError("Invalid gender")
        validated["gender"] = gender if gender else None
        
        # Date validation
        date_of_birth = patient_data.get("dateOfBirth")
        if date_of_birth:
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', date_of_birth):
                raise ValidationError("Invalid date format. Use YYYY-MM-DD")
        validated["dateOfBirth"] = date_of_birth
        
        return validated
    
    @staticmethod
    def validate_lab_results(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate lab results"""
        validated_results = []
        
        for result in results:
            validated_result = {}
            
            # Test name validation
            test_name = result.get("testName", "").strip()
            if not test_name:
                continue  # Skip empty test names
            validated_result["testName"] = test_name
            
            # Value validation
            try:
                value = float(result.get("value", 0))
                validated_result["value"] = value
            except (ValueError, TypeError):
                continue  # Skip invalid values
            
            # Unit validation
            unit = result.get("unit", "").strip()
            validated_result["unit"] = unit
            
            # Status validation
            status = result.get("status", "normal").lower()
            if status not in ["normal", "high", "low", "critical"]:
                status = "normal"
            validated_result["status"] = status
            
            # Category validation
            category = result.get("category", "blood").lower()
            if category not in ["blood", "lipid", "liver", "kidney", "metabolic"]:
                category = "blood"
            validated_result["category"] = category
            
            validated_results.append(validated_result)
        
        return validated_results
