import type { NextRequest } from 'next/server';
import * as formidable from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/divkhffav/image/upload';
const CLOUDINARY_API_KEY = '344177124323371';
const CLOUDINARY_API_SECRET = 'xNYuEetboQKiRyfp5AsVhY-qTNg';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<Response> {
  console.log('Upload API called');
  try {
    const form = formidable.default({
      multiples: false,
      keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
      form.parse(request as any, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        if (err) {
          resolve(new Response(JSON.stringify({ error: 'Form parse error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        const beneficiaryId = Array.isArray(fields.beneficiaryId) ? fields.beneficiaryId[0] : fields.beneficiaryId;
        if (!beneficiaryId) {
          resolve(new Response(JSON.stringify({ error: 'Beneficiary ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        // For new beneficiaries, use a temporary ID
        const finalBeneficiaryId = beneficiaryId === 'temp' ? `temp_${Date.now()}` : beneficiaryId;

        const fileField = files.file;
        const fileObj = Array.isArray(fileField) ? fileField[0] : fileField;

        if (!fileObj || typeof fileObj !== 'object' || !('filepath' in fileObj) || !('mimetype' in fileObj)) {
          resolve(new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(fileObj.mimetype || '')) {
          resolve(new Response(JSON.stringify({ error: 'Invalid file type. Only PDF and images are allowed.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        // Validate file size (10MB max)
        if (fileObj.size && fileObj.size > 10000000) {
          resolve(new Response(JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        try {
          const fileData = fs.readFileSync(fileObj.filepath);
          const base64File = fileData.toString('base64');

          const timestamp = Math.floor(Date.now() / 1000);
          const publicId = `sc_st_certificate_${finalBeneficiaryId}_${timestamp}`;

          // Create signature for Cloudinary
          const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
          const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append('file', `data:${fileObj.mimetype};base64,${base64File}`);
          cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
          cloudinaryFormData.append('timestamp', timestamp.toString());
          cloudinaryFormData.append('signature', signature);
          cloudinaryFormData.append('public_id', publicId);
          cloudinaryFormData.append('folder', 'beneficiary_certificates');

          const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: cloudinaryFormData,
            // Remove Content-Type header to let fetch set it automatically for FormData
          });

          console.log('Cloudinary response status:', response.status);
          const data = await response.json() as {
            secure_url?: string;
            public_id?: string;
            error?: { message?: string }
          };
          console.log('Cloudinary response data:', data);

          if (!response.ok) {
            resolve(new Response(JSON.stringify({
              error: data.error?.message || 'Cloudinary upload failed'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }));
            return;
          }

          resolve(new Response(JSON.stringify({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            beneficiaryId: beneficiaryId
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));

        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          resolve(new Response(JSON.stringify({ error: 'File upload failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        } finally {
          // Clean up temp file
          if (fileObj.filepath && fs.existsSync(fileObj.filepath)) {
            fs.unlinkSync(fileObj.filepath);
          }
        }
      });
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}