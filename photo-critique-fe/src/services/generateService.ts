import axios from "axios";

export interface GenerateImageCancelToken {
  cancel: () => void;
}

export const generateService = {
  generateImage: async (
    prompt: string,
    imageUrl: string,
    onProgress?: (progress: number) => void,
    cancelToken?: { cancelled: boolean }
  ): Promise<{ imageUrl: string }> => {
    // Call external edit-image API
    const response = await axios.post<{
      task_id: string;
      image_url?: string | null;
    }>(
      "https://unbroached-expandible-ronda.ngrok-free.dev/edit-image",
      // 'https://fastapi-qwen-test.onrender.com/edit-image',
      {
        image_url: imageUrl,
        prompt: prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const taskId = response.data.task_id;
    if (!taskId) {
      throw new Error("Failed to generate image: No task_id in response");
    }

    // If image_url is already available, return it
    if (response.data.image_url) {
      return { imageUrl: response.data.image_url };
    }

    // Poll for progress
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        // Check if cancelled
        if (cancelToken?.cancelled) {
          clearInterval(pollInterval);
          reject(new Error("Image generation cancelled"));
          return;
        }

        try {
          const progressResponse = await axios.get<{
            task_id: string;
            progress: number;
            image_url?: string;
          }>(
            `https://unbroached-expandible-ronda.ngrok-free.dev/progress/${taskId}`,
            {
              //   }>(`https://fastapi-qwen-test.onrender.com/progress/${taskId}`, {
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          // Check if cancelled after request
          if (cancelToken?.cancelled) {
            clearInterval(pollInterval);
            reject(new Error("Image generation cancelled"));
            return;
          }

          const progress = progressResponse.data.progress || 0;
          onProgress?.(progress);

          // If image_url is available, generation is complete
          if (progressResponse.data.image_url) {
            clearInterval(pollInterval);
            resolve({ imageUrl: progressResponse.data.image_url });
          }
        } catch (error: any) {
          // Don't reject if cancelled
          if (cancelToken?.cancelled) {
            clearInterval(pollInterval);
            reject(new Error("Image generation cancelled"));
            return;
          }
          clearInterval(pollInterval);
          reject(
            new Error(error.message || "Failed to check generation progress")
          );
        }
      }, 1000); // Poll every 1 second

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error("Image generation timeout"));
      }, 5 * 60 * 1000);
    });
  },
};
