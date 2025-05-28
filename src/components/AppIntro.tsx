import React from 'react';
import { FiCamera, FiChevronsRight, FiEye, FiSettings, FiXCircle } from 'react-icons/fi'; 

interface AppIntroProps {
  onDismiss: () => void;
}

export const AppIntro = ({ onDismiss }: AppIntroProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-base-100 p-6 sm:p-8 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onDismiss}
          className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2 z-10"
          aria-label="Close introduction"
        >
          <FiXCircle size={24} />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-primary text-center">Welcome to the Realtime Anaglyph Viewer!</h2>

        <div className="space-y-6 text-base-content">
        <div className="p-4 bg-base-200 rounded-lg animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xl font-semibold mb-2 flex items-center"><FiEye className="mr-2 text-accent" /> Viewing Tips</h3>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm sm:text-base">
            <li>You'll need <strong>Red/Cyan anaglyph glasses</strong> (Red lens for the left eye).</li>
            <li>The 3D effect and color depend on your camera alignment and the scene. Experiment with the parallax slider!</li>
            <li>Anaglyph 3D always involves some color compromise. This app tries to balance color and 3D effect.</li>
            <li><strong>Optimal Viewing Distance:</strong> Generally, try to be at least <strong>60-90cm</strong> away from your cameras/screen. If you are very close, the parallax might be too extreme. Use the "Anaglyph Parallax" slider to adjust if the image looks too "wide" or "separated" when you are close.</li>
          </ul>
        </div>
          <div className="p-4 bg-base-200 rounded-lg animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <FiCamera className="mr-2 text-accent" /> Camera Setup Guide
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm sm:text-base">
              <li>Use <strong>two identical webcams</strong> for best results.</li>
              <li>Place them <strong>horizontally side-by-side</strong>.</li>
              <li>Maintain a separation of <strong>65-75mm</strong>, mimicking the distance between human eyes.</li>
              <li>Ensure the cameras are <strong>parallel</strong> and aligned at the <strong>same vertical level</strong>.</li>
              <li>Avoid any <strong>roll</strong> (rotational tilt) differences between the cameras.</li>
            </ul>
          </div>

          <div className="p-4 bg-base-200 rounded-lg animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-semibold mb-2 flex items-center"><FiSettings className="mr-2 text-accent" /> Using the Controls</h3>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm sm:text-base">
              <li><strong>Select Webcams:</strong> Choose your left and right cameras from the dropdowns.</li>
              <li><strong>Start Previews:</strong> Click "Start Previews" to see the live feeds.</li>
              <li><strong>Rotate:</strong> If your cameras are mounted sideways (like on tripod), use the "Rotate Left/Right" buttons to orient the previews correctly.</li>
              <li><strong>Show Anaglyph:</strong> Once previews look good, click "Show Anaglyph".</li>
              <li><strong>Parallax Slider:</strong> Adjust this slider in anaglyph mode to fine-tune the 3D depth. If objects are too close or the effect is too strong/wide, adjust this slider (often towards 0 or negative values for close-ups).</li>
              <li><strong>Maximize View:</strong> Use the expand icon on the anaglyph display to make it larger while keeping controls accessible.</li>
            </ul>
          </div>

        </div>

        <div className="mt-8 text-center animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <button onClick={onDismiss} className="btn btn-primary btn-wide">
            Got it, Let's Start! <FiChevronsRight className="ml-2" />
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0; /* Start hidden */
        }
      `}</style>
    </div>
  );
};

