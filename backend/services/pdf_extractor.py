import logging
from typing import Dict, Any
import pdfplumber

logger = logging.getLogger(__name__)

class PDFExtractor:
    """Efficient PDF extractor using pdfplumber for digital PDFs."""

    def __init__(self, enable_tables: bool = True):
        self.enable_tables = enable_tables

    def extract_content(self, pdf_path: str) -> Dict[str, Any]:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)

                tables = []
                if self.enable_tables:
                    for page_num, page in enumerate(pdf.pages):
                        for table_idx, table in enumerate(page.extract_tables()):
                            if table:
                                headers = table[0] if table else []
                                rows = table[1:] if len(table) > 1 else []
                                tables.append({
                                    "id": f"table_{page_num}_{table_idx}",
                                    "page": page_num + 1,
                                    "headers": headers,
                                    "rows": rows,
                                    "row_count": len(rows),
                                    "column_count": len(headers)
                                })

                output = {
                    "text": text,
                    "tables": tables,
                    "metadata": {
                        "page_count": len(pdf.pages),
                        "table_count": len(tables),
                        "text_length": len(text) if text else 0,
                        "extraction_method": "pdfplumber"
                    },
                    "status": "success"
                }
                print("\n--- PDF Extraction Output ---\n", output, "\n--- End Output ---\n")
                logger.debug(f"PDF Extraction Output: {output}")
                return output
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            return {"text": "", "tables": [], "metadata": {"error": str(e)}, "status": "error"}