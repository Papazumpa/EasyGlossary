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
    const authResponse = await b2.authorize();

    // Get the upload URL for your bucket
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });

    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

    if (!uploadUrl) {
      throw new Error("Upload URL not retrieved");
    }

    // Upload the file as a buffer
    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrl,  // Make sure the URL is passed correctly
      uploadAuthToken: uploadAuthToken,
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
