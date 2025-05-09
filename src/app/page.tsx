
import AnaglyphViewer from '../components/AnaglyphViewer'; // Adjust path

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 p-4 flex flex-col items-center">
      <header className="my-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">Anaglyph Viewer</h1>
        <p className="text-sm sm:text-md text-neutral-content mt-1">
          (React Three Fiber, Next.js, TypeScript & DaisyUI)
        </p>
      </header>
      <div className="w-full max-w-3xl">
        <AnaglyphViewer />
      </div>
    </main>
  );
}