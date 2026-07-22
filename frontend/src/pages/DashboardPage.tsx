import { useNavigate } from "react-router";

import {
    clearAuthSession,
    getStoredUser,
} from "../services/auth-storage";

export function DashboardPage() {
    const navigate = useNavigate();
    const user = getStoredUser();

    function handleLogout(): void {
        clearAuthSession();
        navigate("/login", {
            replace: true,
        });
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div className="brand dashboard-brand">
          <span className="brand-mark" aria-hidden="true">
            ✓
          </span>
                    <span>TaskFlow</span>
                </div>

                <div className="dashboard-user">
                    <div>
                        <strong>{user?.name ?? "Kullanıcı"}</strong>
                        <span>{user?.email}</span>
                    </div>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={handleLogout}
                    >
                        Çıkış yap
                    </button>
                </div>
            </header>

            <section className="dashboard-content">
        <span className="showcase-label dashboard-label">
          Dashboard
        </span>

                <h1>
                    Hoş geldin, {user?.name ?? "Kullanıcı"}!
                </h1>

                <p>
                    Giriş işlemi ve JWT doğrulaması başarıyla
                    tamamlandı. Sırada görevlerini burada
                    göstermek var.
                </p>

                <div className="dashboard-placeholder">
                    <span>✓</span>

                    <div>
                        <strong>Kimlik servisi bağlandı</strong>
                        <p>
                            Bir sonraki aşamada görevlerin Task
                            Service üzerinden yüklenecek.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}