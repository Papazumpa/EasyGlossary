// /api/uploadToB2.js
import BackblazeB2 from 'backblaze-b2';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const b2 = new BackblazeB2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'temp'); // Temporary directory for uploaded files
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to process form', error: err.message });
      }

      try {
        const file = files.file; // Single file upload

        if (!file) {
          return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        await b2.authorize();

        const filePath = file.filepath;
        const fileName = path.basename(filePath);

        // Upload file to Backblaze B2
        const uploadResponse = await b2.uploadFile({
          bucketId: process.env.B2_BUCKET_ID,
          fileName: fileName,
          data: fs.createReadStream(filePath),
          mime: file.mimetype,
        });

        fs.unlinkSync(filePath); // Clean up temporary file

        res.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          data: uploadResponse.data,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to upload file', error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
