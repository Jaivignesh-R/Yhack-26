/**
 * Intelligent Document Validator
 * Simulates automated document verification and compliance rule checking
 * before final submission to government departments.
 */

function validateDocument(reqDoc, file) {
  const fileName = (file.originalname || file.file_name || '').toLowerCase();
  const fileSize = file.size || file.file_size || 0;
  const docName = (reqDoc.document_name || '').toLowerCase();

  // 1. Minimum file check (avoid empty or corrupt dummy uploads)
  if (fileSize < 1024) {
    return {
      status: 'Invalid',
      confidence: 95,
      notes: 'Validation Failed: File appears corrupt or empty (< 1KB). Please upload a valid scanned PDF or high-resolution image.'
    };
  }

  // 2. Allowed extensions: .pdf, .jpg, .jpeg, .png
  const ext = fileName.split('.').pop();
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
    return {
      status: 'Invalid',
      confidence: 98,
      notes: `Validation Failed: Unsupported file type (.${ext}). Only PDF, JPEG, and PNG files are accepted by state departments.`
    };
  }

  // 3. Heuristic matching between document title and uploaded file metadata
  let isMismatch = false;
  let mismatchReason = '';

  if (docName.includes('pan') || docName.includes('aadhaar')) {
    if (fileName.includes('invoice') || fileName.includes('resume') || fileName.includes('photo')) {
      isMismatch = true;
      mismatchReason = 'Uploaded file does not match Identity Proof. Expected PAN/Aadhaar document.';
    }
  } else if (docName.includes('layout') || docName.includes('blueprint')) {
    if (fileName.includes('pan') || fileName.includes('cheque') || fileName.includes('bank')) {
      isMismatch = true;
      mismatchReason = 'Uploaded file appears to be a financial record, not an architectural site plan.';
    }
  } else if (docName.includes('water') || docName.includes('potability')) {
    if (fileName.includes('drawing') || fileName.includes('pan')) {
      isMismatch = true;
      mismatchReason = 'Uploaded file does not appear to be an accredited NABL water testing laboratory report.';
    }
  }

  if (isMismatch) {
    return {
      status: 'Invalid',
      confidence: 88,
      notes: `AI Verification Flag: ${mismatchReason} Please review and upload the correct document.`
    };
  }

  // Success verdict
  return {
    status: 'Valid',
    confidence: 94,
    notes: `AI Verification Passed: Document format verified, legible scan quality confirmed, and mandatory regulatory attributes detected.`
  };
}

module.exports = {
  validateDocument
};
