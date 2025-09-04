
export enum CancerStage {
  NORMAL = 'Normal',
  BEGINNING = 'Beginning',
  INTERMEDIATE = 'Intermediate',
  FINAL = 'Final',
  UNKNOWN = 'Unknown'
}

export interface AnalysisResult {
  stage: CancerStage;
  confidence: number;
  explanation: string;
  report: {
    symptoms: string[];
    nextSteps: string[];
  };
}

export interface PatientScan {
  id: string;
  patientId: string;
  scanDate: string;
  image: string; // base64 image data
  result: AnalysisResult;
  feedback?: 'helpful' | 'not_helpful';
}
