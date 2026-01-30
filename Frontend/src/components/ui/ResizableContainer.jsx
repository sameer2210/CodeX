// src/components/ui/ResizableContainer.jsx
import { useEffect, useRef, useState } from 'react';

const directions = [
  'top',
  'right',
  'bottom',
  'left',
  'top-right',
  'bottom-right',
  'bottom-left',
  'top-left',
];

export default function ResizableContainer({
  children,
  minWidth = 200,
  minHeight = 150,
  className = '',
}) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: undefined, height: undefined });

  useEffect(() => {
    if (ref.current && size.width === undefined && size.height === undefined) {
      setSize({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      });
    }
  }, []);

  const startResize = (e, dir) => {
    e.preventDefault();
    if (!ref.current) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = ref.current.offsetWidth;
    const startHeight = ref.current.offsetHeight;

    const onMouseMove = ev => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (dir.includes('right')) newWidth = startWidth + (ev.clientX - startX);
      if (dir.includes('left')) newWidth = startWidth - (ev.clientX - startX);
      if (dir.includes('bottom')) newHeight = startHeight + (ev.clientY - startY);
      if (dir.includes('top')) newHeight = startHeight - (ev.clientY - startY);

      setSize({
        width: Math.max(newWidth, minWidth),
        height: Math.max(newHeight, minHeight),
      });
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopResize);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const style = {};
  if (size.width !== undefined) style.width = `${size.width}px`;
  if (size.height !== undefined) style.height = `${size.height}px`;

  return (
    <div
      ref={ref}
      style={style}
      className={`relative border rounded-lg overflow-hidden ${className}`}
    >
      {children}

      {directions.map(dir => (
        <div
          key={dir}
          onMouseDown={e => startResize(e, dir)}
          className={`absolute ${getHandleClass(dir)}`}
        />
      ))}
    </div>
  );
}

function getHandleClass(dir) {
  const base = 'bg-transparent z-10';
  switch (dir) {
    case 'right':
      return `${base} right-0 top-0 w-2 h-full cursor-ew-resize`;
    case 'left':
      return `${base} left-0 top-0 w-2 h-full cursor-ew-resize`;
    case 'bottom':
      return `${base} bottom-0 left-0 h-2 w-full cursor-ns-resize`;
    case 'top':
      return `${base} top-0 left-0 h-2 w-full cursor-ns-resize`;
    case 'top-right':
      return `${base} right-0 top-0 w-3 h-3 cursor-nwse-resize`;
    case 'bottom-right':
      return `${base} right-0 bottom-0 w-3 h-3 cursor-nesw-resize`;
    case 'bottom-left':
      return `${base} left-0 bottom-0 w-3 h-3 cursor-nwse-resize`;
    case 'top-left':
      return `${base} left-0 top-0 w-3 h-3 cursor-nesw-resize`;
  }
}
