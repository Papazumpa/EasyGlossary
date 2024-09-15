import React, { useState } from 'react';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const processImage = async (file) => {
        setLoading(true);

        try {
            // Convert image to base64
            const base64Image = await convertToBase64(file);

            // Upload image to Cloudinary via your Vercel serverless API
            const uploadResponse = await fetch('/api/uploadImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            const uploadResult = await uploadResponse.json();
            console.log('Cloudinary upload result:', uploadResult);

            if (uploadResult.secure_url) {
                // Use the uploaded image URL for OCR or display to the user
                onTextDetected(uploadResult.secure_url);
            } else {
                console.error('Image upload failed');
            }
        } catch (error) {
            console.error('Error during image upload:', error);
        } finally {
            setLoading(false);
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
