import { Link } from "wouter";
import { Helmet } from "react-helmet";
import AuthForm from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Create Account - HiddenHeu</title>
        <meta 
          name="description" 
          content="Create a free HiddenHeu account to discover hidden gems, save favorites, and get personalized recommendations for your travels in India."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Join HiddenHeu to discover unique experiences across India
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="register" />
              
              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <p className="text-sm text-center text-gray-500">
              By creating an account, you agree to our{" "}
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
