import Replicate from 'replicate';
import dotenv from 'dotenv';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export class ReplicateService {
  /**
   * Virtual Try-on using IDM-VTON model
   * @param humanImage URL or base64 of the person photo
   * @param garmentImage URL or base64 of the clothing item photo
   * @param description Short description of the garment (e.g., "Short sleeve t-shirt")
   * @param category Clothing category: "upper_body", "lower_body", or "dresses"
   */
  static async virtualTryOn(humanImage: string, garmentImage: string, description: string = "clothing item", category: string = "upper_body") {
    try {
      console.log('🚀 Starting Virtual Try-on process...');
      
      const output = await replicate.run(
        "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
        {
          input: {
            human_img: humanImage,
            garm_img: garmentImage,
            garment_des: description,
            crop: true,
            seed: 42,
            steps: 30,
            category: category,
            force_dc: false,
            mask_only: false
          }
        }
      );

      console.log('✅ AI Generation completed, processing output...');
      
      // The model returns a ReadableStream, we need to convert it to a buffer
      if (output instanceof ReadableStream) {
        const reader = output.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        return `data:image/png;base64,${base64}`;
      }

      // If it's already a string (URL), just return it
      return output;
    } catch (error) {
      console.error('Replicate Virtual Try-on Error:', error);
      throw error;
    }
  }
}
