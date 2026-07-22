import {
    type FormEvent,
    useState,
} from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router";

import { AuthLayout } from "../components/auth/AuthLayout";
import { login } from "../services/auth.service";
import { saveAuthSession } from "../services/auth-storage";

interface LoginLocationState {
    message?: string;
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const locationState =
        location.state as LoginLocationState | null;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const response = await login({
                email: email.trim(),
                password,
            });

            saveAuthSession(
                response.accessToken,
                response.user,
                remember,
            );

            navigate("/dashboard", {
                replace: true,
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Giriş sırasında bir hata oluştu.";

            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <div className="auth-card">
                <header className="auth-header">
                    <span className="mobile-brand">TaskFlow</span>
                    <h2>Tekrar hoş geldin</h2>
                    <p>Görevlerine devam etmek için giriş yap.</p>
                </header>

                {locationState?.message && (
                    <p className="form-message form-message-success">
                        {locationState.message}
                    </p>
                )}

                {errorMessage && (
                    <p className="form-message form-message-error">
                        {errorMessage}
                    </p>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label className="form-field">
                        <span>E-posta adresi</span>
                        <input
                            type="email"
                            name="email"
                            placeholder="ornek@email.com"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Parola</span>
                        <input
                            type="password"
                            name="password"
                            placeholder="Parolanı gir"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </label>

                    <div className="form-options">
                        <label className="remember-option">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(event) =>
                                    setRemember(event.target.checked)
                                }
                                disabled={isSubmitting}
                            />
                            <span>Beni hatırla</span>
                        </label>

                        <button className="text-button" type="button">
                            Parolamı unuttum
                        </button>
                    </div>

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Giriş yapılıyor..."
                            : "Giriş yap"}
                    </button>
                </form>

                <p className="auth-switch">
                    Henüz hesabın yok mu?
                    <Link to="/register">Hesap oluştur</Link>
                </p>
            </div>
        </AuthLayout>
    );
}