import Link from "next/link";

export function Header() {
  return <header className="topbar"><div className="wrap nav">
    <Link className="brand" href="/">Renti<span>Safe</span></Link>
    <nav className="navlinks" aria-label="Main navigation">
      <Link href="/rentals">Homes for rent</Link>
      <Link href="/scam-database">Scam database</Link>
      <Link href="/blog">Keja guides</Link>
      <Link href="/login">Agent / Admin</Link>
    </nav>
  </div></header>;
}

export function Footer() {
  return <footer className="footer"><div className="wrap">
    <div className="footer-top"><div><Link className="brand" href="/">Renti<span>Safe</span></Link><p>Before utume deposit, verify kwanza.</p></div>
      <nav className="footer-links" aria-label="Policies and information">
        <Link href="/rentals">Homes for rent</Link>
        <Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/refund-policy">Refund policy</Link>
        <Link href="/scam-database-policy">Scam database policy</Link><Link href="/scam-database">Scam database</Link>
      </nav>
    </div>
    <p className="footer-line">We are your housing agents and independent verifiers. We do not own the houses.</p>
    <small>© {new Date().getFullYear()} RentiSafe. Verification is an inspection at one point in time, not a guarantee.</small>
  </div></footer>;
}

export function CookieNotice() {
  return <div id="cookie-notice" className="cookie" hidden role="region" aria-label="Cookie notice">
    <span>We use essential cookies for secure staff sign-in. No ad trackers.</span>
    <button type="button">OK</button>
  </div>;
}
