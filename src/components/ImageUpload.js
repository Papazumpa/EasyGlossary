import React, { useState } from 'react';

// Cloudinary and OCR API URLs
const CLOUDINARY_UPLOAD_URL = '/api/uploadImage'; // URL of your Vercel serverless function
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image'; // OCR.Space API URL

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const resizeAndGrayscaleImage = (file, maxSizeKB) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

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

                    // Start compression loop to ensure file size is under maxSizeKB
                    let quality = 1.0;
                    const compressImage = () => {
                        return new Promise((resolveCompress) => {
                            canvas.toBlob((blob) => {
                                if (blob.size / 1024 > maxSizeKB && quality > 0.1) {
                                    // If file is too large, reduce quality and try again
                                    quality -= 0.1;
                                    compressImage().then(resolveCompress);
                                } else {
                                    resolveCompress(blob); // Return compressed blob
                                }
                            }, file.type, quality); // Compress with current quality
                        });
                    };

                    compressImage().then((blob) => {
                        resolve(new File([blob], file.name, { type: file.type }));
                    });
                };
            };
            reader.readAsDataURL(file);
        });
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
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
