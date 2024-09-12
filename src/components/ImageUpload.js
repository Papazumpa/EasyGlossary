import React, { useState } from 'react';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            processImage(file);
        }
    };

    const processImage = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('apikey', 'K84884375988957'); // Replace with your OCR.space API key
        formData.append('file', file);
        formData.append('language', 'eng'); // Specify language (you can modify this)

        try {
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            const detectedText = result.ParsedResults[0].ParsedText || '';
            onTextDetected(detectedText);
        } catch (error) {
            console.error('Error during OCR:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && <img src={image} alt="Uploaded preview" style={{ width: '200px' }} />}
            {loading && <p>Processing...</p>}
        </div>
    );
};

export default ImageUpload;
