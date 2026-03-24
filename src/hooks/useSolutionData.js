import { useEffect, useState } from "react";

import { formulaService } from "../services/formulaService.js";

const DEFAULT_ERROR_MESSAGE = "The math expression is invalid. Please check it again.";

export const useSolutionData = ({ expression, prefetchedSolution }) => {
  const [solution, setSolution] = useState(prefetchedSolution || null);
  const [isLoading, setIsLoading] = useState(!prefetchedSolution);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadSolution = async () => {
      const trimmedExpression = expression.trim();

      if (!trimmedExpression) {
        setSolution(null);
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
        setIsLoading(false);
        return;
      }

      if (prefetchedSolution) {
        setSolution(prefetchedSolution);
        setErrorMessage("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await formulaService.solve(trimmedExpression);

        if (!isCancelled) {
          setSolution(result);
        }
      } catch (error) {
        if (!isCancelled) {
          setSolution(null);
          setErrorMessage(error.response?.data?.message || DEFAULT_ERROR_MESSAGE);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSolution();

    return () => {
      isCancelled = true;
    };
  }, [expression, prefetchedSolution]);

  return {
    solution,
    isLoading,
    errorMessage,
    setErrorMessage
  };
};
