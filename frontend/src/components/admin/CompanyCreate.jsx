import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        if (!companyName) {
            toast.error("Company name is required.");
            return;
        }
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, { companyName }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res?.data?.success) {
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        }
    }
    return (
        <div>
            <Navbar />
            <div className='max-w-xl mx-auto px-4'>
                <div className='my-10 bg-card border border-border rounded-lg p-6 sm:p-8'>
                    <h1 className='font-heading font-extrabold text-2xl'>Name your company</h1>
                    <p className='text-muted-foreground text-sm mt-1'>What would you like to call it? You can change this later.</p>

                    <div className='mt-6 space-y-1.5'>
                        <Label>Company name</Label>
                        <Input
                            type="text"
                            placeholder="JobHunt, Microsoft, etc."
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                    <div className='flex items-center gap-2 mt-6'>
                        <Button variant="outline" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                        <Button onClick={registerNewCompany}>Continue</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate
