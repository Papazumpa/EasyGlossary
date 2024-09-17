import BackblazeB2 from 'backblaze-b2';
import busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

// Initialize Backblaze B2
const b2 = new BackblazeB2({
  accountId: process.env.B2_ACCOUNT_ID, // Ensure these env variables are correct
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const bb = busboy({ headers: req.headers });

    // Variables to hold the file info
    let uploadError = null;
    let fileMimeType = null;
    let fileName = null;

    // When a file is received
    bb.on('file', async (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;

      // Store the MIME type and filename
      fileMimeType = mimeType; // Ensure this captures the mimetype
      fileName = filename;

      console.log(`Received file: ${filename} with MIME type: ${mimeType}`);

      try {
        // Authorize with Backblaze B2
        await b2.authorize();

        // Upload the file directly from the stream
        const uploadResponse = await b2.uploadFile({
          bucketId: process.env.B2_BUCKET_ID,
          fileName: filename, // Use the original file name
          data: file, // Directly stream the file to Backblaze
          mime: fileMimeType, // Pass the MIME type
        });

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

    bb.on('error', (err) => {
      uploadError = err;
      res.status(500).json({
        success: false,
        message: 'File upload parsing error',
        error: err,
      });
    });

    req.pipe(bb);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
