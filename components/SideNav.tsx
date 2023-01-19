import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

const items = [
  {
    title: 'Code',
    links: [
      {href: '/docs/code/es6', children: 'ES6 Tips', sub: [
        {href: '/docs/code/es6/array', children: 'Array'},
        {href: '/docs/code/es6/boolean', children: 'Boolean'},
        {href: '/docs/code/es6/date', children: 'Date'},
        {href: '/docs/code/es6/math', children: 'Math'},
        {href: '/docs/code/es6/number', children: 'Number'},
        {href: '/docs/code/es6/object', children: 'Object'},
        {href: '/docs/code/es6/string', children: 'String'},
        {href: '/docs/code/es6/misc', children: 'Miscellaneous'},
      ]},
      {href: '/docs/code/quality', children: 'Code Quality', sub: [
        {href: '/docs/code/quality/iterative-code', children: 'Iterative Code'},
        {href: '/docs/code/quality/variable-naming', children: 'Variable Naming'},
      ]},
      {href: '/docs/code/typescript', children: 'Typescript', sub: [
        {href: '/docs/code/quality/utility-types', children: 'Utility Types'},
        {href: '/docs/code/quality/additional-resources', children: 'Additional Resources'},
      ]}
    ],
  },
  {
    title: 'React',
    links: [
      {href: '/docs/react', children: 'Introduction'},
      {href: '/docs/react/handling-state', children: 'Handling State'}
    ],
  },
];

export function SideNav() {
  const router = useRouter();

  return (
    <nav className="sidenav">
      {items.map((item) => (
        <div key={item.title} className="sidenav__group">
          <span>{item.title}</span>
          <ul className="flex column">
            {item.links.map((link) => {
              const active = router.pathname === link.href;
              return (
                <li key={link.href} className={active ? 'active' : ''}>
                  <Link {...link} />
                  { link.sub && <ul> { link.sub.map(sublink => {
                    const subActive = router.pathname === sublink.href;
                    return (
                      <li key={sublink.href} className={subActive ? 'active' : ''}>
                        <Link {...sublink} />
                      </li>
                    )
                  })} </ul> }
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <style jsx>
        {`
          .sidenav__group {
            margin-bottom: 2rem;
          }
          nav {
            position: sticky;
            top: var(--top-nav-height);
            height: calc(100vh - var(--top-nav-height));
            flex: 0 0 auto;
            overflow-y: auto;
            padding: 2.5rem 2rem 2rem;
            border-right: 1px solid var(--border-color);
          }
          span {
            font-size: larger;
            font-weight: 500;
            padding: 0.5rem 0 0.5rem;
          }
          ul {
            padding: 0;
          }
          li {
            list-style: none;
            margin: 0.5rem;
            font-size: 0.9rem;
          }
          li :global(a) {
            text-decoration: none;
          }
          li :global(a:hover),
          li.active > :global(a) {
            text-decoration: underline;
          }
          ul li ul {
            margin-bottom: 1rem;
          }
        `}
      </style>
    </nav>
  );
}
