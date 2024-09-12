// src/components/TextProcessor.js
import React, { useState } from 'react';

const TextProcessor = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/huggingface', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter OCR text here"
            />
            <button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
            </button>

            {result && (
                <div>
                    <h3>Hugging Face API Output:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TextProcessor;
