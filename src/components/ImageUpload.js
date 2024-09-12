import React, { useState } from 'react';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const processImage = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('apikey', 'YOUR_OCR_SPACE_API_KEY');
        formData.append('file', file);
        formData.append('language', 'eng');

        try {
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log('OCR result:', result);

            if (result.ParsedResults && result.ParsedResults.length > 0) {
                const detectedText = result.ParsedResults[0].ParsedText || '';
                onTextDetected(detectedText);
            } else {
                console.error('No text detected');
            }
        } catch (error) {
            console.error('Error during OCR:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            processImage(file);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {image && <img src={image} alt="Selected" />}
            {loading && <p>Processing...</p>}
        </div>
    );
};

export default ImageUpload;
