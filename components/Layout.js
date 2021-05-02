import Meta from "next/head"; // Meta tags
import Link from "next/link"; // Navigation
import chain from "@store/chain"; // ETH information
import { useRouter } from "next/router"; // Routing
import { useEffect, useState } from "react"; // React
import HamburgerMenu from "react-hamburger-menu"; // Menu
import styles from "@styles/components/Layout.module.scss"; // Component styles

/**
 * Encompasses Olympus Dao site
 * @param {HTMLElement} children to render
 * @returns {HTMLElement} encompassed layout
 */
export default function Layout({ children }) {
  return (
    <div>
      {/* Meta tags */}
      <HeadMeta />

      {/* Header */}
      <Header />

      {/* Page content */}
      <div className={styles.ohm__content}>
        {/* Page content sizer */}
        <div className={styles.ohm__content_sizer}>{children}</div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

/**
 * Page meta information
 */
function HeadMeta() {
  return (
    <Meta>
      {/* General meta */}
      <title>OHMDao | Algorithmic Currency Protocol</title>
      <meta name="title" content="OHMDao | Algorithmic Currency Protocol" />
      <meta
        name="description"
        content="Enhanced Olympus DAO front-end by YouMyChic-fil-A for the OHMies community."
      />

      {/* Open Graph Meta */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ohmdao.com/" />
      <meta
        property="og:title"
        content="OHMDao | Algorithmic Currency Protocol"
      />
      <meta
        property="og:description"
        content="Enhanced Olympus DAO front-end by YouMyChic-fil-A for the OHMies community."
      />
      <meta property="og:image" content="https://ohmdao.com/images/meta.png" />

      {/* Twitter Meta */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://ohmdao.com/" />
      <meta
        property="twitter:title"
        content="OHMDao | Algorithmic Currency Protocol"
      />
      <meta
        property="twitter:description"
        content="Enhanced Olympus DAO front-end by YouMyChic-fil-A for the OHMies community."
      />
      <meta
        property="twitter:image"
        content="https://ohmdao.com/images/meta.png"
      />

      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* Icon */}
      <link rel="shortcut icon" href="/favicon.ico" />
    </Meta>
  );
}

/**
 * Header + Menu
 */
function Header() {
  const router = useRouter(); // Routing
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state
  const [authLoading, setAuthLoading] = useState(false); // Auth loading status
  const { address, lock, unlock } = chain.useContainer(); // Chain functions

  /**
   * Returns active class styling
   * @param {String} href of current path
   * @returns {Object || String} either style object or empty string
   */
  const activeClass = (href) => {
    // If current path is same as provided path, show active class
    return router.pathname === href ? styles.ohm__header_menu_active : "";
  };

  /**
   * Truncates address string with ellipsis
   * @param {String} address to truncate
   * @returns {String} truncated address
   */
  const truncatedAddress = (address) => {
    // Address[0, 3] + ... + Address[length - 3, length]
    return address.substr(0, 3) + "..." + address.slice(address.length - 3);
  };

  /**
   * Updates state of mobile menu based on current window dimensions
   */
  const updateDimensions = () => {
    // When window width > 700px
    if (window.innerWidth > 700) {
      // Force mobile menu closed
      setMenuOpen(false);
    }
  };

  /**
   * Unlock wallet with loading state
   */
  const unlockWithLoading = async () => {
    setAuthLoading(true); // Toggle loading

    try {
      // Unlock wallet
      await unlock();
    } catch (error) {
      console.log(`Error when unlocking: ${error}`);
    }

    setAuthLoading(false); // Toggle loading
  };

  /**
   * Lock wallet with loading state
   */
  const lockWithLoading = async () => {
    setAuthLoading(true); // Toggle loading

    try {
      // Lock wallet
      await lock();
    } catch (error) {
      console.log(`Error when locking: ${error}`);
    }

    setAuthLoading(false); // Toggle loading
  };

  /**
   * Lifecycle: on load
   */
  useEffect(() => {
    // Update page dimensions
    updateDimensions();
    // Listen to page dimensions per resize
    window.addEventListener("resize", updateDimensions);

    // Lifecycle: on unmount
    return () => {
      // Remove page dimension listener
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <div className={styles.ohm__header}>
      {/* Header logo */}
      <div className={styles.ohm__header_logo}>
        <Link href="/">
          <a>
            <img src="/vectors/logo.svg" alt="OHMDAO logo" />
          </a>
        </Link>
      </div>

      {/* Header menu */}
      <div className={styles.ohm__header_menu}>
        <ul>
          <li className={activeClass("/")}>
            <Link href="/">Dashboard</Link>
          </li>
          <li className={activeClass("/stake")}>
            <Link href="/stake">Stake</Link>
          </li>
        </ul>
      </div>

      {/* Header connect wallet */}
      {address ? (
        <div className={styles.ohm__header_actions}>
          <button onClick={lockWithLoading} disabled={authLoading}>
            {authLoading
              ? "Disconnecting..."
              : `Disconnect ${truncatedAddress(address)}`}
          </button>
        </div>
      ) : (
        <div className={styles.ohm__header_actions}>
          <button onClick={unlockWithLoading} disabled={authLoading}>
            {authLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      )}

      {/* Header mobile accordion */}
      <div className={styles.ohm__header_accordion}>
        <HamburgerMenu
          width={20}
          height={15}
          color="#fff"
          isOpen={menuOpen}
          menuClicked={() => setMenuOpen((previous) => !previous)}
        />
      </div>

      {/* Header mobile menu */}
      <div
        className={`${styles.ohm__header_mobile} ${
          menuOpen
            ? // Display if menuOpen === true
              styles.ohm__header_mobile_open
            : // Don't display if menuOpen === false
              styles.ohm__header_mobile_closed
        }`}
      >
        <ul>
          <li className={activeClass("/")}>
            <Link href="/">Dashboard</Link>
          </li>
          <li className={activeClass("/stake")}>
            <Link href="/stake">Stake</Link>
          </li>
        </ul>

        {address ? (
          <button onClick={lockWithLoading} disabled={authLoading}>
            {authLoading
              ? "Disconnecting..."
              : `Disconnect ${truncatedAddress(address)}`}
          </button>
        ) : (
          <button onClick={unlockWithLoading} disabled={authLoading}>
            {authLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Layout footer
 */
function Footer() {
  return (
    <div className={styles.ohm__footer}>
      <p>
        Developed by{" "}
        <a
          href="https://youmychicfila.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouMyChic-fil-A
        </a>
        .
      </p>
      <p>OHMDAO Version 0.0.1.</p>
    </div>
  );
}
