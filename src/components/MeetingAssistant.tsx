import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic, Square, Loader2, Save, Trash2,
  FileText, History, MessageSquare,
  CheckCircle, AlertCircle, X
} from 'lucide-react';

const GEMINI_MODEL = "gemini-2.0-flash";

const MeetingAssistant: React.FC = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'municipal_admin';
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchMeetings = async () => {
      const { data, error: fetchError } = await supabase
        .from('meetings')
        .select('id, title, date, author, summary')
        .order('date', { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error("[MeetingAssistant] Fetch error:", fetchError);
      } else if (data) {
        setMeetings(data);
      }
    };

    fetchMeetings();

    const channel = supabase
      .channel('meetings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, fetchMeetings)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 6000);
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("[MeetingAssistant] Microphone error:", err);
      showError("Could not access microphone. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("AI service is not configured.");

      const ai = new GoogleGenAI({ apiKey });
      const base64Audio = await blobToBase64(audioBlob);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            parts: [
              {
                text: `You are a professional municipal secretary for the Municipality of Talibon, Bohol, Philippines.
Please transcribe the following audio recording from a local government meeting, then provide a concise summary.

Format your response EXACTLY as follows:

TRANSCRIPTION:
[Full verbatim transcription here]

SUMMARY:
- [Key discussion point 1]
- [Key decision 2]
- [Action item 3]

Be accurate, professional, and concise.`,
              },
              { inlineData: { data: base64Audio, mimeType: 'audio/webm' } },
            ],
          },
        ],
      });

      const resultText = response.text ?? '';
      const summaryIndex = resultText.indexOf('SUMMARY:');

      if (summaryIndex === -1) {
        setTranscription(resultText.replace('TRANSCRIPTION:', '').trim());
        setSummary('Unable to generate structured summary. Please review the transcription.');
      } else {
        setTranscription(
          resultText.slice(0, summaryIndex).replace('TRANSCRIPTION:', '').trim()
        );
        setSummary(resultText.slice(summaryIndex + 8).trim());
      }

      if (!title) {
        setTitle(`Municipal Meeting — ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      }
    } catch (err) {
      console.error("[MeetingAssistant] Processing error:", err);
      showError("Failed to process audio. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveMeeting = async () => {
    if (!title.trim()) {
      showError("Please provide a meeting title before saving.");
      return;
    }
    if (!summary.trim()) {
      showError("No summary to save. Please record and process audio first.");
      return;
    }

    try {
      const { error: saveError } = await supabase.from('meetings').insert([{
        title: title.trim().slice(0, 200),
        summary: summary.trim().slice(0, 10000),
        transcription: transcription.trim().slice(0, 50000),
        date: new Date().toISOString(),
        author: user?.email ?? 'Admin',
      }]);

      if (saveError) throw saveError;

      showSuccess("Meeting record saved successfully!");
      setTitle('');
      setSummary('');
      setTranscription('');
    } catch (err: any) {
      showError(err.message ?? "Failed to save meeting record.");
    }
  };

  const deleteMeeting = async (id: string) => {
    if (!window.confirm("Permanently delete this meeting record?")) return;
    try {
      const { error: deleteError } = await supabase.from('meetings').delete().eq('id', id);
      if (deleteError) throw deleteError;
      showSuccess("Meeting record deleted.");
    } catch (err: any) {
      showError(err.message ?? "Delete failed.");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="meeting-title" className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] block mb-2">
              Meeting Title
            </label>
            <input
              id="meeting-title"
              type="text"
              placeholder="e.g., Sangguniang Bayan Weekly Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full bg-brand-bg border-2 border-brand-border rounded-2xl py-4 px-6 font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
            />
          </div>

          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="civic-button-primary flex-1 py-5 flex items-center justify-center gap-3"
                aria-label="Start recording"
              >
                <Mic size={20} aria-hidden="true" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 uppercase"
                aria-label="Stop recording"
              >
                <Square size={20} aria-hidden="true" />
                Stop & Summarize
              </button>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl" role="status">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Recording in progress...</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12 bg-brand-bg rounded-[2.5rem] border-2 border-dashed border-brand-primary/20" role="status" aria-live="polite">
              <Loader2 size={40} className="text-brand-primary animate-spin mb-4" aria-hidden="true" />
              <p className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em]">AI is analyzing audio...</p>
              <p className="text-xs font-medium text-brand-muted mt-2">Transcribing and summarizing discussion points.</p>
            </div>
          )}

          {summary && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-8 bg-brand-primary/5 rounded-[2rem] border-2 border-brand-primary/10">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <CheckCircle size={14} aria-hidden="true" />
                  Generated Summary
                </h3>
                <div className="text-sm text-brand-text font-medium leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>
              </div>

              <button
                onClick={saveMeeting}
                className="w-full py-4 bg-brand-text text-white rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-text/20 uppercase"
              >
                <Save size={18} aria-hidden="true" />
                Save to Records
              </button>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2" aria-label="Transcription preview">
            <FileText size={14} aria-hidden="true" />
            Full Transcription
          </label>
          <div
            className="h-[400px] bg-brand-bg rounded-[2.5rem] p-8 overflow-y-auto border-2 border-brand-border shadow-inner"
            aria-live="polite"
            aria-label="Transcription text"
          >
            {transcription ? (
              <p className="text-sm text-brand-text leading-relaxed font-medium whitespace-pre-wrap">
                {transcription}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-brand-muted/20" aria-label="No transcription yet">
                <MessageSquare size={48} className="mb-4" aria-hidden="true" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No transcription yet</p>
                <p className="text-xs font-medium mt-2 text-center max-w-[200px]">Start recording to capture and transcribe meeting audio.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-brand-bg rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/10">
            <History size={20} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black text-brand-text tracking-tight font-display uppercase">Recent Meetings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-brand-bg rounded-[2.5rem] border-2 border-dashed border-brand-border">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">No meeting records yet</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                layout
                className="group p-8 bg-brand-bg rounded-[2.5rem] border-2 border-transparent hover:border-brand-primary/20 hover:bg-white transition-all shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
                      {meeting.title}
                    </h3>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1">
                      {new Date(meeting.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} &bull; {meeting.author}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMeeting(meeting.id)}
                    aria-label={`Delete meeting: ${meeting.title}`}
                    className="p-2 text-brand-muted/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="text-sm text-brand-muted font-medium line-clamp-3 whitespace-pre-wrap leading-relaxed">
                  {meeting.summary}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="alert"
            aria-live="assertive"
            className="fixed bottom-8 right-8 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200]"
          >
            <AlertCircle size={20} aria-hidden="true" />
            <span className="font-bold text-sm">{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error" className="ml-4 hover:opacity-70">
              <X size={18} />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-8 right-8 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[200]"
          >
            <CheckCircle size={20} aria-hidden="true" />
            <span className="font-bold text-sm">{success}</span>
            <button onClick={() => setSuccess(null)} aria-label="Dismiss success message" className="ml-4 hover:opacity-70">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingAssistant;
