import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import SavedJobs from './components/SavedJobs'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import CompanyProfile from './components/CompanyProfile'
import ApplyJobForm from './components/ApplyJobForm'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from "./components/admin/AdminJobs";
import Dashboard from './components/admin/Dashboard'
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import RequireAuth from './components/shared/RequireAuth'
import InterviewRoom from './components/InterviewRoom'
import ApplicantDetail from './components/admin/ApplicantDetail'
import AdminJobDetail from './components/admin/AdminJobDetail'


const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />
  },
  {
    path: "/jobs",
    element: <Jobs />
  },
  {
    path: "/description/:id",
    element: <JobDescription />
  },
  {
    path: "/companies/:id",
    element: <CompanyProfile />
  },
  {
    path: "/jobs/:id/apply",
    element: <ApplyJobForm />
  },
  {
    path: "/browse",
    element: <Browse />
  },
  {
    path: "/profile",
    element: <RequireAuth><Profile /></RequireAuth>
  },
  {
    path: "/saved-jobs",
    element: <RequireAuth><SavedJobs /></RequireAuth>
  },
  {
    path: "/interview/:interviewId",
    element: <RequireAuth><InterviewRoom /></RequireAuth>
  },
  // admin ke liye yha se start hoga
  {
    path:"/admin/companies",
    element: <ProtectedRoute><Companies/></ProtectedRoute>
  },
  {
    path:"/admin/dashboard",
    element: <ProtectedRoute><Dashboard/></ProtectedRoute>
  },
  {
    path:"/admin/companies/create",
    element: <ProtectedRoute><CompanyCreate/></ProtectedRoute> 
  },
  {
    path:"/admin/companies/:id",
    element:<ProtectedRoute><CompanySetup/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs",
    element:<ProtectedRoute><AdminJobs/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/create",
    element:<ProtectedRoute><PostJob/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/:id",
    element:<ProtectedRoute><AdminJobDetail/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/:id/applicants",
    element:<ProtectedRoute><Applicants/></ProtectedRoute> 
  },
  {
    path:"/admin/applicants/:id",
    element:<ProtectedRoute><ApplicantDetail/></ProtectedRoute> 
  },

])
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App