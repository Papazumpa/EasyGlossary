import multer from 'multer';
import BackblazeB2 from 'backblaze-b2';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: '/temp/' }); // Temporary directory

const b2 = new BackblazeB2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await b2.authorize();

      const file = req.file; // Access the file from multer

      const uploadResponse = await b2.uploadFile({
        bucketId: process.env.B2_BUCKET_ID,
        fileName: path.basename(file.path),
        data: fs.createReadStream(file.path),
        mime: file.mimetype,
      });

      fs.unlinkSync(file.path); // Clean up temp file

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: uploadResponse.data,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to upload file', error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default upload.single('file')(handler); // Specify 'file' as the key for file upload
