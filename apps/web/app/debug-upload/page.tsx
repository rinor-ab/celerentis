'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function DebugUploadPage() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    console.log('Raw files from dropzone:', acceptedFiles);
    acceptedFiles.forEach(file => {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isPPTX: file.name.endsWith('.pptx')
      });
    });
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    }
  });

  const hasPPTX = files.some(file => file.name.endsWith('.pptx'));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug File Upload</h1>
      
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop PPTX files here, or click to select files</p>
        )}
      </div>

      <div className="mt-4">
        <p>Files uploaded: {files.length}</p>
        <p>Has PPTX: {hasPPTX ? 'YES' : 'NO'}</p>
        <p>Button should be enabled: {hasPPTX ? 'YES' : 'NO'}</p>
        
        <button 
          disabled={!hasPPTX}
          className={`mt-4 px-4 py-2 rounded ${
            hasPPTX 
              ? 'bg-blue-500 text-white cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Generate IM {hasPPTX ? '(Enabled)' : '(Disabled)'}
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-bold">File List:</h3>
        {files.map((file, index) => (
          <div key={index} className="p-2 border rounded mt-2">
            <p>Name: {file.name}</p>
            <p>Size: {file.size} bytes</p>
            <p>Type: {file.type}</p>
            <p>Is PPTX: {file.name.endsWith('.pptx') ? 'YES' : 'NO'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
