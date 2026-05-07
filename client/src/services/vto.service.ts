import axiosInstance from './axios';

export const vtoService = {
  /**
   * Perform virtual try-on
   * @param humanImage File object OR string URL of already uploaded photo
   * @param garmentImage URL or local path of the product image
   * @param description Product description
   * @param category Clothing category: "upper_body", "lower_body", or "dresses"
   */
  tryOn: async (humanImage: File | string, garmentImage: string, description: string, category: string = 'upper_body') => {
    const formData = new FormData();
    if (typeof humanImage === 'string') {
      formData.append('humanImage', humanImage);
    } else {
      formData.append('humanImage', humanImage);
    }
    formData.append('garmentImage', garmentImage);
    formData.append('description', description);
    formData.append('category', category);

    // Using the real /vto endpoint
    return axiosInstance.post('/vto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
