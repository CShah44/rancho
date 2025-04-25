import SignIn from "@/components/shared/SignInButton";

export default function Hero() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-between py-16 md:py-24 gap-12">
        {/* Hero Left Side - Text Content */}
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-9xl font-bold text-white tracking-tight">
            <span className="block">RANCHO</span>
            <span className="block text-indigo-200 text-5xl font-normal">
              I&apos;m here to change the way you learn.
            </span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl">
            Experience learning like never before with visual animations,
            interactive quizzes, and personalized explanations - all in one
            intelligent platform.
          </p>

          <div className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <SignIn />
              <p className="text-zinc-400 text-sm">
                Start learning smarter, not harder. Join in seconds.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-700">
            <div className="flex flex-wrap gap-6 items-center text-zinc-400">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Visual learning</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Interactive quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Personalized learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right Side - Demo Visualization */}
        <div className="flex-1 w-full max-w-md">
          <div className="relative w-full h-[550px] rounded-lg overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 z-0"></div>
            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-zinc-700/50 p-3 rounded-lg max-w-[80%] text-zinc-200">
                  {/* <p className="font-medium">RANCHO</p> */}
                  <p>How can I help with your studies today?</p>
                </div>
                <div className="bg-indigo-500/30 p-3 rounded-lg max-w-[80%] self-end text-zinc-200">
                  Can you explain photosynthesis with a visual?
                </div>
                <div className="bg-zinc-700/50 p-3 rounded-lg max-w-[80%] text-zinc-200">
                  <p>
                    Of course! Here&apos;s a visual explanation of
                    photosynthesis:
                  </p>
                  <div className="mt-2 bg-indigo-900/30 rounded-md p-3 text-center">
                    <div className="relative aspect-video bg-black/40 rounded overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
                      <div className="w-12 h-12 rounded-full bg-indigo-500/50 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="absolute bottom-2 left-2 text-xs text-white/70">
                        Photosynthesis Process
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 border-t border-zinc-700">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How RANCHO Transforms Learning
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Visual Learning
            </h3>
            <p className="text-zinc-300">
              Every concept comes to life with custom animations and images that
              make complex topics easy to understand.
            </p>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Interactive Quizzes
            </h3>
            <p className="text-zinc-300">
              Test your knowledge with adaptive quizzes that adjust to your
              learning pace and help reinforce key concepts.
            </p>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              All-in-One Interface
            </h3>
            <p className="text-zinc-300">
              No more juggling between apps. Get explanations, visualizations,
              and assessments all in one seamless experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
