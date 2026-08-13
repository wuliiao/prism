import TrackList from './components/TrackList';

function App() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
        <h1 className="text-center text-4xl font-semibold tracking-normal sm:text-5xl">
          Music Visualizer
        </h1>
        <TrackList />
      </div>
    </main>
  );
}

export default App;
