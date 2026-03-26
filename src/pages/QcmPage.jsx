import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlockMath } from "react-katex";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Lock,
  Play,
  Trophy,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ButtonSpinner } from "../components/ButtonSpinner.jsx";
import { ScanHeader } from "../components/ScanHeader.jsx";
import { SkeletonBlock } from "../components/SkeletonBlock.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { quizService } from "../services/quizService.js";

const springTransition = { type: "spring", stiffness: 360, damping: 30 };

const EMPTY_LEVELS = [];
const EMPTY_QUESTIONS = [];

const SubjectSkeletonList = () => (
  <section className="mt-4 space-y-3" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={`subject-skeleton-${index}`}
        className="rounded-[2rem] border border-green-100/80 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <SkeletonBlock className="h-5 w-40 rounded-lg" />
            <SkeletonBlock className="h-4 w-full rounded-lg" />
            <SkeletonBlock className="h-4 w-2/3 rounded-lg" />
          </div>
          <SkeletonBlock className="h-5 w-5 rounded-full" />
        </div>
      </div>
    ))}
  </section>
);

const LevelSkeletonList = () => (
  <section className="mt-4 space-y-3" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={`level-skeleton-${index}`}
        className="rounded-[2rem] border border-green-100/80 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-36 rounded-lg" />
                <SkeletonBlock className="h-4 w-44 rounded-lg" />
              </div>
              <SkeletonBlock className="h-8 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <SkeletonBlock className="h-3.5 w-20 rounded-full" />
                <SkeletonBlock className="h-3.5 w-16 rounded-full" />
              </div>
              <SkeletonBlock className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </section>
);

const QuestionSkeleton = () => (
  <main className="mt-3 flex-1" aria-hidden="true">
    <section className="rounded-[2rem] bg-white p-4 shadow-[0_22px_50px_rgba(34,197,94,0.10)]">
      <SkeletonBlock className="h-6 w-44 rounded-full" />
      <div className="mt-3 space-y-2">
        <SkeletonBlock className="h-4 w-28 rounded-lg" />
        <SkeletonBlock className="h-7 w-full rounded-xl" />
        <SkeletonBlock className="h-7 w-5/6 rounded-xl" />
        <div className="rounded-[1.5rem] border border-green-100 bg-green-50/70 px-4 py-5">
          <div className="space-y-3">
            <SkeletonBlock className="mx-auto h-7 w-2/3 rounded-xl" />
            <SkeletonBlock className="mx-auto h-7 w-1/2 rounded-xl" />
          </div>
        </div>
      </div>
    </section>

    <section className="mt-3 space-y-2.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`question-option-skeleton-${index}`}
          className="rounded-[2rem] border-2 border-slate-100 bg-white px-4 py-3.5 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <SkeletonBlock className="mt-0.5 h-8 w-8 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-full rounded-lg" />
              <SkeletonBlock className="h-5 w-3/4 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </section>
  </main>
);

export const QcmPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, loginWithGoogle } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectLevels, setSubjectLevels] = useState(EMPTY_LEVELS);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [questionsPayload, setQuestionsPayload] = useState(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmittingLevel, setIsSubmittingLevel] = useState(false);
  const [quizError, setQuizError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showResultDrawer, setShowResultDrawer] = useState(false);
  const [lives, setLives] = useState(3);
  const [wrongOptionId, setWrongOptionId] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpBurstKey, setXpBurstKey] = useState(0);

  const currentQuestions = questionsPayload?.questions ?? EMPTY_QUESTIONS;
  const currentQuestion = currentQuestions[currentIndex] ?? null;
  const correctOption = currentQuestion?.options.find((option) => option.isCorrect) ?? null;
  const isCurrentAnswerCorrect = selectedOptionId === correctOption?.id;
  const isLastQuestion = currentQuestions.length > 0 && currentIndex === currentQuestions.length - 1;
  const progressValue = currentQuestions.length
    ? ((currentIndex + (showResultDrawer ? 1 : 0)) / currentQuestions.length) * 100
    : 0;

  const headline = useMemo(() => {
    if (!currentQuestions.length) {
      return "សំណួរទី 1";
    }

    return `សំណួរទី ${currentIndex + 1}`;
  }, [currentIndex, currentQuestions.length]);

  const resetQuizState = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setShowResultDrawer(false);
    setLives(3);
    setWrongOptionId(null);
    setCorrectCount(0);
    setXpBurstKey(0);
  };

  const loadSubjects = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoadingSubjects(true);
    setQuizError("");

    try {
      const data = await quizService.getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      setQuizError(error.response?.data?.message || "មិនអាចទាញយកមុខវិជ្ជាបានទេ។");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadSubjects();
  }, [isAuthLoading, isAuthenticated]);

  const handleChooseSubject = async (subject) => {
    setSelectedSubject(subject);
    setSelectedLevelId(null);
    setQuestionsPayload(null);
    setSubjectLevels(EMPTY_LEVELS);
    resetQuizState();
    setIsLoadingLevels(true);
    setQuizError("");

    try {
      const data = await quizService.getSubjectLevels(subject.id);
      setSelectedSubject({
        ...subject,
        titleKh: data.titleKh,
        summaryKh: data.summaryKh,
        image_url: data.image_url || subject.image_url || ""
      });
      setSubjectLevels(Array.isArray(data.levels) ? data.levels : EMPTY_LEVELS);
    } catch (error) {
      setQuizError(error.response?.data?.message || "មិនអាចទាញយកកម្រិតបានទេ។");
    } finally {
      setIsLoadingLevels(false);
    }
  };

  const handleChooseLevel = async (level) => {
    if (!level.unlocked || !selectedSubject) {
      return;
    }

    setSelectedLevelId(level.id);
    setQuestionsPayload(null);
    resetQuizState();
    setIsLoadingQuestions(true);
    setQuizError("");

    try {
      const data = await quizService.getQuestions(selectedSubject.id, level.id);
      setQuestionsPayload(data);
    } catch (error) {
      setSelectedLevelId(null);
      setQuizError(
        error.response?.data?.message || "មិនអាចទាញយកសំណួរសម្រាប់កម្រិតនេះបានទេ។"
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedLevelId(null);
    setQuestionsPayload(null);
    setSubjectLevels(EMPTY_LEVELS);
    resetQuizState();
    setQuizError("");
  };

  const handleBackToLevels = async () => {
    setSelectedLevelId(null);
    setQuestionsPayload(null);
    resetQuizState();
    setQuizError("");

    if (!selectedSubject) {
      return;
    }

    setIsLoadingLevels(true);

    try {
      const data = await quizService.getSubjectLevels(selectedSubject.id);
      setSubjectLevels(Array.isArray(data.levels) ? data.levels : EMPTY_LEVELS);
    } catch (error) {
      setQuizError(error.response?.data?.message || "មិនអាចធ្វើបច្ចុប្បន្នភាពកម្រិតបានទេ។");
    } finally {
      setIsLoadingLevels(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showResultDrawer || !currentQuestion) {
      return;
    }

    setSelectedOptionId(option.id);
    setShowResultDrawer(true);

    if (option.isCorrect) {
      setCorrectCount((value) => value + 1);
      setXpBurstKey((value) => value + 1);
      return;
    }

    setWrongOptionId(option.id);
    setLives((value) => Math.max(0, value - 1));
  };

  const handleLevelCompletion = async () => {
    if (!selectedSubject || !selectedLevelId || !currentQuestions.length) {
      return;
    }

    const scorePercent = Math.round((correctCount / currentQuestions.length) * 100);

    setIsSubmittingLevel(true);

    try {
      const [levelsData] = await Promise.all([
        quizService.completeLevel(selectedSubject.id, selectedLevelId, scorePercent),
        loadSubjects()
      ]);

      setSubjectLevels(Array.isArray(levelsData.levels) ? levelsData.levels : EMPTY_LEVELS);
    } catch (error) {
      setQuizError(error.response?.data?.message || "មិនអាចរក្សាទុកលទ្ធផលបានទេ។");
    } finally {
      setIsSubmittingLevel(false);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion || lives === 0) {
      await handleLevelCompletion();
      await handleBackToLevels();
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedOptionId(null);
    setWrongOptionId(null);
    setShowResultDrawer(false);
  };

  const getOptionClasses = (option) => {
    const isSelected = selectedOptionId === option.id;
    const isCorrect = showResultDrawer && option.isCorrect;
    const isWrong = showResultDrawer && wrongOptionId === option.id;

    if (isCorrect) {
      return "border-green-500 bg-green-50 text-green-900 shadow-[0_14px_28px_rgba(34,197,94,0.14)]";
    }

    if (isWrong) {
      return "border-red-400 bg-red-50 text-red-900 shadow-[0_14px_28px_rgba(248,113,113,0.12)]";
    }

    if (isSelected) {
      return "border-green-500 bg-green-50 text-slate-900";
    }

    return "border-slate-100 bg-white text-slate-800 hover:border-green-200 hover:bg-green-50/40";
  };

  const getLevelCardClasses = (level) => {
    if (level.completed) {
      return "border-green-200 bg-green-50/80";
    }

    if (level.current) {
      return "border-green-400 bg-white shadow-[0_18px_34px_rgba(34,197,94,0.12)]";
    }

    return "border-slate-200 bg-slate-50/90 grayscale pointer-events-none";
  };

  const renderAuthGate = () => (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <section className="premium-surface w-full rounded-[2rem] border border-green-100/80 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-700">Sign in to start your math journey.</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          ត្រូវចូលគណនីជាមុនសិន ដើម្បីមើលមុខវិជ្ជា កម្រិត និងសំណួរប្រឡងរបស់អ្នក។
        </p>
        <button
          type="button"
          onClick={() => { navigate("/login"); }}
          className="mt-5 rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(16,185,129,0.22)] transition hover:bg-green-700"
        >
          Login
        </button>
      </section>
    </main>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-green-50 via-white to-slate-50 text-slate-900"
    >
      <div className="app-shell-page mx-auto flex min-h-screen flex-col bg-white pb-28">
        <ScanHeader />

        {quizError ? (
          <div className="px-4 pt-4">
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-600">
              {quizError}
            </div>
          </div>
        ) : null}

        {isAuthLoading ? (
          <main className="flex flex-1 items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-36 rounded-lg" />
                <SkeletonBlock className="h-4 w-full rounded-lg" />
                <SkeletonBlock className="h-11 w-full rounded-2xl" />
              </div>
            </div>
            <div className="hidden rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
              កំពុងផ្ទុក...
            </div>
          </main>
        ) : !isAuthenticated ? (
          renderAuthGate()
        ) : !selectedSubject ? (
          <main className="flex-1 px-4 py-4 md:px-5 lg:px-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex mb-2 items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <section className="premium-surface rounded-[2rem] border border-green-100/80 p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-green-700">
                <Trophy className="h-3.5 w-3.5" />
                Quiz Subjects
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-relaxed text-slate-900">
                ជ្រើសរើសមុខវិជ្ជាដើម្បីចាប់ផ្តើម
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                ជ្រើសប្រធានបទគណិតវិទ្យាមួយ ហើយបន្តកម្រិតជាបន្តបន្ទាប់តាមសមត្ថភាពរបស់អ្នក។
              </p>
            </section>

            {isLoadingSubjects ? (
              <>
                <SubjectSkeletonList />
                <div className="hidden mt-4 rounded-[1.5rem] border border-green-100 bg-white px-4 py-3 text-sm text-slate-500">
                កំពុងទាញយកមុខវិជ្ជា...
                </div>
              </>
            ) : (
              <section className="mt-4 space-y-3">
                {subjects.map((subject, index) => {
                  const ringPercent = (subject.progress || 0) * 1.13;

                  return (
                    <motion.button
                      key={subject.id}
                      type="button"
                      onClick={() => handleChooseSubject(subject)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
                      whileTap={{ scale: 0.985 }}
                      className="premium-card flex w-full items-center gap-4 rounded-[2rem] border border-green-100/80 bg-white p-4 text-left"
                    >
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="rgb(220 252 231)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="rgb(34 197 94)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${ringPercent} 999`}
                          />
                        </svg>
                        <span className="absolute text-[11px] font-bold text-green-700">
                          {`${subject.completedLevels}/${subject.totalLevels}`}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold text-slate-800">{subject.titleKh}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                          {subject.summaryKh}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {`Level ${subject.completedLevels}/${subject.totalLevels} Completed`}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </motion.button>
                  );
                })}
              </section>
            )}
          </main>
        ) : !selectedLevelId ? (
          <main className="flex-1 px-4 py-4 md:px-5 lg:px-6">
            <button
              type="button"
              onClick={handleBackToSubjects}
              className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <section className="premium-surface mt-3 rounded-[2rem] border border-green-100/80 p-4">
              <h1 className="text-2xl font-bold leading-relaxed text-slate-900">
                {selectedSubject.titleKh}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                ទទួលបានពិន្ទុ ៨០% ក្នុងកម្រិតមុន ដើម្បីបន្តទៅកម្រិតបន្ទាប់
              </p>
            </section>

            {isLoadingLevels ? (
              <>
                <LevelSkeletonList />
                <div className="hidden mt-4 rounded-[1.5rem] border border-green-100 bg-white px-4 py-3 text-sm text-slate-500">
                កំពុងទាញយកកម្រិត...
                </div>
              </>
            ) : (
              <section className="mt-4 space-y-3">
                {subjectLevels.map((level, index) => {
                  const isLocked = !level.unlocked;

                  return (
                    <div key={level.id} className="relative">
                      {index < subjectLevels.length - 1 && (
                        <div className="absolute left-6 top-16 h-10 w-px bg-green-100" />
                      )}

                      <motion.button
                        type="button"
                        onClick={() => handleChooseLevel(level)}
                        whileTap={{ scale: isLocked ? 1 : 0.99 }}
                        className={`premium-card relative w-full rounded-[2rem] border p-4 text-left ${getLevelCardClasses(level)}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                              level.completed
                                ? "border-green-500 bg-green-500 text-white"
                                : level.current
                                  ? "border-green-400 bg-green-50 text-green-700"
                                  : "border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                          >
                            {level.completed ? (
                              <Check className="h-5 w-5" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-bold">{level.id}</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h2 className="text-lg font-bold text-slate-800">{level.label}</h2>
                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  {level.completed
                                    ? `បានបញ្ចប់ · ពិន្ទុខ្ពស់បំផុត ${level.bestScore || 0}%`
                                    : level.current
                                      ? `កម្រិតបច្ចុប្បន្ន · ត្រូវការ ${level.requiredScore}%`
                                      : `ត្រូវការកម្រិតមុន ${level.requiredScore}%`}
                                </p>
                              </div>

                              {level.current ? (
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                  Start
                                </div>
                              ) : null}
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-400">
                                <span>{`Highest Score ${level.bestScore || 0}%`}</span>
                                <span>{`${level.requiredScore || 80}% target`}</span>
                              </div>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    level.completed
                                      ? "bg-green-500"
                                      : level.current
                                        ? "bg-green-400"
                                        : "bg-slate-300"
                                  }`}
                                  style={{ width: `${level.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {!isLocked && (
                          <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                        )}

                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-white/65 backdrop-blur-[2px]">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
                              <Lock className="h-3.5 w-3.5" />
                              Locked
                            </div>
                          </div>
                        )}
                      </motion.button>
                    </div>
                  );
                })}
              </section>
            )}
          </main>
        ) : (
          <div className="flex-1 px-4 pt-3 md:px-5 lg:px-6">
            <header className="flex justify-center">
              <div className="app-shell w-full space-y-2.5 rounded-[1.75rem] border border-green-100/80 bg-white/90 px-4 py-3.5 shadow-[0_16px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleBackToLevels}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-green-100 bg-white px-3.5 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                      aria-label="Quit quiz"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 px-0.5 text-[10px] font-medium tracking-[0.18em] text-slate-400">
                    <span>{headline}</span>
                    <span>
                      {currentIndex + 1}/{currentQuestions.length}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-green-100/90">
                    <motion.div
                      className="h-full rounded-full bg-green-500 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressValue}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </header>

            {isLoadingQuestions ? (
              <>
                <QuestionSkeleton />
                <div className="hidden mt-4 rounded-[1.5rem] border border-green-100 bg-white px-4 py-3 text-sm text-slate-500">
                កំពុងទាញយកសំណួរ...
                </div>
              </>
            ) : currentQuestion ? (
              <main className="mt-3 flex-1">
                <section className="relative rounded-[2rem] bg-white p-4 shadow-[0_22px_50px_rgba(34,197,94,0.10)]">
                  <AnimatePresence>
                    {xpBurstKey > 0 && showResultDrawer && isCurrentAnswerCorrect && (
                      <motion.div
                        key={xpBurstKey}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -20, scale: 1 }}
                        exit={{ opacity: 0, y: -34 }}
                        transition={{ duration: 0.65, ease: "easeOut" }}
                        className="pointer-events-none absolute right-5 top-3 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 shadow-sm"
                      >
                        +10 XP
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-green-700">
                    {`${questionsPayload.titleKh} · ${questionsPayload.levelLabel}`}
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-slate-500">សំណួរគណិតវិទ្យា</p>
                    <h1 className="text-[1.35rem] font-bold leading-relaxed text-slate-900">
                      {currentQuestion.promptKh}
                    </h1>
                    <div className="rounded-[1.5rem] border border-green-100 bg-green-50/70 px-4 py-3 text-center">
                      <div className="overflow-x-auto text-base text-slate-900">
                        <BlockMath math={currentQuestion.latex} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mt-3 space-y-2.5">
                  {currentQuestion.options.map((option, index) => {
                    const isWrong = showResultDrawer && wrongOptionId === option.id;

                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResultDrawer}
                        initial={{ opacity: 0, y: 16 }}
                        animate={
                          isWrong
                            ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
                            : { opacity: 1, y: 0, x: 0 }
                        }
                        transition={{
                          duration: isWrong ? 0.38 : 0.24,
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        className={`w-full rounded-[2rem] border-2 px-4 py-3.5 text-left transition ${getOptionClasses(option)}`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-xs font-bold uppercase text-slate-500">
                            {option.id}
                          </div>
                          <div className="min-w-0 text-sm font-semibold leading-relaxed">
                            <div className="overflow-x-auto">
                              <BlockMath math={option.label} />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </section>
              </main>
            ) : (
              <div className="mt-4 rounded-[1.5rem] border border-green-100 bg-white px-4 py-3 text-sm text-slate-500">
                មិនទាន់មានសំណួរសម្រាប់កម្រិតនេះទេ។
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {showResultDrawer && currentQuestion && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={springTransition}
              className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6"
            >
              <div
                className={`app-shell w-full overflow-hidden rounded-[2rem] border px-5 py-5 shadow-[0_-14px_40px_rgba(15,23,42,0.12)] ${
                  isCurrentAnswerCorrect
                    ? "border-green-200 bg-green-500 text-white"
                    : "border-red-200 bg-red-500 text-white"
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                      {isCurrentAnswerCorrect ? "Correct Answer" : "Try Again"}
                    </p>
                    <h2 className="mt-1 text-xl font-bold leading-relaxed">
                      {isCurrentAnswerCorrect
                        ? "អស្ចារ្យណាស់! ចម្លើយត្រឹមត្រូវ"
                        : "ចម្លើយនេះមិនទាន់ត្រឹមត្រូវទេ"}
                    </h2>
                  </div>

                  <div className="rounded-3xl bg-white/14 px-4 py-4 text-sm leading-relaxed text-white/95 backdrop-blur-sm">
                    {isCurrentAnswerCorrect ? (
                      <p>បន្តទៅសំណួរបន្ទាប់ ដើម្បីរកពិន្ទុបន្ថែម និងពង្រឹងជំនាញរបស់អ្នក។</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-semibold text-white">ចម្លើយត្រឹមត្រូវ៖</p>
                        <div className="overflow-x-auto rounded-2xl bg-white/10 px-3 py-2">
                          <BlockMath math={correctOption?.label || ""} />
                        </div>
                        <p>{currentQuestion.explanationKh}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white/85">
                      ពិន្ទុត្រឹមត្រូវ: <span className="font-bold text-white">{correctCount}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmittingLevel}
                      className={`rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition ${
                        isCurrentAnswerCorrect
                          ? "bg-white text-green-700 hover:bg-green-50"
                          : "bg-white text-red-600 hover:bg-rose-50"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {isSubmittingLevel ? <ButtonSpinner className="h-4 w-4" /> : null}
                        <span>{isLastQuestion || lives === 0 ? "Finish" : "Next"}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
