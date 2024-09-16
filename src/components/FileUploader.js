// src/components/FileUploader.js
import React, { useState } from 'react';

const FileUploader = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/uploadToB2', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                onUploadSuccess(data);
            } else {
                console.error('Upload failed:', data.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default FileUploader;
