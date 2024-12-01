import { AuthApi } from '@/apis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PATHS } from '@/utils/enums';
import { ILogin } from '@/utils/interface';
import { FormSubmit, InputChange } from '@/utils/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiMail, FiCheck, FiCheckCircle } from 'react-icons/fi'; // Fixed icon imports
import { toastConfig } from '@/utils/toast';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import zxcvbn from 'zxcvbn'; // Add this import

export default function Login() {
  const { toast } = useToast();
  const [login, setLogin] = useState<ILogin>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);  // for focusing on email input after error
  const passwordInputRef = useRef<HTMLInputElement>(null); // for password input focus management

  const { setToken } = useAuth(); // Destructure setToken from useAuth

  const handleChangeInput = (e: InputChange) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormSubmit) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthApi.Login(login);
      console.log('Login response:', response); // Debug

      if (response.status === "Login successful" && response.access_token) {
        const { access_token } = response; // Correctly access access_token
        localStorage.setItem('access_token', access_token);
        setToken(access_token); // Set the token
        setSuccess(true);

        // Set user_id in localStorage
        const { user_id } = response; // Correctly access user_id
        localStorage.setItem('user_id', user_id.toString());

        toast(toastConfig.success('Successfully logged in'));
        setTimeout(() => {
          window.location.href = PATHS.HOME;
        }, 1500);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.detail || 'Bad Request';
        toast(toastConfig.error(errorMessage));
      } else {
        const errorMessage = error.response?.data?.message || 'Login failed';
        toast(toastConfig.error(errorMessage));
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
                <FiMail className="text-2xl text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {success ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <FiCheck className="text-green-500" /> {/* Changed from FiCheckCircle to FiCheck */}
                  Login Successful!
                </motion.div>
              ) : (
                "Welcome Back"
              )}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to continue
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
                    value={login.email}
                    onChange={handleChangeInput}
                    ref={emailInputRef} // focus management
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                  />
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
                    value={login.password}
                    onChange={handleChangeInput}
                    ref={passwordInputRef} // focus management
                    className="pl-10 bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className={`w-full h-12 mt-2 relative ${success
                  ? 'border border-green-500 hover:border-green-600 text-green-500'
                  : 'p-[1px] bg-gradient-to-r from-purple-600 to-pink-600'
                  } rounded-md transition-all duration-300`}
                disabled={isLoading || success}
              >
                <div className={`h-full w-full rounded-[4px] flex items-center justify-center ${success ? 'bg-transparent' : 'bg-[#0D0D1F]'
                  }`}>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border border-white rounded-full border-t-transparent"
                      />
                    ) : success ? (
                      <motion.span
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center gap-2 text-green-500"
                      >
                        <FiCheckCircle /> Success
                      </motion.span>
                    ) : (
                      <motion.span
                        key="signin"
                        className=" bg-clip-text bg-gradient-to-r from-purple-700 to-pink-900"
                      >
                        Sign In
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Button>
              <p className="text-center text-sm text-gray-400">
                New here?{' '}
                <Link to={PATHS.REGISTER} className="text-purple-400 hover:text-purple-300 font-medium">
                  Create an account
                </Link>
              </p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div >
  );
}
