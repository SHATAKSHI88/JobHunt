import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DailyIframe from '@daily-co/daily-js'
import Navbar from './shared/Navbar'
import { Button } from './ui/button'
import { INTERVIEW_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Loader2, PhoneOff, ArrowLeft } from 'lucide-react'

// Renders a Daily.co prebuilt call inside the app. We fetch a fresh,
// short-lived join token every time this page loads rather than storing
// one — tokens are scoped to one room + one person + a 30 min window,
// minted by the backend only after it confirms the requester is the
// recruiter or candidate on this specific interview.
const InterviewRoom = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const callFrameRef = useRef(null);
    const containerRef = useRef(null);
    const [status, setStatus] = useState('loading'); // loading | joined | error | ended
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        const setup = async () => {
            try {
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${INTERVIEW_API_END_POINT}/${interviewId}/join`);
                if (cancelled) return;
                if (!res.data.success) throw new Error(res.data.message);

                const { roomUrl, token } = res.data;
                const callFrame = DailyIframe.createFrame(containerRef.current, {
                    iframeStyle: {
                        width: '100%',
                        height: '100%',
                        border: '0',
                    },
                    showLeaveButton: true,
                    showFullscreenButton: true,
                });
                callFrameRef.current = callFrame;

                callFrame.on('left-meeting', () => setStatus('ended'));

                await callFrame.join({ url: roomUrl, token });
                if (!cancelled) setStatus('joined');
            } catch (error) {
                if (cancelled) return;
                setStatus('error');
                setErrorMessage(error.response?.data?.message || error.message || "Couldn't join the interview.");
            }
        };

        setup();

        return () => {
            cancelled = true;
            callFrameRef.current?.destroy();
        };
    }, [interviewId]);

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col bg-black">
                {status === 'loading' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm text-white/70">Connecting to your interview...</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white px-4 text-center">
                        <p className="text-sm text-white/80">{errorMessage}</p>
                        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Go back
                        </Button>
                    </div>
                )}
                {status === 'ended' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white px-4 text-center">
                        <PhoneOff className="h-6 w-6 text-white/70" />
                        <p className="text-sm text-white/80">You've left the interview.</p>
                        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to JobHunt
                        </Button>
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="flex-1"
                    style={{ display: status === 'joined' ? 'block' : 'none' }}
                />
            </div>
        </div>
    )
}

export default InterviewRoom
