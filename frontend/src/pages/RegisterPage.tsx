import {
    type FormEvent,
    useState,
} from "react";
import {
    Link,
    useNavigate,
} from "react-router";

import { AuthLayout } from "../components/auth/AuthLayout";
import { register } from "../services/auth.service";

export function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [
        passwordConfirmation,
        setPasswordConfirmation,
    ] = useState("");

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        setErrorMessage(null);

        if (password !== passwordConfirmation) {
            setErrorMessage("Parolalar birbiriyle eşleşmiyor.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await register({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    message: response.message,
                },
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Kayıt sırasında bir hata oluştu.";

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
                    <h2>Hesabını oluştur</h2>
                    <p>Görevlerini düzenlemeye hemen başla.</p>
                </header>

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
                        <span>Ad soyad</span>
                        <input
                            type="text"
                            name="name"
                            placeholder="Adını ve soyadını gir"
                            autoComplete="name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </label>

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
                            placeholder="En az 8 karakter"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={isSubmitting}
                            minLength={8}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Parola tekrarı</span>
                        <input
                            type="password"
                            name="passwordConfirmation"
                            placeholder="Parolanı tekrar gir"
                            autoComplete="new-password"
                            value={passwordConfirmation}
                            onChange={(event) =>
                                setPasswordConfirmation(
                                    event.target.value,
                                )
                            }
                            disabled={isSubmitting}
                            minLength={8}
                            required
                        />
                    </label>

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Hesap oluşturuluyor..."
                            : "Hesap oluştur"}
                    </button>
                </form>

                <p className="auth-switch">
                    Zaten hesabın var mı?
                    <Link to="/login">Giriş yap</Link>
                </p>
            </div>
        </AuthLayout>
    );
}