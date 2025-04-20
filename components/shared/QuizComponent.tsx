import React, { useState } from "react";
import { motion } from "framer-motion";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizProps {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

const QuizComponent: React.FC<QuizProps> = ({
  topic,
  difficulty,
  questions,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (showResults) return;

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index].correctAnswer ? score + 1 : score;
    }, 0);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array(questions.length).fill(-1));
    setShowResults(false);
    setShowExplanation(false);
    setExpandedQuestions([]);
  };

  const toggleQuestionExpand = (index: number) => {
    setExpandedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isQuestionExpanded = (index: number) => {
    return expandedQuestions.includes(index);
  };

  const difficultyColor =
    {
      easy: "bg-green-900 text-green-300",
      medium: "bg-yellow-900 text-yellow-300",
      hard: "bg-red-900 text-red-300",
    }[difficulty] || "bg-blue-900 text-blue-300";

  if (!questions || questions.length === 0) {
    return (
      <div className="p-4 bg-red-900 text-red-200 rounded-lg">
        Failed to load quiz questions.
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-900 rounded-lg shadow-md overflow-hidden w-full max-w-2xl border border-gray-700">
      <div className="bg-indigo-900 p-4 text-white">
        <h3 className="text-xl font-bold">{topic} Quiz</h3>
        <div className="flex items-center mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <span className="ml-auto text-sm text-gray-300">
            {!showResults
              ? `Question ${currentQuestion + 1}/${questions.length}`
              : "Results"}
          </span>
        </div>
      </div>

      {!showResults ? (
        <div className="p-4 text-gray-200">
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-3 text-white">
              {questions[currentQuestion].question}
            </h4>
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion] === index
                      ? "bg-indigo-800 border-indigo-600"
                      : "border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                        selectedAnswers[currentQuestion] === index
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {showExplanation && (
            <div className="mt-4 p-3 bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-200">
                <span className="font-bold">Explanation: </span>
                {questions[currentQuestion].explanation}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-md ${
                currentQuestion === 0
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Previous
            </button>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              disabled={selectedAnswers[currentQuestion] === -1}
              className={`px-4 py-2 rounded-md ${
                selectedAnswers[currentQuestion] === -1
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-blue-900 text-blue-200 hover:bg-blue-800"
              }`}
            >
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestion] === -1}
              className={`px-4 py-2 rounded-md ${
                selectedAnswers[currentQuestion] === -1
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-800 text-white hover:bg-indigo-700"
              }`}
            >
              {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-gray-200">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2 text-white">
              {calculateScore()} / {questions.length}
            </div>
            <p className="text-gray-400">
              {calculateScore() === questions.length
                ? "Perfect score! Excellent work!"
                : calculateScore() >= questions.length * 0.8
                ? "Great job! You've mastered this topic."
                : calculateScore() >= questions.length * 0.6
                ? "Good effort! Keep practicing to improve."
                : "Keep studying! You'll get better with practice."}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800"
              >
                <div
                  className="p-3 flex items-start cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => toggleQuestionExpand(qIndex)}
                >
                  <div
                    className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full mr-3 ${
                      selectedAnswers[qIndex] === question.correctAnswer
                        ? "bg-green-700 text-green-200"
                        : "bg-red-700 text-red-200"
                    }`}
                  >
                    {selectedAnswers[qIndex] === question.correctAnswer
                      ? "✓"
                      : "✗"}
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-medium text-white pr-6">
                      {question.question}
                    </h5>
                  </div>
                  <div className="text-gray-400 ml-2">
                    {isQuestionExpanded(qIndex) ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {isQuestionExpanded(qIndex) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4 border-t border-gray-700"
                  >
                    <div className="pt-3 text-sm">
                      <p className="mb-2">
                        <span className="font-medium text-gray-300">
                          Your answer:
                        </span>{" "}
                        <span
                          className={
                            selectedAnswers[qIndex] === question.correctAnswer
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {selectedAnswers[qIndex] !== -1
                            ? question.options[selectedAnswers[qIndex]]
                            : "No answer selected"}
                        </span>
                      </p>
                      <p className="mb-2">
                        <span className="font-medium text-gray-300">
                          Correct answer:
                        </span>{" "}
                        <span className="text-green-400">
                          {question.options[question.correctAnswer]}
                        </span>
                      </p>
                      <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                        <p className="text-gray-300">
                          <span className="font-medium text-gray-200">
                            Explanation:
                          </span>{" "}
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetQuiz}
              className="px-6 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
