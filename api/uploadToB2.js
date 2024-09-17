import BackblazeB2 from 'backblaze-b2';
import busboy from 'busboy';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

// Initialize Backblaze B2
const b2 = new BackblazeB2({
  accountId: process.env.B2_ACCOUNT_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const handler = async (req, res) => {
  if (req.method === 'POST') {
    // Initialize busboy instance
    const bb = busboy({ headers: req.headers });

    let uploadError = null;

    // Collect file data
    let fileBuffer = Buffer.from([]);
    let fileName = '';
    let mimeType = '';

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
  try {
    console.log('Received file:', filename, 'with MIME type:', mimetype);

    // Convert FileStream to Buffer
    const fileBuffer = await streamToBuffer(file);

    // Authorize with Backblaze B2
    await b2.authorize();

    // Upload the file as a buffer
    const uploadResponse = await b2.uploadFile({
      bucketId: process.env.B2_BUCKET_ID,
      fileName: String(filename), // Ensure filename is a string
      data: fileBuffer, // Pass the buffer instead of stream
      mime: mimetype || 'application/octet-stream', // Use the MIME type or fallback
    });

    // Return the upload response
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: uploadResponse.data,
    });
  } catch (error) {
    console.error('Upload failed: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error,
    });
  }
});



    // If there's an error with parsing
    bb.on('error', (err) => {
      uploadError = err;
      res.status(500).json({
        success: false,
        message: 'File upload parsing error',
        error: err,
      });
    });

    // Pipe the request stream into busboy for processing
    req.pipe(bb);
  } else {
    // Method not allowed
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
