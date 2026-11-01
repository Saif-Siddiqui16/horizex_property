import { masterApi } from '../baseApi';

export const mediaApi = masterApi.injectEndpoints({
  endpoints: (builder) => ({
    getUploadSignature: builder.mutation({
      query: (body = {}) => ({
        url: '/media/signature',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data,
    }),
    uploadBase64: builder.mutation({
      query: (body) => ({
        url: '/media/upload-base64',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetUploadSignatureMutation, useUploadBase64Mutation } = mediaApi;

/**
 * Helper function for direct client-to-Cloudinary upload without Multer.
 * 1. Requests HMAC signature from backend.
 * 2. Uploads binary directly to Cloudinary CDN.
 * 3. Returns secure HTTPS image URL.
 */
export const uploadFileDirectToCloudinary = async (file, folder = 'horizex_properties', getSignatureFn) => {
  const sigData = await getSignatureFn({ folder }).unwrap();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sigData.apiKey);
  formData.append('timestamp', sigData.timestamp);
  formData.append('signature', sigData.signature);
  formData.append('folder', sigData.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image directly to Cloudinary');
  }

  const result = await response.json();
  return result.secure_url;
};

