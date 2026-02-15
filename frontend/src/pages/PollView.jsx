import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { generateFingerprint, hasVotedLocally, markVotedLocally } from "@/lib/fingerprint";
import { getPoll, getVotes, vote as submitVote, deletePoll } from "@/api";
// use native button styled with tailwind
import { BarChart3, Check, Copy, Link, Loader2, Trash } from "lucide-react";
import { toast } from "sonner";


const PollView = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatorFingerprint, setCreatorFingerprint] = useState(null);

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const fetchVotes = useCallback(async () => {
    if (!id) return;
    const res = await getVotes(id);
    const counts = {};
    (res.votes || []).forEach((v) => {
      counts[v._id] = v.count;
    });
    setVotes(counts);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const loadPoll = async () => {
      try {
        const { poll, options: opts } = await getPoll(id);
        setQuestion(poll.question);
        setOptions(opts || []);
        setCreatorFingerprint(poll.creatorFingerprint || null);
        await fetchVotes();

        if (hasVotedLocally(id)) {
          setHasVoted(true);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, [id, fetchVotes]);

  // TODO: add realtime updates using WebSockets or Socket.io.
  // For now we simply refetch when a vote is submitted.

  const handleVote = async () => {
    if (!selectedOption || !id) return;

    setVoting(true);
    try {
      const fingerprint = generateFingerprint();
      await submitVote(id, selectedOption, fingerprint);
      markVotedLocally(id);
      setHasVoted(true);
      toast.success("Vote recorded!");
      await fetchVotes(); // refresh counts
    } catch (err) {
      if (err.message.includes("Already voted")) {
        toast.error("You've already voted on this poll");
        setHasVoted(true);
      } else {
        toast.error("Failed to vote: " + err.message);
      }
    } finally {
      setVoting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!id) return;
    const fingerprint = generateFingerprint();
    try {
      await deletePoll(id, fingerprint);
      localStorage.removeItem(`poll-owner-${id}`);
      toast.success("Poll deleted");
      window.location.href = "/";
    } catch (err) {
      toast.error("Cannot delete poll: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-2">Poll not found</h1>
        <p className="text-muted-foreground">This poll doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">PollVault</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">{question}</h1>
            {creatorFingerprint && (
              (() => {
                const fp = generateFingerprint();
                const stored = localStorage.getItem(`poll-owner-${id}`);
                if (fp === creatorFingerprint || stored === creatorFingerprint) {
                  return (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 text-sm text-destructive hover:underline hover:bg-destructive/10 rounded px-2 py-1 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  );
                }
                return null;
              })()
            )}
          </div>

          <div className="space-y-3">
            {options.map((opt) => {
              const count = votes[opt.id] || 0;
              const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              const isSelected = selectedOption === opt.id;

              return (
                <div key={opt.id} className="animate-vote-in">
                  {!hasVoted ? (
                    <button
                      type="button"
                      onClick={() => setSelectedOption(opt.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  ) : (
                    <div className="px-4 py-3 rounded-lg border bg-secondary/30 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/10 animate-bar-grow"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-sm font-semibold text-muted-foreground">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!hasVoted && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || voting}
              className="w-full mt-5 h-11 font-semibold bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {voting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vote"}
            </button>
          )}

          {hasVoted && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""} · Results update in real time
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Link className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy share link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollView;
