const cloudinary = require('cloudinary').v2;

const config = {
  cloud_name: 'dbp4wh3ww',
  api_key: '393214379245822',
  api_secret: 'YPDmFdAma5TozgC3oEx5Pya6JBg'
};

cloudinary.config(config);

async function testConnection() {
  try {
    console.log('[TEST] Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('[OK] Connection successful!', result);
    
    // Test upload
    console.log('[TEST] Testing upload...');
    const uploadResult = await cloudinary.uploader.upload('https://cloudinary-res.cloudinary.com/image/upload/cloudinary_logo.png', {
      public_id: 'test_connection_logo',
      tags: ['test']
    });
    console.log('[OK] Upload successful!', uploadResult.secure_url);
    
    // Cleanup
    await cloudinary.uploader.destroy('test_connection_logo');
    console.log('[OK] Cleanup successful!');
    
  } catch (error) {
    console.error('[ERROR] Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
