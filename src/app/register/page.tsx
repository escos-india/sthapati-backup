"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { USER_CATEGORIES, COA_REGEX } from "@/lib/constants";

import { CategorySelectionModal } from "@/components/auth/category-selection-modal";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    coa_number: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogleSignup = () => {
    setShowGoogleModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.phone || !formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.category === "Architect") {
      if (!formData.coa_number) {
        toast({
          title: "Missing fields",
          description: "Architects must provide a valid COA Number.",
          variant: "destructive",
        });
        return;
      }
      if (!COA_REGEX.test(formData.coa_number)) {
        toast({
          title: "Invalid COA Number",
          description: "Format must be CA/YYYY/XXXXX (e.g., CA/1998/12345)",
          variant: "destructive",
        });
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          coa_number: formData.category === "Architect" ? formData.coa_number : undefined,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to Phone Verification
      router.push("/auth/verify-phone");

    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-x-12">

        {/* Left Column - Branding (Responsive) */}
        <div className="hidden md:flex md:col-span-4 flex-col items-start justify-center space-y-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full shadow-sm">
            <Logo />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Welcome to the Network.</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Connect, collaborate, and build the future of the ACE industry. Get started.
          </p>
        </div>

        {/* Right Column - Form (Always Dark to keep text White) */}
        <div className="md:col-span-6 w-full">
          <Card className="bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-xl">
            <CardHeader className="p-8 md:p-12 pb-4">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Create an Account</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 pt-2">
                Join the premier professional network for the ACE industry.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0">
              <div className="space-y-6">

                <div className="space-y-6">
                  {/* Google Sign Up */}
                  <Button
                    variant="outline"
                    className="w-full bg-slate-100 dark:bg-white text-slate-900 dark:text-black hover:bg-slate-200 dark:hover:bg-slate-200 rounded-md font-bold py-6 border-slate-200 dark:border-transparent"
                    onClick={handleGoogleSignup}
                  >
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Sign up with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-2 text-slate-500">
                        OR
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullname" className="font-bold text-slate-900 dark:text-white">Full Name</Label>
                        <Input
                          id="fullname"
                          placeholder="John Doe"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-cyan-500"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="font-bold text-slate-900 dark:text-white">I am a...</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger id="role" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                            {USER_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.category === "Architect" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="coa_number" className="font-bold text-slate-900 dark:text-white">
                          COA Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="coa_number"
                          placeholder="CA/YYYY/XXXXX"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-cyan-500 uppercase"
                          value={formData.coa_number}
                          onChange={(e) => setFormData({ ...formData, coa_number: e.target.value })}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="contact" className="font-bold text-slate-900 dark:text-white">Contact Number</Label>
                      <Input
                        id="contact"
                        placeholder="9876543210"
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full text-slate-900 dark:text-white focus:border-cyan-500"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-slate-900 dark:text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-cyan-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-bold text-slate-900 dark:text-white">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-cyan-500"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="font-bold text-slate-900 dark:text-white">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-cyan-500"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`w-full font-bold rounded-md py-6 mt-2 transition-all duration-200 ${formData.name &&
                        formData.category &&
                        formData.phone &&
                        formData.email &&
                        formData.password &&
                        formData.password &&
                        formData.confirmPassword &&
                        (formData.category !== "Architect" || formData.coa_number)
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                        }`}
                      disabled={
                        isSubmitting ||
                        (formData.category === "Architect" && !formData.coa_number) ||
                        !formData.name ||
                        !formData.category ||
                        !formData.phone ||
                        !formData.email ||
                        !formData.password ||
                        !formData.confirmPassword
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-cyan-400 hover:text-cyan-300">
                      Login here
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <CategorySelectionModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        intent="signup"
      />
    </div>
  );
}
