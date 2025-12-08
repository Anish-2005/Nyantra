import type { NextApiRequest, NextApiResponse } from 'next';
import * as formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import crypto from 'crypto';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/divkhffav/image/upload';
const CLOUDINARY_API_KEY = '344177124323371';
const CLOUDINARY_API_SECRET = 'xNYuEetboQKiRyfp5AsVhY-qTNg';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable.default({ multiples: false });
  form.parse(req, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
    if (err) {
      return res.status(500).json({ error: 'Form parse error' });
    }

    const beneficiaryId = Array.isArray(fields.beneficiaryId) ? fields.beneficiaryId[0] : fields.beneficiaryId;
    if (!beneficiaryId) {
      return res.status(400).json({ error: 'Beneficiary ID is required' });
    }

    const fileField = files.file;
    const fileObj = Array.isArray(fileField) ? fileField[0] : fileField;
    if (!fileObj || typeof fileObj !== 'object' || !('filepath' in fileObj) || !('mimetype' in fileObj)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileData = fs.readFileSync(fileObj.filepath);
      const base64File = fileData.toString('base64');

      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `sc_st_certificates/${beneficiaryId}_${timestamp}`;

      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
      const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', `data:${fileObj.mimetype};base64,${base64File}`);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('public_id', publicId);
      formData.append('folder', 'sc_st_certificates');

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };

      if (!response.ok) {
        return res.status(500).json({ error: data.error?.message || 'Cloudinary upload failed' });
      }

      return res.status(200).json({
        url: data.secure_url,
        publicId: data.public_id,
        beneficiaryId: beneficiaryId
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'File upload failed' });
    }
  });
}