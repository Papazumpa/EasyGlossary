import React, { useState } from 'react';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const processImage = async (file) => {
        setLoading(true);

        // Resize image if it's larger than 1024 KB
        const resizedFile = await resizeImage(file, 1024);

        const formData = new FormData();
        formData.append('apikey', 'K84884375988957'); // Replace with your actual API key
        formData.append('file', resizedFile);
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

    const resizeImage = (file, maxSizeKB) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set the canvas dimensions to the image dimensions
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Resize if image is larger than maxSizeKB
                    let quality = 1;
                    if (file.size / 1024 > maxSizeKB) {
                        const scaleFactor = Math.sqrt(maxSizeKB * 1024 / file.size);
                        canvas.width = img.width * scaleFactor;
                        canvas.height = img.height * scaleFactor;
                        quality = 0.7;  // Adjust quality for compression
                    }

                    // Draw the image to the canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, { type: file.type }));
                        },
                        file.type,
                        quality // Adjust the quality (optional)
                    );
                };
            };
            reader.readAsDataURL(file);
        });
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
