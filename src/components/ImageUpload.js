import React, { useState } from 'react';

// Cloudinary and OCR API URLs
const CLOUDINARY_UPLOAD_URL = '/api/uploadImage'; // URL of your Vercel serverless function
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image'; // OCR.Space API URL

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jsonContent, setJsonContent] = useState(null);

    const processImage = async (file) => {
        setLoading(true);

        try {
            // Step 1: Resize and convert image to grayscale with dynamic compression
            const processedFile = await resizeAndGrayscaleImage(file, 1024); // 1024 KB limit

            // Step 2: Convert processed image to base64
            const base64Image = await convertToBase64(processedFile);

            // Step 3: Upload image to Cloudinary via your Vercel serverless API
            const uploadResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            const uploadResult = await uploadResponse.json();
            console.log('Cloudinary upload result:', uploadResult);

            if (uploadResult.secure_url) {
                // Step 4: Send Cloudinary URL to OCR.Space
                const ocrFormData = new FormData();
                ocrFormData.append('apikey', 'K84884375988957'); // Replace with your actual API key
                ocrFormData.append('url', uploadResult.secure_url); // Use image URL instead of file

                const ocrResponse = await fetch(OCR_SPACE_API_URL, {
                    method: 'POST',
                    body: ocrFormData,
                });

                const ocrResult = await ocrResponse.json();
                console.log('OCR result:', ocrResult);

                if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
                    const detectedText = ocrResult.ParsedResults[0].ParsedText || '';
                    onTextDetected(detectedText);
                } else {
                    console.error('No text detected');
                }
            } else {
                console.error('Image upload failed');
            }
        } catch (error) {
            console.error('Error during image processing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJsonUpload = async (file) => {
        try {
            const text = await file.text(); // Read file content as text
            const json = JSON.parse(text); // Parse JSON

            // Handle JSON content
            setJsonContent(json);
            console.log('JSON file content:', json);
        } catch (error) {
            console.error('Error processing JSON file:', error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type;

            if (fileType === 'application/json') {
                // Handle JSON file
                await handleJsonUpload(file);
            } else if (fileType.startsWith('image/')) {
                // Handle image file
                setImage(URL.createObjectURL(file));
                await processImage(file);
            } else {
                console.error('Unsupported file type');
            }
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept="image/*,application/json" />
            {image && <img src={image} alt="Selected" />}
            {loading && <p>Processing...</p>}
            {jsonContent && (
                <pre>{JSON.stringify(jsonContent, null, 2)}</pre> // Display JSON content for verification
            )}
        </div>
    );
};

export default ImageUpload;
