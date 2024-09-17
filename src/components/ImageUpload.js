import React, { useState } from 'react';

// Cloudinary and OCR API URLs
const CLOUDINARY_UPLOAD_URL = '/api/uploadImage'; // URL of your Vercel serverless function
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image'; // OCR.Space API URL

const ImageUpload = ({ onTextDetected, onJsonData }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null); // State for error message

    const uploadToCloudinaryWithSizeCheck = async (base64Image) => {
        const maxFileSizeInBytes = 1048576; // 1MB in bytes (1,048,576 bytes)

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const uploadResult = await response.json();
        console.log('Cloudinary upload result:', uploadResult);

        // Check the `bytes` field for the file size (1MB = 1,048,576 bytes)
        if (uploadResult.secure_url && uploadResult.bytes <= maxFileSizeInBytes) {
            console.log(`Image size is within limit: ${uploadResult.bytes} bytes.`);
            return uploadResult.secure_url; // Image size is within the limit
        } else {
            throw new Error(`Image size exceeds limit: ${uploadResult.bytes} bytes.`);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const processImage = async (file) => {
        setLoading(true);
        setErrorMessage(null); // Clear any previous errors

        try {
            // Convert image to base64
            const base64Image = await convertToBase64(file);

            // Upload to Cloudinary with size check
            const cloudinaryUrl = await uploadToCloudinaryWithSizeCheck(base64Image);

            // Send Cloudinary URL to OCR.Space
            const ocrFormData = new FormData();
            ocrFormData.append('apikey', 'K84884375988957'); // Replace with your actual API key
            ocrFormData.append('url', cloudinaryUrl); // Use image URL instead of file

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
        } catch (error) {
            console.error('Error during image processing:', error);
            setErrorMessage(error.message); // Set the error message for display
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setImage(URL.createObjectURL(file)); // Update image preview
                await processImage(file); // Process the selected image
            } else if (file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        onJsonData(jsonData); // Pass the JSON data to the parent component
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                };
                reader.readAsText(file);
            } else {
                console.error('Please upload a valid image or JSON file.');
            }
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept="image/*,application/json" />
            {image && <img src={image} alt="Selected" />}
            {loading && <p>Processing...</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default ImageUpload;
