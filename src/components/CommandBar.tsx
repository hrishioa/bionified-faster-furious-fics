import React from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  ActionId,
  ActionImpl,
} from 'kbar';

const searchStyle = {
  padding: '12px 16px',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
  outline: 'none',
  border: 'none',
  background: 'rgb(252 252 252)',
  color: 'rgb(28 28 29)',
};

const animatorStyle = {
  maxWidth: '600px',
  width: '100%',
  background: 'rgb(252 252 252)',
  color: 'rgb(28 28 29)',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0px 6px 20px rgb(0 0 0 / 20%)',
};

const groupNameStyle = {
  padding: '8px 16px',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  opacity: 0.5,
};

const actions = [
  {
    id: 'docsAction',
    name: 'Docs',
    shortcut: ['g', 'd'],
    keywords: 'help',
    section: 'Navigation',
    perform: () => console.log('Docs'),
  },
  {
    id: 'contactAction',
    name: 'Contact',
    shortcut: ['c'],
    keywords: 'email hello',
    section: 'Navigation',
    perform: () => window.open('mailto:timchang@hey.com', '_blank'),
  },
];

function RenderResults() {
  const { results } = useMatches();

  const ancestors: ActionImpl[] = [];

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div style={groupNameStyle}>{item}</div>
        ) : (
          <div
            style={{
              padding: '12px 16px',
              background: active ? 'rgba(0 0 0 / 0.05)' : 'transparent',
              borderLeft: `2px solid ${
                active ? 'rgb(28 28 29)' : 'transparent'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                fontSize: 14,
              }}
            >
              {item.icon && item.icon}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  {ancestors.length > 0 &&
                    ancestors.map((ancestor) => (
                      <React.Fragment key={ancestor.id}>
                        <span
                          style={{
                            opacity: 0.5,
                            marginRight: 8,
                          }}
                        >
                          {ancestor.name}
                        </span>
                        <span
                          style={{
                            marginRight: 8,
                          }}
                        >
                          &rsaquo;
                        </span>
                      </React.Fragment>
                    ))}
                  <span>{item.name}</span>
                </div>
                {item.subtitle && (
                  <span style={{ fontSize: 12 }}>{item.subtitle}</span>
                )}
              </div>
            </div>
            {item.shortcut?.length ? (
              <div
                aria-hidden
                style={{ display: 'grid', gridAutoFlow: 'column', gap: '4px' }}
              >
                {item.shortcut.map((sc) => (
                  <kbd
                    key={sc}
                    style={{
                      padding: '4px 6px',
                      background: 'rgba(0 0 0 / .1)',
                      borderRadius: '4px',
                      fontSize: 14,
                    }}
                  >
                    {sc}
                  </kbd>
                ))}
              </div>
            ) : null}
          </div>
        )
      }
    />
  );
}

export const CommandBar = ({ children }: { children?: JSX.Element }) => {
  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator style={animatorStyle}>
            <KBarSearch style={searchStyle} />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>

      {children}
    </KBarProvider>
  );
};
