import { Link } from "wouter";
import { Helmet } from "react-helmet";
import AuthForm from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login - HiddenHeu</title>
        <meta 
          name="description" 
          content="Log in to your HiddenHeu account to access personalized recommendations, save favorite places, and more."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Log in to your account to continue your journey of discovering hidden gems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="login" />
              
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <p className="text-sm text-center text-gray-500">
              By logging in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
