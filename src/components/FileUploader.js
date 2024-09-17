import React, { useState } from 'react';

// Cloudinary and OCR API URLs
const CLOUDINARY_UPLOAD_URL = '/api/uploadImage'; // URL of your Vercel serverless function
const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image'; // OCR.Space API URL

const ImageUpload = ({ onTextDetected, onJsonData }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);


    const uploadToCloudinaryWithSizeCheck = async (base64Image, retries = 5) => {
        let uploadResult;
        for (let attempt = 0; attempt < retries; attempt++) {
            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            uploadResult = await response.json();
            console.log('Cloudinary upload result:', uploadResult);

            // Check the `bytes` field for the file size (1MB = 1.024e+6 bytes)
            if (uploadResult.secure_url && uploadResult.bytes <= 1.024e+6) {
                console.log(`Image size is within limit: ${uploadResult.bytes} bytes.`);
                return uploadResult.secure_url; // Image size is within the limit
            }

            if (attempt === retries - 1) {
                throw new Error('Image size exceeded limit after multiple attempts.');
            }

            // Resize and compress the image for the next attempt
            console.log('Resizing image and retrying...');
            base64Image = await resizeAndGrayscaleImage(base64Image, 1024); // Update the base64 image with resized one
        }
    };


    // Function to resize and grayscale image
    const resizeAndGrayscaleImage = (base64Image, maxSizeKB) => {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
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

                // Compress image to ensure file size is under maxSizeKB
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
                        }, 'image/jpeg', quality); // Compress with current quality
                    });
                };

                compressImage().then((blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            };

            img.src = base64Image;
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

    const processImage = async (file) => {
        setLoading(true);

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
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setImage(URL.createObjectURL(file));
                await processImage(file);
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
        </div>
    );
};

export default ImageUpload;
