import { useEffect, useState } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { CommandBarIcon } from './CommandBar/CommandBarIcon';

export const NavBar: React.FC<any> = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (document) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <div className="navbar">
      <DarkModeSwitch
        checked={theme === 'dark'}
        style={{
          margin: '10px',
        }}
        onChange={() =>
          setTheme((theme) => (theme === 'light' ? 'dark' : 'light'))
        }
        size={50}
        moonColor="var(--heading-color)"
        sunColor="var(--heading-color)"
      />
      <CommandBarIcon />
    </div>
  );
};
