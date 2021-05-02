import "../styles/globals.scss"; // Global styles
import StateProvider from "@store/index"; // Global state provider

export default function OHMDao({ Component, pageProps }) {
  return (
    // Wrap component in Global state provider
    <StateProvider>
      <Component {...pageProps} />
    </StateProvider>
  );
}
