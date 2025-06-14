import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

  const difficultyConfig = {
    easy: {
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-900/20",
      text: "text-green-300",
      border: "border-green-500/30",
    },
    medium: {
      color: "from-yellow-500 to-orange-500",
      bg: "bg-yellow-900/20",
      text: "text-yellow-300",
      border: "border-yellow-500/30",
    },
    hard: {
      color: "from-red-500 to-pink-500",
      bg: "bg-red-900/20",
      text: "text-red-300",
      border: "border-red-500/30",
    },
  }[difficulty] || {
    color: "from-blue-500 to-purple-500",
    bg: "bg-blue-900/20",
    text: "text-blue-300",
    border: "border-blue-500/30",
  };

  const scorePercentage = (calculateScore() / questions.length) * 100;
  const getScoreMessage = () => {
    if (scorePercentage === 100) return "Perfect! Outstanding work! 🎉";
    if (scorePercentage >= 80)
      return "Excellent! You've mastered this topic! 🌟";
    if (scorePercentage >= 60)
      return "Good job! Keep practicing to improve! 📚";
    return "Keep studying! You'll get better with practice! 💪";
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-red-900/50 to-red-800/30 text-red-200 rounded-xl sm:rounded-2xl border border-red-500/30">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          <div>
            <h3 className="font-semibold text-sm sm:text-base">
              Quiz Loading Error
            </h3>
            <p className="text-xs sm:text-sm text-red-300">
              Failed to load quiz questions. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 sm:mt-4 md:mt-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-zinc-700/50 max-w-4xl">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm p-3 sm:p-4 md:p-6 border-b border-zinc-700/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                {topic} Quiz
              </h3>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-1 flex-wrap gap-1">
                <span
                  className={`text-xs px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r ${difficultyConfig.color} text-white font-medium`}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className="text-xs sm:text-sm text-zinc-400">
                  {!showResults
                    ? `Question ${currentQuestion + 1} of ${questions.length}`
                    : "Quiz Complete"}
                </span>
              </div>
            </div>
          </div>

          {!showResults && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-12 sm:w-16 md:w-20 bg-zinc-700/50 rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-3 sm:p-4 md:p-6 text-gray-200"
          >
            <div className="mb-4 sm:mb-6">
              <h4 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 md:mb-6 text-white leading-relaxed">
                {questions[currentQuestion].question}
              </h4>
              <div className="space-y-2 sm:space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-3 sm:p-4 border rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-500/50 shadow-lg shadow-purple-500/20"
                        : "border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full mr-3 sm:mr-4 font-semibold transition-all duration-200 text-xs sm:text-sm ${
                          selectedAnswers[currentQuestion] === index
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                            : "bg-zinc-700/50 text-zinc-300"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-sm sm:text-base leading-relaxed">
                        {option}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg sm:rounded-xl border border-blue-500/30"
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-blue-300 mb-2">
                        Explanation
                      </p>
                      <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                        {questions[currentQuestion].explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 space-y-3 sm:space-y-0 gap-3">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-200 text-sm font-medium ${
                  currentQuestion === 0
                    ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                    : "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 border border-zinc-600/50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  disabled={selectedAnswers[currentQuestion] === -1}
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium ${
                    selectedAnswers[currentQuestion] === -1
                      ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white hover:from-blue-700/80 hover:to-purple-700/80 border border-blue-500/30"
                  }`}
                >
                  {showExplanation ? "Hide Explanation" : "Show Explanation"}
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQuestion] === -1}
                  className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium ${
                    selectedAnswers[currentQuestion] === -1
                      ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25"
                  }`}
                >
                  <span>
                    {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-3 sm:p-4 md:p-6 text-gray-200"
          >
            {/* Enhanced Results Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">
                {calculateScore()} / {questions.length}
              </div>
              <div className="text-base sm:text-lg md:text-xl text-purple-300 font-medium mb-2">
                {scorePercentage.toFixed(0)}% Score
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm md:text-base max-w-md mx-auto leading-relaxed px-4">
                {getScoreMessage()}
              </p>
            </div>

            {/* Score Visualization */}
            <div className="mb-6 sm:mb-8">
              <div className="w-full bg-zinc-700/50 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full shadow-lg"
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Enhanced Question Review */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <h5 className="font-semibold text-white text-base sm:text-lg mb-3 sm:mb-4 flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" />
                Question Review
              </h5>
              {questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="border border-zinc-700/50 rounded-lg sm:rounded-xl overflow-hidden bg-zinc-800/30 backdrop-blur-sm"
                >
                  <div
                    className="p-3 sm:p-4 flex items-start cursor-pointer hover:bg-zinc-700/30 transition-all duration-200"
                    onClick={() => toggleQuestionExpand(qIndex)}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0 flex items-center justify-center rounded-full mr-3 sm:mr-4 font-semibold ${
                        selectedAnswers[qIndex] === question.correctAnswer
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                      }`}
                    >
                      {selectedAnswers[qIndex] === question.correctAnswer ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h6 className="font-medium text-white pr-4 sm:pr-6 text-xs sm:text-sm md:text-base leading-relaxed">
                        {question.question}
                      </h6>
                    </div>
                    <div className="text-zinc-400 ml-2 flex-shrink-0">
                      {isQuestionExpanded(qIndex) ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isQuestionExpanded(qIndex) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-zinc-700/50"
                      >
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="font-medium text-zinc-300 mb-2">
                                Your Answer:
                              </p>
                              <p
                                className={`p-2 sm:p-3 rounded-lg ${
                                  selectedAnswers[qIndex] ===
                                  question.correctAnswer
                                    ? "bg-green-900/30 text-green-300 border border-green-500/30"
                                    : "bg-red-900/30 text-red-300 border border-red-500/30"
                                }`}
                              >
                                {selectedAnswers[qIndex] !== -1
                                  ? question.options[selectedAnswers[qIndex]]
                                  : "No answer selected"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-zinc-300 mb-2">
                                Correct Answer:
                              </p>
                              <p className="p-2 sm:p-3 rounded-lg bg-green-900/30 text-green-300 border border-green-500/30">
                                {question.options[question.correctAnswer]}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg sm:rounded-xl border border-blue-500/30">
                            <div className="flex items-start space-x-2 sm:space-x-3">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-blue-300 mb-2 text-xs sm:text-sm">
                                  Explanation:
                                </p>
                                <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                                  {question.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Enhanced Retry Button */}
            <div className="flex justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Retake Quiz</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizComponent;
