import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 1,
        companyId: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
        setInput({ ...input, companyId: selectedCompany._id });
    };

    const jobTypeChangeHandler = (value) => {
        setInput({ ...input, jobType: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-3xl mx-auto px-4 my-8'>
                <div className='bg-card border border-border rounded-lg p-6 sm:p-8'>
                    <h1 className='font-heading font-extrabold text-2xl mb-1'>Post a new job</h1>
                    <p className='text-muted-foreground text-sm mb-6'>Fill in the details candidates will see.</p>

                    <form onSubmit={submitHandler}>
                        <div className='grid sm:grid-cols-2 gap-4'>
                            <div className='space-y-1.5'>
                                <Label>Title</Label>
                                <Input type="text" name="title" value={input.title} onChange={changeEventHandler} required />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Location</Label>
                                <Input type="text" name="location" value={input.location} onChange={changeEventHandler} required />
                            </div>
                            <div className='space-y-1.5 sm:col-span-2'>
                                <Label>Description</Label>
                                <Input type="text" name="description" value={input.description} onChange={changeEventHandler} required />
                            </div>
                            <div className='space-y-1.5 sm:col-span-2'>
                                <Label>Requirements <span className='text-muted-foreground font-normal'>(comma-separated)</span></Label>
                                <Input type="text" name="requirements" value={input.requirements} onChange={changeEventHandler} placeholder="React, Node.js, SQL" required />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Salary (LPA)</Label>
                                <Input type="number" name="salary" value={input.salary} onChange={changeEventHandler} required />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Experience (years)</Label>
                                <Input type="number" name="experience" value={input.experience} onChange={changeEventHandler} required />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Job type</Label>
                                <Select onValueChange={jobTypeChangeHandler} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {jobTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Number of positions</Label>
                                <Input type="number" min={1} name="position" value={input.position} onChange={changeEventHandler} required />
                            </div>
                            {
                                companies.length > 0 && (
                                    <div className='space-y-1.5 sm:col-span-2'>
                                        <Label>Company</Label>
                                        <Select onValueChange={selectChangeHandler} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a company" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {
                                                        companies.map((company) => (
                                                            <SelectItem key={company._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )
                            }
                        </div>

                        {
                            loading ? (
                                <Button className="w-full mt-6" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
                            ) : (
                                <Button type="submit" className="w-full mt-6">Post job</Button>
                            )
                        }
                        {
                            companies.length === 0 && (
                                <p className='text-sm text-destructive text-center mt-3'>Please register a company first, before posting a job.</p>
                            )
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PostJob
