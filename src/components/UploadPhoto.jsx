import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, LoaderCircle, X } from "lucide-react";

import { formulaService } from "../services/formulaService.js";
import { toKhmerErrorMessage } from "../utils/errorMessages.js";

const MIN_CROP_WIDTH = 140;
const MIN_CROP_HEIGHT = 110;

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
  } catch {
    // Best-effort feedback only.
  }
};

const clampCropBox = (box, boundsWidth, boundsHeight) => {
  const width = Math.min(Math.max(box.width, MIN_CROP_WIDTH), boundsWidth);
  const height = Math.min(Math.max(box.height, MIN_CROP_HEIGHT), boundsHeight);
  const x = Math.min(Math.max(box.x, 0), Math.max(0, boundsWidth - width));
  const y = Math.min(Math.max(box.y, 0), Math.max(0, boundsHeight - height));

  return { x, y, width, height };
};

const createInitialCropBox = (boundsWidth, boundsHeight) => {
  const width = Math.max(MIN_CROP_WIDTH, Math.min(boundsWidth * 0.72, boundsWidth - 32));
  const height = Math.max(MIN_CROP_HEIGHT, Math.min(boundsHeight * 0.48, boundsHeight - 32));

  return {
    x: Math.max(16, (boundsWidth - width) / 2),
    y: Math.max(16, (boundsHeight - height) / 2),
    width,
    height
  };
};

const loadImageFromSource = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process the selected image."));
    image.src = src;
  });

const optimizeImageFile = async (file) => {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });

  const image = await loadImageFromSource(dataUrl);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to process the selected image.");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const sourceMimeType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const exportMimeType = sourceMimeType === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), exportMimeType, 0.86);
  });

  if (!blob) {
    throw new Error("Unable to optimize the selected image.");
  }

  const optimizedFile = new File([blob], file.name || `math-vision-${Date.now()}.jpg`, {
    type: exportMimeType
  });

  const optimizedBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.replace(/^data:[^;]+;base64,/, ""));
    };
    reader.onerror = () => reject(new Error("Unable to prepare the image for scanning."));
    reader.readAsDataURL(optimizedFile);
  });

  return {
    imageBase64: optimizedBase64,
    mimeType: exportMimeType
  };
};

export const UploadPhoto = ({ open, onClose, onScanComplete }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const interactionRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cropBox, setCropBox] = useState({
    x: 32,
    y: 32,
    width: 240,
    height: 160
  });

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    setCameraStream(null);
    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
  };

  const syncInitialCropBox = () => {
    if (!frameRef.current) {
      return;
    }

    const frameRect = frameRef.current.getBoundingClientRect();

    if (!frameRect.width || !frameRect.height) {
      return;
    }

    setCropBox(createInitialCropBox(frameRect.width, frameRect.height));
  };

  const openCamera = async () => {
    setErrorMessage("");
    setIsStartingCamera(true);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setErrorMessage(
        toKhmerErrorMessage("Live camera is not supported here. Please upload a photo instead.")
      );
      setIsStartingCamera(false);
      return;
    }

    try {
      stopCameraStream();
      clearPreview();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      });

      setCameraStream(stream);
      setIsCameraActive(true);
    } catch {
      setErrorMessage(
        toKhmerErrorMessage("Camera access was blocked. Please allow camera access or upload a photo.")
      );
    } finally {
      setIsStartingCamera(false);
    }
  };

  useEffect(() => {
    if (!open) {
      clearPreview();
      setErrorMessage("");
      setIsProcessing(false);
      setIsFlashActive(false);
      stopCameraStream();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream, previewUrl]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraActive]);

  useEffect(() => {
    if (!open) {
      return;
    }

    openCamera();
  }, [open]);

  useEffect(() => {
    if (!isCameraActive) {
      return;
    }

    const handleResize = () => {
      syncInitialCropBox();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCameraActive]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const interaction = interactionRef.current;

      if (!interaction || !frameRef.current) {
        return;
      }

      event.preventDefault();

      const frameRect = frameRef.current.getBoundingClientRect();
      const deltaX = event.clientX - interaction.startX;
      const deltaY = event.clientY - interaction.startY;
      let nextBox = { ...interaction.startBox };

      if (interaction.mode === "move") {
        nextBox.x = interaction.startBox.x + deltaX;
        nextBox.y = interaction.startBox.y + deltaY;
      }

      if (interaction.mode.includes("e")) {
        nextBox.width = interaction.startBox.width + deltaX;
      }

      if (interaction.mode.includes("s")) {
        nextBox.height = interaction.startBox.height + deltaY;
      }

      if (interaction.mode.includes("w")) {
        nextBox.x = interaction.startBox.x + deltaX;
        nextBox.width = interaction.startBox.width - deltaX;
      }

      if (interaction.mode.includes("n")) {
        nextBox.y = interaction.startBox.y + deltaY;
        nextBox.height = interaction.startBox.height - deltaY;
      }

      if (nextBox.width < MIN_CROP_WIDTH) {
        if (interaction.mode.includes("w")) {
          nextBox.x -= MIN_CROP_WIDTH - nextBox.width;
        }

        nextBox.width = MIN_CROP_WIDTH;
      }

      if (nextBox.height < MIN_CROP_HEIGHT) {
        if (interaction.mode.includes("n")) {
          nextBox.y -= MIN_CROP_HEIGHT - nextBox.height;
        }

        nextBox.height = MIN_CROP_HEIGHT;
      }

      setCropBox(clampCropBox(nextBox, frameRect.width, frameRect.height));
    };

    const handlePointerUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startInteraction = (event, mode) => {
    if (!frameRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    interactionRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startBox: cropBox
    };
  };

  const handleFileSelected = async (file) => {
    if (!file) {
      return;
    }

    if (isProcessing) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setErrorMessage("");
    setIsProcessing(true);
    stopCameraStream();

    try {
      const optimizedImage = await optimizeImageFile(file);

      const result = await formulaService.solveFromImage({
        imageBase64: optimizedImage.imageBase64,
        mimeType: optimizedImage.mimeType
      });

      playSuccessFeedback();
      clearPreview();
      onScanComplete?.(result);
      onClose?.();
    } catch (error) {
      setErrorMessage(
        toKhmerErrorMessage(
          error.response?.data?.message || error.message || "Unable to scan the image right now. Please try again."
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !frameRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const frameRect = frameRef.current.getBoundingClientRect();
    const scaleX = video.videoWidth / frameRect.width;
    const scaleY = video.videoHeight / frameRect.height;
    const sourceX = Math.max(0, Math.round(cropBox.x * scaleX));
    const sourceY = Math.max(0, Math.round(cropBox.y * scaleY));
    const sourceWidth = Math.max(1, Math.round(cropBox.width * scaleX));
    const sourceHeight = Math.max(1, Math.round(cropBox.height * scaleY));

    if (!video.videoWidth || !video.videoHeight || !isCameraReady) {
      setErrorMessage(toKhmerErrorMessage("Camera is not ready yet. Please try again."));
      return;
    }

    if (isProcessing) {
      return;
    }

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setErrorMessage(toKhmerErrorMessage("Unable to capture the camera image right now."));
      return;
    }

    setIsFlashActive(true);
    window.setTimeout(() => setIsFlashActive(false), 180);

    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    const capturedFile = await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        resolve(
          new File([blob], `math-vision-scan-${Date.now()}.jpg`, {
            type: "image/jpeg"
          })
        );
      }, "image/jpeg", 0.95);
    });

    if (!capturedFile) {
      setErrorMessage(toKhmerErrorMessage("Unable to capture the photo. Please try again."));
      return;
    }

    await handleFileSelected(capturedFile);
  };

  const cropStyle = {
    left: `${cropBox.x}px`,
    top: `${cropBox.y}px`,
    width: `${cropBox.width}px`,
    height: `${cropBox.height}px`
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
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
                <h2 className="text-lg font-semibold text-green-900">ស្កេនលំហាត់គណិតវិទ្យា</h2>
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
              <div
                ref={frameRef}
                className="relative overflow-hidden rounded-[1.25rem] bg-slate-950/5"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[1.25rem]">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        setIsCameraReady(true);
                        window.requestAnimationFrame(syncInitialCropBox);
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Uploaded math problem preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-white px-8 text-center text-sm text-slate-400">
                      Open the camera or upload a photo to scan your math problem.
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

                {isCameraActive && (
                  <div
                    className="absolute border-2 border-green-500/95 bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.32)] touch-none"
                    style={cropStyle}
                    onPointerDown={(event) => startInteraction(event, "move")}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-white/5" />

                    <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l-[4px] border-t-[4px] border-green-700 rounded-tl-xl" />
                    <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r-[4px] border-t-[4px] border-green-700 rounded-tr-xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 border-b-[4px] border-l-[4px] border-green-700 rounded-bl-xl" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-[4px] border-r-[4px] border-green-700 rounded-br-xl" />

                    {["nw", "ne", "sw", "se"].map((handle) => {
                      const positions = {
                        nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
                        ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
                        sw: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
                        se: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
                      };

                      return (
                        <button
                          key={handle}
                          type="button"
                          aria-label={`Resize crop ${handle}`}
                          onPointerDown={(event) => startInteraction(event, handle)}
                          className={`absolute h-6 w-6 rounded-full border-2 border-white bg-green-600 shadow-lg touch-none ${positions[handle]}`}
                        />
                      );
                    })}
                  </div>
                )}

                {isFlashActive && (
                  <motion.div
                    initial={{ opacity: 0.85 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 bg-white"
                  />
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
                  onClick={handleCameraCapture}
                  disabled={!isCameraActive || !isCameraReady || isProcessing || isStartingCamera}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-[0_10px_22px_rgba(34,197,94,0.18)] transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  <Camera className="h-4 w-4" />
                  <span>{isProcessing ? "Scanning..." : "Scan"}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    galleryInputRef.current?.click();
                  }}
                  disabled={isProcessing || isStartingCamera}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
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
              onChange={(event) => {
                handleFileSelected(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                handleFileSelected(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
