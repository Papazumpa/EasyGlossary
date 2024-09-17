import BackblazeB2 from 'backblaze-b2';
import busboy from 'busboy';

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

    // Store the file buffer
    let fileBuffer = [];
    let fileName = '';
    let mimeType = '';

    // When a file is received
    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      fileName = filename;
      mimeType = mimetype;

      console.log(`Received file: ${fileName} with MIME type: ${mimeType}`);

      // Collect the file stream chunks
      file.on('data', (data) => {
        fileBuffer.push(data);
      });

      // When the file stream ends
      file.on('end', () => {
        fileBuffer = Buffer.concat(fileBuffer); // Combine the chunks into a single buffer
      });
    });

    // When busboy finishes processing
    bb.on('finish', async () => {
      try {
        // Check if fileName is a valid string
        if (typeof fileName !== 'string' || fileName.trim() === '') {
          throw new Error('Invalid file name');
        }

        // Authorize with Backblaze B2
        await b2.authorize();

        // Upload the file using the buffer
        const uploadResponse = await b2.uploadFile({
          bucketId: process.env.B2_BUCKET_ID,
          fileName: fileName, // Use the original file name
          data: fileBuffer, // Use the file buffer
          mime: mimeType, // Pass the MIME type
        });

        // Return the upload response after successful upload
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
          error: error.message, // Provide a detailed error message
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
