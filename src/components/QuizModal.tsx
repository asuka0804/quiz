'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  source: string;
}

interface QuizModalProps {
  isOpen: boolean;
  nodeName: string;
  onClose: () => void;
  fetchQuestions: (nodeName: string, count: number) => Promise<Question[]>;
}

export default function QuizModal({ isOpen, nodeName, onClose, fetchQuestions }: QuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuizFinished(false);
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setSubmitted(false);
      setScore(0);
      setUserAnswers({});
      startQuiz();
    }
  }, [isOpen, nodeName]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const qs = await fetchQuestions(nodeName, 10);
      console.log('获取到的题目数量：', qs.length);
      if(!qs.length) {
        alert('服务器返回空题目，请检查 Workflow 输出或 API 路由');
      }
        setQuestions(qs);
    } catch (err) {
      console.error(err);
      alert('获取题目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (key: string) => {
    if (submitted) return;
    setSelectedAnswer(key);
    // 自动提交可选，这里保持手动提交
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    const current = questions[currentIndex];
    const isCorrect = selectedAnswer === current.correct_answer;
    setUserAnswers(prev => ({ ...prev, [current.id]: selectedAnswer }));
    if (isCorrect) setScore(prev => prev + 1);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      const nextId = questions[currentIndex + 1].id;
      setSelectedAnswer(userAnswers[nextId] || null);
      setSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevId = questions[currentIndex - 1].id;
      setSelectedAnswer(userAnswers[prevId] || null);
      setSubmitted(false);
    }
  };

  const handleNextSet = () => {
    startQuiz();
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setScore(0);
    setUserAnswers({});
    setQuizFinished(false);
  };

  if (!isOpen) return null;
  if (loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">加载题目中...</div>
    </div>
  );
  if (questions.length === 0) return null;

  const current = questions[currentIndex];

  if (quizFinished) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">答题完成！</h2>
          <p className="mb-4">得分：{score} / {questions.length}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">关闭</button>
            <button onClick={handleNextSet} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">下一套</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">✕</button>
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-600">第 {currentIndex+1} / {questions.length} 题</span>
          <span className="text-sm text-gray-600">得分: {score}</span>
        </div>
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-lg font-medium">{current.question}</p>
        </div>
        <div className="space-y-2">
          {current.options.map(opt => {
            const key = opt.charAt(0);
            let btnClass = "w-full text-left p-3 rounded border transition-all";
            if (submitted) {
              if (key === current.correct_answer) btnClass += " bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400";
              else if (selectedAnswer === key) btnClass += " bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400";
              else btnClass += " bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600";
            } else {
              btnClass += selectedAnswer === key ? " bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400" : " bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700";
            }
            return (
              <button key={key} onClick={() => handleSelectAnswer(key)} disabled={submitted} className={btnClass}>
                {opt}
              </button>
            );
          })}
        </div>
        {submitted && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-sm">
            <p className="font-medium mb-1">答案解析：</p>
            <p>{current.explanation}</p>
          </div>
        )}
        <div className="flex justify-between mt-6">
          <button onClick={handlePrev} disabled={currentIndex === 0} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">上一题</button>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!selectedAnswer} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">提交答案</button>
          ) : (
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded">
              {currentIndex + 1 === questions.length ? '完成' : '下一题'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
