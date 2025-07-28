import json
import logging
import requests
import re
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class OllamaAnalyzer:
    """Analyze extracted PDF content using Ollama LLM"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "deepseek-r1:8b"):
        self.base_url = base_url
        self.model = model
        self.api_url = f"{base_url}/api"
    
    def is_available(self) -> bool:
        """Check if Ollama server is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def analyze_medical_data(self, extracted_content: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze extracted medical PDF content"""
        if not self.is_available():
            logger.warning("⚠️  Ollama server not available")
            return self._fallback_analysis(extracted_content)
        
        try:
            # Prepare content for analysis
            analysis_prompt = self._create_medical_analysis_prompt(extracted_content)
            
            # Get LLM response
            response = self._generate_response(analysis_prompt)
            
            if response:
                # Parse the response
                parsed_result = self._parse_medical_response(response)
                logger.info("✅ Ollama analysis completed")
                return parsed_result
            else:
                logger.warning("⚠️  Empty Ollama response")
                return self._fallback_analysis(extracted_content)
                
        except Exception as e:
            logger.error(f"❌ Error in Ollama analysis: {str(e)}")
            return self._fallback_analysis(extracted_content)
    
    def _create_medical_analysis_prompt(self, extracted_content: Dict[str, Any]) -> str:
        """Create prompt for medical data analysis"""
        text = extracted_content.get("text", "")
        tables = extracted_content.get("tables", [])
        
        # Prepare table data summary
        tables_summary = []
        for table in tables:
            headers = table.get("headers", [])
            rows = table.get("rows", [])
            tables_summary.append(f"Table with headers: {', '.join(headers[:5])} and {len(rows)} rows")
        
        prompt = f"""
You are a medical data analyst. Analyze the following medical lab report and extract structured information.

TEXT CONTENT:
{text[:2000]}...

TABLES FOUND:
{chr(10).join(tables_summary)}

DETAILED TABLE DATA:
{json.dumps(tables[:3], indent=2)}

Please analyze this medical lab report and respond with ONLY a valid JSON object in this exact format:
{{
  "patientInfo": {{
    "id": "extracted_or_generated_id",
    "name": "Patient Name",
    "age": age_number_or_null,
    "gender": "male/female or null",
    "dateOfBirth": "YYYY-MM-DD or null",
    "lastTestDate": "YYYY-MM-DD"
  }},
  "latestResults": [
    {{
      "id": "unique_id",
      "testName": "Test Name",
      "value": numeric_value,
      "unit": "unit",
      "referenceRange": {{"min": min_value, "max": max_value}},
      "status": "normal/high/low/critical",
      "date": "YYYY-MM-DD",
      "category": "blood/lipid/liver/kidney/metabolic"
    }}
  ],
  "testCategories": [
    {{
      "id": "category_id",
      "name": "Category Name", 
      "description": "Category Description",
      "color": "hsl(var(--chart-primary))",
      "tests": ["test1", "test2"]
    }}
  ]
}}

IMPORTANT INSTRUCTIONS:
1. Extract patient information from the text
2. Find all test results with their values, units, and reference ranges
3. Determine status based on reference ranges (normal/high/low/critical)
4. Categorize tests into: blood, lipid, liver, kidney, or metabolic
5. Generate appropriate test categories based on found tests
6. Use realistic reference ranges for medical tests
7. Return ONLY valid JSON, no additional text or explanations
8. If information is missing, use null or generate realistic placeholders
"""
        
        return prompt
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using Ollama"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": 2000,
                    "temperature": 0.1,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(
                f"{self.api_url}/generate",
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return ""
                
        except Exception as e:
            logger.error(f"Error calling Ollama: {str(e)}")
            return ""
    
    def _parse_medical_response(self, response: str) -> Dict[str, Any]:
        """Parse Ollama response and extract JSON"""
        try:
            # Try to find JSON in the response
            json_pattern = r'\{.*\}'
            json_match = re.search(json_pattern, response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                
                # Validate structure
                if self._validate_medical_structure(parsed):
                    return parsed
            
            # If parsing fails, try to extract information manually
            return self._extract_medical_info_from_text(response)
            
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️  JSON parsing error: {str(e)}")
            return self._extract_medical_info_from_text(response)
        except Exception as e:
            logger.error(f"❌ Error parsing Ollama response: {str(e)}")
            return self._fallback_analysis({})
    
    def _validate_medical_structure(self, data: Dict[str, Any]) -> bool:
        """Validate the structure of medical data"""
        required_keys = ['patientInfo', 'latestResults', 'testCategories']
        return all(key in data for key in required_keys)
    
    def _extract_medical_info_from_text(self, text: str) -> Dict[str, Any]:
        """Extract medical information from unstructured text response"""
        # This is a fallback method to extract basic information
        return {
            "patientInfo": {
                "id": "extracted_patient",
                "name": "Patient Name",
                "age": None,
                "gender": None,
                "dateOfBirth": None,
                "lastTestDate": "2024-01-15"
            },
            "latestResults": [],
            "testCategories": [
                {
                    "id": "blood",
                    "name": "Complete Blood Count",
                    "description": "Blood cell counts and basic blood chemistry",
                    "color": "hsl(var(--chart-primary))",
                    "tests": []
                }
            ]
        }
    
    def _fallback_analysis(self, extracted_content: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis when Ollama is not available"""
        return {
            "patientInfo": {
                "id": "fallback_patient",
                "name": "Unknown Patient",
                "age": None,
                "gender": None,
                "dateOfBirth": None,
                "lastTestDate": "2024-01-15"
            },
            "latestResults": [],
            "testCategories": []
        }
