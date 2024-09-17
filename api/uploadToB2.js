const Busboy = require('busboy');  // Import Busboy for file uploads
const B2 = require('backblaze-b2');  // Import Backblaze B2 library

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,  // Replace with your env variable
  applicationKey: process.env.B2_APPLICATION_KEY,  // Replace with your env variable
});

module.exports = async (req, res) => {  // Changed to module.exports
  if (req.method === 'POST') {
    const bb = new Busboy({ headers: req.headers });

    bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      try {
        console.log('Received file:', filename, 'with MIME type:', mimetype);

        await b2.authorize();  // Authorize B2 client
        const buffer = [];

        // Collect file stream
        file.on('data', (data) => {
          buffer.push(data);
        });

        file.on('end', async () => {
          const fileBuffer = Buffer.concat(buffer);

          // Upload file to B2
          const uploadResponse = await b2.uploadFile({
            bucketId: process.env.B2_BUCKET_ID,  // Ensure this is set
            fileName: filename,
            mimeType: mimetype,
            data: fileBuffer,
          });

          console.log('File uploaded successfully:', uploadResponse);
        });
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
