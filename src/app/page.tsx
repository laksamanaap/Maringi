"use client";
import React, { useState, useRef } from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
}

const dummyQuestions: Question[] = [
  { id: "1", question: "Apa kabar", answer: "Piye kabare" },
  { id: "2", question: "Selamat pagi", answer: "Sugeng enjing" },
  { id: "3", question: "Tidak tahu", answer: "Mboten Ngertos" },
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const currentQuestion = dummyQuestions[currentIndex];

  const startRecognition = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setFeedback(
        "Browser Anda tidak mendukung Speech Recognition."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionRef.current = recognition;

    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setFeedback("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          validateAnswer(result[0].transcript);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "network") {
        setFeedback(
          "Browser Anda tidak mendukung Speech Recognition."
        );
      } else {
        setFeedback(`Terjadi kesalahan: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const validateAnswer = (userAnswer: string) => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentQuestion.answer.trim().toLowerCase();

    console.log(
      `User Answer: ${normalizedUserAnswer}, Correct Answer: ${normalizedCorrectAnswer}`)

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setScore(prevScore => prevScore + 1);
      setFeedback("Benar!");
      stopRecognition();

      // Move to next question after delay
      setTimeout(() => {
        setFeedback("");
        setTranscript("");
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 1500);

    } else if (normalizedUserAnswer.length >= normalizedCorrectAnswer.length) {
      setFeedback(`Salah, jawaban yang benar adalah: ${currentQuestion.answer}`);
      stopRecognition();

      // Clear feedback after delay but stay on same question
      setTimeout(() => {
        setFeedback("");
        setTranscript("");
      }, 2000);
    } else {
      setFeedback(`Salah!`);
      stopRecognition();

      // Clear feedback after delay but stay on same question
      setTimeout(() => {
        setFeedback("");
        setTranscript("");
      }, 2000);
    }
  };

  if (currentIndex >= dummyQuestions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            Selesai! 🎉
          </h1>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-700 mb-2">
              Skor Anda: {score} / {dummyQuestions.length}
            </p>
            <p className="text-gray-600">
              {score === dummyQuestions.length
                ? "Sempurna! Anda telah menguasai semua pertanyaan."
                : "Terus berlatih untuk meningkatkan kemampuan Anda!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">
            Belajar Bahasa Jawa
          </h1>
          <p className="text-gray-600">
            Latih pengucapan Anda dengan menjawab pertanyaan
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{currentIndex + 1}/{dummyQuestions.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / dummyQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Terjemahkan ke Bahasa Jawa:
            </h2>
            <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl">
              <p className="text-2xl font-medium text-indigo-800">
                {currentQuestion.question}
              </p>
              <button
                className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                aria-label="Play pronunciation"
              >
                <Volume2 className="w-6 h-6 text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Recording Section */}
          <div className="text-center">
            <button
              onClick={isListening ? stopRecognition : startRecognition}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-full transition-colors duration-300 ${isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
              <Mic className={`w-6 h-6 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening ? 'Berhenti' : 'Mulai Berbicara'}
            </button>

            {/* Transcript */}
            <div className={`mt-6 bg-white border-2 ${isListening ? 'border-indigo-400' : 'border-indigo-100'} p-4 rounded-xl transition-colors duration-300`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                <p className="text-sm font-medium text-gray-500">
                  {isListening ? 'Mendengarkan...' : 'Siap mendengarkan'}
                </p>
              </div>
              <p className="text-lg text-gray-800 min-h-[2rem]">
                {transcript || 'Ucapkan jawaban Anda...'}
              </p>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mt-6 p-4 rounded-lg ${feedback.includes("Benar")
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
                }`}>
                <p className="font-medium">{feedback}</p>
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-center text-gray-600">
          <p className="font-medium">
            Skor: {score}/{dummyQuestions.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;