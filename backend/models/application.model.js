import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected'],
        default:'pending'
    },
    // Populated by the Gemini resume-vs-JD matcher when the job has a JD
    // PDF attached. null means "not scored" (no JD on the job, or the
    // scoring call failed) rather than "scored zero".
    matchScore: {
        type: Number,
        default: null,
    },
    matchSummary: {
        type: String,
    },
    // Richer, on-demand per-skill breakdown — generated only when a
    // recruiter opens the applicant's detail page and clicks "Analyze",
    // then cached here so it isn't re-generated (and re-billed) on every visit.
    detailedAnalysis: {
        skillScores: [{
            skill: String,
            score: Number, // 0-10
            comment: String,
        }],
        overallScore: Number, // 0-10
        overallSummary: String,
        generatedAt: Date,
    },
    // Screening questions collected on the "Apply" form, submitted once
    // per application (not stored on the user's profile, since answers
    // like "do you have a relative at this company" are role-specific).
    gender: {
        type: String,
        enum: ['male', 'female', 'prefer_not_to_say'],
        required: true,
    },
    hasDisability: {
        type: Boolean,
        required: true,
    },
    disabilityDetails: {
        type: String,
        trim: true,
    },
    hasRelativeAtCompany: {
        type: Boolean,
        required: true,
    },
    relativeDetails: {
        type: String,
        trim: true,
    },
    nationality: {
        type: String,
        required: true,
        trim: true,
    },
    agreedToTerms: {
        type: Boolean,
        required: true,
    },
},{timestamps:true});
export const Application  = mongoose.model("Application", applicationSchema);
