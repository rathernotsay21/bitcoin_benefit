'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { createToolError } from '@/types/bitcoin-tools';
import { TimestampService } from '@/lib/services/timestampService';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';
import { ProgressIndicator } from './ToolSkeleton';

type WorkflowStep = 'upload' | 'creating' | 'result' | 'verify';

function DocumentTimestampingTool() {
  const {
    tools: { documentTimestamp },
    setDocumentTimestampLoading,
    setDocumentTimestampData,
    setDocumentTimestampError,
    setDocumentTimestampFile,
    checkRateLimit,
    recordRequest
  } = useBitcoinToolsStore();

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEducation, setShowEducation] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationFiles, setVerificationFiles] = useState<{
    original?: File;
    proof?: File;
  }>({});
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyOriginalRef = useRef<HTMLInputElement>(null);
  const verifyProofRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      TimestampService.validateFile(file);
      setDocumentTimestampFile(file);
      setCurrentStep('upload');
    } catch (error) {
      setDocumentTimestampError(
        error && typeof error === 'object' && 'type' in error
          ? error as any
          : createToolError('validation', 'INVALID_FILE_TYPE')
      );
    }
  };

  const handleCreateTimestamp = async () => {
    if (!documentTimestamp.uploadedFile) return;

    if (!checkRateLimit('document-timestamp')) {
      setDocumentTimestampError(createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED'));
      return;
    }

    setIsCreating(true);
    setCurrentStep('creating');
    
    const steps = [
      'Calculating file hash...',
      'Submitting to OpenTimestamps...',
      'Creating proof file...',
      'Finalizing timestamp...'
    ];

    try {
      recordRequest('document-timestamp');

      // Step 1: Calculate hash
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[0],
        progress: { current: 1, total: 4, description: steps[0] }
      });
      setUploadProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Submit to OpenTimestamps
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[1],
        progress: { current: 2, total: 4, description: steps[1] }
      });
      setUploadProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Create proof
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[2],
        progress: { current: 3, total: 4, description: steps[2] }
      });
      setUploadProgress(75);

      const result = await TimestampService.createTimestamp(documentTimestamp.uploadedFile);

      // Step 4: Finalize
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[3],
        progress: { current: 4, total: 4, description: steps[3] }
      });
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      setDocumentTimestampData(result);
      setCurrentStep('result');

    } catch (error) {
      console.error('Timestamp creation error:', error);
      setDocumentTimestampError(
        error && typeof error === 'object' && 'type' in error
          ? error as any
          : createToolError('unknown', 'UNKNOWN_ERROR', error instanceof Error ? error : undefined)
      );
    } finally {
      setIsCreating(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadProof = () => {
    if (!documentTimestamp.data || !documentTimestamp.uploadedFile) return;

    const proofFilename = TimestampService.generateProofFilename(documentTimestamp.uploadedFile.name);
    TimestampService.downloadBlob(documentTimestamp.data.proofFile, proofFilename);
  };

  const handleVerifyTimestamp = async () => {
    if (!verificationFiles.original || !verificationFiles.proof) {
      setVerificationResult({
        isValid: false,
        error: 'Both original file and proof file are required for verification'
      });
      return;
    }

    setDocumentTimestampLoading({
      isLoading: true,
      loadingMessage: 'Verifying timestamp proof...'
    });

    try {
      const result = await TimestampService.verifyTimestamp(
        verificationFiles.proof,
        verificationFiles.original
      );
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        isValid: false,
        error: 'Verification failed'
      });
    }
  };

  const resetWorkflow = () => {
    setCurrentStep('upload');
    setDocumentTimestampFile(null);
    setDocumentTimestampData(null);
    setDocumentTimestampError(null);
    setVerificationMode(false);
    setVerificationFiles({});
    setVerificationResult(null);
  };

  if (documentTimestamp.loading.isLoading) {
    const progress = documentTimestamp.loading.progress;
    
    return (
      <div className="space-y-4">
        <ToolSkeleton 
          variant="document" 
          showProgress 
          progressMessage={documentTimestamp.loading.loadingMessage}
        />
        {progress && (
          <div className="mt-4">
            <ProgressIndicator 
              steps={['Calculate Hash', 'Submit to OpenTimestamps', 'Create Proof', 'Finalize']}
              currentStep={progress.current - 1}
            />
          </div>
        )}
      </div>
    );
  }

  if (documentTimestamp.error) {
    throw documentTimestamp.error;
  }

  const educationalInfo = TimestampService.getEducationalInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Document Timestamping
          </h3>
          <BitcoinTooltip term="TIMESTAMP">
            <span className="cursor-help text-bitcoin">ⓘ</span>
          </BitcoinTooltip>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEducation(!showEducation)}
            className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            {showEducation ? 'Hide Info' : 'Learn More'}
          </button>
          
          <button
            onClick={() => setVerificationMode(!verificationMode)}
            className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {verificationMode ? 'Create Timestamp' : 'Verify Timestamp'}
          </button>
        </div>
      </div>

      {/* Educational Content */}
      {showEducation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <span className="mr-2">📚</span>
            {educationalInfo.title}
          </h4>
          
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            {educationalInfo.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Benefits:</h5>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                {educationalInfo.benefits.map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Use Cases:</h5>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                {educationalInfo.useCases.map((useCase, index) => (
                  <li key={index}>• {useCase}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Verification Mode */}
      {verificationMode ? (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Verify Existing Timestamp
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Document
                </label>
                <input
                  ref={verifyOriginalRef}
                  type="file"
                  onChange={(e) => e.target.files?.[0] && setVerificationFiles(prev => ({
                    ...prev,
                    original: e.target.files![0]
                  }))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-bitcoin file:text-white hover:file:bg-bitcoin-600"
                />
                {verificationFiles.original && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {verificationFiles.original.name} ({TimestampService.formatFileSize(verificationFiles.original.size)})
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proof File (.ots)
                </label>
                <input
                  ref={verifyProofRef}
                  type="file"
                  accept=".ots"
                  onChange={(e) => e.target.files?.[0] && setVerificationFiles(prev => ({
                    ...prev,
                    proof: e.target.files![0]
                  }))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-bitcoin file:text-white hover:file:bg-bitcoin-600"
                />
                {verificationFiles.proof && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {verificationFiles.proof.name} ({TimestampService.formatFileSize(verificationFiles.proof.size)})
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleVerifyTimestamp}
              disabled={!verificationFiles.original || !verificationFiles.proof}
              className="w-full py-3 bg-bitcoin text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 transition-colors"
            >
              Verify Timestamp
            </button>
          </div>

          {/* Verification Results */}
          {verificationResult && (
            <div className={`border rounded-lg p-6 ${
              verificationResult.isValid 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">
                  {verificationResult.isValid ? '✅' : '❌'}
                </span>
                <h4 className={`text-lg font-semibold ${
                  verificationResult.isValid 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {verificationResult.isValid ? 'Timestamp Verified!' : 'Verification Failed'}
                </h4>
              </div>
              
              {verificationResult.isValid ? (
                <div className="space-y-2 text-sm">
                  {verificationResult.timestamp && (
                    <p className="text-green-700 dark:text-green-300">
                      <strong>Timestamp:</strong> {new Date(verificationResult.timestamp * 1000).toLocaleString()}
                    </p>
                  )}
                  {verificationResult.blockHeight && (
                    <p className="text-green-700 dark:text-green-300">
                      <strong>Block Height:</strong> {verificationResult.blockHeight}
                    </p>
                  )}
                  {verificationResult.details && (
                    <p className="text-green-700 dark:text-green-300">
                      <strong>Proof Type:</strong> {verificationResult.details.proofType}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {verificationResult.error}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Creation Mode */
        <div className="space-y-6">
          {/* File Upload */}
          {currentStep === 'upload' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-bitcoin bg-bitcoin/5'
                  : 'border-gray-300 dark:border-gray-600 hover:border-bitcoin/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!documentTimestamp.uploadedFile ? (
                <div className="space-y-4">
                  <div className="text-6xl">📄</div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Upload Document to Timestamp
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop a file here, or click to select
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-bitcoin text-white rounded-lg font-medium hover:bg-bitcoin-600 transition-colors"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Supported: PDF, Text, Images, Documents • Max size: 10MB
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl">
                    {TimestampService.getFileTypeIcon(documentTimestamp.uploadedFile)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {documentTimestamp.uploadedFile.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {TimestampService.formatFileSize(documentTimestamp.uploadedFile.size)} • {documentTimestamp.uploadedFile.type || 'Unknown type'}
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={handleCreateTimestamp}
                        disabled={isCreating}
                        className="px-6 py-2 bg-bitcoin text-white rounded-lg font-medium disabled:opacity-50 hover:bg-bitcoin-600 transition-colors"
                      >
                        Create Timestamp
                      </button>
                      <button
                        onClick={() => setDocumentTimestampFile(null)}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Change File
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {currentStep === 'result' && documentTimestamp.data && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">✅</span>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Timestamp Created Successfully!
                    </h4>
                    <p className="text-green-700 dark:text-green-300">
                      {documentTimestamp.data.humanReadable.timestampDescription}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Timestamp Details:</h5>
                  <div className="space-y-1 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">File Hash:</span>
                      <span className="break-all">{documentTimestamp.data.hash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <span>{new Date(documentTimestamp.data.timestamp * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadProof}
                    className="flex-1 py-2 bg-bitcoin text-white rounded-lg font-medium hover:bg-bitcoin-600 transition-colors"
                  >
                    Download Proof File
                  </button>
                  <button
                    onClick={() => window.open(documentTimestamp.data!.verificationUrl, '_blank')}
                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Verify Online
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {documentTimestamp.data.humanReadable.instructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>

              {/* Reset */}
              <div className="text-center">
                <button
                  onClick={resetWorkflow}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Timestamp Another Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DocumentTimestampingToolWithErrorBoundary() {
  return (
    <ToolErrorBoundary toolName="Document Timestamping">
      <DocumentTimestampingTool />
    </ToolErrorBoundary>
  );
}