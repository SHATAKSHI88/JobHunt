import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";

dotenv.config({});

const companyDefs = [
    {
        name: "TechNova",
        description: "A product-led SaaS company building tools for remote teams.",
        website: "https://technova.example.com",
        location: "Bangalore",
    },
    {
        name: "BrightPath Analytics",
        description: "Data and analytics consultancy for mid-market retailers.",
        website: "https://brightpathanalytics.example.com",
        location: "Pune",
    },
    {
        name: "Skyline Software",
        description: "Enterprise software for logistics and supply chain.",
        website: "https://skylinesoftware.example.com",
        location: "Hyderabad",
    },
    {
        name: "GreenLeaf Consulting",
        description: "Sustainability-focused management consulting.",
        website: "https://greenleafconsulting.example.com",
        location: "Delhi NCR",
    },
    {
        name: "Nimbus Cloud Systems",
        description: "Cloud infrastructure and DevOps tooling for startups.",
        website: "https://nimbuscloud.example.com",
        location: "Mumbai",
    },
];

const jobDefs = [
    {
        title: "Frontend Developer",
        companyName: "TechNova",
        description: "Build and maintain our customer-facing React dashboard used by thousands of teams daily.",
        requirements: ["React", "JavaScript", "Tailwind CSS", "REST APIs"],
        salary: 8,
        location: "Bangalore",
        jobType: "Full-time",
        experience: 2,
        position: 3,
    },
    {
        title: "Backend Developer",
        companyName: "TechNova",
        description: "Design and scale our Node.js/Express services and MongoDB data layer.",
        requirements: ["Node.js", "Express", "MongoDB", "REST APIs"],
        salary: 10,
        location: "Bangalore",
        jobType: "Full-time",
        experience: 3,
        position: 2,
    },
    {
        title: "Data Analyst Intern",
        companyName: "BrightPath Analytics",
        description: "Support our analytics team with dashboards, reporting, and ad-hoc data requests.",
        requirements: ["SQL", "Excel", "Python", "Data Visualization"],
        salary: 3,
        location: "Pune",
        jobType: "Internship",
        experience: 0,
        position: 4,
    },
    {
        title: "FullStack Developer",
        companyName: "Skyline Software",
        description: "Work across our React frontend and Node backend on logistics tracking features.",
        requirements: ["React", "Node.js", "MongoDB", "TypeScript"],
        salary: 12,
        location: "Hyderabad",
        jobType: "Full-time",
        experience: 3,
        position: 2,
    },
    {
        title: "UI/UX Designer",
        companyName: "Skyline Software",
        description: "Own end-to-end design for our supply-chain web app, from research to high-fidelity mockups.",
        requirements: ["Figma", "User research", "Design systems"],
        salary: 9,
        location: "Hyderabad",
        jobType: "Contract",
        experience: 2,
        position: 1,
    },
    {
        title: "Business Analyst",
        companyName: "GreenLeaf Consulting",
        description: "Partner with clients to translate sustainability goals into actionable business plans.",
        requirements: ["Excel", "PowerPoint", "Communication"],
        salary: 7,
        location: "Delhi NCR",
        jobType: "Full-time",
        experience: 1,
        position: 2,
    },
    {
        title: "DevOps Engineer",
        companyName: "Nimbus Cloud Systems",
        description: "Manage CI/CD pipelines and cloud infrastructure for our client-facing platforms.",
        requirements: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        salary: 14,
        location: "Mumbai",
        jobType: "Full-time",
        experience: 4,
        position: 1,
    },
    {
        title: "Marketing Associate (Part-time)",
        companyName: "Nimbus Cloud Systems",
        description: "Help run our content calendar, social channels, and email campaigns.",
        requirements: ["Content writing", "Social media", "Basic analytics"],
        salary: 4,
        location: "Mumbai",
        jobType: "Part-time",
        experience: 0,
        position: 2,
    },
];

const seed = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is not set in your .env file. Nothing to connect to.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...\n");

        // --- demo recruiter ---
        let recruiter = await User.findOne({ email: "recruiter@jobhunt.dev" });
        if (!recruiter) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            recruiter = await User.create({
                fullname: "Alex Recruiter",
                email: "recruiter@jobhunt.dev",
                phoneNumber: "9999999999",
                password: hashedPassword,
                role: "recruiter",
            });
            console.log("✔ Created demo recruiter (recruiter@jobhunt.dev / password123)");
        } else {
            console.log("• Demo recruiter already exists, reusing it.");
        }

        // --- demo student ---
        const studentExists = await User.findOne({ email: "student@jobhunt.dev" });
        if (!studentExists) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            await User.create({
                fullname: "Sam Student",
                email: "student@jobhunt.dev",
                phoneNumber: "8888888888",
                password: hashedPassword,
                role: "student",
                profile: { bio: "Aspiring developer exploring frontend roles.", skills: ["React", "JavaScript"] },
            });
            console.log("✔ Created demo student (student@jobhunt.dev / password123)");
        } else {
            console.log("• Demo student already exists, reusing it.");
        }

        // --- companies ---
        const companies = {};
        for (const def of companyDefs) {
            let company = await Company.findOne({ name: def.name });
            if (!company) {
                company = await Company.create({ ...def, userId: recruiter._id });
                console.log(`✔ Created company: ${def.name}`);
            } else {
                console.log(`• Company already exists: ${def.name}`);
            }
            companies[def.name] = company;
        }

        // --- jobs ---
        let jobsCreated = 0;
        for (const def of jobDefs) {
            const company = companies[def.companyName];
            const exists = await Job.findOne({ title: def.title, company: company._id });
            if (!exists) {
                await Job.create({
                    title: def.title,
                    description: def.description,
                    requirements: def.requirements,
                    salary: def.salary,
                    location: def.location,
                    jobType: def.jobType,
                    experienceLevel: def.experience,
                    position: def.position,
                    company: company._id,
                    created_by: recruiter._id,
                });
                jobsCreated++;
            }
        }
        console.log(`✔ Created ${jobsCreated} job posting(s) (skipped any that already existed).`);

        console.log("\nSeeding complete!\n");
        console.log("Log in as recruiter: recruiter@jobhunt.dev / password123");
        console.log("Log in as student:   student@jobhunt.dev / password123\n");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
