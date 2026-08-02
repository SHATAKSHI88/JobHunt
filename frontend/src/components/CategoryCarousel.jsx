import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';
import { Code2, Server, BarChart3, Palette, Layers } from 'lucide-react';

const category = [
    { label: "Frontend Developer", icon: Code2 },
    { label: "Backend Developer", icon: Server },
    { label: "Data Science", icon: BarChart3 },
    { label: "Graphic Designer", icon: Palette },
    { label: "FullStack Developer", icon: Layers },
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className='bg-muted/30 border-b border-border'>
            <div className='max-w-7xl mx-auto px-4'>
                <p className='text-center text-sm font-medium text-muted-foreground pt-10'>Popular categories</p>
                <Carousel className="w-full max-w-3xl mx-auto mt-4 pb-10">
                    <CarouselContent>
                        {
                            category.map(({ label, icon: Icon }) => (
                                <CarouselItem key={label} className="basis-auto pr-3">
                                    <button
                                        onClick={() => searchJobHandler(label)}
                                        className="group flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm hover:border-primary hover:shadow-md transition-all"
                                    >
                                        <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                                            <Icon className='h-3.5 w-3.5' />
                                        </span>
                                        {label}
                                    </button>
                                </CarouselItem>
                            ))
                        }
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    )
}

export default CategoryCarousel
