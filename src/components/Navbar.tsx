import { useEffect, useState } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { CommandBarIcon } from './CommandBar/CommandBarIcon';

export const NavBar: React.FC<any> = () => {
  const [theme, setTheme] = useState('light');
  const [bottomBarEnabled, setBottomBarEnabled] = useState(false);
  const [bottomBarShown, setBottomBarShown] = useState(false);

  useEffect(() => {
    if (document) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    let pastScroll = window.scrollY;

    const scrollHandler = () => {
      if(window.scrollY > 100) {
        setBottomBarEnabled(true);
      } else {
        setBottomBarEnabled(false);
      }

      if(Math.abs(pastScroll - window.scrollY) > 50) {
        if(pastScroll > window.scrollY) {
          setBottomBarShown(true);
        } else {
          setBottomBarShown(false);
        }

        pastScroll = window.scrollY;
      }
    }

    window.addEventListener('scroll', scrollHandler, {passive: true});

    return () => window.removeEventListener('scroll', scrollHandler);
  });

  return (
    <>
        {bottomBarEnabled && <div style={{
          height: '80px'
        }}></div>}
        <div className={`navbar ${bottomBarEnabled ? 'bottom': ''} ${bottomBarShown && bottomBarEnabled ? 'bottom-shown': ''}`}>
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
    </>
  );
};
