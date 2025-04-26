import SignIn from "@/components/shared/SignInButton";

export default function Hero() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-between py-16 md:py-24 gap-12">
        {/* Hero Left Side - Text Content */}
        <div className="flex-1 space-y-8">
          <div className="mb-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">
              Beyond Text • Beyond Static Learning
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-9xl font-bold text-white tracking-tight">
            <span className="block">RANCHO</span>
            <span className="block text-indigo-200 text-5xl font-normal">
              Where AI meets visualization in ways ChatGPT can't touch.
            </span>
          </h1>

          <p className="text-xl text-zinc-300 max-w-2xl">
            Forget static explanations and text-only responses. RANCHO
            transforms complex concepts into dynamic visualizations, relevant
            images, and interactive games that make ChatGPT, Gemini, and Claude
            feel like outdated textbooks.
          </p>

          <div className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <SignIn />
              <p className="text-zinc-400 text-sm">
                Join to learn how RANCHO can help you study smarter, not harder.
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
                <span>AI-powered visualizations</span>
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
                <span>Relevant image generation</span>
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
                <span>Interactive concept games</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right Side - Demo Visualization */}
        <div className="flex-1 w-full max-w-md">
          <div className="relative w-full h-[550px] rounded-lg overflow-hidden shadow-2xl border border-zinc-700 bg-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 z-0"></div>
            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-indigo-500/30 px-2 py-1 rounded-md text-xs text-white">
                  RANCHO AI • Smarter Than The Rest
                </div>
              </div>
              <div className="flex-1 flex flex-col space-y-4">
                <div className="bg-zinc-700/50 p-3 rounded-lg max-w-[80%] text-zinc-200">
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
                  <div className="mt-3 text-sm">
                    <p className="text-indigo-300 font-medium">
                      Would you like to:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-indigo-500/30">
                        Play Photosynthesis Game
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-indigo-500/30">
                        Take a Quiz
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-indigo-500/30">
                        See 3D Model
                      </span>
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
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Why RANCHO Outperforms Every Other AI Learning Tool
        </h2>
        <p className="text-zinc-400 text-center max-w-3xl mx-auto mb-12">
          ChatGPT gives you text. Gemini gives you images. RANCHO gives you an
          entire visual learning experience that makes complex concepts crystal
          clear.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700 transform transition-all hover:scale-105 hover:border-indigo-500/50">
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
              Visual Learning Engine
            </h3>
            <p className="text-zinc-300">
              Our proprietary visualization engine transforms abstract concepts
              into dynamic animations that make learning intuitive. Something
              ChatGPT and other text-based AIs simply can't match.
            </p>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700 transform transition-all hover:scale-105 hover:border-indigo-500/50">
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
              Contextual Image Generation
            </h3>
            <p className="text-zinc-300">
              RANCHO creates custom images and diagrams specifically designed to
              illustrate the exact concept you're learning about, making
              abstract ideas concrete and memorable.
            </p>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700 transform transition-all hover:scale-105 hover:border-indigo-500/50">
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
              Concept Playgrounds{" "}
              <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full ml-2">
                Coming Soon
              </span>
            </h3>
            <p className="text-zinc-300">
              Our revolutionary AI-generated micro games transform learning from
              passive to active. Play through concepts to truly understand them
              at a deeper level than any explanation could provide.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 border-t border-zinc-700">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Students Who Left ChatGPT for RANCHO
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                JD
              </div>
              <div>
                <h4 className="text-white font-medium">Jamie D.</h4>
                <p className="text-zinc-400 text-sm">Physics Student</p>
              </div>
            </div>
            <p className="text-zinc-300">
              "I was stuck on quantum mechanics for weeks. ChatGPT just gave me
              walls of text. RANCHO showed me an interactive visualization that
              made it click instantly. The visuals make all the difference."
            </p>
            <div className="mt-4 flex">
              <div className="flex text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mr-3">
                MS
              </div>
              <div>
                <h4 className="text-white font-medium">Maria S.</h4>
                <p className="text-zinc-400 text-sm">Biology Teacher</p>
              </div>
            </div>
            <p className="text-zinc-300">
              "I tried Gemini and Claude to help prepare my lessons, but
              RANCHO's visualizations are in a different league. The diagrams
              and animations it creates have transformed my classroom materials.
              Engagement is up 200%."
            </p>
            <div className="mt-4 flex">
              <div className="flex text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
                KT
              </div>
              <div>
                <h4 className="text-white font-medium">Kevin T.</h4>
                <p className="text-zinc-400 text-sm">Computer Science Major</p>
              </div>
            </div>
            <p className="text-zinc-300">
              "I used to bounce between ChatGPT and YouTube tutorials. RANCHO
              combines the best of both with its interactive visualizations. I
              can't wait for the upcoming concept games - they'll be a
              game-changer."
            </p>
            <div className="mt-4 flex">
              <div className="flex text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Section - Modified to focus on visualization */}
      <div className="py-16 border-t border-zinc-700">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          RANCHO vs. The Rest
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="p-4 text-left text-zinc-400">Features</th>
                <th className="p-4 text-center bg-indigo-900/30 text-white font-bold">
                  RANCHO
                </th>
                <th className="p-4 text-center text-zinc-400">ChatGPT</th>
                <th className="p-4 text-center text-zinc-400">Gemini</th>
                <th className="p-4 text-center text-zinc-400">Claude</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-700">
                <td className="p-4 text-zinc-300">
                  Interactive Visualizations
                </td>
                <td className="p-4 text-center bg-indigo-900/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <span className="text-yellow-500 text-sm">Limited</span>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="p-4 text-zinc-300">Concept Micro Games</td>
                <td className="p-4 text-center bg-indigo-900/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="p-4 text-zinc-300">Custom Diagrams & Images</td>
                <td className="p-4 text-center bg-indigo-900/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <span className="text-yellow-500 text-sm">Basic</span>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
              </tr>
              <tr>
                <td className="p-4 text-zinc-300">3D Models & Simulations</td>
                <td className="p-4 text-center bg-indigo-900/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Coming Soon - Playground Teaser - Modified to focus on micro games */}
      <div className="py-16 border-t border-zinc-700">
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-block bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Coming Soon
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Concept Micro Games: Learn by Playing
            </h2>
            <p className="text-xl text-zinc-300 mb-6 max-w-3xl">
              RANCHO is about to revolutionize learning again. Our AI will soon
              generate custom interactive micro games that transform abstract
              concepts into engaging gameplay experiences.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/30 p-4 rounded-lg border border-indigo-500/30">
                <h3 className="text-indigo-300 font-medium mb-2">
                  Physics Playground
                </h3>
                <p className="text-zinc-400 text-sm">
                  Control gravity, mass, and friction in real-time simulations
                  to master Newtonian physics through play.
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-indigo-500/30">
                <h3 className="text-indigo-300 font-medium mb-2">
                  Cell Explorer
                </h3>
                <p className="text-zinc-400 text-sm">
                  Navigate through a 3D cell, interact with organelles, and
                  complete missions to understand cellular biology.
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-indigo-500/30">
                <h3 className="text-indigo-300 font-medium mb-2">
                  Algorithm Arena
                </h3>
                <p className="text-zinc-400 text-sm">
                  Build, test, and race algorithms in a visual competition that
                  makes computer science concepts intuitive.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Join the Waitlist
              </button>
              <p className="text-zinc-400 text-sm">
                Be the first to experience our revolutionary concept micro
                games.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA - Modified to focus on visualization */}
      <div className="py-16 border-t border-zinc-700 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to See What ChatGPT Can't Show You?
        </h2>
        <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
          Join thousands of students who've discovered that learning with visual
          AI isn't just better—it's a completely different experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
          <SignIn />
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Watch Demo
          </button>
        </div>

        <div className="inline-flex items-center gap-2 text-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Your data is secure. No credit card required.</span>
        </div>
      </div>
    </div>
  );
}
