import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { login, getSavedEmail } from "../services/authService";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "login.error.emailInvalid" })
    .min(1, { message: "login.error.emailRequired" }),
  password: z
    .string()
    .min(1, { message: "login.error.passwordRequired" })
    .min(8, { message: "login.error.passwordMinLength" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const savedEmail = getSavedEmail();
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const result = await login(data);
      if (result.success) {
        localStorage.setItem("passxyz-token", result.token || "");
        onSuccess?.();
      } else {
        setLoginError(result.message || t("login.error.loginFailed"));
      }
    } catch {
      setLoginError(t("login.error.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
          {t("login.email")}
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main ${
            errors.email
              ? "border-danger-500 focus:ring-danger-500"
              : "border-light-300 dark:border-dark-400 focus:border-brand-main"
          } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
          placeholder="user@example.com"
          disabled={isLoading}
        />
        {errors.email && errors.email.message && (
          <p className="mt-1 text-sm text-danger-500">{t(errors.email.message)}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-light-850 dark:text-light-100 mb-2">
          {t("login.password")}
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            id="password"
            className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-main pr-12 ${
              errors.password
                ? "border-danger-500 focus:ring-danger-500"
                : "border-light-300 dark:border-dark-400 focus:border-brand-main"
            } bg-light-50 dark:bg-dark-700 text-light-900 dark:text-light-100`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-light-500 dark:text-dark-300 hover:text-light-700 dark:hover:text-light-200 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.87 9.87a3 3 0 1 0 4.26 4.26" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c1.09 0 2.16-.16 3.16-.46" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && errors.password.message && (
          <p className="mt-1 text-sm text-danger-500">{t(errors.password.message)}</p>
        )}
      </div>

      {loginError && (
        <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
          <p className="text-sm text-danger-600 dark:text-danger-400">{loginError}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register("rememberMe")}
            type="checkbox"
            className="w-4 h-4 rounded border-light-300 dark:border-dark-500 bg-light-50 dark:bg-dark-700 text-brand-main focus:ring-brand-main"
            disabled={isLoading}
          />
          <span className="text-sm text-light-600 dark:text-light-300">{t("login.rememberMe")}</span>
        </label>
        <a
          href="#"
          className="text-sm text-brand-main hover:text-brand-darker transition-colors"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {t("login.forgotPassword")}
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-main text-white font-medium rounded-lg hover:bg-brand-darker focus:outline-none focus:ring-2 focus:ring-brand-main focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {t("login.loading")}
          </>
        ) : (
          t("login.login")
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-light-200 dark:border-dark-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-light-50 dark:bg-dark-800 text-light-500 dark:text-dark-400">
            {t("login.or")}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-light-200 dark:border-dark-600 text-light-700 dark:text-light-300 font-medium rounded-lg hover:bg-light-50 dark:hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-main focus:ring-offset-2 transition-all disabled:opacity-50"
        onClick={() => {
          window.location.href = "/api/auth/cloudflare";
        }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
        {t("login.continueWithCloudflare")}
      </button>
    </form>
  );
}