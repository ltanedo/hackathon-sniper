import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (keyword: string) => void;
  /** Explicit search (Enter). Also fires onChange immediately. */
  onSubmit: (keyword: string) => void;
  busy?: boolean;
}

const DEBOUNCE_MS = 300;

export default function SearchBox({ value, onChange, onSubmit, busy }: Props) {
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const timer = useRef<number | null>(null);

  // Keep local text in sync if the parent resets the keyword (derived-state pattern).
  if (prevValue !== value) {
    setPrevValue(value);
    setText(value);
  }

  // Cancel a pending debounce on unmount.
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const schedule = (next: string) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(next), DEBOUNCE_MS);
  };

  const submit = () => {
    if (timer.current) window.clearTimeout(timer.current);
    onSubmit(text);
  };

  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <span className="search-icon" aria-hidden>
        ⌕
      </span>
      <input
        type="search"
        placeholder="Search events, e.g. hackathon"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          schedule(e.target.value);
        }}
        aria-label="Search events"
      />
      {text && (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          onClick={() => {
            setText('');
            if (timer.current) window.clearTimeout(timer.current);
            onSubmit('');
          }}
        >
          ×
        </button>
      )}
      {busy && <span className="search-busy" aria-label="Searching" />}
    </form>
  );
}
