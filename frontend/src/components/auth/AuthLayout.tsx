import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({
                               children,
                           }: AuthLayoutProps) {
    return (
        <main className="auth-shell">
            <section className="auth-showcase">
                <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ✓
          </span>
                    <span>TaskFlow</span>
                </div>

                <div className="showcase-content">
          <span className="showcase-label">
            Gününü kontrol altına al
          </span>

                    <h1>
                        Yapacaklarını planla,
                        <br />
                        hedeflerine odaklan.
                    </h1>

                    <p>
                        Görevlerini kategorilere ayır, önceliklerini
                        belirle ve zamanını daha verimli kullan.
                    </p>

                    <ul className="feature-list">
                        <li>
                            <span>✓</span>
                            Kişisel ve güvenli görev alanı
                        </li>
                        <li>
                            <span>✓</span>
                            Kategori ve öncelik yönetimi
                        </li>
                        <li>
                            <span>✓</span>
                            Son tarih takibi
                        </li>
                    </ul>
                </div>

                <p className="showcase-footer">
                    Daha düzenli bir gün, daha sakin bir zihin.
                </p>
            </section>

            <section className="auth-main">
                {children}
            </section>
        </main>
    );
}