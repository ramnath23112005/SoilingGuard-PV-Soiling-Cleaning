import { env, isProd } from './env';

export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: isProd,
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
  provider: 'cloudinary' | 'placeholder';
}

/**
 * Uploads a buffer/file to Cloudinary when configured.
 * Development fallback: returns a deterministic placeholder URL so the
 * application remains fully functional without credentials.
 */
export async function uploadMedia(
  buffer: Buffer,
  folder: string,
  opts: { resourceType?: 'image' | 'video'; filename?: string } = {}
): Promise<UploadResult> {
  const resourceType = opts.resourceType ?? 'image';
  if (cloudinaryConfigured) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cloudinary = require('cloudinary').v2;
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `fittrack/${folder}`, resource_type: resourceType },
        (err: Error | undefined, res: unknown) => {
          if (err) reject(err);
          else resolve(res as { secure_url: string; public_id: string });
        }
      );
      stream.end(buffer);
    });
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
  }
  const name = (opts.filename ?? 'upload').replace(/[^a-zA-Z0-9_-]/g, '');
  return {
    url: `https://placehold.co/${resourceType === 'video' ? '640x360/1B1D22/B7F34A' : '400x300/1B1D22/B7F34A'}.png?text=${name}`,
    publicId: `dev/${folder}/${name}`,
    provider: 'placeholder',
  };
}
