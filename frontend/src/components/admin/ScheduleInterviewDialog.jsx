import React, { useState } from 'react'
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { INTERVIEW_API_END_POINT } from '@/utils/constant';
import { Video, CalendarClock } from 'lucide-react';

// Local datetime string (YYYY-MM-DDTHH:mm) suitable as a min= value / default,
// set 1 hour from now so recruiters aren't tripped up by the "must be future" check.
const defaultDateTime = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

const ScheduleInterviewDialog = ({ applicationId, existingInterview, onScheduled, trigger }) => {
    const [open, setOpen] = useState(false);
    const [scheduledAt, setScheduledAt] = useState(existingInterview?.scheduledAt
        ? new Date(existingInterview.scheduledAt).toISOString().slice(0, 16)
        : defaultDateTime());
    const [durationMinutes, setDurationMinutes] = useState(existingInterview?.durationMinutes || 30);
    const [loading, setLoading] = useState(false);

    const isReschedule = Boolean(existingInterview && existingInterview.status === 'scheduled');

    const submit = async () => {
        if (!scheduledAt) {
            toast.error("Pick a date and time first.");
            return;
        }
        setLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const isoTime = new Date(scheduledAt).toISOString();
            const res = isReschedule
                ? await axios.patch(`${INTERVIEW_API_END_POINT}/${existingInterview._id}/reschedule`, { scheduledAt: isoTime })
                : await axios.post(`${INTERVIEW_API_END_POINT}/schedule/${applicationId}`, { scheduledAt: isoTime, durationMinutes });

            if (res.data.success) {
                toast.success(isReschedule ? "Interview rescheduled." : "Interview scheduled and candidate notified by email.");
                onScheduled?.(res.data.interview);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't schedule the interview.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="outline" className="gap-1.5">
                        <Video className="h-3.5 w-3.5" />
                        {isReschedule ? "Reschedule" : "Schedule interview"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        {isReschedule ? "Reschedule interview" : "Schedule interview"}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="scheduledAt">Date & time</Label>
                        <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={scheduledAt}
                            min={defaultDateTime()}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                    </div>
                    {!isReschedule && (
                        <div className="grid gap-2">
                            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                            <Input
                                id="durationMinutes"
                                type="number"
                                min={15}
                                step={15}
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                            />
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        The candidate will get an email with the interview time. Both of you can join the video call from JobHunt when it starts.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={loading}>
                        {loading ? "Saving..." : isReschedule ? "Confirm new time" : "Schedule & notify candidate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ScheduleInterviewDialog
