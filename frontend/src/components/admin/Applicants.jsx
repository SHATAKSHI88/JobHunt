import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import ApplicantsKanban from './ApplicantsKanban'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { LayoutGrid, List, Download, ArrowLeft } from 'lucide-react';
import { downloadCSV } from '@/lib/csvExport';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { applicants } = useSelector(store => store.application);
    const [view, setView] = useState('board'); // 'board' | 'table'

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    }, []);

    const exportHandler = () => {
        const rows = (applicants?.applications || []).map((item) => ({
            "Full name": item?.applicant?.fullname || "",
            "Email": item?.applicant?.email || "",
            "Phone": item?.applicant?.phoneNumber || "",
            "Status": item.status,
            "Match score": item.matchScore ?? "",
            "Applied on": item?.applicant?.createdAt?.split("T")[0] || "",
            "Resume": item?.applicant?.profile?.resume || "",
        }));
        downloadCSV(`${applicants?.title || "applicants"}-${new Date().toISOString().split("T")[0]}`, rows);
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 my-8'>
                <div className='flex items-start justify-between flex-wrap gap-3 mb-6'>
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/admin/jobs')}
                            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className='h-3.5 w-3.5 mr-1.5' /> Back to jobs
                        </Button>
                        <h1 className='font-heading font-extrabold text-2xl'>Applicants</h1>
                        <p className='text-muted-foreground text-sm mt-1'>{applicants?.applications?.length ?? 0} people have applied for {applicants?.title || "this role"}.</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportHandler}
                            disabled={!applicants?.applications?.length}
                        >
                            <Download className='h-3.5 w-3.5 mr-1.5' /> Export CSV
                        </Button>
                        <div className='inline-flex rounded-md border border-border p-0.5 bg-muted/40'>
                            <button
                                onClick={() => setView('board')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'board' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <LayoutGrid className='h-3.5 w-3.5' /> Board
                            </button>
                            <button
                                onClick={() => setView('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <List className='h-3.5 w-3.5' /> Table
                            </button>
                        </div>
                    </div>
                </div>

                {
                    view === 'board' ? (
                        <ApplicantsKanban />
                    ) : (
                        <div className='bg-card border border-border rounded-lg overflow-hidden'>
                            <ApplicantsTable />
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Applicants
