'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { createToolError } from '@/types/bitcoin-tools';
import { TimestampService } from '@/lib/services/timestampService';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';
import { ProgressIndicator } from './ToolSkeleton';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { timestampEducation } from './educational/educationalContent';

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
  const [, setUploadProgress] = useState(0);
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

  const handleFileSelect = useCallback(async (file: File) => {
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
  }, [setDocumentTimestampFile, setCurrentStep, setDocumentTimestampError]);

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
  }, [handleFileSelect]);

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
        loadingMessage: steps[0]!,
        progress: { current: 1, total: 4, description: steps[0]! }
      });
      setUploadProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Submit to OpenTimestamps
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[1]!,
        progress: { current: 2, total: 4, description: steps[1]! }
      });
      setUploadProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Create proof
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[2]!,
        progress: { current: 3, total: 4, description: steps[2]! }
      });
      setUploadProgress(75);

      const result = await TimestampService.createTimestamp(documentTimestamp.uploadedFile);

      // Step 4: Finalize
      setDocumentTimestampLoading({
        isLoading: true,
        loadingMessage: steps[3]!,
        progress: { current: 4, total: 4, description: steps[3]! }
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
      {/* Main Tool Content - 60% width */}
      <div className="lg:flex-[1.5] w-full min-w-0 space-y-6">
        {/* Explanatory Text for New Users */}
        {!documentTimestamp.data && !verificationMode && (
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What is Document Timestamping?
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Document timestamping creates proof that a file existed at a specific time. It's like getting a 
            document notarized, but using the Bitcoin network instead of a notary. This creates permanent, 
            tamper-proof evidence that can't be faked or changed.
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Common uses:</strong> Proving when a contract was signed, protecting intellectual property, 
            establishing when research was conducted, or creating evidence for legal purposes.
          </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {verificationMode ? 'Verify Timestamp' : 'Create Timestamp'}
          </h3>
          <BitcoinTooltip term="TIMESTAMP">
            <span className="cursor-help text-bitcoin">ⓘ</span>
          </BitcoinTooltip>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEducation(!showEducation)}
            className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            {showEducation ? 'Hide Info' : 'Learn More'}
          </button>
          
          <button
            onClick={() => setVerificationMode(!verificationMode)}
            className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {verificationMode ? 'Create Timestamp' : 'Verify Timestamp'}
          </button>
        </div>
        </div>

        {/* Educational Content */}
        {showEducation && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-6 mb-6">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <span className="mr-2">📚</span>
            How It Works
          </h4>
          
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            When you timestamp a document, we create a unique "fingerprint" (hash) of your file and record it 
            on the Bitcoin blockchain. This proves the document existed at that exact moment. The document itself 
            never leaves your computer - only the fingerprint is recorded.
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-sm p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Verify Existing Timestamp
            </h4>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Document (the file you timestamped)
                </label>
                <input
                  ref={verifyOriginalRef}
                  type="file"
                  onChange={(e) => e.target.files?.[0] && setVerificationFiles(prev => ({
                    ...prev,
                    original: e.target.files![0]
                  }))}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-bitcoin file:text-white hover:file:bg-bitcoin-600"
                />
                {verificationFiles.original && (
                  <p className="text-xs text-gray-600 dark:text-gray-600 mt-1">
                    {verificationFiles.original.name} ({TimestampService.formatFileSize(verificationFiles.original.size)})
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proof File (the .ots file you downloaded)
                </label>
                <input
                  ref={verifyProofRef}
                  type="file"
                  accept=".ots"
                  onChange={(e) => e.target.files?.[0] && setVerificationFiles(prev => ({
                    ...prev,
                    proof: e.target.files![0]
                  }))}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-bitcoin file:text-white hover:file:bg-bitcoin-600"
                />
                {verificationFiles.proof && (
                  <p className="text-xs text-gray-600 dark:text-gray-600 mt-1">
                    {verificationFiles.proof.name} ({TimestampService.formatFileSize(verificationFiles.proof.size)})
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleVerifyTimestamp}
              disabled={!verificationFiles.original || !verificationFiles.proof}
              className="w-full py-3 bg-bitcoin text-white rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 transition-colors"
            >
              Verify Timestamp
            </button>
          </div>

          {/* Verification Results */}
          {verificationResult && (
            <div className={`border rounded-sm p-6 mb-6 ${
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
                <div className="space-y-3 text-sm">
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
              className={`border-2 border-dashed rounded-sm p-6 text-center transition-colors ${
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
                <div className="space-y-3">
                  <div className="text-6xl">📄</div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Select Your Document
                    </h4>
                    <p className="text-gray-600 dark:text-gray-600 mb-4">
                    Drag and drop any file here, or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-bitcoin text-white rounded-sm font-medium hover:bg-bitcoin-600 transition-colors"
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
                  <div className="text-xs text-gray-500 dark:text-gray-600">
                    Any file type • Maximum 10MB • Your file stays on your computer
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl">
                    {TimestampService.getFileTypeIcon(documentTimestamp.uploadedFile)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Ready: {documentTimestamp.uploadedFile.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-600 mb-4">
                      Size: {TimestampService.formatFileSize(documentTimestamp.uploadedFile.size)}
                    </p>
                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={handleCreateTimestamp}
                        disabled={isCreating}
                        className="px-6 py-2 bg-bitcoin text-white rounded-sm font-medium disabled:opacity-50 hover:bg-bitcoin-600 transition-colors"
                      >
                        Create Timestamp
                      </button>
                      <button
                        onClick={() => setDocumentTimestampFile(null)}
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-sm p-6 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl">✅</span>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Success! Your Document is Timestamped
                    </h4>
                    <p className="text-green-700 dark:text-green-300">
                      Your document now has permanent proof it existed at this exact moment. 
                      This proof is stored forever on the Bitcoin blockchain.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-sm p-4 mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Your Proof Details:</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-600">Timestamped at:</span>
                      <div className="font-medium">{new Date(documentTimestamp.data.timestamp * 1000).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-600">Document fingerprint (hash):</span>
                      <div className="font-mono text-xs break-all mt-1">{documentTimestamp.data.hash}</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadProof}
                    className="flex-1 py-2 bg-bitcoin text-white rounded-sm font-medium hover:bg-bitcoin-600 transition-colors"
                  >
                    Download Proof File
                  </button>
                  <button
                    onClick={() => window.open(documentTimestamp.data!.verificationUrl, '_blank')}
                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Verify Online
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-6 mb-6">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Important - Save Your Proof:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Download the proof file (.ots) and keep it with your original document</li>
                  <li>• You'll need both files to prove when the document was created</li>
                  <li>• The proof file is small and can be emailed or stored anywhere</li>
                  <li>• Anyone can verify your timestamp using the proof file and original document</li>
                </ul>
              </div>

              {/* Reset */}
              <div className="text-center">
                <button
                  onClick={resetWorkflow}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Timestamp Another Document
                </button>
              </div>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Educational Sidebar - 40% width */}
      <div className="lg:flex-[1] lg:max-w-md">
        <div className="lg:sticky lg:top-6">
          <EducationalSidebar sections={timestampEducation} />
        </div>
      </div>
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