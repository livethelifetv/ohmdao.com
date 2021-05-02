import Link from "next/link"; // Routing
import stake from "@store/stake"; // Stake provider
import Card from "@components/Card"; // Component: card
import Layout from "@components/Layout"; // Component: layout wrapper
import Breadcrumb from "@components/Breadcrumb"; // Component: breadcrumb header
import styles from "@styles/pages/Dashboard.module.scss"; // Component styles

export default function Home() {
  return (
    <Layout>
      <div className={styles.ohm__dashboard}>
        {/* Highlight CTA */}
        <div className={styles.ohm__dashboard_highlight}>
          <div>
            <img src="/vectors/logo.svg" alt="OHMDao logo" />
            <p>
              Olympus DAO utilizes Protocol Owned Value to enable price
              consistency and scarcity within an infinite supply system.{" "}
            </p>
            <Link href="/stake">
              <a>Join Olympus DAO</a>
            </Link>
          </div>
          <div style={{ backgroundImage: "url(/images/feature.png)" }} />
        </div>

        {/* Ecosystem statistics */}
        <Breadcrumb
          header="Ecosystem Insight"
          text="Olympus DAO (OHM) general statistics."
        />
        <OHMStatistics />

        {/* Quicklinks */}
        <Breadcrumb
          header="Additional resources"
          text="Quicklinks to learn more about Olympus DAO."
        />
        <OHMResources />
      </div>
    </Layout>
  );
}

/**
 * OHM statistics
 */
function OHMStatistics() {
  // Collect statistics from stake container
  const { price, marketCap, circulatingSupply } = stake.useContainer();

  /**
   * Formats numbers to us-en locale
   * @param {Number || String} value to format
   * @param {Boolean} dollar if dollar representation (appends with "$")
   * @returns {HTMLElement} h3 containing number
   */
  const formatNumber = (value, dollar) => {
    // Format settings with [min(2), max(2)] decimals
    const formatterSettings = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return (
      <h3>
        {value
          ? // If value exists, render as us-en locale
            `${dollar ? "$" : ""}${parseFloat(value).toLocaleString(
              "us-en",
              formatterSettings
            )}`
          : // Else, show loading...
            "Loading..."}
      </h3>
    );
  };

  return (
    <div className={styles.ohm__dashboard_stats}>
      <Card title="OHM Price">{formatNumber(price, true)}</Card>
      <Card title="OHM Market Cap">{formatNumber(marketCap, true)}</Card>
      <Card title="OHM Circulating Supply">
        {formatNumber(circulatingSupply, false)}
      </Card>
    </div>
  );
}

/**
 * OHM Resource list
 */
function OHMResources() {
  // List of resources
  const resourceList = [
    {
      name: "Olympus DAO Documentation",
      url: "https://docs.olympusdao.finance/",
    },
    {
      name: "Blog: First Month in Review",
      url: "https://olympusdao.medium.com/first-month-in-review-e415191d680a",
    },
    {
      name: "Blog: Introducing OlympusDAO, An Algorithmic Currency Protocol",
      url:
        "https://olympusdao.medium.com/introducing-olympusdao-a-true-digital-currency-protocol-648c00c572d2",
    },
    {
      name: "Blog: DAI Bonds: A More Effective Sales Mechanism",
      url:
        "https://olympusdao.medium.com/dai-bonds-a-more-effective-sales-mechanism-c9a57586f1f7",
    },
    {
      name: "Dune Analytics: Olympus (OHM) via @sh4dow",
      url: "https://duneanalytics.com/shadow/Olympus-(OHM)",
    },
    {
      name: "OHM Calculator via @sh4dow",
      url:
        "https://docs.google.com/spreadsheets/u/3/d/1_w7iNYeajnPrvyUO2smh__lCH30ROmzwjhtbGGoww-8/edit#gid=0",
    },
  ];

  return (
    <div className={styles.ohm__dashboard_resources}>
      {resourceList.map((resource, i) => {
        // For each OHM resource, render link to it
        return (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            key={i}
          >
            {resource.name}
          </a>
        );
      })}
    </div>
  );
}
