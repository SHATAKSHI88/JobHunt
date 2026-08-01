import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

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
    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 my-8'>
                <div className='mb-6'>
                    <h1 className='font-heading font-extrabold text-2xl'>Applicants</h1>
                    <p className='text-muted-foreground text-sm mt-1'>{applicants?.applications?.length ?? 0} people have applied for {applicants?.title || "this role"}.</p>
                </div>
                <div className='bg-card border border-border rounded-lg overflow-hidden'>
                    <ApplicantsTable />
                </div>
            </div>
        </div>
    )
}

export default Applicants
