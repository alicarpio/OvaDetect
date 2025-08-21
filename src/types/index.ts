export interface ImageFile {
  id: string
  name: string
  size: number
  type: string
  lastModified: number
  url: string
  thumbnail?: string
  width?: number
  height?: number
  uploadedAt: Date
  status: 'uploading' | 'uploaded' | 'error' | 'processing' | string
  error?: string
  tempFile?: File // Para guardar el archivo original antes de subir a API
}

export interface AnalysisResult {
  id: string
  imageId: string
  pcosProbability: number
  confidence: number
  findings: string[]
  recommendations: string[]
  analyzedAt: Date
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
  riskLevel?: 'alto' | 'bajo' | 'medio' // Agregado para el nivel de riesgo
}

export interface User {
  id: string
  name: string
  email: string
  role: 'doctor' | 'technician' | 'admin'
  avatar?: string
}

export interface UploadOptions {
  maxSize: number // 10MB en bytes
  allowedTypes: string[]
  maxFiles: number
}

// Tipos para la respuesta de tu API (actualizada)
export interface ImageFileRecord {
  id: number | string
  name: string
  size: number
  type: string
  url: string
  width?: number
  height?: number
  uploaded_at: string
  status: string
  error?: string | null
  last_modified?: number
  
  // Nueva estructura de análisis médico
  medical_analysis?: {
    id: number | string
    diagnosis: string
    pcos_probability: number
    confidence_score: number
    requires_specialist_review: boolean
    clinical_recommendations: string[]
    
    model_validation: {
      threshold: number
      sensitivity: number
      specificity: number
      auc: number
      model_version: string
    }
    
    clinical_interpretation: {
      confidence_level: string
      clinical_action: string
      reliability: string
    }
  }
  
  // Campos legacy para compatibilidad
  analysis?: {
    id: number | string
    pcos_probability: number
    confidence: number
    findings: any
    recommendations: string[]
    prediction: string
  }
}
