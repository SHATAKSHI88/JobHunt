import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2, BellPlus } from 'lucide-react'
import axios from 'axios'
import { ALERTS_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CreateAlertDialog = ({ open, setOpen, criteria }) => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const [label, setLabel] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.info("Log in to create job alerts.");
            setOpen(false);
            navigate("/login");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(ALERTS_API_END_POINT, { label, ...criteria }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setOpen(false);
                setLabel("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't create this alert.");
        } finally {
            setLoading(false);
        }
    }

    const criteriaSummary = [criteria.keyword, criteria.location, criteria.jobType].filter(Boolean).join(" · ") || "All jobs";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><BellPlus className='h-4 w-4 text-primary' /> Create job alert</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitHandler}>
                    <p className='text-sm text-muted-foreground mb-4'>
                        We'll email you when a new job matching <span className='font-medium text-foreground'>{criteriaSummary}</span> is posted.
                    </p>
                    <div className='space-y-1.5'>
                        <Label htmlFor="alert-label">Name this alert</Label>
                        <Input
                            id="alert-label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Frontend roles in Pune"
                            required
                        />
                    </div>
                    <DialogFooter>
                        {
                            loading ? (
                                <Button className="w-full mt-4" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating…</Button>
                            ) : (
                                <Button type="submit" className="w-full mt-4">Create alert</Button>
                            )
                        }
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateAlertDialog
