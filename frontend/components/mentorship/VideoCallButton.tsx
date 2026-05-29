"use client";
import { useState } from "react";
import { Video, X, ExternalLink } from "lucide-react";

interface Props {
  mentorshipId: number;
  mentorName: string;
  menteeName: string;
}

/**
 * Jitsi Meet — open-source video conferencing, Apache 2.0 license.
 * No API key, no backend, no account needed. Runs on meet.jit.si.
 * https://jitsi.org/jitsi-meet/
 */
export default function VideoCallButton({ mentorshipId, mentorName, menteeName }: Props) {
  const [open, setOpen] = useState(false);

  // Deterministic room name from mentorship ID — keeps the same room every time
  const roomName = `Nexus-Mentorship-${mentorshipId}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 font-heading font-bold text-xs transition-all hover:shadow-md"
        style={{ borderColor: "rgba(22,163,74,0.3)", color: "#16a34a", backgroundColor: "rgba(22,163,74,0.05)" }}
      >
        <Video className="w-3.5 h-3.5" />
        Start Video Call
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="font-heading font-bold text-white text-sm">
                {mentorName} ↔ {menteeName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a href={jitsiUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-heading font-semibold text-white/60 hover:text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
              </a>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Jitsi iframe */}
          <iframe
            src={`${jitsiUrl}#userInfo.displayName="${encodeURIComponent("")}"`}
            className="flex-1 w-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Video Call"
          />

          <div className="text-center py-2 text-[10px] text-white/30 font-heading">
            Powered by Jitsi Meet — open source, end-to-end encrypted
          </div>
        </div>
      )}
    </>
  );
}
