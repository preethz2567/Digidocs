import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../store/authStore";
import "../styles/login.css";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError("");
    try {
      await login(data);
      navigate("/dashboard");
    } catch (error: any) {
      setLoginError(error?.response?.data?.error ?? "Invalid email or password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-form-container">
          <div className="logo-section">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22h20L12 2z" fill="#111" />
              <path d="M12 8l-5 10h10l-5-10z" fill="#f7f7f9" />
              <path d="M12 11l-2 4h4l-2-4z" fill="#111" />
            </svg>
            <span className="logo-text">DigiDocs</span>
          </div>

          <h1 className="title">Sign in</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="error">{errors.password.message}</p>}
            </div>

            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>

            {loginError && <p className="error" style={{ marginBottom: '16px', marginTop: '-16px' }}>{loginError}</p>}

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="links">
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
            <p>
              <Link to="#">Forgot Password</Link>
            </p>
          </div>

          <div className="social-login">
            <button className="social-btn">
              <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </button>
            <button className="social-btn">
              <svg viewBox="0 0 24 24"><path fill="#111" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </button>
            <button className="social-btn">
              <svg viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="right-container">
          <div className="right-content">
            <span className="small-brand">DigiDocs</span>
            
            <div className="right-text">
              <h2>Secure your digital world with DigiDocs</h2>
              <p>
                DigiDocs is your ultimate digital vault. Keep your important files organized, accessible, and safe in one place. Connect from anywhere, anytime.
              </p>
              <p className="stats">Trusted by over 10,000 professionals worldwide</p>
            </div>

            <div className="info-card">
              <h3>Seamless Document Management</h3>
              <p>Experience real-time editing, secure sharing, and advanced access controls. Join today and start organizing your life.</p>
              <div className="avatars">
                <div className="avatar">AM</div>
                <div className="avatar">JD</div>
                <div className="avatar">RK</div>
                <div className="avatar">+99</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;