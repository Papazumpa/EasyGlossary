import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const ImageUpload = ({ onTextDetected }) => {
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            processImage(file);
        }
    };

    const processImage = (file) => {
        Tesseract.recognize(
            file,
            'eng',
            {
                logger: (m) => console.log(m),
            }
        ).then(({ data: { text } }) => {
            onTextDetected(text);
        });
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && <img src={image} alt="Uploaded preview" style={{ width: '200px' }} />}
        </div>
    );
};

export default ImageUpload;
