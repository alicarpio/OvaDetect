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

// Tipos para la respuesta de tu API
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
  // Campos adicionales que tu API puede devolver
  original_filename?: string
  file_size?: number
  mime_type?: string
  file_path?: string
  created_at?: string
  analysis?: {
    id: number | string
    pcos_probability: number
    confidence: number
    findings: any
    recommendations: string[]
    prediction: string
  }
}
