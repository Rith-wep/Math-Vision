import { useEffect, useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });

export const ProfilePage = () => {
  const fileInputRef = useRef(null);
  const { isAuthenticated, isAuthLoading, user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  if (!isAuthLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const avatarUrl =
    avatarPreview ||
    user?.avatar ||
    "https://ui-avatars.com/api/?name=Math-Vision&background=dcfce7&color=166534&size=256";

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarPreview(dataUrl);
      setErrorMessage("");
      setSuccessMessage("");
    } catch (error) {
      setErrorMessage("មិនអាចអានរូបភាពដែលបានជ្រើសរើសបានទេ។");
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateProfile({
        displayName: displayName.trim(),
        avatar: avatarPreview || user?.avatar || ""
      });
      setSuccessMessage("បានរក្សាទុកការផ្លាស់ប្តូរដោយជោគជ័យ។");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "មិនអាចរក្សាទុកការផ្លាស់ប្តូរបានទេ។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ScanHeader />

      <main className="mx-auto flex w-full max-w-xl flex-col px-4 py-6">
        <Link
          to="/"
          className="inline-flex w-fit items-center rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          Back to Home
        </Link>

        <section className="mt-5 rounded-[2rem] border border-emerald-100 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Profile</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Your Profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            រៀបចំឈ្មោះ និងរូបភាពរបស់អ្នកឱ្យមានភាពទាក់ទាញ ដើម្បីបទពិសោធន៍ថ្មីជាមួយ Math-Vision។
          </p>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
              aria-label="Edit profile photo"
            >
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[6px] border-emerald-100 bg-emerald-50 shadow-[0_20px_40px_rgba(34,197,94,0.14)]">
                <img src={avatarUrl} alt={displayName || user?.displayName || "Profile"} className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-lg transition group-hover:bg-emerald-600">
                <Pencil className="h-5 w-5" />
              </div>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />

          <div className="mt-8 text-left">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Display Name</label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                placeholder="Add your name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              />
              <Camera className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-[#22c55e] bg-[#22c55e] px-4 py-3 text-left text-sm font-medium text-white shadow-[0_10px_24px_rgba(34,197,94,0.18)]">
              {successMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#22c55e] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(34,197,94,0.24)] transition hover:bg-[#22c55e] disabled:cursor-not-allowed disabled:bg-[#22c55e] disabled:opacity-100"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </section>
      </main>
    </div>
  );
};
