import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SignupForm } from "./pages/Signup";
import { LoginForm } from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Questions from "./components/questions/Questions";
import Dashboard from "./pages/Dashboard";
import QuestionDetail from "./pages/QuestionDetail";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/signup"
            element={
              <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                  <SignupForm />
                </div>
              </div>
            }
          />

          <Route
            path="/login"
            element={
              <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                  <LoginForm />
                </div>
              </div>
            }
          />
          <Route path="/questions"element={
            <ProtectedRoute>
        <Questions/>
          </ProtectedRoute>}/>

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          }/>

          <Route path="/questions/:id" element={
<ProtectedRoute>
  <QuestionDetail/>
</ProtectedRoute>
          }/>

          <Route path="/" element={<Navigate to="/questions" replace/>}/>
        <Route path="*" element={<Navigate to="/questions" replace/>}/>
        </Routes>


      </Router>
    </AuthProvider>
  );
}

export default App;
