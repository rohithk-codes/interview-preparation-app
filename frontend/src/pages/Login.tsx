
import { cn } from "@/lib/utils"
import { Button } from "../components/ui/button"
import {Link} from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../components/ui/field"
import { Input } from "../components/ui/input"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"
import { AlertCircle } from "lucide-react"



export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const navigate = useNavigate()
  const {login, loginWithGoogle} = useAuth()
 
const [formData,setFormData] = useState({
  email:"",
  password:""
})

const [error,setError] =useState("")
const [loading,setLoading] = useState(false)






const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
  setFormData({
    ...formData,
    [e.target.id]:e.target.value
  })
}

const handleSubmit = async(e:React.FormEvent)=>{
e.preventDefault()
setError("");
setLoading(true);

try {

  await login(formData.email,formData.password)
  navigate("/questions")
} catch (error:any) {
  
  setError(error.message||"Failed to login")
}finally{
  setLoading(false)
}

}

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
Sign in to continue your journey
          </CardDescription>
         
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>

              <Field>
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        setLoading(true);
                        await loginWithGoogle(credentialResponse.credential || ""); 
                        navigate("/questions");
                      } catch (err: any) {
                        setError(err.message || "Google login failed");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={() => {
                      setError("Google login failed");
                    }}
                    useOneTap
                  />
                </div>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              

              {error && (
              <div className="bg-red-100 border-red-300 border-error text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
        
                  placeholder="m@example.com"
                 value={formData.email}
                 onChange={handleChange}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                id="password"
                 type="password" 
                 value={formData.password}
                 onChange={handleChange} 

                 />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading?(<>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>):("Login")}
                </Button>
                <FieldDescription className="text-center">
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
