import axios from "axios";
import { BookOpenText, Files, ListChecks, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ButtonSpinner } from "../../components/ButtonSpinner.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { adminService } from "../services/adminService.js";

const formatVisibilityCount = (documents, visibility) =>
  documents.filter((item) => item.visibility === visibility).length;

const getErrorMessage = (error, fallbackMessage) =>
  axios.isAxiosError(error) ? error.response?.data?.message || fallbackMessage : fallbackMessage;

export const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);

      try {
        const [nextQuestions, nextDocuments] = await Promise.all([
          adminService.getQuestions(),
          adminService.getDocuments()
        ]);

        setQuestions(nextQuestions);
        setDocuments(nextDocuments);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Unable to load the latest admin data."));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const categories = new Set(questions.map((item) => item.category));
  const recentQuestions = questions.slice(0, 4);
  const recentDocuments = documents.slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-slate-900 px-6 py-6 text-white shadow-[0_24px_56px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Math Vision Admin</p>
            <h1 className="mt-3 text-3xl font-black leading-tight">Admin Control Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
              Review QCM content and document library updates in one place so the admin team can manage learner-facing content with confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Link
              to="/admin/qcm"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Manage QCM
            </Link>
            <Link
              to="/admin/library"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              Manage Library
            </Link>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total QCM Questions"
          value={isLoading ? "..." : questions.length}
          subtitle="Total questions currently available in the admin question bank."
          icon={ListChecks}
        />
        <StatCard
          title="Categories"
          value={isLoading ? "..." : categories.size}
          subtitle="Distinct categories such as Algebra, Geometry, and Calculus."
          icon={BookOpenText}
        />
        <StatCard
          title="Public Documents"
          value={isLoading ? "..." : formatVisibilityCount(documents, "public")}
          subtitle="Documents visible to learners in the shared library."
          icon={Files}
        />
        <StatCard
          title="Private Documents"
          value={isLoading ? "..." : formatVisibilityCount(documents, "private")}
          subtitle="Internal or draft files that remain hidden from students."
          icon={Shield}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent QCM Updates</h2>
              <p className="mt-1 text-sm text-slate-500">Recent additions and updates in the QCM bank.</p>
            </div>
            <Link to="/admin/qcm" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Open Manager
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm font-medium text-slate-500">
                <ButtonSpinner className="h-5 w-5" />
                <span>Loading QCM overview...</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Question</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Answer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {recentQuestions.map((question) => (
                    <tr key={question.id}>
                      <td className="px-4 py-3">{question.question_text}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {question.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{question.correct_answer}</td>
                    </tr>
                  ))}

                  {!recentQuestions.length ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500">
                        No QCM questions available yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Documents</h2>
              <p className="mt-1 text-sm text-slate-500">Latest PDF uploads and their visibility state.</p>
            </div>
            <Link to="/admin/library" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Open Library
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm font-medium text-slate-500">
                <ButtonSpinner className="h-5 w-5" />
                <span>Loading document overview...</span>
              </div>
            ) : recentDocuments.length ? (
              recentDocuments.map((document) => (
                <article
                  key={document.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{document.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{document.description}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        document.visibility === "public"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {document.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                No documents uploaded yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
