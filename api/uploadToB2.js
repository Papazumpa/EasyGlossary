import BackblazeB2 from 'backblaze-b2';
import busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

// Initialize Backblaze B2 with the new environment variable names
const b2 = new BackblazeB2({
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID, // Update to new variable
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY,     // Update to new variable
});

const handler = async (req, res) => {
  if (req.method === 'POST') {
    // Initialize busboy instance
    const bb = busboy({ headers: req.headers });

    let uploadError = null;

    // When a file is received
    bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      try {
        // Authorize with Backblaze B2
        await b2.authorize();

        // Upload the file directly from the stream
        const uploadResponse = await b2.uploadFile({
          bucketId: process.env.BACKBLAZE_BUCKET_ID, // Update to new variable
          fileName: filename, // Use the original file name
          data: file, // Directly stream the file to Backblaze
          mime: mimetype, // Pass the MIME type
        });

        // Return the upload response after successful upload
        res.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          data: uploadResponse.data,
        });
      } catch (error) {
        uploadError = error;
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
