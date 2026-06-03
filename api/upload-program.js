const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');

export const config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  try {
    const form = new IncomingForm();
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    const programFile = files.program;
    const programsDir = path.join('/tmp', 'programs');
    
    if (!fs.existsSync(programsDir)) {
      fs.mkdirSync(programsDir, { recursive: true });
    }
    
    const targetPath = path.join(programsDir, 'worldcup_betting.so');
    fs.copyFileSync(programFile.filepath, targetPath);
    
    console.log('✅ Program saved to /tmp/programs/');
    console.log('📦 Size:', programFile.size, 'bytes');
    
    res.json({
      success: true,
      message: 'Program uploaded successfully',
      size: programFile.size,
      ready: true
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};