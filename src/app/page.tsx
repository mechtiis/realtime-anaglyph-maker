import Image from "next/image";

// intro for real time anaglyph maker with two webcams
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Real Time Anaglyph Maker</h1>
      <p className="mt-4 text-lg">
        This is a simple web application that uses two webcams to create a real-time anaglyph image.
      </p>
      <div className="mt-8">
        <Image
          src="/next.svg"
          alt="Anaglyph Image"
          width={500}
          height={500}
        />
      </div>
      <p className="mt-4 text-lg">
        To use this application, you will need two webcams. The application will use the left webcam to capture the left image and the right webcam to capture the right image. The two images will be combined to create a 3D anaglyph image.
      </p>
      <p className="mt-4 text-lg">
        Click the button below to start capturing images from your webcams.
      </p>
      <button className="mt-8 px-4 py-2 bg-blue-500 text-white rounded">
        Start Capturing
      </button>
      <p className="mt-4 text-lg">
        Note: This application is still in development and may not work perfectly on all devices.
      </p>
    </main>
  );
}
