import React, { useState } from 'react';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const processImage = async (file) => {
        setLoading(true);

        // Resize and convert image to grayscale
        const processedFile = await resizeAndGrayscaleImage(file, 1024);

        const formData = new FormData();
        formData.append('apikey', 'K84884375988957'); // Replace with your actual API key
        formData.append('file', processedFile);
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

    const resizeAndGrayscaleImage = (file, maxSizeKB) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set canvas dimensions to the image dimensions
                    canvas.width = img.width;
                    canvas.height = img.height;

                    let quality = 1;

                    // Resize if the image is larger than maxSizeKB
                    if (file.size / 1024 > maxSizeKB) {
                        const scaleFactor = Math.sqrt(maxSizeKB * 1024 / file.size);
                        canvas.width = img.width * scaleFactor;
                        canvas.height = img.height * scaleFactor;
                        quality = 0.7; // Adjust quality for compression
                    }

                    // Draw image to the canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convert to grayscale
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const red = data[i];
                        const green = data[i + 1];
                        const blue = data[i + 2];
                        const grayscale = 0.299 * red + 0.587 * green + 0.114 * blue;

                        data[i] = data[i + 1] = data[i + 2] = grayscale; // Set the RGB to grayscale value
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // Convert canvas to blob and resolve the file
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
            await processImage(file);
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
