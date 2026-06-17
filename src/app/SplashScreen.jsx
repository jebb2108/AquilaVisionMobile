import logo from '../images/logo.png';

export function SplashScreen() {
  return (
    <div className="app-splash" role="status" aria-live="polite">
      <div className="app-splash__inner">
        <img className="app-splash__logo" src={logo} alt="Aquila Vision" />
        <div className="app-splash__progress" aria-hidden="true">
          <span></span>
        </div>
      </div>
    </div>
  );
}
