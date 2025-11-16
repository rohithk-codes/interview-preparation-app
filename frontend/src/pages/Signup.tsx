import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length < 3) {
      setError("Name should be minimum 3 letter");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(formData.email)){
       setError("Please enter a valid email address");
    return;
    }
     if (formData.password.length < 3) {
      setError("Password must be at least 3 characters");
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password do not match");
      return
    }

    setLoading(true);

    try {
      await signup(formData.name, formData.email, formData.password);
      navigate("/questions");
    } catch (error: any) {
      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to get started
                </p>
              </div>

              {error && (
                <div className="bg-red-100 text-red-800 border border-red-300 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Field>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Field>

                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  // type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Field>
                </Field>
              </Field>

              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </Field>
              <FieldSeparator>Or continue with</FieldSeparator>
              <Field className="grid grid-cols-3">
                <Button
                  variant="outline"
                  type="button"
                  className="col-start-2 justify-self-center"
                >
                  <span className="sr-only">Google</span> G
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <a href="/login" className="text-primary">
                  Sign in
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
