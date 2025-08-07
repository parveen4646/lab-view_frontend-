import os
import uuid
import logging
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class FileHandler:
    """Handle file uploads and management"""
    
    def __init__(self, upload_folder: str = "uploads"):
        self.upload_folder = upload_folder
        self.allowed_extensions = {'pdf'}
        self._ensure_upload_folder()
    
    def _ensure_upload_folder(self):
        """Ensure upload folder exists"""
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
            logger.info(f"Created upload folder: {self.upload_folder}")
    
    def is_allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def save_uploaded_file(self, file: FileStorage) -> Tuple[bool, str, Optional[str]]:
        """
        Save uploaded file and return (success, message, filepath)
        """
        try:
            if not file or file.filename == '':
                return False, "No file provided", None
            
            if not self.is_allowed_file(file.filename):
                return False, "File type not allowed. Only PDF files are accepted.", None
            
            # Generate unique filename
            original_filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
            filepath = os.path.join(self.upload_folder, unique_filename)
            
            # Save file
            file.save(filepath)
            
            # Verify file was saved
            if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                logger.info(f"✅ File saved: {filepath}")
                return True, "File uploaded successfully", filepath
            else:
                return False, "Failed to save file", None
                
        except Exception as e:
            logger.error(f"❌ Error saving file: {str(e)}")
            return False, f"Error saving file: {str(e)}", None
    
    def cleanup_file(self, filepath: str) -> bool:
        """Clean up temporary file"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"🗑️  Cleaned up file: {filepath}")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Error cleaning up file {filepath}: {str(e)}")
            return False
