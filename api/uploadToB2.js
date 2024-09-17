const Busboy = require('busboy');  // Ensure busboy is imported
const b2 = require('backblaze-b2');  // Ensure Backblaze B2 is also imported

exports.handler = async (req, res) => {
  // Check that it's a POST request and has a multipart form-data content-type
  if (req.method === 'POST') {
    const bb = new Busboy({ headers: req.headers });

    bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      try {
        console.log('Received file:', filename, 'with MIME type:', mimetype);

        // Your file upload logic using Backblaze B2 here
        // (like the one I previously shared)
        // Convert file to buffer and proceed with B2 upload

      } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({
          success: false,
          message: 'File upload failed',
          error,
        });
      }
    });

    bb.on('finish', () => {
      res.status(200).json({
        success: true,
        message: 'Upload complete',
      });
    });

    req.pipe(bb);  // Pipe the request to busboy

  } else {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }
};
