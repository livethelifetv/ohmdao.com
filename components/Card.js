import styles from "@styles/components/Card.module.scss"; // Component styles

/**
 * Card highlight component
 * @param {String} title for card
 * @param {HTMLElement} children of card
 * @param {Boolean} highlight optional focus highlighting (applied style)
 * @returns {HTMLElement} card
 */
export default function Card({ title, children, highlight }) {
  return (
    <div
      className={`${styles.ohm__card} ${
        // If optional highlight, toggle style
        highlight ? styles.ohm__card_higlight : ""
      }`}
    >
      {/* Card title */}
      <h4>{title}</h4>

      {/* Card content */}
      {children}
    </div>
  );
}
