// /api/uploadToB2.js
import { json } from 'body-parser';
import BackblazeB2 from 'backblaze-b2';
import fs from 'fs';
import path from 'path';

const b2 = new BackblazeB2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Extract file data from request
      const { file } = req.body;

      // Authenticate with Backblaze B2
      await b2.authorize();

      // Upload the file to Backblaze B2
      const uploadResponse = await b2.uploadFile({
        bucketId: process.env.B2_BUCKET_ID,
        fileName: path.basename(file.name),
        data: fs.createReadStream(file.path),
        mime: file.type,
      });

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
}

export default handler;
