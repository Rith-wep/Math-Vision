import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, LoaderCircle, X } from "lucide-react";

import { formulaService } from "../services/formulaService.js";

const playSuccessFeedback = () => {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate([35, 20, 45]);
  }

  if (typeof window === "undefined") {
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(980, audioContext.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.24);
    oscillator.onended = () => {
      audioContext.close().catch(() => {});
    };
  } catch (error) {
    // Non-blocking feedback only; ignore devices that don't support it.
  }
};

export const UploadPhoto = ({ open, onClose, onScanComplete }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
  };

  useEffect(() => {
    if (!open) {
      clearPreview();
      setErrorMessage("");
      setIsProcessing(false);
    }
  }, [open, previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelected = async (file) => {
    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setErrorMessage("");
    setIsProcessing(true);

    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = typeof reader.result === "string" ? reader.result : "";
          resolve(result.replace(/^data:[^;]+;base64,/, ""));
        };
        reader.onerror = () => reject(new Error("Unable to read the selected image."));
        reader.readAsDataURL(file);
      });

      const result = await formulaService.solveFromImage({
        imageBase64,
        mimeType: file.type || "image/jpeg"
      });

      playSuccessFeedback();
      clearPreview();
      onScanComplete?.(result);
      onClose?.();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to scan the image right now. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[420px] rounded-[2rem] border border-green-100 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-green-900">
                  ស្កេនលំហាត់គណិតវិទ្យា
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ដាក់លំហាត់ឱ្យចំកណ្ដាលប្រអប់ ដើម្បីទទួលបានលទ្ធផលច្បាស់ល្អ
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700 transition hover:bg-green-100"
                aria-label="Close upload modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-green-100 bg-green-50/70 p-4">
              <div className="relative overflow-hidden rounded-[1.25rem] bg-slate-950/5">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[1.25rem]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Uploaded math problem preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-white text-center text-sm text-slate-400">
                      ដាក់រូបលំហាត់នៅក្នុងប្រអប់ស្កេន
                    </div>
                  )}
                </div>

                <div
                  className="pointer-events-none absolute inset-4 rounded-[1rem] opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(34,197,94,0.18) 1px, transparent 1px)",
                    backgroundSize: "14px 14px"
                  }}
                />
                <div className="pointer-events-none absolute inset-4 rounded-[1rem] shadow-[0_0_0_9999px_rgba(255,255,255,0.05)]" />
                <div className="pointer-events-none absolute inset-4">
                  <div className="absolute left-0 top-0 h-10 w-10 border-l-[4px] border-t-[4px] border-green-700 rounded-tl-2xl" />
                  <div className="absolute right-0 top-0 h-10 w-10 border-r-[4px] border-t-[4px] border-green-700 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 h-10 w-10 border-b-[4px] border-l-[4px] border-green-700 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 h-10 w-10 border-b-[4px] border-r-[4px] border-green-700 rounded-br-2xl" />
                </div>
                {isProcessing && (
                  <div className="pointer-events-none absolute inset-4 overflow-hidden rounded-[1rem]">
                    <motion.div
                      animate={{ y: ["0%", "260%", "0%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-x-4 top-2"
                    >
                      <div className="h-8 rounded-full bg-gradient-to-b from-green-300/0 via-green-400/20 to-green-500/0 blur-md" />
                      <div className="mt-[-18px] h-1 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.9)]" />
                    </motion.div>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/75 backdrop-blur-sm">
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-4 rounded-full bg-green-100 blur-xl" />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                          <div className="relative flex h-7 w-7 items-center justify-center">
                            <div className="absolute bottom-0 h-4 w-5 rounded-b-xl bg-green-500" />
                            <div className="absolute top-0 h-4 w-4 rounded-full bg-green-500" />
                            <div className="absolute left-0 top-2 h-3 w-1 rounded-full bg-slate-700" />
                            <div className="absolute right-0 top-2 h-3 w-1 rounded-full bg-slate-700" />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                      <LoaderCircle className="h-4 w-4 animate-spin text-green-600" />
                      <p>Processing...</p>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-[0_10px_22px_rgba(34,197,94,0.18)] transition hover:bg-green-700"
                >
                  <Camera className="h-4 w-4" />
                  <span>Camera</span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-50"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Photo</span>
                </button>
              </div>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => handleFileSelected(event.target.files?.[0])}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFileSelected(event.target.files?.[0])}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
