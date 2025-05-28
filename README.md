# Realtime Anaglyph Maker
This web application generates a live anaglyph 3D effect using two webcams. It's built with Next.js, React, TypeScript, Three.js (via React Three Fiber), and styled with DaisyUI/Tailwind CSS. Users can preview individual camera streams, adjust rotation, fine-tune the 3D parallax, and view the combined anaglyph image feed.

## Features

* **Dual Webcam Input:** Utilizes two webcams to capture stereoscopic video.
* **Live Previews:** Displays individual feeds from both cameras before anaglyph generation.
* **Stream Rotation:** Allows independent rotation (0°, 90°, 180°, 270°) of each camera stream to correct for physical camera orientation.
* **Realtime Anaglyph:** Generates a live anaglyph 3D image using WebGL shaders.
    * Uses a simple Color Anaglyph method for better color fidelity with Red/Cyan glasses.
* **Adjustable Parallax:** Provides a slider to control the horizontal offset (depth/parallax) of the anaglyph effect.
* **User Introduction:** An initial setup guide helps users with camera positioning and app usage (persists via local storage).
* **Responsive Design:** Styled with Tailwind CSS and DaisyUI for a modern look and feel across devices.

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (with React)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **3D Rendering:** [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [DaisyUI](https://daisyui.com/)
* **Icons:** [React Icons](https://react-icons.github.io/react-icons/)

## Project Structure (Key Components)

* `components/AnaglyphViewer.tsx`: The main orchestrator component.
* `components/AppIntro.tsx`: The initial welcome and guide screen.
* `components/WebcamControls.tsx`: UI for selecting cameras, rotation, and parallax.
* `components/AnaglyphScene.tsx`: The React Three Fiber scene that renders the anaglyph.
* `hooks/useWebcamManager.ts`: Custom hook for managing webcam access, streams, and permissions.
* `lib/shaders.ts`: Contains the GLSL vertex and fragment shaders for the anaglyph effect.
* `types/index.ts`: Shared TypeScript type definitions.

## Setup and Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install Next.js, React, Three.js, React Three Fiber, DaisyUI, Tailwind CSS, React Icons, and their necessary types.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  **Introduction:** On first launch, an introduction screen will guide you through camera setup and app features.
2.  **Permissions:** Your browser will request permission to access your webcams. Please allow this.
3.  **Camera Selection:**
    * Use the dropdown menus to select the appropriate webcam for the "Left Eye" and "Right Eye".
    * If camera names are generic, ensure permissions are granted and try refreshing the list.
4.  **Start Previews:** Click "Start Previews" to see the live feeds from your selected cameras.
5.  **Adjust Rotation:**
    * If your cameras are mounted sideways or upside down, use the "Rotate Left" and "Rotate Right" buttons to orient each preview correctly.
6.  **Show Anaglyph:**
    * Once the previews are set up and correctly oriented, click "Show Anaglyph".
7.  **Adjust Parallax:**
    * Use the "Anaglyph Parallax (Depth)" slider to fine-tune the 3D effect.
    * Moving the slider changes the horizontal separation of the left and right eye images.
    * If the image appears "too wide" or objects are hard to fuse (especially close-ups), try moving the slider towards 0 or into negative values.
8.  **Maximize View:**
    * Click the expand icon on the anaglyph display to toggle a larger, more immersive view. The controls will remain accessible.
9.  **Stop Streams:**
    * Click "Stop All Streams" to release the webcams and return to the initial setup state.

## Camera Setup Tips for Best 3D Effect

* **Identical Cameras:** Using two identical webcams is highly recommended for consistent image quality and field of view.
* **Horizontal Alignment:** Position the cameras side-by-side, as close to the same vertical level as possible.
* **Separation (Interaxial Distance):**
    * A separation of about **65-75mm (2.5 - 3 inches)** is ideal, mimicking human interpupillary distance. This is crucial for a natural 3D effect.
    * Too little separation results in a flat image; too much can cause eye strain or make fusion difficult.
* **Parallel Alignment:** Ensure both cameras are pointing straight ahead and are parallel to each other. Avoid "toeing-in" (angling cameras towards each other) unless you are intentionally trying to set a very specific close convergence point.
* **No Roll:** Make sure neither camera is tilted rotationally along its lens axis relative to the other.
* **Stable Mounting:** Use a tripod or a stable mount to prevent camera shake and maintain alignment.
* **Lighting:** Good, even lighting on your subject will improve image quality for both cameras.

## Notes on Anaglyph 3D

* **Glasses:** You will need **Red/Cyan anaglyph glasses** to view the 3D effect (Red lens over the left eye).
* **Color Fidelity:** Anaglyph 3D inherently involves color filtering, which means the final image will not have perfect color reproduction. This application uses the Dubois algorithm, which is optimized for better color retention compared to simpler methods but still involves compromise.
* **Ghosting:** Some "ghosting" (where faint parts of the other eye's image are visible) can occur, depending on the anaglyph algorithm, screen calibration, and glasses quality.
* **Eye Strain:** If you experience eye strain, take breaks. Adjusting the parallax slider can often help find a more comfortable viewing depth.

## Future Enhancements (Ideas/ToDos)
* Implement different anaglyph such as the [Dubois Anaglyph algorithm](https://www.site.uottawa.ca/~edubois/anaglyph/)
* Implement different anaglyph algorithms  (e.g., grayscale, half-color, other optimized matrices) selectable by the user.
* Add on-screen guides for camera alignment.
* Option to record or take snapshots of the anaglyph output.
* Vertical offset adjustment if cameras are not perfectly level.
---

Feel free to contribute or suggest improvements!
