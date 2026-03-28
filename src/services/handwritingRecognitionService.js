import axios from "axios";

import { apiClient } from "./apiClient.js";

const resolveRecognitionValue = (payload) => {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  const candidate =
    payload.latex
    || payload.text
    || payload.expression
    || payload.result
    || payload.prediction
    || payload.data?.latex
    || payload.data?.text
    || payload.data?.expression
    || payload.data?.result
    || payload.recognition?.latex
    || payload.recognition?.text;

  return typeof candidate === "string" ? candidate : "";
};

const resolveErrorMessage = (error) =>
  error?.response?.data?.message
  || error?.message
  || "Handwriting recognition failed. Please try again.";

class HandwritingRecognitionService {
  async recognize(payload) {
    const configuredUrl = import.meta.env.VITE_HANDWRITING_RECOGNITION_URL;

    if (configuredUrl) {
      try {
        const response = await axios.post(
          configuredUrl,
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const value = resolveRecognitionValue(response.data);

        if (!value) {
          throw new Error("មិនទទួលបានលទ្ធផលពី handwriting recognition service ទេ។");
        }

        return {
          ...response.data,
          latex: response.data?.latex || value,
          text: response.data?.text || value
        };
      } catch (error) {
        throw new Error(resolveErrorMessage(error));
      }
    }

    try {
      const response = await apiClient.post("/handwriting/recognize", payload);
      const value = resolveRecognitionValue(response.data);

      if (!value) {
        throw new Error("មិនទទួលបានលទ្ធផលពី handwriting recognition service ទេ។");
      }

      return {
        ...response.data,
        latex: response.data?.latex || value,
        text: response.data?.text || value
      };
    } catch (error) {
      if (error?.response?.status === 404) {
        throw new Error(
          "Handwriting recognition service is not configured yet. Set `VITE_HANDWRITING_RECOGNITION_URL` or add `POST /handwriting/recognize`."
        );
      }

      throw new Error(resolveErrorMessage(error));
    }
  }
}

export const handwritingRecognitionService = new HandwritingRecognitionService();
