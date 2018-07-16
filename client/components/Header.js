import React from 'react';
import Link from 'next/link';

const ListLink = props => {
  return (
    <li style={{ display: 'inline-block', marginRight: '1rem' }}>
      {props.children}
    </li>
  );
};

export default props => {
  return (
    <header style={{ marginBottom: '1.5rem' }}>
      <h1 style={{ display: 'inline' }}>{props.page}</h1>
      <ul style={{ listStyle: 'none', float: 'right' }}>
        <ListLink>
          <Link href={'/user'}>
            <a>User</a>
          </Link>
        </ListLink>
        <ListLink>
          <Link href={'/mailroom'}>
            <a>Mailroom</a>
          </Link>
        </ListLink>
      </ul>
    </header>
  );
};
