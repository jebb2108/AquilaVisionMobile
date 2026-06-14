// Bookmark.jsx
import React from 'react';

const Bookmark = React.memo(({
  top,
  height,
  background,
  letter,
  dragging,
  onPointerDown,
}) => (
  <div
    className={`alpha-track__bookmark${dragging ? ' alpha-track__bookmark--dragging' : ''}`}
    style={{ top, height, background }}
    onPointerDown={onPointerDown}
  >
    <span>{letter}</span>
  </div>
));

export default Bookmark;