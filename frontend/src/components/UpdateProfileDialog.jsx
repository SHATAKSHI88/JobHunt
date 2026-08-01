import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.map(skill => skill).join(", ") || "",
        file: user?.profile?.resume || ""
    });
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.file instanceof File) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[440px]" onInteractOutside={() => setOpen(false)}>
                <DialogHeader>
                    <DialogTitle>Update profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitHandler}>
                    <div className='grid gap-4 py-2'>
                        <div className='space-y-1.5'>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="fullname" type="text" value={input.fullname} onChange={changeEventHandler} />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={input.email} onChange={changeEventHandler} />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor="number">Phone number</Label>
                            <Input id="number" name="phoneNumber" value={input.phoneNumber} onChange={changeEventHandler} />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor="bio">Bio</Label>
                            <Input id="bio" name="bio" value={input.bio} onChange={changeEventHandler} />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor="skills">Skills</Label>
                            <Input id="skills" name="skills" value={input.skills} onChange={changeEventHandler} placeholder="React, Node.js, SQL" />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor="file">Resume (PDF)</Label>
                            <Input id="file" name="file" type="file" accept="application/pdf" onChange={fileChangeHandler} className="cursor-pointer" />
                        </div>
                    </div>
                    <DialogFooter>
                        {
                            loading ? (
                                <Button className="w-full mt-2" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
                            ) : (
                                <Button type="submit" className="w-full mt-2">Save changes</Button>
                            )
                        }
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateProfileDialog
