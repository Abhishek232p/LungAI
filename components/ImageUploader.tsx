
import React, { useState, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { analyzeXRayImage } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onAnalysisComplete: (result: AnalysisResult, image: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalysisComplete, setIsLoading, setError }) => {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleAnalyzeClick = useCallback(async () => {
    if (!file || !image) {
      setError('Please select an image file first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const base64Image = image.split(',')[1];
      const result = await analyzeXRayImage(base64Image, file.type);
      onAnalysisComplete(result, image);
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(`Analysis failed. ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, image, onAnalysisComplete, setIsLoading, setError]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">1. Upload Chest X-Ray</h2>
      <div className="w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 mb-4 overflow-hidden">
        {image ? (
          <img src={image} alt="X-Ray Preview" className="h-full w-full object-contain" />
        ) : (
          <div className="text-center text-slate-500">
            <UploadIcon className="mx-auto h-12 w-12" />
            <p>Image preview will appear here</p>
          </div>
        )}
      </div>
      <input 
        type="file" 
        id="file-upload"
        className="hidden"
        accept="image/png, image/jpeg" 
        onChange={handleFileChange} 
      />
      <label htmlFor="file-upload" className="cursor-pointer bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors w-full text-center mb-4">
        {file ? file.name : 'Choose Image'}
      </label>
      <button 
        onClick={handleAnalyzeClick} 
        disabled={!image}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
      >
        Analyze Image
      </button>
    </div>
  );
};

export default ImageUploader;
