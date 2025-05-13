
import Image from 'next/image';
import AnaglyphViewer from '../components/AnaglyphViewer'; // Adjust path as needed


const Home = () => {
  return (
    <main className="min-h-screen bg-base-100 p-2 sm:p-4 flex flex-col items-center">
      <header className="my-4 sm:my-8 text-center">
        <Image
          src="/ra-logo.png"
          alt="Anaglyph Viewer Logo"
          width={200}
          height={200}
        />
      </header>
      <div className="w-full max-w-4xl">
        <AnaglyphViewer />
      </div>
  </main>
  );
}

export default Home;