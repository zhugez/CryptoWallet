import { AuthApi } from '@/apis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PATHS } from '@/utils/enums';
import { IRegister } from '@/utils/interface';
import { FormSubmit, InputChange } from '@/utils/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiMail, FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import zxcvbn from 'zxcvbn';
interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<RegisterForm> = {};

    // Email validation
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setForm(prev => ({ ...prev, password }));
    // Check password strength
    const result = zxcvbn(password);
    setPasswordStrength(result.score);
  };

  const getStrengthColor = () => {
    const colors = ['red', 'orange', 'yellow', 'light-green', 'green'];
    return colors[passwordStrength];
  };

  const handleChangeInput = (e: InputChange) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormSubmit) => {
    e.preventDefault();
    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast({
        title: "🚫 Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
        className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await AuthApi.Register(form);
      if (response.message !== 'User already exists.') {
        setSuccess(true);
        toast({
          title: "🎉 Welcome Aboard!",
          description: "Your account has been created successfully. Redirecting...",
          className: "bg-gradient-to-r from-green-400 to-green-500 text-white border-none",
        });
        startTransition(() => {
          setTimeout(() => {
            window.location.href = PATHS.LOGIN;
          }, 2000);
        });
      } else {
        setSuccess(false);
        toast({
          title: "🚫 Registration Error",
          description: "User already exists. Please login.",
          variant: "destructive",
          className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
        });
      }
    } catch (error: any) {
      setShake(true);
      setTimeout(() => setShake(false), 500);

      console.error('Registration error:', error);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data?.detail === 'Email already exists') {
              toast({
                title: "🚫 Registration Failed",
                description: "Email already exists. Please login instead.",
                variant: "destructive",
                className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
              });
            } else {
              toast({
                title: "💥 Registration Failed",
                description: "Something went wrong. Please try again later.",
                variant: "destructive",
                className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
              });
            }
            break;
          case 500:
            toast({
              title: "💥 Server Error",
              description: "Internal server error. Please try again later.",
              variant: "destructive",
              className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
            });
            break;
          default:
            toast({
              title: "💥 Registration Failed",
              description: "An unexpected error occurred. Please try again later.",
              variant: "destructive",
              className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
            });
        }
      } else {
        toast({
          title: "💥 Registration Failed",
          description: "Network error. Please check your connection and try again.",
          variant: "destructive",
          className: "bg-gradient-to-r from-red-400 to-red-500 text-white border-none",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) window.location.href = PATHS.HOME;
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0D0D1F]">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(63,94,251,0.1),rgba(252,70,107,0.1))]" />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(63,94,251,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 60%, rgba(252,70,107,0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-[420px] bg-black/40 backdrop-blur-2xl border border-white/10">
          <CardHeader className="space-y-1 pb-6">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-[2px]"
            >
              <div className="w-full h-full rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                {success ? (
                  <FiCheckCircle className="text-2xl text-green-400" />
                ) : (
                  <FiUserPlus className="text-2xl text-white" />
                )}
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {success ? "Registration Successful!" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your details to register
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form
              className="space-y-4"
              onSubmit={handleSubmit}
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    name="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  />
                  {errors.email && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.email}
                    </motion.span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    name="password"
                    value={form.password}
                    onChange={handlePasswordChange}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <div className="mt-1 h-1 bg-gray-200 rounded">
                    <motion.div
                      className={`h-full rounded bg-${getStrengthColor()}-500`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength + 1) * 20}%` }}
                    />
                  </div>
                  {errors.password && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.password}
                    </motion.span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChangeInput}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  />
                  {errors.confirmPassword && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500"
                    >
                      {errors.confirmPassword}
                    </motion.span>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className={`w-full h-12 mt-2 ${success
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } transition-all duration-300`}
                disabled={isLoading || isPending || success}
              >
                <AnimatePresence mode="wait">
                  {isLoading || isPending ? (
                    <motion.div
                      key="loading"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                    />
                  ) : success ? (
                    <motion.span
                      key="success"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Success
                    </motion.span>
                  ) : (
                    <motion.span key="create">Create Account</motion.span>
                  )}
                </AnimatePresence>
              </Button>
              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to={PATHS.LOGIN} className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign in
                </Link>
              </p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;