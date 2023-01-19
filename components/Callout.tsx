import * as React from 'react';

export function Callout({ title, children }) {
  return (
    <div className="callout">
      <strong>{title}</strong>
      <span>{children}</span>
      <style jsx>
        {`
          .callout {
            display: flex;
            flex-direction: column;
            padding: 12px 16px;
            background: hsl(0, 0%, 8%);
            border: 1px solid #dce6e9;
            border-radius: 4px;
          }
          .callout :global(p) {
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}
