import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllPolls } from "@/api";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getAllPolls();
        setPolls(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Loader2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">PollVault</h1>
          </div>
          <p className="text-muted-foreground">Browse existing polls or create your own.</p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Active polls</h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {polls.length === 0 ? (
            <p className="text-muted-foreground">
              No polls yet.{' '}
              <Link to="/create" className="text-primary underline">
                Create one
              </Link>!
            </p>
          ) : (
            <ul className="space-y-3">
              {polls.map((p) => (
                <li
                  key={p.id}
                  className="border rounded-lg p-4 hover:bg-primary/5 transition-colors"
                >
                  <Link
                    to={`/poll/${p.id}`}
                    className="block font-medium text-lg"
                  >
                    {p.question}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/create"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
            >
              + Create new poll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;