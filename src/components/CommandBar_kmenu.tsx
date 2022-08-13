import React from 'react';
import {
  MenuProvider,
  MenuConfig,
  useKmenu,
  Command,
  useCommands,
  CommandMenu,
} from 'kmenu';
import 'kmenu/dist/index.css';

const Menu: React.FC = () => {
  const [input, setInput, open, setOpen] = useKmenu();

  const main: Command[] = [
    {
      category: 'kmenu',
      commands: [
        {
          // icon: <ArrowRight />,
          text: 'kmenu...',
          perform: () => setOpen(2),
        },
      ],
    },
    {
      category: 'Socials',
      commands: [
        {
          // icon: <Globe />,
          text: 'Website',
          href: 'https://hxrsh.in',
          newTab: true,
          keywords: 'home',
        },
        {
          // icon: <Twitter />,
          text: 'Twitter',
          href: 'https://twitter.com/harshhhdev',
          newTab: true,
        },
        {
          // icon: <GitHub />,
          text: 'GitHub',
          href: 'https://github.com/harshhhdev',
          newTab: true,
        },
        {
          // icon: <Dribbble />,
          text: 'Dribbble',
          href: 'https://dribbble.com/harshhhdev',
          newTab: true,
        },
        {
          // icon: <Linkedin />,
          text: 'Linkedin',
          href: 'https://linkedin.com/in/harshhhdev',
          newTab: true,
        },
      ],
    },
  ];

  const info: Command[] = [
    {
      category: 'Information',
      commands: [
        {
          // icon: <Globe />,
          text: 'Demo',
          href: 'https://kmenu.hxrsh.in',
          newTab: true,
          keywords: 'website',
        },
        {
          // icon: <GitHub />,
          text: 'Source',
          href: 'https://github.com/harshhhdev/kmenu',
          newTab: true,
          keywords: 'github',
        },
        {
          // icon: <Book />,
          text: 'Documentation',
          href: 'https://github.com/harshhhdev/kmenu/blob/master/README.md',
          newTab: true,
          keywords: 'docs',
        },
        {
          // icon: <DownloadCloud />,
          text: 'NPM',
          href: 'https://npmjs.com/package/kmenu',
          newTab: true,
          keywords: 'download',
        },
        {
          // icon: <AlertOctagon />,
          text: 'Issues',
          href: 'https://github.com/harshhhdev/kmenu/issues',
          newTab: true,
        },
      ],
    },
  ];

  const [mainCommands, setMainCommands] = useCommands(main);
  const [infoCommands, setInfoCommands] = useCommands(info);

  return (
    <>
      <CommandMenu commands={mainCommands} index={1} main />
      <CommandMenu commands={infoCommands} index={2} />
    </>
  );
};

export const CommandBar: React.FC = ({}) => {
  const config: MenuConfig = {
    backdropBlur: 5,
    backdropColor: '#e7e7e7e5',
  };

  return (
    <MenuProvider dimensions={{ sectionHeight: 34 }} config={config}>
      <Menu />
    </MenuProvider>
  );
};
