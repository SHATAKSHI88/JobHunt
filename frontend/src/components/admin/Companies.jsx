import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import PageTransition from '../shared/PageTransition'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'
import { Plus, Search } from 'lucide-react'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSearchCompanyByText(input));
    }, [input]);
    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='max-w-6xl mx-auto px-4 my-8'>
                <div className='flex items-center justify-between mb-6'>
                    <div>
                        <h1 className='font-heading font-extrabold text-2xl'>Companies</h1>
                        <p className='text-muted-foreground text-sm mt-1'>Manage the companies you recruit for.</p>
                    </div>
                    <Button onClick={() => navigate("/admin/companies/create")}>
                        <Plus className='h-4 w-4 mr-2' /> New company
                    </Button>
                </div>
                <div className='relative mb-4 max-w-xs'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                        className="pl-9"
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <div className='bg-card border border-border rounded-lg overflow-hidden'>
                    <CompaniesTable />
                </div>
            </div>
        </PageTransition>
        </div>
    )
}

export default Companies
