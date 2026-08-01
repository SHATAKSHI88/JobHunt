import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Edit2, Building2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    useEffect(() => {
        const filteredCompany = companies.length >= 0 && companies.filter((company) => {
            if (!searchCompanyByText) {
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    }, [companies, searchCompanyByText])

    if (filterCompany?.length <= 0) {
        return (
            <div className='flex flex-col items-center justify-center text-center py-16'>
                <Building2 className='h-8 w-8 text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>No companies registered yet.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableCaption>A list of your recently registered companies</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    filterCompany?.map((company) => (
                        <TableRow key={company._id}>
                            <TableCell>
                                <Avatar className="rounded-md">
                                    <AvatarImage src={company.logo} />
                                    <AvatarFallback className="rounded-md">{company?.name?.[0]}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell className="text-muted-foreground">{company.createdAt?.split("T")[0]}</TableCell>
                            <TableCell className="text-right">
                                <button
                                    onClick={() => navigate(`/admin/companies/${company._id}`)}
                                    className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline'
                                >
                                    <Edit2 className='h-3.5 w-3.5' /> Edit
                                </button>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}

export default CompaniesTable
