import axios from 'axios';

export interface ModerationResult {
  image_url: string;
  allowed: boolean;
  label: string;
  confidence: number;
  probabilities: {
    safe: number;
    sexy: number;
    violence: number;
  };
}

export interface ModerationResponse {
  count: number;
  results: ModerationResult[];
}

export interface TextModerationResult {
  label: string;
  confidence: number;
  allowed: boolean;
  probabilities: {
    "Hate Speech": number;
    "Offensive": number;
    "Neither": number;
  };
}

export const moderationService = {
  moderateBatch: async (imageUrls: string[]): Promise<ModerationResponse> => {
    const response = await axios.post<ModerationResponse>(
      'https://yuu1234-sfw.hf.space/moderate_batch',
      {
        image_urls: imageUrls,
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  moderateText: async (text: string): Promise<TextModerationResult> => {
    const response = await axios.post<TextModerationResult>(
      'https://yuu1234-offensive-detection-bert.hf.space/predict',
      {
        text: text,
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },
};

