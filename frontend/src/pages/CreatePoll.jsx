import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPoll } from "@/api";
import { generateFingerprint } from "@/lib/fingerprint";
// using simple HTML elements for button and input
// no external UI components needed
import { Plus, X, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const CreatePoll = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length < 10) setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(o => o.trim()).filter(o => o.length > 0);

    if (!trimmedQuestion) {
      toast.error("Please enter a question");
      return;
    }
    if (trimmedOptions.length < 2) {
      toast.error("You need at least 2 options");
      return;
    }
    if (new Set(trimmedOptions).size !== trimmedOptions.length) {
      toast.error("Options must be unique");
      return;
    }

    setLoading(true);
    try {
      const fingerprint = generateFingerprint();
      const { poll } = await createPoll(trimmedQuestion, trimmedOptions, fingerprint);
      // store in local storage so we know owner for UI later
      localStorage.setItem(`poll-owner-${poll.id}`, fingerprint);
      navigate(`/poll/${poll.id}`);
    } catch (err) {
      toast.error("Failed to create poll: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">PollVault</h1>
          </div>
          <p className="text-muted-foreground">
            Create a poll, share the link, see results in real time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Your Question</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What should we have for lunch?"
                maxLength={200}
                className="text-base input bg-background border border-border rounded-md px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center animate-vote-in">
                    <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      maxLength={100}
                      className="input bg-background border border-border rounded-md px-3 py-2 w-full"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add option
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground rounded-md flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Create Poll"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
