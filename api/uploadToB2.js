const Busboy = require('busboy');  // Import Busboy
const B2 = require('backblaze-b2');  // Import Backblaze B2 library

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,  // Replace with your env variable
  applicationKey: process.env.B2_APPLICATION_KEY,  // Replace with your env variable
});

// Function to list files in the bucket
async function listFiles(bucketId, fileName) {
  try {
    const response = await b2.listFileNames({
      bucketId,
      maxFileCount: 1000,  // Adjust as needed
    });

    const files = response.data.files || [];
    return files.some(file => file.fileName === fileName);
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const bb = Busboy({ headers: req.headers });  // Correct way to initialize Busboy

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
            mimeType: mimetype || 'application/json',  // Default to JSON MIME type
            data: fileBuffer,
          });

          console.log('File uploaded successfully:', uploadResponse);

          // Verify file existence
          const fileExists = await listFiles(process.env.B2_BUCKET_ID, filename);

          if (fileExists) {
            console.log('File is present in the bucket.');
            res.status(200).json({
              success: true,
              message: 'Upload complete',
            });
          } else {
            console.error('File is not present in the bucket.');
            res.status(500).json({
              success: false,
              message: 'File upload failed',
            });
          }
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
      // End the response if file stream finishes
    });

    req.pipe(bb);  // Pipe the request to Busboy
  } else {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }
};
