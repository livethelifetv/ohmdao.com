import styles from "@styles/components/Breadcrumb.module.scss"; // Component styles

/**
 * Breadcrumb header
 * @param {String} header text
 * @param {String} text description
 * @returns {HTMLElement} containing breadcrumb and optional text description
 */
export default function Breadcrumb({ header, text }) {
  return (
    <div className={styles.ohm__breadcrumb}>
      <h2>{header}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
