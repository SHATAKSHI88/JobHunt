import React, { useState } from 'react'
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { updateApplicationStatus } from '@/redux/applicationSlice'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { FileText, Mail, GripVertical, Users } from 'lucide-react'
import { avatarColor } from '@/lib/jobType'

const columns = [
    { id: 'pending', title: 'Pending', dot: 'bg-muted-foreground' },
    { id: 'accepted', title: 'Accepted', dot: 'bg-accent' },
    { id: 'rejected', title: 'Rejected', dot: 'bg-destructive' },
]

const ApplicantCard = ({ application }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application._id,
    });
    const applicant = application.applicant;

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-card border border-border rounded-lg p-3 mb-2.5 shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className='flex items-start gap-2.5'>
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={`text-xs font-heading font-bold ${avatarColor(applicant?.fullname)}`}>
                        {applicant?.fullname?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                    <p className='font-medium text-sm truncate'>{applicant?.fullname}</p>
                    <p className='text-xs text-muted-foreground flex items-center gap-1 truncate'>
                        <Mail className='h-3 w-3 shrink-0' /> {applicant?.email}
                    </p>
                </div>
                <button
                    {...attributes}
                    {...listeners}
                    className='shrink-0 h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing touch-none'
                    aria-label="Drag to change status"
                >
                    <GripVertical className='h-3.5 w-3.5' />
                </button>
            </div>
            {
                applicant?.profile?.resume && (
                    <a
                        href={applicant.profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className='mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileText className='h-3 w-3' /> Resume
                    </a>
                )
            }
        </div>
    )
}

const Column = ({ column, applications }) => {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[260px] rounded-lg border ${isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'} p-3 transition-colors`}
        >
            <div className='flex items-center justify-between mb-3 px-1'>
                <div className='flex items-center gap-2'>
                    <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                    <h3 className='font-heading font-bold text-sm'>{column.title}</h3>
                </div>
                <span className='text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5 border border-border'>
                    {applications.length}
                </span>
            </div>
            <div className='min-h-[80px]'>
                {
                    applications.length === 0 ? (
                        <p className='text-xs text-muted-foreground text-center py-6'>Drop here</p>
                    ) : (
                        applications.map((app) => <ApplicantCard key={app._id} application={app} />)
                    )
                }
            </div>
        </div>
    )
}

const ApplicantsKanban = () => {
    const { applicants } = useSelector(store => store.application);
    const dispatch = useDispatch();
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    const applications = applicants?.applications || [];

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const applicationId = active.id;
        const newStatus = over.id;
        const application = applications.find((a) => a._id === applicationId);
        if (!application || application.status === newStatus) return;

        // optimistic update — the board should feel instant
        const previousStatus = application.status;
        dispatch(updateApplicationStatus({ applicationId, status: newStatus }));

        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
                { status: newStatus },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(`Moved to ${newStatus}`);
            }
        } catch (error) {
            // roll back on failure
            dispatch(updateApplicationStatus({ applicationId, status: previousStatus }));
            toast.error(error.response?.data?.message || "Couldn't update status.");
        }
    }

    if (applications.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center text-center py-16'>
                <Users className='h-8 w-8 text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>No one has applied yet.</p>
            </div>
        )
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className='flex gap-4 overflow-x-auto scroll-thin pb-2'>
                {
                    columns.map((column) => (
                        <Column
                            key={column.id}
                            column={column}
                            applications={applications.filter((a) => a.status === column.id)}
                        />
                    ))
                }
            </div>
        </DndContext>
    )
}

export default ApplicantsKanban
