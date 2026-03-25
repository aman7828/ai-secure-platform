import io

def parse_file(file_obj, filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return _parse_pdf(file_obj)
    elif ext in ("doc", "docx"):
        return _parse_docx(file_obj)
    else:
        return file_obj.read().decode("utf-8", errors="replace")

def _parse_pdf(file_obj) -> str:
    try:
        import fitz
        data = file_obj.read()
        doc = fitz.open(stream=data, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    except Exception as e:
        return f"[PDF parse error: {e}]"

def _parse_docx(file_obj) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_obj.read()))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        return f"[DOCX parse error: {e}]"
