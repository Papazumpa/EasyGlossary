const Busboy = require('busboy');  // Import Busboy
const B2 = require('backblaze-b2');  // Import Backblaze B2 library

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,  // Replace with your env variable
  applicationKey: process.env.B2_APPLICATION_KEY,  // Replace with your env variable
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const bb = new Busboy({ headers: req.headers });  // Correct way to initialize Busboy

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

          try {
            // Upload file to B2
            const uploadResponse = await b2.uploadFile({
              bucketId: process.env.B2_BUCKET_ID,  // Ensure this is set
              fileName: filename,
              mimeType: 'application/json',  // Set MIME type directly to 'application/json'
              data: fileBuffer,
            });

            console.log('File uploaded successfully:', uploadResponse);

            // List files in the bucket to verify upload
            const listFilesResponse = await b2.listFileNames({
              bucketId: process.env.B2_BUCKET_ID,  // Ensure this is set
              maxFileCount: 100,  // Adjust based on your needs
            });

            const fileNames = listFilesResponse.data.files.map(file => file.fileName);
            console.log('Files in bucket:', fileNames);

            if (fileNames.includes(filename)) {
              res.status(200).json({
                success: true,
                message: 'Upload complete',
                uploadedFile: filename,
                filesInBucket: fileNames,
              });
            } else {
              res.status(500).json({
                success: false,
                message: 'File not found in bucket after upload',
                uploadedFile: filename,
                filesInBucket: fileNames,
              });
            }
          } catch (uploadError) {
            console.error('Upload failed:', uploadError);
            res.status(500).json({
              success: false,
              message: 'File upload failed',
              error: uploadError,
            });
          }
        });
      } catch (error) {
        console.error('File processing failed:', error);
        res.status(500).json({
          success: false,
          message: 'File processing failed',
          error,
        });
      }
    });

    bb.on('finish', () => {
      // Response handling is already done in 'end' event handler of file stream
    });

    req.pipe(bb);  // Pipe the request to Busboy
  } else {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }
};
