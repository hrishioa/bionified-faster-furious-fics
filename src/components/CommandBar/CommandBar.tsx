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
import { useSelector } from 'react-redux';
import { RootState } from '../Redux-Store/ReduxStore';

const actions = [
  {
    id: 'theme',
    name: 'Change theme…',
    keywords: 'interface color dark light',
    section: 'Preferences',
  },
  {
    id: 'darkTheme',
    name: 'Dark',
    keywords: 'dark theme',
    section: 'Standard',
    parent: 'theme',
    perform: () => {
      console.log('Setting dark mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    },
  },
  {
    id: 'lightTheme',
    name: 'Light',
    keywords: 'light theme',
    section: 'Standard',
    parent: 'theme',
    perform: () => {
      document.documentElement.setAttribute('data-theme', 'light');
    },
  },
  {
    id: 'blueTheme',
    name: 'Blue',
    keywords: 'blue theme',
    section: 'Exotic',
    parent: 'theme',
    perform: () => {
      document.documentElement.setAttribute('data-theme', 'blue');
    },
  },
  {
    id: 'catAction',
    name: 'Hello',
    subtitle: 'Why did you wake me?',
    shortcut: ['c'],
    keywords: 'cat',
    section: 'Functions',
    perform: () => window.open('https://www.youtube.com/watch?v=dEFGfu_tHsA'),
  },
];

type ComplexResultItemProps = {
  action: ActionImpl;
  active: boolean;
  currentRootActionId: ActionId;
};

const ComplexResultItem = (
  { action, active, currentRootActionId }: ComplexResultItemProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const ancestors = React.useMemo(() => {
    if (!currentRootActionId) return action.ancestors;
    const index = action.ancestors.findIndex(
      (ancestor) => ancestor.id === currentRootActionId,
    );
    // +1 removes the currentRootAction; e.g.
    // if we are on the "Set theme" parent action,
    // the UI should not display "Set theme… > Dark"
    // but rather just "Dark"
    return action.ancestors.slice(index + 1);
  }, [action.ancestors, currentRootActionId]);

  return (
    <div ref={ref} className={`cb-item ${active ? 'active' : ''}`}>
      <div className="cb-item-label">
        {action.icon && action.icon}
        <div className="cb-item-label-container">
          <div>
            {ancestors.length > 0 &&
              ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <span className="cb-item-ancestor">{ancestor.name}</span>
                  <span className="cb-breadcrumb-arrow">&rsaquo;</span>
                </React.Fragment>
              ))}
            <span>{action.name}</span>
          </div>
          {action.subtitle && (
            <span className="cb-item-subtitle">{action.subtitle}</span>
          )}
        </div>
      </div>
      {action.shortcut?.length ? (
        <div
          aria-hidden
          style={{ display: 'grid', gridAutoFlow: 'column', gap: '4px' }}
        >
          {action.shortcut.map((sc) => (
            <kbd key={sc} className="cb-item-shortcut">
              {sc}
            </kbd>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const ComplexResultItemRef = React.forwardRef(ComplexResultItem);

const RenderResults = () => {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="cb-group-name">{item}</div>
        ) : (
          <ComplexResultItemRef
            action={item}
            active={active}
            currentRootActionId={rootActionId || ''}
          />
        )
      }
    />
  );
};

export const CommandBarLogic = () => {
  // TODO: Question: How can we do this better?
  const { curChapterName, curScrollPercent } = useSelector(
    (state: RootState) => ({
      curChapterName:
        (state.work.chapterInfo &&
          state.work.chapterInfo.find(
            (chapter) => chapter.id === state.work.currentChapterId,
          )?.title) ||
        null,
      curScrollPercent: state.work.chapterScrollPercentage,
    }),
  );
  const MAX_CHAPTER_NAME_LENGTH = 35;

  return (
    <KBarPortal>
      <KBarPositioner className="cb-positioner">
        <KBarAnimator className="cb-animator">
          <KBarSearch
            defaultPlaceholder={
              curChapterName
                ? `${curScrollPercent.toFixed(1)}% through ${
                    curChapterName.slice(0, MAX_CHAPTER_NAME_LENGTH) +
                    (curChapterName.length > MAX_CHAPTER_NAME_LENGTH
                      ? '...'
                      : '')
                  }`
                : undefined
            }
            className="cb-search"
          />
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

export const CommandBar = ({
  children,
}: {
  children?: JSX.Element | JSX.Element[];
}) => {
  return (
    <KBarProvider actions={actions}>
      <CommandBarLogic />
      {children}
    </KBarProvider>
  );
};
