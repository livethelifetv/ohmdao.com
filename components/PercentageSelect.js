import styles from "@styles/components/PercentageSelect.module.scss"; // Component styles

/**
 * Percentage selection toggle
 * @param {Number} max possible number
 * @param {Function} setter to update number
 * @param {Boolean} disabled toggle state
 * @returns {HTMLElement} percentage selection toggle
 */
export default function PercentageSelect({ max, setter, disabled }) {
  return (
    <div className={styles.ohm__percentage}>
      {[0.25, 0.5, 0.75, 1.0].map((percentage, i) => {
        // For each common interval (25%, 50%, 75%, 100%) return button
        return (
          <button
            key={i}
            // On button click, update the new percentage via the setter
            onClick={() => setter(max * percentage)}
            disabled={disabled}
          >
            {percentage * 100}%
          </button>
        );
      })}
    </div>
  );
}
