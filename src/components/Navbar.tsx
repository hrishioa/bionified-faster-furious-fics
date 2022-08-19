import { useKBar } from 'kbar';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { CommandBarIcon } from './CommandBar/CommandBarIcon';
import Kudos from './Kudos';
import { RootState } from './Redux-Store/ReduxStore';

export const NavBar: React.FC<any> = () => {
  const [theme, setTheme] = useState('light');
  const [bottomBarEnabled, setBottomBarEnabled] = useState(false);
  const [bottomBarShown, setBottomBarShown] = useState(false);

  const username = useSelector((state: RootState) => state.user.username);

  const [touchEnabled, setTouchEnabled] = useState(true);

  useEffect(() => {
    if(window)
      setTouchEnabled('ontouchstart' in window);
  });

  const { query } = useKBar();

  function openLogoutOption() {
    (window as any).query = query;
    query.toggle();
    window.setTimeout(() => {
      query.setSearch('logout');
    }, 50);
  }

  useEffect(() => {
    if (document) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    let pastScroll = window.scrollY;

    const scrollHandler = () => {
      if (window.scrollY > 100) {
        setBottomBarEnabled(true);
      } else {
        setBottomBarEnabled(false);
      }

      if (Math.abs(pastScroll - window.scrollY) > 50) {
        if (pastScroll > window.scrollY) {
          setBottomBarShown(true);
        } else {
          setBottomBarShown(false);
        }

        pastScroll = window.scrollY;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => window.removeEventListener('scroll', scrollHandler);
  });

  return (
    <>
      {bottomBarEnabled && (
        <div
          style={{
            height: '80px',
          }}
        ></div>
      )}
      <div
        className={`navbar ${bottomBarEnabled ? 'bottom' : ''} ${
          bottomBarShown && bottomBarEnabled ? 'bottom-shown' : ''
        }`}
      >
        {!touchEnabled && <div
          className="bookmarklet"
          dangerouslySetInnerHTML={{
            __html: `
            <a class="hidden-bookmarklink" href="javascript:(window.location.toString().match('archiveofourown.org/works')?window.location=(window.location.toString().replace('archiveofourown.org','archiveofherown.org')):alert('Use me on a real AO3 Work to jump to BF3!'))">
            AO3 -> BF3 Portal
            </a>
            <span>Bookmark Me!</span>
          `,
          }}
        ></div>}
        <div className="flexseparator"></div>
        <div className="username" onClick={openLogoutOption}>
          {username || 'Anonymous'}
        </div>
        <Kudos />
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
