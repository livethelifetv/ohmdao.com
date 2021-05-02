// Import providers
import chain from "@store/chain";
import stake from "@store/stake";

/**
 * Global state provider
 * @param {HTMLElement} children to inject
 * @returns {HTMLElement} with injected state
 */
export default function StateProvider({ children }) {
  return (
    <chain.Provider>
      <stake.Provider>{children}</stake.Provider>
    </chain.Provider>
  );
}
