const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL // Automatically picks up from env variable
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { image } = req.body;

        try {
            const result = await cloudinary.uploader.upload(image, {
                upload_preset: 'ml_default', // Use your upload preset
            });

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error during Cloudinary upload:', error);
            return res.status(500).json({ message: 'Image upload failed', error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
