import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SignupForm } from "./pages/Signup";
import { LoginForm } from "./pages/Login";

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
        </Routes>
<<<<<<< HEAD

        <Route path="/" element={<Navigate to="/login" replace/>}/>
        <Route path="*" element={<Navigate to="/login" replace/>}/>
=======
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
      </Router>
    </AuthProvider>
  );
}

export default App;
