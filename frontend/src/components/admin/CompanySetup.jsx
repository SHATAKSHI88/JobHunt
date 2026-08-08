import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2, UploadCloud } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const { singleCompany } = useSelector(store => store.company);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!singleCompany) return;
        setInput({
            name: singleCompany.name || "",
            description: singleCompany.description || "",
            website: singleCompany.website || "",
            location: singleCompany.location || "",
            file: singleCompany.file || null
        })
    }, [singleCompany]);

    return (
        <div>
            <Navbar />
            <div className='max-w-2xl mx-auto px-4 my-8'>
                <div className='bg-card border border-border rounded-lg p-6 sm:p-8'>
                    <form onSubmit={submitHandler}>
                        <div className='flex items-center gap-4 mb-6'>
                            <Button type="button" onClick={() => navigate("/admin/companies")} variant="outline" size="icon" className="shrink-0">
                                <ArrowLeft className='h-4 w-4' />
                            </Button>
                            <div>
                                <h1 className='font-heading font-extrabold text-xl'>Company setup</h1>
                                <p className='text-muted-foreground text-sm'>Keep your company profile up to date.</p>
                            </div>
                        </div>
                        <div className='grid sm:grid-cols-2 gap-4'>
                            <div className='space-y-1.5'>
                                <Label>Company name</Label>
                                <Input type="text" name="name" value={input.name} onChange={changeEventHandler} />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Description</Label>
                                <Input type="text" name="description" value={input.description} onChange={changeEventHandler} />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Website</Label>
                                <Input type="text" name="website" value={input.website} onChange={changeEventHandler} placeholder="https://" />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Location</Label>
                                <Input type="text" name="location" value={input.location} onChange={changeEventHandler} />
                            </div>
                            <div className='space-y-1.5 sm:col-span-2'>
                                <Label htmlFor="logo">Logo</Label>
                                <label htmlFor="logo" className='flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors'>
                                    <UploadCloud className='h-4 w-4' />
                                    {input.file?.name || "Choose a logo image"}
                                </label>
                                <input id="logo" type="file" accept="image/*" onChange={changeFileHandler} className="hidden" />
                            </div>
                        </div>
                        {
                            loading ? (
                                <Button className="w-full mt-6" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
                            ) : (
                                <Button type="submit" className="w-full mt-6">Save changes</Button>
                            )
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CompanySetup
